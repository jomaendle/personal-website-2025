"use client";

import { track } from "@vercel/analytics";
import Image, { type StaticImageData } from "next/image";
import { usePlausible } from "next-plausible";
import { useCallback, useEffect, useRef, useState } from "react";
import dsc00465 from "@/public/assets/DSC00465.webp";
import dsc00483 from "@/public/assets/DSC00483-web.webp";
import dsc00535 from "@/public/assets/DSC00535.webp";
import dsc00645 from "@/public/assets/DSC00645.webp";
import dsc00911 from "@/public/assets/DSC00911.webp";
import dsc00929 from "@/public/assets/DSC00929.webp";
import dsc04499 from "@/public/assets/DSC04499.webp";
import dsc04861 from "@/public/assets/DSC04861.webp";
import dsc04938 from "@/public/assets/DSC04938.webp";
import dsc05383 from "@/public/assets/DSC05383.webp";
import dsc05480 from "@/public/assets/DSC05480.webp";
import dsc09908 from "@/public/assets/DSC09908.webp";
import photo6554107 from "@/public/assets/Photo_6554107.webp";
import styles from "./image-stack.module.css";

const clamp = (value: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, value));

/** The pile, in order. Static imports carry each print's dimensions (for
 * orientation) and a build-time blur placeholder (for lazy prints). */
const PRINTS: StaticImageData[] = [
  dsc00483,
  dsc00465,
  dsc00645,
  dsc00929,
  dsc00535,
  dsc04861,
  dsc04938,
  dsc00911,
  dsc05383,
  dsc05480,
  dsc04499,
  dsc09908,
  photo6554107,
];
/** How many prints are assumed in view before anything is measured. The
 * server renders these with real images and the rest as placeholders; a
 * wider window reveals more as soon as it has been measured. */
const INITIAL_WINDOW = 6;

/**
 * The curve belongs to the window, not the strip: a print stands upright at
 * the window's centre and leans out toward either edge, so as the pile
 * travels each print rolls through upright. It is the arc of a circle seen
 * from its centre: a print's angle is atan2(its distance from the window's
 * centre, the circle's radius), which is half the window, so at the window's
 * edge it is 45°. The radius never drops below RADIUS, though: a phone's
 * window is a quarter as wide as a desktop's, and prints on the tight
 * circle that would give leaned into one another like a bump. The lean is
 * the angle scaled to LEAN at 45°; the drop is the arc's sag in print
 * heights, capped at DROP. The stylesheet computes the same curve in CSS
 * for the resting fan (`--angle`, `--lean`, `--drop` on `.tile`), so the
 * server's pose matches the first client frame at any window width: keep
 * the numbers in step.
 */
const LEAN = 10;
const RADIUS = 260;
const DROP = 14 / 120;
const SAG = 0.4;
function curve(
  dx: number,
  half: number,
  print: number,
): { lean: number; drop: number } {
  const angle = Math.atan2(dx, Math.max(half, RADIUS));
  return {
    lean: clamp(angle * (180 / Math.PI) * (LEAN / 45), -LEAN, LEAN),
    drop: print * Math.min(DROP, SAG * (1 - Math.cos(angle))),
  };
}
/** Layout ratios the stylesheet uses, repeated here so the server can write
 * each print's resting centre for the stylesheet's curve. Keep in step with
 * `--w` (portrait, landscape) and `--tuck`. */
const PAPER = { portrait: 0.8, landscape: 1.25 };
const TUCK = 0.4;
/** Where each print's centre sits at rest, in paper heights from the list's
 * padding edge. The stylesheet turns it into the print's place on the arc. */
const REST_CENTRES: number[] = (() => {
  let x = 0;
  return PRINTS.map((print) => {
    const w = print.width >= print.height ? PAPER.landscape : PAPER.portrait;
    const centre = x + w / 2;
    x += w * (1 - TUCK);
    return centre;
  });
})();
/** Scale-up of the print under the pointer, as a fraction, and how far it
 * lifts, in px. Hovering is a state, not a dial: the print under the pointer
 * is fully up and every other print is fully down, so the pointer wandering
 * inside a print changes nothing, and the pile only moves when the pointer
 * reaches another print. */
const GROWTH = 0.35;
const LIFT = 12;
/** Daylight between a fully uncovered print and the neighbour that slid off it. */
const GAP = 6;

/** How large a print is drawn: its hover growth, with the lift's growth on
 * top of it and taking over from it as the print comes up out of the pile.
 * Three places need this and they must agree — the pose that draws it, the
 * hit test that decides what the pointer is over, and the nudge that keeps a
 * lifted print inside the window. */
function paperScale(g: number, f: number): number {
  return 1 + g * GROWTH * (1 - f) + f * (GROWTH + FOCUS_GROWTH);
}
/** A click pulls the print up out of the pile where it is: lifted and grown
 * beyond the hover pose by these, on top of the hover growth and lift. Its
 * own spring, critically damped: a click carries no momentum, so nothing
 * should bounce. Response ≈ 0.26s. On a desktop the hover has already shown
 * most of the movement, but a tap has shown nothing, so this is the whole
 * answer to a touch and has to arrive inside the 300ms a UI gesture is
 * allowed: at the old 0.36s it took 380ms to look finished and was still
 * moving most of a second later. */
const FOCUS_GROWTH = 0.78;
const FOCUS_LIFT = 44;
const FOCUS_STIFFNESS = 580;
const FOCUS_DAMPING = 48;
/** Spring for putting a lifted print back. Critically damped, response
 * ≈ 0.20s: a dismissal is the system answering and should be quicker than
 * the deliberate act that raised it. */
const PUTBACK_STIFFNESS = 1000;
const PUTBACK_DAMPING = 63;
/** A press dips the print under the pointer by this share of its size until
 * it is released: the pile answers on pointer-down, before the click lands. */
const PRESS = 0.04;
/** A press that moves less than this, in px, and lasts under this, in ms,
 * is a click, not a drag. */
const CLICK_SLOP = 6;
const CLICK_TIME = 500;
/** A drag past either end follows the finger less and less: how far it can
 * go, in px, and how stiffly it resists. */
const RUBBER_REACH = 96;
const RUBBER = 0.55;
/** Momentum after a release decays like a scroll view (Apple's projection). */
const DECELERATION = 0.997;
/** How far a flick let go inside the range can carry the pile past either
 * end before it springs back, in px. Let go already rubber-banded past an
 * end, it goes somewhat further, still well inside RUBBER_REACH. */
const BOUNCE = 40;
/** Spring for a print's prominence, its uncover and its press. Critically
 * damped, response ≈ 0.16s:
 * the print comes up almost at once and settles with no overshoot, so the
 * handoff from one print to the next is one clean motion. */
const STIFFNESS = 1600;
const DAMPING = 80;
/** Spring for the strip while a wheel or trackpad swipe is driving it, and
 * how long after the last event it keeps it. A swipe is direct manipulation
 * like a drag, so it should land with the gesture: on the travel spring only
 * 18% of a 160px swipe had arrived by the time the fingers stopped, and the
 * pile spent another 430ms catching up. Response ≈ 0.16s. */
