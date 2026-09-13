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
 * centre, half the window), so at the window's edge it is 45°. The lean is
 * that angle scaled to LEAN at the edge; the drop is the arc's sag, capped at
 * DROP. The stylesheet computes the same curve in CSS for the resting fan
 * (`--angle`, `--lean`, `--drop` on `.tile`), so the server's pose matches the
 * first client frame at any window width: keep the numbers in step.
 */
const LEAN = 10;
const DROP = 14;
const SAG = 48;
function curve(dx: number, half: number): { lean: number; drop: number } {
  const angle = Math.atan2(dx, half);
  return {
    lean: clamp(angle * (180 / Math.PI) * (LEAN / 45), -LEAN, LEAN),
    drop: Math.min(DROP, SAG * (1 - Math.cos(angle))),
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
/** How far the pointer's pull reaches, in neighbour spacings (the average
 * distance between print centres). Measured that way so the crest keeps its
 * shape whatever the mix of print widths: at 1.7 the immediate neighbours
 * grow about a third as much as the hovered print, the next ones not at all. */
const REACH = 1.7;
/** Peak scale-up, as a fraction, and how far the print lifts at the peak, in px. */
const GROWTH = 0.35;
const LIFT = 12;
/** Daylight between a fully uncovered print and the neighbour that slid off it. */
const GAP = 6;
/** A click pulls the print up out of the pile where it is: lifted and grown
 * beyond the hover pose by these, on top of the hover growth and lift. Its
 * own spring, critically damped: a click carries no momentum, so nothing
 * should bounce. */
const FOCUS_GROWTH = 0.5;
const FOCUS_LIFT = 44;
const FOCUS_STIFFNESS = 300;
const FOCUS_DAMPING = 35;
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
/** A drag past either end follows the finger less and less: how far it can
 * go, in px, and how stiffly it resists. */
const RUBBER_REACH = 96;
const RUBBER = 0.55;
/** Momentum after a release decays like a scroll view (Apple's projection). */
const DECELERATION = 0.997;
/** Spring for a print's prominence. Damping ratio ≈ 0.85, response ≈ 0.16s:
 * the print reaches the pointer almost at once and settles without a visible
 * bounce, which is what pointer-tracking wants. */
const STIFFNESS = 1600;
const DAMPING = 68;
/** Spring for the strip's travel. Critically damped, response ≈ 0.45s: the
 * pile glides rather than chases, and carries a released drag's velocity. */
const TRAVEL_STIFFNESS = 200;
const TRAVEL_DAMPING = 28;
/** Below this a spring counts as settled and the loop can stop. */
const EPSILON = 0.0005;

type Report = (action: "hover" | "travel" | "lift", print?: number) => void;

/** Resting layout, measured once per pointer visit. All in px, relative to
 * the list's left edge. `unit` is the average neighbour spacing; `overlap[k]`
 * is how much print k+1 covers print k. */
type Geometry = {
  zoneLeft: number;
  zoneWidth: number;
  fade: number;
  unit: number;
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
 * paper height, as prints do. Under the pointer the nearest print straightens,
 * lifts and grows, and the prints to its right slide aside in proportion, so
 * it is uncovered by its neighbour gliding off it rather than by jumping in
 * front. Nothing ever changes stacking order: the reveal is continuous, and
 * crossing to the next print is the same motion played backwards.
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
 * the mouse leaving puts it back, and the arrow keys leaf from one print to
 * the next. The pile holds still underneath while a print is up. Its
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
 * for every pointer. With reduced motion the drag still tracks 1:1 but
 * nothing coasts or opens. Without JavaScript, the resting fan the server
 * rendered is what you get.
 */
export function ImageStack() {
  const zoneRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [revealed, setRevealed] = useState(INITIAL_WINDOW);
  const [focused, setFocused] = useState(-1);
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
    hovering: false,
    /** Edge drift: -1 at the left edge, 1 at the right, 0 in the middle. */
    drive: 0,
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
    const dt = Math.min(32, now - (s.last || now)) / 1000;
    s.last = now;

    const moving = step(s, dt);
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
    if (!moving) s.last = 0;
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
      const span = (centres.at(-1) ?? 0) - (centres[0] ?? 0);
      const overlaps = lefts.map((left, i) =>
        Math.max(0, left + (widths[i] ?? 0) - (lefts[i + 1] ?? Infinity)),
      );
      const zoneRect = zone.getBoundingClientRect();
      const fade = Number.parseFloat(getComputedStyle(zone).paddingRight);
      // The strip must be able to travel far enough that the last print,
      // fully opened, clears the fade. Opening adds the overlap it sheds, the
      // gap, and its own growth.
      const opened = Math.max(...overlaps) + GAP + GROWTH * Math.max(...widths);
      s.geometry = {
        zoneLeft: zoneRect.left,
        zoneWidth: zoneRect.width,
        fade,
        unit: Math.max(1, span / Math.max(1, centres.length - 1)),
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
      // Capture keeps the drag alive outside the zone. It throws if the
      // pointer is already gone, which is no reason to drop the drag.
      try {
        hit.setPointerCapture(event.pointerId);
      } catch {}
      // Grab the strip where it is, mid-glide included: no jump on touch.
      s.travelTarget = s.travel;
      s.travelV = 0;
      s.drive = 0;
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
      s.hovering = true;
      showCursor(hit, event, tileRefs.current, s.focused);
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

    /** Lift print `index` out of the pile, or put the lifted one back (-1).
     * Uncovering it (its neighbour sliding off) is its own state, so that it
     * can outlast the lift: see `step`. */
    const lift = (index: number) => {
      const next = index < PRINTS.length ? index : -1;
      s.fTarget.fill(0);
      if (next >= 0) {
        s.fTarget[next] = 1;
        s.uTarget[next] = 1;
        // The pile holds while a print is up (see `step`), so take the
        // pointer's aim once now: what it holds is where the pointer is at
        // the click, not where it was at an earlier one.
        if (s.hovering && s.geometry) aim(s, s.geometry);
        report.current("lift", next + 1);
      }
      s.focused = next;
      setFocused(next);
      start();
    };

    /** What a click on `index` (-1 for the background) does: lifts the
     * print, or puts it back if it is the one lifted; on the background,
     * puts back whatever is lifted. */
    const click = (index: number) => {
      lift(index === s.focused ? -1 : index);
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
      s.travelV = velocity;
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

    hit.addEventListener("pointerenter", measure);
    hit.addEventListener("pointerdown", handleDown);
    hit.addEventListener("pointermove", handleMove, { passive: true });
    hit.addEventListener("pointerup", handleUp);
    hit.addEventListener("pointercancel", handleUp);
    hit.addEventListener("pointerleave", handleLeave);
    hit.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      hit.removeEventListener("pointerenter", measure);
      hit.removeEventListener("pointerdown", handleDown);
      hit.removeEventListener("pointermove", handleMove);
      hit.removeEventListener("pointerup", handleUp);
      hit.removeEventListener("pointercancel", handleUp);
      hit.removeEventListener("pointerleave", handleLeave);
      hit.removeEventListener("wheel", handleWheel);
      if (s.frame !== null) cancelAnimationFrame(s.frame);
      s.frame = null;
    };
  }, [start]);

  return (
    // The zone is the window onto the strip and the pointer's detection
    // area. Its vertical padding is headroom for the lift and the scale above
    // and for the outer prints' rotated corners below, and must contain every
    // print in every state: check it if LIFT, GROWTH or DROP change. Its
    // right padding is the fade.
    <div className={styles.stack}>
      <div ref={zoneRef} className={styles.zone}>
        {/* A soft pool of shadow behind the pile, faded in with a lift. First
            child, so it is under every print. */}
        <div ref={backdropRef} className={styles.backdrop} />
        {/* The pointer's surface: the window's box, grown to cover a lifted
            print. The zone itself takes no pointer events, because its box
            reaches up over the paragraph to give a lifted print room. */}
        <div
          ref={hitRef}
          className={styles.hit}
          style={focused >= 0 ? { top: 0 } : undefined}
        />
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
                      sizes={sizesFor(landscape, index === focused)}
                      quality={index === focused ? 90 : 80}
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

/** Say what a click would do: a pointer over a print, a hand elsewhere. */
function showCursor(
  hit: HTMLElement,
  event: PointerEvent,
  tiles: (HTMLLIElement | null)[],
  focused: number,
) {
  const over = printAt(event.clientX, event.clientY, tiles, focused);
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
  return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
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

/** Source width to ask for: the print at its largest on screen (paper ×
 * hover growth), or half as big again when lifted by a click. On a 2×
 * display these land on the 256/384 and 384/640 variants. */
function sizesFor(landscape: boolean, lifted: boolean): string {
  if (lifted) return landscape ? "288px" : "192px";
  return landscape ? "192px" : "128px";
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
  target: number[];
  offsets: number[];
  pointerX: number;
  travel: number;
};

/**
 * Set every print's target prominence from where the pointer is. Judged
 * against where each print's centre is right now: its resting place plus
 * the room the pile has opened around it, less the strip's travel. A print
 * that grows shifts a little to make room, and this keeps the pointer
 * pointing at it rather than at its resting outline.
 */
function aim(s: Aim, geometry: Geometry) {
  const x = s.pointerX + s.travel;
  for (let i = 0; i < s.target.length; i++) {
    const centre = (geometry.centres[i] ?? 0) + (s.offsets[i] ?? 0);
    const distance = Math.abs(x - centre) / geometry.unit;
    s.target[i] =
      distance >= REACH
        ? 0
        : 0.5 * (1 + Math.cos((Math.PI * distance) / REACH));
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

/** Advance every print's lift spring by `dt` seconds. With reduced motion
 * the print is simply up, or back. */
function integrateFocus(s: Focus, dt: number): boolean {
  let moving = false;
  for (let i = 0; i < s.f.length; i++) {
    const f = s.f[i] ?? 0;
    const v = s.fv[i] ?? 0;
    const target = s.fTarget[i] ?? 0;
    if (s.reduced) {
      moving = moving || f !== target;
      s.f[i] = target;
      s.fv[i] = 0;
      continue;
    }
    const nextV = v + (FOCUS_STIFFNESS * (target - f) - FOCUS_DAMPING * v) * dt;
    const nextF = f + nextV * dt;
    const settled =
      Math.abs(target - nextF) <= EPSILON && Math.abs(nextV) <= EPSILON;
    s.fv[i] = settled ? 0 : nextV;
    s.f[i] = settled ? target : nextF;
    if (!settled) moving = true;
  }
  return moving;
}

/** Advance the whole simulation by `dt` seconds. Returns whether anything is
 * still moving. */
function step(s: Sim, dt: number): boolean {
  let moving = creep(s, dt);
  // Re-aim every frame: the pile may be drifting under a still pointer. With
  // a print lifted the pile holds as it was at the click: nothing under the
  // print changes, so the print rises straight up from where it was.
  if (s.focused < 0 && s.hovering && s.geometry) aim(s, s.geometry);
  moving = integrate(s, STIFFNESS, DAMPING, dt) || moving;
  moving = integrateFocus(s, dt) || moving;
  // A print's neighbour stays off it until it has landed, and, while any
  // print is up, until the pile is closed again: a print that is up must not
  // be slid about by a neighbour settling.
  if (s.focused < 0) {
    for (let i = 0; i < s.u.length; i++) {
      if ((s.f[i] ?? 0) < LANDED) s.uTarget[i] = 0;
    }
  }
  moving =
    integrate(
      { g: s.u, v: s.uv, target: s.uTarget, reduced: s.reduced },
      STIFFNESS,
      DAMPING,
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
  travelTarget: number;
  geometry: Geometry | null;
};

/** Drift the travel target while the pointer rests in an edge band. Returns
 * whether it moved. */
function creep(s: Drift, dt: number): boolean {
  if (s.drive === 0 || !s.geometry) return false;
  const before = s.travelTarget;
  s.travelTarget = clamp(
    before + s.drive * Math.abs(s.drive) * CREEP * dt,
    0,
    s.geometry.maxTravel,
  );
  return s.travelTarget !== before;
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

/**
 * Place every print for the current prominences and travel. The first print
 * is anchored, so the pile only ever opens to the right, never into the
 * window's clipped left edge.
 */
/** Per-print prominence (hover) and uncover (lift). */
type Lifts = { g: number[]; u: number[] };

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
    // Where this print's centre sits across the window right now, and the
    // curve it takes there.
    const centre = (geometry.centres[i] ?? 0) + x - travel;
    const arc = curve(centre - half, half);
    // A lifted print rises where it is, sliding inward only by as much as
    // it needs to clear the window's edges. Nothing else moves for it.
    const nudge = inward(i, { g, f }, x - travel, geometry);
    offsets[i] = x + nudge;
    pose(
      arc,
      { g: g[i] ?? 0, f: f[i] ?? 0, p: p[i] ?? 0 },
      x + nudge - travel,
      tiles[i],
    );
  }
}

/** How far print `i`, lifted by `f`, must slide inward to stay clear of the
 * window's edges, in px, easing in with the lift. `shift` is where the print
 * sits relative to its resting place on screen (opening less travel). */
const INSET = 8;
function inward(
  i: number,
  { g, f }: { g: number[]; f: number[] },
  shift: number,
  geometry: Geometry,
): number {
  const lift = f[i] ?? 0;
  if (lift <= 0) return 0;
  const visible = geometry.zoneWidth - geometry.fade;
  const scale =
    1 + (g[i] ?? 0) * GROWTH * (1 - lift) + lift * (GROWTH + FOCUS_GROWTH);
  const halfWidth = ((geometry.widths[i] ?? 0) * scale) / 2;
  const centre = (geometry.centres[i] ?? 0) + shift;
  const over =
    Math.min(0, centre - halfWidth - INSET) +
    Math.max(0, centre + halfWidth - (visible - INSET));
  return -over * lift;
}

/** Write a print's pose: its place on the arc, `g` its prominence, `f` its
 * lift, `p` its press, `x` its horizontal offset. Lifted, the print is
 * upright, off the arc, and at its full size and height whatever the pointer
 * is doing. */
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
 * property, so nothing inside it has to recalculate style.
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
