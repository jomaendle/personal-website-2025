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
/** A click pulls the print up out of the pile where it is: lifted and grown
 * beyond the hover pose by these, on top of the hover growth and lift. Its
 * own spring, critically damped: a click carries no momentum, so nothing
 * should bounce. Response ≈ 0.26s. On a desktop the hover has already shown
 * most of the movement, but a tap has shown nothing, so this is the whole
 * answer to a touch and has to arrive inside the 300ms a UI gesture is
 * allowed: at the old 0.36s it took 380ms to look finished and was still
 * moving most of a second later. */
const FOCUS_GROWTH = 0.5;
const FOCUS_LIFT = 44;
const FOCUS_STIFFNESS = 580;
const FOCUS_DAMPING = 48;
/** A press dips the print under the pointer by this share of its size until
 * it is released: the pile answers on pointer-down, before the click lands. */
const PRESS = 0.04;
/** A press that moves less than this, in px, and lasts under this, in ms,
 * is a click, not a drag. */
const CLICK_SLOP = 6;
const CLICK_TIME = 500;
/** Resting the pointer in the outer band of the window drifts the pile toward
 * that end: the band's share of the window's width, and the drift at the very
 * edge in px per second. It ramps quadratically, so the inner half of the
 * band barely moves it and the pointer never has to fight the pile. */
const BAND = 0.22;
const CREEP = 200;
/** The drift's time constant, in seconds: it covers 63% of the way to full
 * speed in this long once the pointer has settled in a band, and dies away
 * as gently after it leaves.
 * A pointer that only sweeps through the band on its way somewhere else
 * moves the pile by next to nothing. */
const DWELL = 0.35;
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
/** Spring for the strip's travel. Critically damped, response ≈ 0.39s: the
 * pile glides rather than chases, and carries a released drag's velocity.
 * Near Apple's 0.4s for a repositioning gesture, and enough quicker than it
 * was that a flick stops feeling like it is still deciding. */