const WHEEL_STIFFNESS = 1600;
const WHEEL_DAMPING = 80;
const WHEEL_HOLD = 120;
/** Spring for the strip's travel. Critically damped, response ≈ 0.39s: the
 * pile glides rather than chases, and carries a released drag's velocity.
 * Near Apple's 0.4s for a repositioning gesture, and enough quicker than it
 * was that a flick stops feeling like it is still deciding. */
const TRAVEL_STIFFNESS = 260;
const TRAVEL_DAMPING = 32;
/** Time constant for the edge fades easing in and out, in seconds. */
const EDGE_EASE = 0.16;
/** Below this a spring counts as settled and the loop can stop. */
const EPSILON = 0.0005;
/** The longest step the springs are integrated over, in seconds. A frame
 * longer than this is split into several (see `runFrame`). */
const MAX_STEP = 0.008;
/** The class that promotes the pile's compositor layers while it is in use
 * (see the stylesheet). Read once: a CSS module's members are typed as
 * possibly absent, and `classList` will not take `undefined`. */
const ARMED = styles.armed ?? "armed";

type Report = (action: "hover" | "travel" | "lift", print?: number) => void;

/** Resting layout, measured once per pointer visit. All in px, relative to
 * the list's left edge. `overlap[k]` is how much print k+1 covers print k. */
type Geometry = {
  zoneLeft: number;
  zoneTop: number;
  zoneWidth: number;
  /** The window the reader actually sees: the zone less its fade. */
  visible: number;
  /** The strip's vertical band, in zone coordinates: where the prints stand
   * at rest, less the room the tallest lift needs above them. */
  stripTop: number;
  stripBottom: number;
  fade: number;
  /** The paper height, which the curve's drop is measured in. */
  height: number;
  lefts: number[];
  centres: number[];
  widths: number[];
  overlaps: number[];
  maxTravel: number;
};

/**
 * A fanned pile of photographs that opens under the pointer. At rest the
 * prints lean and drop along a shallow arc, each one covering part of the
 * print before it; portrait and landscape prints share the baseline and the
 * paper height, as prints do. Under the pointer the print it is over
 * straightens, lifts and grows, and the prints to its right slide aside to
 * uncover it, so it is uncovered by its neighbour gliding off it rather than
 * by jumping in front. Over the gap between prints nothing changes: the
 * pile only moves when the pointer reaches another print. Hovering never
 * changes stacking order, and crossing to the next print is the same motion
 * played backwards. (A lift does reorder, but only where nothing overlaps
 * the print: see `raise`.)
 *
 * The pile is longer than its window, and whichever end has more behind it
 * fades out to say so. Resting the pointer near an edge drifts the pile that
 * way, slowly and only while it stays there; a sideways wheel or trackpad
 * swipe leafs through directly; and a drag, mouse or finger, moves it 1:1,
 * rubber-bands past the ends and coasts on release with the velocity it was
 * let go at. Nothing moves under a pointer resting in the middle. Prints only
 * get a real image once they have entered the window; until then they carry
 * their blur placeholder, which is a few hundred bytes and never visible at
 * rest.
 *
 * A press dips the print under the pointer at once; a click lifts it up out
 * of the pile where it is, to full size whatever the pointer does, over a
 * pool of shadow that follows it; a second click, Escape or
 * the mouse leaving puts it back — so does a click on the background, and a
 * drag long enough to count as leafing — and the arrow keys leaf from one
 * print to the next. The pile holds still underneath while a print is up. Its
 * neighbour slides off it the way it does under the pointer, no further, and
 * stays off until the print has landed: the print goes on top of the pile
 * while it is up, and the swap is made when nothing overlaps it, so the
 * stacking order is never seen to change.
 *
 * One requestAnimationFrame loop runs the springs and writes `transform` and
 * the shadow layer's `opacity` straight to the elements, the way
 * `crafts/Minimap` does; React re-renders only when a new print comes into
 * view. The pointer is tracked on a static zone rather than on the moving
 * prints, geometry is measured once on entry, and the loop stops itself once
 * everything has settled, so an untouched pile costs nothing.
 *
 * Decoration, not content: hidden from assistive tech. Opening under the
 * pointer is only wired up for fine pointers that can hover; dragging works
 * for every pointer. With reduced motion the drag still tracks 1:1 and a
 * click still lifts, but nothing coasts and nothing opens under the pointer. Without JavaScript, the resting fan the server
 * rendered is what you get.
 */
export function ImageStack() {
  const stackRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [revealed, setRevealed] = useState(INITIAL_WINDOW);
  const plausible = usePlausible();
  // Which interactions happen at all is the question worth answering, so
  // hover and travel report once per page view; each lift reports, with
  // the print, since that is a deliberate act.
  const reported = useRef(new Set<string>());
  const report = useRef<Report>(() => undefined);
  report.current = (action, print) => {
    if (action !== "lift") {
      if (reported.current.has(action)) return;
      reported.current.add(action);
    }
    const props = print === undefined ? { action } : { action, print };
    plausible("Photo pile", { props });
    track("Photo pile", props);
  };
  const state = useRef({
    /** Prominence per print: 0 at rest, 1 directly under the pointer. */
    g: PRINTS.map(() => 0),
    v: PRINTS.map(() => 0),
    target: PRINTS.map(() => 0),
    /** Lift per print: 1 for the one print pulled out by a click. */
    f: PRINTS.map(() => 0),
    fv: PRINTS.map(() => 0),
    fTarget: PRINTS.map(() => 0),
    /** Uncover per print: 1 while its neighbour has slid off it for a lift.
     * Set with the lift, cleared only once the print has landed. */
    u: PRINTS.map(() => 0),
    uv: PRINTS.map(() => 0),
    uTarget: PRINTS.map(() => 0),
    /** Press per print: 1 while the pointer is down on it. */
    p: PRINTS.map(() => 0),
    pv: PRINTS.map(() => 0),
    pTarget: PRINTS.map(() => 0),
    /** Where each print sits right now, relative to its resting place, in
     * px: the room its neighbours and its own growth have made. */
    offsets: PRINTS.map(() => 0),
    focused: -1,
    /** How much of each edge fade is on screen, 0 to 1. */
    edgeL: 0,
    edgeR: 1,
    /** When a wheel or trackpad swipe last drove the strip. */
    wheeledAt: -Infinity,
    /** How far the strip has travelled left, in px. */
    travel: 0,
    travelV: 0,
    travelTarget: 0,
    /** The pointer, in window coordinates, and whether it can open prints. */
    pointerX: 0,
    pointerY: 0,
    hovering: false,
    /** Edge drift: -1 at the left edge, 1 at the right, 0 in the middle.
    /** An active drag: where it started, and recent samples for velocity. */
    drag: null as null | {
      /** The finger that owns the gesture. Every later pointer event is
       * matched against it; see `handleDown`. */
      pointerId: number;
      originX: number;
      originTravel: number;
      at: number;
      index: number;
    },
    samples: [] as { x: number; t: number }[],
    reduced: false,
    revealed: INITIAL_WINDOW,
    last: 0,
    frame: null as number | null,
    geometry: null as Geometry | null,
  });

  const runFrame = useCallback((now: number) => {
    const s = state.current;
    const elapsed = Math.min(32, now - (s.last || now)) / 1000;
    s.last = now;

    // Advanced in fixed sub-steps, never in one jump. The prominence spring is
    // integrated by semi-implicit Euler, which is only stable while
    // k·h² + 2·c·h < 4 — at k = 1600 and c = 80 that is h < 20.7ms. One frame
    // longer than that (a 30Hz display, a laden or backgrounded tab) and the
    // spring diverges instead of settling: the transforms go to Infinity,
    // which is not valid CSS and is silently dropped, and the loop never sees
    // it settle, so it runs for ever. Sub-stepping keeps every spring inside
    // its bound whatever the frame rate, and is more accurate besides.
    let moving = false;
    const substeps = Math.max(1, Math.ceil(elapsed / MAX_STEP));
    const dt = elapsed / substeps;
    for (let i = 0; i < substeps; i++) moving = step(s, dt) || moving;
    let inView = paint(
      s,
      zoneRef.current,
      backdropRef.current,
      tileRefs.current,
    );
    if (s.geometry && dotsRef.current) {
      markDots(s, s.geometry, s.travel, dotsRef.current);
    }
    // A print lifted by key from beyond the window needs its image too.
    if (s.focused >= 0) inView = Math.max(inView, s.focused + 1);
    if (inView > s.revealed) {
      s.revealed = inView;
      setRevealed(inView);
    }

    s.frame = moving ? requestAnimationFrame(runFrame) : null;
    if (!moving) {
      s.last = 0;
    }
  }, []);

  const start = useCallback(() => {
    state.current.frame ??= requestAnimationFrame(runFrame);
  }, [runFrame]);

  useEffect(() => {
    const zone = zoneRef.current;
    const hit = hitRef.current;
    const list = listRef.current;
    if (!(zone && hit && list)) return;
    const s = state.current;

    // Opening under the pointer needs a pointer that can hover; touch gets
    // the drag alone. Reduced motion keeps 1:1 tracking and drops the rest.
    const canHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    s.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Measured once per visit of the pointer. offsetLeft/offsetWidth ignore
    // transforms, so this is the resting layout and the prints can't chase
    // themselves; reading it here keeps layout off the pointermove path. It
    // is kept after the pointer leaves, because the pile is still settling.
    const measure = () => {
      const tiles = tileRefs.current;
      const lefts = tiles.map((tile) => tile?.offsetLeft ?? 0);
      const widths = tiles.map((tile) => tile?.offsetWidth ?? 0);
      const centres = lefts.map((left, i) => left + (widths[i] ?? 0) / 2);
      const overlaps = lefts.map((left, i) =>
        Math.max(0, left + (widths[i] ?? 0) - (lefts[i + 1] ?? Infinity)),
      );
      const zoneRect = zone.getBoundingClientRect();
      const fade = Number.parseFloat(getComputedStyle(zone).paddingRight);
      // The strip must be able to travel far enough that the last print,
      // fully opened, clears the fade. Opening adds the overlap it sheds, the
      // gap, and its own growth.
      const opened = Math.max(...overlaps) + GAP + GROWTH * Math.max(...widths);
      const listRect = list.getBoundingClientRect();
      s.geometry = {
        zoneLeft: zoneRect.left,
        zoneTop: zoneRect.top,
        stripTop: listRect.top - zoneRect.top - (LIFT + FOCUS_LIFT),
        stripBottom: listRect.bottom - zoneRect.top,
        zoneWidth: zoneRect.width,
        visible: zoneRect.width - fade,
        fade,
        height: tiles[0]?.offsetHeight ?? 0,
        lefts,
        centres,
        widths,
        overlaps,
        maxTravel: Math.max(
          0,
          list.offsetWidth + opened - (zoneRect.width - fade),
        ),
      };
    };

    const handleDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      // A second finger landing mid-drag would take the strip with it, since
      // the drag records where it began: the pile would jump to the new
      // finger. The first one keeps the gesture. Blocking a second
      // `pointerdown` is only half of it, though, because capture redirects
      // one pointer and not the rest: the second finger still fires its own
      // moves and ups at this element. So the gesture records whose it is
      // and the other handlers check. Without that, a finger resting on the
      // pile mid-drag threw the strip 78px sideways in a single frame.
      if (s.drag) return;
      if (!s.geometry) measure();
      // Capture keeps the drag alive outside the zone. It throws if the
      // pointer is already gone, which is no reason to drop the drag.
      try {
        hit.setPointerCapture(event.pointerId);
      } catch {}
      // Grab the strip where it is, mid-glide included: no jump on touch.
      s.travelTarget = s.travel;
      s.travelV = 0;
      s.drag = {
        pointerId: event.pointerId,
        originX: event.clientX,
        originTravel: s.travel,
        at: event.timeStamp,
        // Read now, geometrically: the prints never receive pointer events.
        index: printAt(
          event.clientX,
          event.clientY,
          tileRefs.current,
          s.focused,
        ),
      };
      s.samples = [{ x: event.clientX, t: event.timeStamp }];
      if (s.drag.index >= 0) s.pTarget[s.drag.index] = 1;
      start();
    };

    const dragMove = (event: PointerEvent, geometry: Geometry) => {
      if (!s.drag) return;
      dragTo(s, event, geometry);
      if (Math.abs(event.clientX - s.drag.originX) >= CLICK_SLOP) {
        report.current("travel");
        // A real drag means leafing through: the press lets go, and a
        // lifted print goes back.
        s.pTarget.fill(0);
        if (s.focused >= 0) lift(-1);
      }
    };

    const hoverMove = (geometry: Geometry) => {
      s.hovering = true;
      showCursor(hit, printUnder(s, geometry));
      report.current("hover");
    };

    const handleMove = (event: PointerEvent) => {
      if (s.drag && event.pointerId !== s.drag.pointerId) return;
      if (!s.geometry) measure();
      const geometry = s.geometry as Geometry;
      // Kept fresh whatever the pointer is doing. `step` re-aims every frame
      // while the pointer is on the pile, so a drag that left this stale had
      // the pile aiming at where the pointer was before the drag began,
      // while the strip slid underneath it: on release the wrong print stood
      // raised until the next move snapped it, one print dropping and
      // another rising for no reason the reader could see.
      s.pointerX = event.clientX - geometry.zoneLeft;
      s.pointerY = event.clientY - geometry.zoneTop;
      if (s.drag) dragMove(event, geometry);
      else if (canHover && !s.reduced) hoverMove(geometry);
      else return;
      start();
    };

    /** Take print `next` up out of the pile. The pile holds still while it
     * is up (see `step`), so the hover targets are cleared and only the
     * print under a hovering pointer stays raised: a print the keys leaf
     * away from goes down rather than staying up.
     *
     * Its neighbour slides off it and stays off until it has landed. That
     * slide is what makes the drop back into the pile invisible: the print
     * rejoins the stacking order at the moment nothing is covering it, and
     * the neighbour closes afterwards. Without it the neighbour snapped over
     * the print the instant its z-index changed, a one-frame flicker at the
     * end of every minimise. It is carried on the lift's own spring, so it
     * reads as the pile opening rather than jumping. */
    const raiseOne = (next: number) => {
      s.fTarget[next] = 1;
      s.uTarget[next] = 1;
      s.target.fill(0);
      if (s.hovering) s.target[next] = 1;
      report.current("lift", next + 1);
    };

    /** Lift print `index` out of the pile, or put the lifted one back (-1).
     * Uncovering it (its neighbour sliding off) is its own state, so that it
     * can outlast the lift: see `step`. */
    const lift = (index: number) => {
      const next = index < PRINTS.length ? index : -1;
      s.fTarget.fill(0);
      if (next >= 0) raiseOne(next);
      s.focused = next;
      // The pointer's surface grows to cover a lifted print. Written here,
      // not rendered: a click must not re-render the pile, since React
      // touching the prints' props mid-lift is how the images used to swap
      // sources and pop while rising.
      hit.style.top = next >= 0 ? "0" : "";
      start();
    };

    /** What a click on `index` (-1 for the background) does: lifts the
     * print, or puts it back if it is the one lifted; on the background,
     * puts back whatever is lifted. */
    const click = (index: number) => {
      lift(index === s.focused ? -1 : index);
    };

    /** The browser has taken the gesture over (a vertical page pan on touch,
     * say) or the pointer is gone. The drag is abandoned where it stands:
     * never committed as a click, which would lift a print under a finger
     * that was only scrolling the page. Chromium happens to report the
     * cancelled pointer at x = 0, which the click's slop test rejects by
     * accident; this makes it deliberate. */
    const handleCancel = (event: PointerEvent) => {
      if (!s.drag || event.pointerId !== s.drag.pointerId) return;
      s.drag = null;
      s.pTarget.fill(0);
      s.samples.length = 0;
      // A drag holds the strip at its target, rubber-banded up to
      // RUBBER_REACH past an end. A release clamps it back; a cancel must
      // too, or the pile parks outside its range with nothing left to move
      // it: the spring sees no distance to travel and the loop stops there.
      if (s.geometry) {
        s.travelTarget = clamp(s.travel, 0, s.geometry.maxTravel);
      }
      start();
    };

    const handleUp = (event: PointerEvent) => {
      if (!s.drag || event.pointerId !== s.drag.pointerId) return;
      const drag = s.drag;
      s.drag = null;
      s.pTarget.fill(0);
      const geometry = s.geometry as Geometry;
      if (isClick(drag, event)) {
        click(drag.index);
        return;
      }
      const velocity = s.reduced ? 0 : releaseVelocity(s.samples, event);
      // Where the coast would end decides where it settles; the spring then
      // starts at the finger's speed, so there is no seam at the release.
      const landing = s.travel + project(velocity);
      s.travelTarget = clamp(landing, 0, geometry.maxTravel);
      // A coast that would run past an end is caught there: the spring is
      // started with only as much speed as bounces it BOUNCE px past the
      // end, instead of the finger's whole speed carrying it far out and
      // gliding back. A critically damped spring let go at v away from its
      // target overshoots by v / (ω·e).
      const cap = BOUNCE * Math.sqrt(TRAVEL_STIFFNESS) * Math.E;
      s.travelV =
        landing === s.travelTarget ? velocity : clamp(velocity, -cap, cap);
      start();
    };

    const handleLeave = (event: PointerEvent) => {
      s.hovering = false;
      s.target.fill(0);
      if (event.pointerType === "mouse" && s.focused >= 0) lift(-1);
      start();
    };

    // Only while a print is lifted, and never from someone typing: this
    // listener is on the window, so without that guard a lifted print
    // swallowed the arrow keys that move a caret in any field on the page.
    const handleKey = (event: KeyboardEvent) => {
      if (s.focused < 0 || isTyping(document.activeElement)) return;
      const next = leafTo(event.key, s.focused);
      if (next === undefined) return;
      lift(next);
      event.preventDefault();
    };

    // A sideways wheel or trackpad swipe leafs through the pile directly.
    // Vertical wheel is left to the page.
    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      if (!s.geometry) measure();
      const geometry = s.geometry as Geometry;
      event.preventDefault();
      s.travelTarget = clamp(
        s.travelTarget + event.deltaX,
        0,
        geometry.maxTravel,
      );
      s.wheeledAt = event.timeStamp;
      report.current("travel");
      start();
    };

    // The pointer is tracked on a static hit surface, not on the prints. A
    // print under the pointer lifts and shifts as it grows; hit-testing that
    // would flicker enter/leave at every edge. The surface never moves and
    // contains every print in every state (it grows to cover a lifted one),
    // so it behaves like a fixed detection region.
    // Paint once on mount so the resting marks match the real window, not
    // the server's guess; the loop itself only runs when something moves.
    measure();
    if (s.geometry) {
      if (dotsRef.current) markDots(s, s.geometry, s.travel, dotsRef.current);
      // A window wider than the server assumed shows more prints: give them
      // their images now rather than at the first movement.
      const inView = countInView(s, s.geometry, s.travel);
      if (inView > s.revealed) {
        s.revealed = inView;
        setRevealed(inView);
      }
    }

    // The window's width decides the strip's travel range, and the paper
    // height changes at the stylesheet's breakpoint, so a resize invalidates
    // every measurement. Without this the pile keeps a travel that is now
    // past the end: blank space at the right, and the next drag jumps the
    // difference in one frame. Snapped, not sprung — a resize is not a
    // gesture, and nothing should glide while the user drags a window edge.
    const observer = new ResizeObserver(() => {
      const before = s.geometry?.zoneWidth;
      measure();
      // Observing fires once straight away, and the mount already measured:
      // do nothing unless the width really changed, so nothing is painted
      // before the first interaction.
      if (!s.geometry || s.geometry.zoneWidth === before) return;
      s.travel = clamp(s.travel, 0, s.geometry.maxTravel);
      s.travelTarget = s.travel;
      s.travelV = 0;
      start();
    });
    observer.observe(zone);

    // Promotion is not free of consequence: giving forty elements their own
    // compositor layers snaps each to whole device pixels, and the prints
    // stand on fractional ones, so the whole row jumps a pixel or two the
    // moment it happens. Doing that on pointerenter or pointerdown put the
    // jump under the reader's finger on every single tap. It now happens
    // when the pile scrolls into view, where the page is already moving and
    // a pixel cannot be seen, and is given back when it scrolls away — so an
    // off-screen pile still costs nothing.
    const promote = new IntersectionObserver(
      (entries) => {
        const onScreen = entries.at(-1)?.isIntersecting ?? false;
        stackRef.current?.classList.toggle(ARMED, onScreen);
      },
      { rootMargin: "200px 0px" },
    );
    if (stackRef.current) promote.observe(stackRef.current);

    hit.addEventListener("pointerenter", measure);
    hit.addEventListener("pointerdown", handleDown);
    hit.addEventListener("pointermove", handleMove, { passive: true });
    hit.addEventListener("pointerup", handleUp);
    hit.addEventListener("pointercancel", handleCancel);
    hit.addEventListener("pointerleave", handleLeave);
    hit.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKey);

    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", handleKey);
      promote.disconnect();
      hit.removeEventListener("pointerenter", measure);
      hit.removeEventListener("pointerdown", handleDown);
      hit.removeEventListener("pointermove", handleMove);
      hit.removeEventListener("pointerup", handleUp);
      hit.removeEventListener("pointercancel", handleCancel);
      hit.removeEventListener("pointerleave", handleLeave);
      hit.removeEventListener("wheel", handleWheel);
      if (s.frame !== null) cancelAnimationFrame(s.frame);
      s.frame = null;
    };
  }, [start]);

  return (
    // The zone is the window onto the strip; `.hit` inside it is the
    // pointer's surface, since the zone itself takes no pointer events. The
    // zone's vertical padding is headroom for the lift and the scale above
    // and for the outer prints' rotated corners below, and must contain every
    // print in every state: check it if LIFT, GROWTH or DROP change. Its
    // right padding is the fade.
    <div ref={stackRef} className={styles.stack}>
      {/* A soft pool of shadow behind the pile, faded in with a lift. Outside
          the zone, which clips sideways and fades at both ends: the pool
          falls on the page with no edge. Before the zone, so it is under
          every print. */}
      <div ref={backdropRef} className={styles.backdrop} />
      <div ref={zoneRef} className={styles.zone}>
        {/* The pointer's surface: the window's box, grown (by `lift`, which
            writes its `top`) to cover a lifted print. The zone itself takes
            no pointer events, because its box reaches up over the paragraph
            to give a lifted print room. */}
        <div ref={hitRef} className={styles.hit} />
        {/* `--c0` is the first print's resting centre. The stylesheet needs
            it on the list to size the start padding, which is the room that
            print's rotated corner takes to its left. */}
        <ul
          ref={listRef}
          aria-hidden="true"
          className={styles.list}
          style={
            { "--c0": (REST_CENTRES[0] ?? 0).toFixed(3) } as React.CSSProperties
          }
        >
          {PRINTS.map((print, index) => {
            const landscape = print.width >= print.height;
            return (
              <li
                key={print.src}
                ref={(node) => {
                  tileRefs.current[index] = node;
                }}
                className={`${styles.tile} ${landscape ? styles.landscape : styles.portrait}`}
                style={
                  {
                    zIndex: index,
                    "--c": (REST_CENTRES[index] ?? 0).toFixed(3),
                  } as React.CSSProperties
                }
              >
                {/* First child on purpose: `pose` reaches it as firstElementChild. */}
                <span className={styles.shadow} />
                {/* The blur placeholder is the frame's own background, and the
                    photograph fades in over it once it has decoded. Left to
                    `placeholder="blur"`, the blur is the image's background and
                    is dropped the instant it loads — a single-frame cut from
                    soft to sharp, which on a print held at 1.85x reads as the
                    picture jumping. */}
                <div
                  className={styles.photo}
                  style={{
                    backgroundImage: `url(${print.blurDataURL})`,
                    backgroundSize: "cover",
                  }}
                >
                  {index < revealed && (
                    <Image
                      src={print}
                      alt=""
                      fill
                      sizes={sizesFor(landscape)}
                      quality={80}
                      draggable={false}
                      className={`object-cover ${styles.reveal}`}
                      onLoad={(event) => {
                        event.currentTarget.dataset.loaded = "true";
                      }}
                      ref={(node) => {
                        // A cached image can be complete before React attaches
                        // the handler, which would leave it faded out for good.
                        if (node?.complete) node.dataset.loaded = "true";
                      }}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      {/* One mark per print, lit as much as that print is in the window. A
        hint of the pile's length and where you are in it, not a control. */}
      <div ref={dotsRef} aria-hidden="true" className={styles.dots}>
        {PRINTS.map((print, index) => (
          <span
            key={print.src}
            className={styles.dot}
            style={{ opacity: index < INITIAL_WINDOW ? 1 : undefined }}
          />
        ))}
      </div>
    </div>
  );
}

/** Where a key sends the lifted print: -1 puts it back, a step leafs to the
 * neighbour, and undefined means the key was never ours to take. */
function leafTo(key: string, focused: number): number | undefined {
  if (key === "Escape") return -1;
  if (key === "ArrowRight") return focused + 1;
  if (key === "ArrowLeft") return focused - 1;
  return undefined;
}

/** Whether the keyboard belongs to a field rather than to the page. */
function isTyping(node: Element | null): boolean {
  if (!(node instanceof HTMLElement)) return false;
  if (node.isContentEditable) return true;
  const tag = node.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/** With reduced motion a print still grows and its shadow still deepens —
 * an opacity and a size are not what makes motion sickening — but it no
 * longer travels: the rise and the arc's drop are dropped, so nothing moves
 * across the screen. Snapping the whole lift instead, as this once did,
 * replaced the animation with the single-frame cut that reduced motion
 * exists to prevent, and on touch it is the only feedback a tap gets. */
function riseOf(g: number, f: number, drop: number, reduced: boolean): number {
  if (reduced) return 0;
  return (drop - g * LIFT) * (1 - f) - f * (LIFT + FOCUS_LIFT);
}

/** A press that barely moved and didn't linger is a click, not a drag. */
function isClick(
  drag: { originX: number; at: number },
  event: PointerEvent,
): boolean {
  return (
    Math.abs(event.clientX - drag.originX) < CLICK_SLOP &&
    event.timeStamp - drag.at < CLICK_TIME
  );
}

/** Say what a click would do: a pointer over a print, a hand elsewhere.
 * Taken from `printUnder`, which reads geometry rather than the DOM:
 * hit-testing thirteen boxes on every pointermove forced the layout the
 * loop is busy writing transforms into. */
function showCursor(hit: HTMLElement, over: number) {
  const cursor = over >= 0 ? "pointer" : "";
  if (hit.style.cursor !== cursor) hit.style.cursor = cursor;
}

/** Which print is under the point, or -1 for the background. Topmost wins:
 * the lifted print, then later prints over earlier ones. A print's box is
 * its bounding rect, which for a print leaning ten degrees is close enough. */
function printAt(
  x: number,
  y: number,
  tiles: (HTMLLIElement | null)[],
  focused: number,
): number {
  if (focused >= 0 && within(x, y, tiles[focused])) return focused;
  for (let i = tiles.length - 1; i >= 0; i--) {
    if (within(x, y, tiles[i])) return i;
  }
  return -1;
}

function within(x: number, y: number, tile: HTMLElement | null | undefined) {
  const r = tile?.getBoundingClientRect();
  if (!r) return false;
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

/** Where a print sits in the stacking order: the lifted print on top of
 * everything, a print still coming down just under it, the rest in order.
 * A print takes its place in the pile again only once it has landed, and
 * its neighbour is still off it then (see `step`), so nothing is seen to
 * flip. Written directly, like the transforms: React never touches this
 * property after the first render, so the two don't fight. */
function raise(
  tile: HTMLLIElement | null | undefined,
  index: number,
  level: "top" | "descending" | "pile",
) {
  if (!tile) return;
  const z = String(
    level === "top"
      ? PRINTS.length + 2
      : level === "descending"
        ? PRINTS.length + 1
        : index,
  );
  if (tile.style.zIndex !== z) tile.style.zIndex = z;
}

/** Below this much lift a print counts as landed. Small enough that the
 * print is within a fifth of a pixel of its resting size when it rejoins
 * the pile's stacking order: at the old 0.02 it was still 1.35% larger, and
 * the neighbour closing over it at that moment was a visible flicker. */
const LANDED = 0.002;

/** Source width to ask for: the print at its largest on screen, lifted by a
 * click, so a lift never changes the source. Swapping to a sharper image as
 * the print rose made it pop into focus a beat after it had landed.
 *
 * Paper height × the orientation's width share × the lift's scale
 * (1 + GROWTH + FOCUS_GROWTH = 2.13), at both of the stylesheet's paper
 * heights — 120px above 640px wide, 72px below (see `--print`) — then
 * rounded up to a round number: 319.5 and 204.5 become 320 and 208 on a
 * desktop, 191.7 and 122.7 become 192 and 128 on a phone. The rounding
 * changes no variant; it only spares the reader four awkward decimals.
 * Keep the numbers with GROWTH and FOCUS_GROWTH, and the query in step with
 * that breakpoint. A phone's print is two-fifths of a desktop's, so without
 * the narrow arm every phone would fetch a source four times the area it
 * can show. */
function sizesFor(landscape: boolean): string {
  return landscape
    ? "(min-width: 640px) 320px, 192px"
    : "(min-width: 640px) 208px, 128px";
}

type Drag = {
  drag: null | {
    pointerId: number;
    originX: number;
    originTravel: number;
    at: number;
    index: number;
  };
  samples: { x: number; t: number }[];
  travelTarget: number;
};

/** Follow the pointer 1:1 during a drag, easing off past either end, and
 * keep the last few samples for the release velocity. */
function dragTo(s: Drag, event: PointerEvent, geometry: Geometry) {
  if (!s.drag) return;
  const raw = s.drag.originTravel - (event.clientX - s.drag.originX);
  s.travelTarget = rubberband(raw, geometry.maxTravel);
  s.samples.push({ x: event.clientX, t: event.timeStamp });
  if (s.samples.length > 6) s.samples.shift();
}

/** Past either end the strip follows the pointer less and less, up to
 * RUBBER_REACH, instead of stopping dead. Apple's rubber-band curve. */
function rubberband(travel: number, maxTravel: number): number {
  const over =
    travel < 0 ? travel : travel > maxTravel ? travel - maxTravel : 0;
  if (over === 0) return travel;
  const give =
    (over * RUBBER_REACH * RUBBER) / (RUBBER_REACH + RUBBER * Math.abs(over));
  return (travel < 0 ? 0 : maxTravel) + give;
}

/** Travel velocity at release, in px per second, from the last ~100ms of
 * pointer samples. The strip moves against the pointer, hence the sign. */
function releaseVelocity(
  samples: { x: number; t: number }[],
  event: PointerEvent,
): number {
  const recent = samples.filter((sample) => event.timeStamp - sample.t <= 100);
  const first = recent[0];
  if (!first || event.timeStamp - first.t < 8) return 0;
  return -((event.clientX - first.x) / (event.timeStamp - first.t)) * 1000;
}

/** How far a coast at `velocity` px/s runs before it stops. */
function project(velocity: number): number {
  return ((velocity / 1000) * DECELERATION) / (1 - DECELERATION);
}

type Aim = {
  g: number[];
  f: number[];
  target: number[];
  offsets: number[];
  pointerX: number;
  pointerY: number;
  travel: number;
};

/**
 * Which print the pointer is over: the topmost — later prints lie over
 * earlier ones — whose extent, at the size and place it has right now,
 * contains it. -1 over a gap, past either end, or clear of the strip's
 * vertical band. Geometry only: no box is measured, so this can be asked on
 * every pointer move without forcing the layout the loop is writing into.
 */
function printUnder(s: Aim, geometry: Geometry): number {
  if (s.pointerY < geometry.stripTop || s.pointerY > geometry.stripBottom) {
    return -1;
  }
  const x = s.pointerX + s.travel;
  for (let i = s.target.length - 1; i >= 0; i--) {
    const g = s.g[i] ?? 0;
    const f = s.f[i] ?? 0;
    const scale = paperScale(g, f);
    const centre = (geometry.centres[i] ?? 0) + (s.offsets[i] ?? 0);
    const half = ((geometry.widths[i] ?? 0) * scale) / 2;
    if (Math.abs(x - centre) <= half) return i;
  }
  return -1;
}

/**
 * Set every print's target prominence from where the pointer is: 1 for the
 * print under it, 0 for the rest. The print under the pointer is the topmost
 * (later prints lie over earlier ones) whose extent, as it is right now,
 * contains the pointer: its resting place plus the room the pile has opened
 * around it, at its current size. A hovered print only ever grows around
 * the pointer that raised it (about its centre, or, shifted by half its
 * growth, about its left edge), so the pointer stays inside it, and the pile
 * is stable under a pointer that does not cross into another print. Over a gap between prints, nothing changes: the pile only
 * closes when the pointer leaves it.
 */
function aim(s: Aim, geometry: Geometry) {
  const over = printUnder(s, geometry);
  if (over < 0) return;
  for (let i = 0; i < s.target.length; i++) {
    s.target[i] = i === over ? 1 : 0;
  }
}

type Focus = {
  f: number[];
  fv: number[];
  fTarget: number[];
  u: number[];
  uv: number[];
  uTarget: number[];
  p: number[];
  pv: number[];
  pTarget: number[];
  focused: number;
  reduced: boolean;
};

type Sim = Springs &
  Focus &
  Travel &
  Edges &
  Aim & { hovering: boolean; drag: unknown; geometry: Geometry | null };

/** Advance the lift, the uncover and the press by `dt` seconds. The lift is
 * never snapped for reduced motion — `riseOf` takes the travel out of it
 * instead — and it runs quicker on the way back down than on the way up. */
function lifts(s: Focus, dt: number, putBack: boolean): boolean {
  let moving = integrate(
    { g: s.f, v: s.fv, target: s.fTarget, reduced: false },
    putBack ? PUTBACK_STIFFNESS : FOCUS_STIFFNESS,
    putBack ? PUTBACK_DAMPING : FOCUS_DAMPING,
    dt,
  );
  const uncover = { g: s.u, v: s.uv, target: s.uTarget, reduced: s.reduced };
  moving = integrate(uncover, FOCUS_STIFFNESS, FOCUS_DAMPING, dt) || moving;
  const press = { g: s.p, v: s.pv, target: s.pTarget, reduced: s.reduced };
  return integrate(press, STIFFNESS, DAMPING, dt) || moving;
}

/** Advance the whole simulation by `dt` seconds. Returns whether anything is
 * still moving. */
function step(s: Sim, dt: number): boolean {
  let moving = false;
  // Putting a print back is the system answering, not the reader deciding,
  // so it goes quicker than the lift that raised it.
  const putBack = s.focused < 0;
  // Re-aim every frame: the pile may still be gliding under a still pointer. With
  // a print lifted the pile holds as it was at the click: nothing under the
  // print changes, so the print rises straight up from where it was.
  if (s.focused < 0 && s.hovering && s.geometry) aim(s, s.geometry);
  moving = integrate(s, STIFFNESS, DAMPING, dt) || moving;
  // A print's neighbour stays off it until it has landed, and, while any
  // print is up, until the pile is closed again: a print that is up must not
  // be slid about by a neighbour settling.
  if (putBack) {
    for (let i = 0; i < s.u.length; i++) {
      if ((s.f[i] ?? 0) < LANDED) s.uTarget[i] = 0;
    }
  }
  moving = lifts(s, dt, putBack) || moving;
  moving = settleEdges(s, dt) || moving;
  return settleTravel(s, dt) || moving;
}

/** Write the simulation to the DOM. Returns how many prints are in view. */
function paint(
  s: Sim,
  zone: HTMLElement | null,
  backdrop: HTMLElement | null,
  tiles: (HTMLLIElement | null)[],
): number {
  if (!s.geometry) return 0;
  layout(s, s.geometry, s.travel, tiles);
  if (zone) fadeEdges(zone, s, s.geometry.fade);
  if (backdrop) shade(backdrop, s, s.geometry, s.travel);
  for (let i = 0; i < tiles.length; i++) {
    const level =
      i === s.focused ? "top" : (s.f[i] ?? 0) >= LANDED ? "descending" : "pile";
    raise(tiles[i], i, level);
  }
  return countInView(s, s.geometry, s.travel);
}

type Springs = {
  g: number[];
  v: number[];
  target: number[];
  reduced: boolean;
};

/** Advance a set of per-print springs by `dt` seconds. Returns whether any
 * is still moving. With reduced motion they are simply at their targets. */
function integrate(
  s: Springs,
  stiffness: number,
  damping: number,
  dt: number,
): boolean {
  let moving = false;
  for (let i = 0; i < s.g.length; i++) {
    const g = s.g[i] ?? 0;
    const v = s.v[i] ?? 0;
    const target = s.target[i] ?? 0;
    if (s.reduced) {
      moving = moving || g !== target;
      s.g[i] = target;
      s.v[i] = 0;
      continue;
    }
    const nextV = v + (stiffness * (target - g) - damping * v) * dt;
    const nextG = g + nextV * dt;
    const settled =
      Math.abs(target - nextG) <= EPSILON && Math.abs(nextV) <= EPSILON;
    s.v[i] = settled ? 0 : nextV;
    s.g[i] = settled ? target : nextG;
    if (!settled) moving = true;
  }
  return moving;
}

type Travel = {
  travel: number;
  travelV: number;
  travelTarget: number;
  wheeledAt: number;
};

/** A drag holds the strip 1:1 and the spring only takes over on release;
 * reduced motion never glides, the strip is simply where it was put. */
function settleTravel(
  s: Travel & { drag: unknown; reduced: boolean },
  dt: number,
): boolean {
  if (s.drag || s.reduced) {
    s.travel = s.travelTarget;
    s.travelV = 0;
    return false;
  }
  return integrateTravel(s, dt);
}

/** Advance the strip's travel spring by `dt` seconds. Returns whether it is still moving. */
function integrateTravel(s: Travel, dt: number): boolean {
  const wheeling = performance.now() - s.wheeledAt < WHEEL_HOLD;
  const k = wheeling ? WHEEL_STIFFNESS : TRAVEL_STIFFNESS;
  const c = wheeling ? WHEEL_DAMPING : TRAVEL_DAMPING;
  const accel = k * (s.travelTarget - s.travel) - c * s.travelV;
  const nextV = s.travelV + accel * dt;
  const next = s.travel + nextV * dt;
  // Travel is in px, so settle on a tenth of one.
  const settled =
    Math.abs(s.travelTarget - next) <= 0.1 && Math.abs(nextV) <= 0.1;
  s.travelV = settled ? 0 : nextV;
  s.travel = settled ? s.travelTarget : next;
  return !settled;
}

/** Per-print prominence (hover) and uncover (lift). */
type Lifts = { g: number[]; u: number[] };

/**
 * Place every print for the current prominences and travel. The first print
 * is anchored, so the pile only ever opens to the right, never into the
 * window's clipped left edge.
 */
function layout(
  {
    g,
    f,
    u,
    p,
    offsets,
    edgeL,
    reduced,
  }: Lifts & {
    f: number[];
    p: number[];
    offsets: number[];
    edgeL: number;
    reduced: boolean;
  },
  geometry: Geometry,
  travel: number,
  tiles: (HTMLLIElement | null)[],
) {
  const half = geometry.visible / 2;
  let x = 0;
  for (let i = 0; i < g.length; i++) {
    if (i > 0) x += separation({ g, u }, geometry, i - 1);
    // The curve is read from the print's resting place less the travel, not
    // from where the opening has pushed it: a print sliding aside for a
    // neighbour keeps its lean and its drop, so the pile parts as a rigid
    // group instead of every print re-leaning as it goes. Travel still rolls
    // each print through upright.
    const centre = (geometry.centres[i] ?? 0) - travel;
    const arc = curve(centre - half, half, geometry.height);
    // A lifted print rises where it is, sliding inward only by as much as
    // it needs to clear the window's edges. Nothing else moves for it.
    const nudge = inward(i, { g, f }, { shift: x - travel, edgeL }, geometry);
    offsets[i] = x + nudge;
    pose(
      arc,
      { g: g[i] ?? 0, f: f[i] ?? 0, p: p[i] ?? 0, reduced },
      x + nudge - travel,
      tiles[i],
    );
  }
}

/** How close a lifted print may come to either edge of the window, in px. */
const INSET = 8;

/** How far print `i` must slide inward to stay clear of the window's
 * edges, in px. The left edge is the text edge and is clipped hard, so a
 * print growing past it (the first print has no earlier neighbour to make
 * room for its growth) is pushed right by exactly its overhang, whether it
 * is up under the pointer or lifted by a click. The fades are different:
 * prints sit in them at rest, and a print up under the pointer stays where
 * it is, since pulling it sideways would slide it out from under the
 * pointer. A lifted print, though, is pulled clear of both fades, easing in
 * with the lift: the mask covers everything in the zone, and a print left
 * inside a fade would be seen through, with the paragraph showing in it.
 * The left fade is only as far in as it has eased, which is what `edgeL`
 * says — read from the same value that places the mask, so the two cannot
 * drift apart. `shift` is where the print sits relative to its resting place
 * on screen (opening less travel). */
function inward(
  i: number,
  { g, f }: { g: number[]; f: number[] },
  { shift, edgeL }: { shift: number; edgeL: number },
  geometry: Geometry,
): number {
  const up = g[i] ?? 0;
  const lift = f[i] ?? 0;
  const { fade } = geometry;
  const { visible } = geometry;
  const scale = paperScale(up, lift);
  const halfWidth = ((geometry.widths[i] ?? 0) * scale) / 2;
  const centre = (geometry.centres[i] ?? 0) + shift;
  const edge = Math.min(0, centre - halfWidth - INSET);
  const fadeIn = fade * edgeL;
  const left = Math.min(0, centre - halfWidth - INSET - fadeIn);
  const right = Math.max(0, centre + halfWidth - (visible - INSET));
  // Eased by the print's own rise: a print already past the edge at rest
  // (the first print, once the pile has travelled) must not jump the whole
  // way on the first frame of a hover.
  return -edge * Math.max(up, lift) - (left - edge + right) * lift;
}

/** Write a print's pose: its place on the arc, `g` its prominence, `f` its
 * lift, `p` its press, `x` its horizontal offset. Lifted, the print is
 * upright, off the arc, and at its full size and height wherever the pointer
 * goes — though a press still dips it, as it dips any print. */
function pose(
  arc: { lean: number; drop: number },
  { g, f, p, reduced }: { g: number; f: number; p: number; reduced: boolean },
  x: number,
  tile: HTMLLIElement | null | undefined,
) {
  const shadow = tile?.firstElementChild as HTMLElement | null | undefined;
  if (!(tile && shadow)) return;
  const up = Math.max(g, f);
  const y = riseOf(g, f, arc.drop, reduced);
  const lean = reduced ? 0 : arc.lean * (1 - up);
  const scale = paperScale(g, f) * (1 - p * PRESS);
  tile.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${lean.toFixed(3)}deg) scale(${scale.toFixed(4)})`;
  shadow.style.opacity = Math.min(1, g + f).toFixed(3);
}

/**
 * The pool of shadow under a lifted print: moved under the print that is up
 * (or, as one lands and another rises, the one that is up the most) and
 * faded in with its lift. Transform and opacity only, on the compositor.
 */
function shade(
  backdrop: HTMLElement,
  { f, offsets }: { f: number[]; offsets: number[] },
  geometry: Geometry,
  travel: number,
) {
  let i = 0;
  for (let k = 1; k < f.length; k++) {
    if ((f[k] ?? 0) > (f[i] ?? 0)) i = k;
  }
  const x = (geometry.centres[i] ?? 0) + (offsets[i] ?? 0) - travel;
  const transform = `translateX(${x.toFixed(1)}px)`;
  if (backdrop.style.transform !== transform) {
    backdrop.style.transform = transform;
  }
  const opacity = (f[i] ?? 0).toFixed(3);
  if (backdrop.style.opacity !== opacity) backdrop.style.opacity = opacity;
}

/**
 * The two edge fades. Each says there is more pile beyond it, so each
 * belongs on screen exactly when there is: the left one once the pile has
 * travelled at all, the right one until it reaches the end. At rest the left
 * edge is crisp, which is what puts the first print's own edge on the text.
 *
 * Eased over time rather than driven off the travel, because distance made
 * them switch: tied to the travel they were either absent or complete within
 * a pixel or two of movement, and the fade snapped on rather than arriving.
 * EDGE_EASE is the time constant, so each covers about two thirds of the way
 * in 0.16s. Written on the zone itself, not through a custom property, so
 * nothing inside it has to recalculate style. Neither moves for a lift: a
 * lifted print is pulled clear of them instead (see `inward`), so it is
 * never seen through.
 */
function fadeEdges(zone: HTMLElement, s: Edges, fade: number) {
  const left = -fade * (1 - s.edgeL);
  const right = -fade * s.edgeR;
  const position = `${left.toFixed(1)}px 0, ${right.toFixed(1)}px 0`;
  if (zone.style.maskPosition !== position) {
    zone.style.maskPosition = position;
    zone.style.webkitMaskPosition = position;
  }
}

type Edges = { edgeL: number; edgeR: number };

/** Ease each edge toward where it belongs and say whether either is still
 * moving, so the loop keeps running until they have arrived. */
function settleEdges(
  s: Edges & Travel & { geometry: Geometry | null },
  dt: number,
): boolean {
  if (!s.geometry) return false;
  const want = (at: number, target: number) => {
    const next = at + (target - at) * (1 - Math.exp(-dt / EDGE_EASE));
    return Math.abs(target - next) < 0.001 ? target : next;
  };
  const before = s.edgeL + s.edgeR;
  s.edgeL = want(s.edgeL, s.travel > 0.5 ? 1 : 0);
  s.edgeR = want(s.edgeR, s.travel < s.geometry.maxTravel - 0.5 ? 1 : 0);
  return s.edgeL + s.edgeR !== before;
}

/**
 * Light each print's mark by how much of the print is inside the visible
 * window right now, from a resting glow to full. Opacity only, on the
 * compositor, and only written when it changes.
 */
function markDots(
  lifts: Lifts,
  geometry: Geometry,
  travel: number,
  dots: HTMLElement,
) {
  const { visible } = geometry;
  let x = 0;
  for (let i = 0; i < lifts.g.length; i++) {
    if (i > 0) x += separation(lifts, geometry, i - 1);
    const left = (geometry.lefts[i] ?? 0) + x - travel;
    const width = geometry.widths[i] ?? 1;
    const shown = (Math.min(left + width, visible) - Math.max(left, 0)) / width;
    const lit = (0.28 + 0.72 * clamp(shown, 0, 1)).toFixed(2);
    const dot = dots.children[i] as HTMLElement | undefined;
    if (dot && dot.style.opacity !== lit) dot.style.opacity = lit;
  }
}

/**
 * How many prints, counting from the first, have their left edge inside the
 * zone right now. Drives lazy loading: a print gets its real image the first
 * time it comes into view.
 *
 * The whole zone, fade included, not the visible window inside it. Prints
 * under the fade are still painted, only dimmed, so counting them out left
 * the one at the fade's edge showing its blur placeholder: a pale card at
 * the end of the fan that only became a photograph once the reader dragged
 * it out, or clicked it, which read as the picture loading late. The fade is
 * about one print wide, so this is an image or two more up front.
 */
function countInView(lifts: Lifts, geometry: Geometry, travel: number): number {
  const { zoneWidth } = geometry;
  let x = 0;
  let count = 0;
  for (let i = 0; i < lifts.g.length; i++) {
    if (i > 0) x += separation(lifts, geometry, i - 1);
    if ((geometry.lefts[i] ?? 0) + x - travel < zoneWidth) count = i + 1;
  }
  return count;
}

/**
 * How much further apart prints `k` and `k+1` sit than at rest, in px. Two
 * parts: print k+1 slides off print k in proportion to k's prominence (or
 * its uncover, for a lift: the same slide, no further), until at full
 * prominence it has cleared the overlap plus a little daylight; and both make
 * room for each other's hover growth, since each scales about its own centre.
 * Chained along the pile, this keeps every hovered print uncovered exactly as
 * much as it has come forward, with no change of stacking order ever needed.
 * A lifted print's extra growth makes no room: it is up out of the pile, on
 * top, and its neighbours don't move for it.
 */
function separation({ g, u }: Lifts, geometry: Geometry, k: number): number {
  const off = Math.max(g[k] ?? 0, u[k] ?? 0);
  const sizeK = (g[k] ?? 0) * GROWTH;
  const sizeN = (g[k + 1] ?? 0) * GROWTH;
  const wk = geometry.widths[k] ?? 0;
  const wn = geometry.widths[k + 1] ?? 0;
  const overlap = geometry.overlaps[k] ?? 0;
  return off * (overlap + GAP) + (wk * sizeK + wn * sizeN) / 2;
}