const TRAVEL_STIFFNESS = 260;
const TRAVEL_DAMPING = 32;
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
    /** How far the strip has travelled left, in px. */
    travel: 0,
    travelV: 0,
    travelTarget: 0,
    /** The pointer, in window coordinates, and whether it can open prints. */
    pointerX: 0,
    pointerY: 0,
    hovering: false,
    /** Which print the pointer is over, from `aim`. -1 for the background. */
    over: -1,
    /** Edge drift: -1 at the left edge, 1 at the right, 0 in the middle.
     * `drive` is where the pointer is; `driving` follows it over DWELL and
     * is what moves the pile. */
    drive: 0,
    driving: 0,
    /** An active drag: where it started, and recent samples for velocity. */
    drag: null as null | {
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
      disarm(s, stackRef.current);
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
      if (!s.geometry) measure();
      stackRef.current?.classList.add(ARMED);
      // Capture keeps the drag alive outside the zone. It throws if the
      // pointer is already gone, which is no reason to drop the drag.
      try {
        hit.setPointerCapture(event.pointerId);
      } catch {}
      // Grab the strip where it is, mid-glide included: no jump on touch.
      s.travelTarget = s.travel;
      s.travelV = 0;
      s.drive = 0;
      s.driving = 0;
      s.drag = {
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

    const hoverMove = (event: PointerEvent, geometry: Geometry) => {
      s.pointerX = event.clientX - geometry.zoneLeft;
      s.pointerY = event.clientY - geometry.zoneTop;
      s.hovering = true;
      s.over = printUnder(s, geometry);
      showCursor(hit, s);
      // No edge drift while a print is lifted: the pile holds still.
      s.drive = s.focused >= 0 ? 0 : driveFor(s.pointerX, geometry);
      reportHover(report.current, s.drive);
    };

    const handleMove = (event: PointerEvent) => {
      if (!s.geometry) measure();
      const geometry = s.geometry as Geometry;
      if (s.drag) dragMove(event, geometry);
      else if (canHover && !s.reduced) hoverMove(event, geometry);
      else return;
      start();
    };

    /** Take print `next` up out of the pile. The pile holds still while it
     * is up (see `step`), so the hover targets are cleared and only the
     * print under a hovering pointer stays raised: a print the keys leaf
     * away from goes down rather than staying up.
     *
     * Its neighbour keeps off it only if a hover had already moved it. A
     * finger has no hover, and a lifted print is above the pile at nearly
     * twice the size, so it needs no room made for it — setting this on a
     * tap slid every print to its right 42px sideways at once, which read
     * as the page lurching under the thumb. */
    const raiseOne = (next: number) => {
      s.fTarget[next] = 1;
      s.uTarget[next] = s.hovering ? 1 : 0;
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
    const handleCancel = () => {
      if (!s.drag) return;
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
      if (!s.drag) return;
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
      s.drive = 0;
      s.target.fill(0);
      if (event.pointerType === "mouse" && s.focused >= 0) lift(-1);
      start();
    };

    // Only while a print is lifted: the keys belong to the page
    // otherwise.
    const handleKey = (event: KeyboardEvent) => {
      if (s.focused < 0) return;
      if (event.key === "Escape") lift(-1);
      else if (event.key === "ArrowRight") lift(s.focused + 1);
      else if (event.key === "ArrowLeft") lift(s.focused - 1);
      else return;
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

    // Promoting on arrival gives the browser notice before the first frame,
    // which is what `will-change` is for; `runFrame` drops it when the
    // springs settle.
    const arm = () => {
      measure();
      stackRef.current?.classList.add(ARMED);
    };

    hit.addEventListener("pointerenter", arm);
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
      hit.removeEventListener("pointerenter", arm);
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
        <ul ref={listRef} aria-hidden="true" className={styles.list}>
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
                {index < revealed ? (
                  <div className={styles.photo}>
                    <Image
                      src={print}
                      alt=""
                      fill
                      placeholder="blur"
                      sizes={sizesFor(landscape)}
                      quality={80}
                      draggable={false}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  // Not in the window yet: the blur placeholder alone, until the
                  // strip brings this print into view.
                  <div
                    className={styles.photo}
                    style={{
                      backgroundImage: `url(${print.blurDataURL})`,
                      backgroundSize: "cover",
                    }}
                  />
                )}
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

/** Everything has settled: give the compositor layers back, unless the
 * pointer is still on the pile and about to need them again. A phone has
 * little GPU memory, and an untouched pile should hold none of it. */
function disarm(
  s: { hovering: boolean; drag: unknown },
  stack: HTMLElement | null,
) {
  if (s.hovering || s.drag) return;
  stack?.classList.remove(ARMED);
}

/** Hovering counts once; resting in an edge band also counts as travel. */
function reportHover(report: Report, drive: number) {
  report("hover");
  if (drive !== 0) report("travel");
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
function showCursor(hit: HTMLElement, s: { over: number }) {
  const cursor = s.over >= 0 ? "pointer" : "";
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

/** Below this much lift a print counts as landed: within 2px of its resting
 * size and a pixel of its resting height. */
const LANDED = 0.02;

/** Source width to ask for: the print at its largest on screen, lifted by a
 * click, so a lift never changes the source. Swapping to a sharper image as
 * the print rose made it pop into focus a beat after it had landed.
 *
 * Paper height × the orientation's width share × the lift's scale
 * (1 + GROWTH + FOCUS_GROWTH = 1.85), at both of the stylesheet's paper
 * heights — 120px above 640px wide, 72px below (see `--print`) — then
 * rounded up to a round number: 177.6 and 277.5 become 192 and 288, 106.6
 * and 166.5 become 108 and 168. The rounding changes no variant; it only
 * spares the reader four awkward decimals. The query must stay in step with
 * that breakpoint. A phone's print is two-fifths of a desktop's, so without
 * the narrow arm every phone would fetch a source four times the area it
 * can show. */
function sizesFor(landscape: boolean): string {
  return landscape
    ? "(min-width: 640px) 288px, 168px"
    : "(min-width: 640px) 192px, 108px";
}

type Drag = {
  drag: null | {
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

/** Edge drift for a pointer at `pointerX`: the visible window is the zone
 * less the fade, and only its outer bands drift the pile, toward that end. */
function driveFor(pointerX: number, geometry: Geometry): number {
  const visible = geometry.zoneWidth - geometry.fade;
  const band = visible * BAND;
  if (pointerX < band) return -(1 - pointerX / band);
  if (pointerX > visible - band) return 1 - (visible - pointerX) / band;
  return 0;
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
  /** Which print the pointer is over, as last judged from the geometry. */
  over: number;
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
    const scale = 1 + g * GROWTH * (1 - f) + f * (GROWTH + FOCUS_GROWTH);
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
  Drift &
  Aim & { hovering: boolean; drag: unknown };

/** Advance the whole simulation by `dt` seconds. Returns whether anything is
 * still moving. */
function step(s: Sim, dt: number): boolean {
  let moving = creep(s, dt);
  // Re-aim every frame: the pile may be drifting under a still pointer. With
  // a print lifted the pile holds as it was at the click: nothing under the
  // print changes, so the print rises straight up from where it was.
  if (s.focused < 0 && s.hovering && s.geometry) aim(s, s.geometry);
  moving = integrate(s, STIFFNESS, DAMPING, dt) || moving;
  moving =
    integrate(
      { g: s.f, v: s.fv, target: s.fTarget, reduced: s.reduced },
      FOCUS_STIFFNESS,
      FOCUS_DAMPING,
      dt,
    ) || moving;
  // A print's neighbour stays off it until it has landed, and, while any
  // print is up, until the pile is closed again: a print that is up must not
  // be slid about by a neighbour settling.
  if (s.focused < 0) {
    for (let i = 0; i < s.u.length; i++) {
      if ((s.f[i] ?? 0) < LANDED) s.uTarget[i] = 0;
    }
  }
  // On the lift's own spring, so that whatever the neighbour still has to
  // slide (a print clicked off-centre was not fully uncovered) moves with
  // the print rising, as one motion, rather than darting off ahead of it.
  moving =
    integrate(
      { g: s.u, v: s.uv, target: s.uTarget, reduced: s.reduced },
      FOCUS_STIFFNESS,
      FOCUS_DAMPING,
      dt,
    ) || moving;
  moving =
    integrate(
      { g: s.p, v: s.pv, target: s.pTarget, reduced: s.reduced },
      STIFFNESS,
      DAMPING,
      dt,
    ) || moving;
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
  if (zone) fadeLeft(zone, s.travel, s.geometry.fade);
  if (backdrop) shade(backdrop, s, s.geometry, s.travel);
  for (let i = 0; i < tiles.length; i++) {
    const level =
      i === s.focused ? "top" : (s.f[i] ?? 0) >= LANDED ? "descending" : "pile";
    raise(tiles[i], i, level);
  }
  return countInView(s, s.geometry, s.travel);
}

type Drift = {
  drive: number;
  driving: number;
  travelTarget: number;
  geometry: Geometry | null;
};

/** Drift the travel target while the pointer rests in an edge band. The
 * drift follows the pointer's position over DWELL, so it has to rest there
 * to move the pile, and lets go as gently. Returns whether anything moved. */
function creep(s: Drift, dt: number): boolean {
  if (!s.geometry) return false;
  s.driving += (s.drive - s.driving) * (1 - Math.exp(-dt / DWELL));
  if (Math.abs(s.driving) < 0.005) s.driving = 0;
  if (s.driving === 0) return false;
  const before = s.travelTarget;
  s.travelTarget = clamp(
    before + s.driving * Math.abs(s.driving) * CREEP * dt,
    0,
    s.geometry.maxTravel,
  );
  // Still moving while the target moves or the drift is still ramping; a
  // pointer parked in a band with the pile already at that end lets the
  // loop stop.
  return s.travelTarget !== before || Math.abs(s.drive - s.driving) > 0.005;
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

type Travel = { travel: number; travelV: number; travelTarget: number };

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
  const accel =
    TRAVEL_STIFFNESS * (s.travelTarget - s.travel) - TRAVEL_DAMPING * s.travelV;
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
  }: Lifts & { f: number[]; p: number[]; offsets: number[] },
  geometry: Geometry,
  travel: number,
  tiles: (HTMLLIElement | null)[],
) {
  const half = (geometry.zoneWidth - geometry.fade) / 2;
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
    const nudge = inward(i, { g, f }, { shift: x - travel, travel }, geometry);
    offsets[i] = x + nudge;
    pose(
      arc,
      { g: g[i] ?? 0, f: f[i] ?? 0, p: p[i] ?? 0 },
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
 * The left fade is only as far in as the travel has brought it. `shift` is
 * where the print sits relative to its resting place on screen (opening
 * less travel). */
function inward(
  i: number,
  { g, f }: { g: number[]; f: number[] },
  { shift, travel }: { shift: number; travel: number },
  geometry: Geometry,
): number {
  const up = g[i] ?? 0;
  const lift = f[i] ?? 0;
  const { fade } = geometry;
  const visible = geometry.zoneWidth - fade;
  const scale = 1 + up * GROWTH * (1 - lift) + lift * (GROWTH + FOCUS_GROWTH);
  const halfWidth = ((geometry.widths[i] ?? 0) * scale) / 2;
  const centre = (geometry.centres[i] ?? 0) + shift;
  const edge = Math.min(0, centre - halfWidth - INSET);
  const fadeIn = fade * clamp(travel / fade, 0, 1);
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
  { g, f, p }: { g: number; f: number; p: number },
  x: number,
  tile: HTMLLIElement | null | undefined,
) {
  const shadow = tile?.firstElementChild as HTMLElement | null | undefined;
  if (!(tile && shadow)) return;
  const up = Math.max(g, f);
  const rest = 1 - f;
  const y = (arc.drop - g * LIFT) * rest - f * (LIFT + FOCUS_LIFT);
  const lean = arc.lean * (1 - up);
  const scale =
    (1 + g * GROWTH * rest + f * (GROWTH + FOCUS_GROWTH)) * (1 - p * PRESS);
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
 * The left-hand fade. Its mask layer sits just off the window at rest, so the
 * first print lands crisp on the text edge, and slides in over the first
 * `fade` px of travel. Written on the zone itself, not through a custom
 * property, so nothing inside it has to recalculate style. The fades never
 * move for a lift: a lifted print is pulled clear of them instead (see
 * `inward`), so it is never seen through.
 */
function fadeLeft(zone: HTMLElement, travel: number, fade: number) {
  const offset = -fade * (1 - clamp(travel / fade, 0, 1));
  const position = `${offset.toFixed(1)}px 0, 0 0`;
  if (zone.style.maskPosition !== position) {
    zone.style.maskPosition = position;
    zone.style.webkitMaskPosition = position;
  }
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
  const visible = geometry.zoneWidth - geometry.fade;
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
 * visible window (the zone less its fade) right now. Drives lazy loading: a
 * print gets its real image the first time it comes into view.
 */
function countInView(lifts: Lifts, geometry: Geometry, travel: number): number {
  const visible = geometry.zoneWidth - geometry.fade;
  let x = 0;
  let count = 0;
  for (let i = 0; i < lifts.g.length; i++) {
    if (i > 0) x += separation(lifts, geometry, i - 1);
    if ((geometry.lefts[i] ?? 0) + x - travel < visible) count = i + 1;
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
