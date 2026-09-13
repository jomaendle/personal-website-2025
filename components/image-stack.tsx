"use client";

import Image, { type StaticImageData } from "next/image";
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
 * server renders these with real images and the rest as placeholders. */
const INITIAL_WINDOW = 6;

/** The curve belongs to the window, not the strip: a print stands upright at
 * the window's centre and leans out toward either edge, so as the pile
 * travels each print rolls through upright. Lean at the edge, in degrees,
 * and drop at the edge, in px; both ease in quadratically. */
const LEAN = 10;
const DROP = 14;
/** Layout ratios the stylesheet uses, repeated here so the server can place
 * the resting curve before anything is measured. Keep in step with
 * `--w` (portrait, landscape), `--tuck` and the window's width in prints. */
const PAPER = { portrait: 0.8, landscape: 1.25 };
const TUCK = 0.4;
const WINDOW_PRINTS = 4.6;
/** Where each print's centre sits at rest, in paper heights, relative to the
 * window's centre: -1 at the left edge, 1 at the right. */
const REST_CURVE: number[] = (() => {
  let x = 0;
  return PRINTS.map((print) => {
    const w = print.width >= print.height ? PAPER.landscape : PAPER.portrait;
    const centre = x + w / 2;
    x += w * (1 - TUCK);
    return clamp((centre - WINDOW_PRINTS / 2) / (WINDOW_PRINTS / 2), -1, 1);
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
  const listRef = useRef<HTMLUListElement>(null);
  const tileRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [revealed, setRevealed] = useState(INITIAL_WINDOW);
  const state = useRef({
    /** Prominence per print: 0 at rest, 1 directly under the pointer. */
    g: PRINTS.map(() => 0),
    v: PRINTS.map(() => 0),
    target: PRINTS.map(() => 0),
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
    drag: null as null | { originX: number; originTravel: number },
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
    const inView = paint(s, zoneRef.current, tileRefs.current);
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
    const list = listRef.current;
    if (!(zone && list)) return;
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
        zone.setPointerCapture(event.pointerId);
      } catch {}
      // Grab the strip where it is, mid-glide included: no jump on touch.
      s.travelTarget = s.travel;
      s.travelV = 0;
      s.drive = 0;
      s.drag = { originX: event.clientX, originTravel: s.travel };
      s.samples = [{ x: event.clientX, t: event.timeStamp }];
      start();
    };

    const handleMove = (event: PointerEvent) => {
      if (!s.geometry) measure();
      const geometry = s.geometry as Geometry;

      if (s.drag) {
        dragTo(s, event, geometry);
        start();
        return;
      }

      if (!canHover || s.reduced) return;
      s.pointerX = event.clientX - geometry.zoneLeft;
      s.hovering = true;
      s.drive = driveFor(s.pointerX, geometry);
      start();
    };

    const handleUp = (event: PointerEvent) => {
      if (!s.drag) return;
      s.drag = null;
      const geometry = s.geometry as Geometry;
      const velocity = s.reduced ? 0 : releaseVelocity(s.samples, event);
      // Where the coast would end decides where it settles; the spring then
      // starts at the finger's speed, so there is no seam at the release.
      const landing = s.travel + project(velocity);
      s.travelTarget = clamp(landing, 0, geometry.maxTravel);
      s.travelV = velocity;
      start();
    };

    const handleLeave = () => {
      s.hovering = false;
      s.drive = 0;
      s.target.fill(0);
      start();
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
      start();
    };

    // The pointer is tracked on the zone, not the list. The list's box is the
    // resting layout, and a print under the pointer lifts and shifts out of
    // it as it grows; hit-testing that would flicker enter/leave at every
    // edge. The zone never moves and already contains every print in every
    // state, so it behaves like a fixed detection region.
    zone.addEventListener("pointerenter", measure);
    zone.addEventListener("pointerdown", handleDown);
    zone.addEventListener("pointermove", handleMove, { passive: true });
    zone.addEventListener("pointerup", handleUp);
    zone.addEventListener("pointercancel", handleUp);
    zone.addEventListener("pointerleave", handleLeave);
    zone.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      zone.removeEventListener("pointerenter", measure);
      zone.removeEventListener("pointerdown", handleDown);
      zone.removeEventListener("pointermove", handleMove);
      zone.removeEventListener("pointerup", handleUp);
      zone.removeEventListener("pointercancel", handleUp);
      zone.removeEventListener("pointerleave", handleLeave);
      zone.removeEventListener("wheel", handleWheel);
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
    <div ref={zoneRef} className={styles.zone}>
      <ul ref={listRef} aria-hidden="true" className={styles.list}>
        {PRINTS.map((print, index) => {
          const t = REST_CURVE[index] ?? 0;
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
                  "--lean": `${(t * LEAN).toFixed(2)}deg`,
                  "--drop": `${(t * t * DROP).toFixed(2)}px`,
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
                    // Sized for the print at its largest: 96px paper × 1.35
                    // open = 130px, landscape 150 × 1.35 = 203px, so a 2×
                    // display gets the 256 / 384 variants from `imageSizes`
                    // and stays crisp under the pointer.
                    sizes={landscape ? "192px" : "128px"}
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
  );
}

type Drag = {
  drag: null | { originX: number; originTravel: number };
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
  pointerX: number;
  travel: number;
};

/**
 * Set every print's target prominence from where the pointer is. Judged in
 * the strip's own resting coordinates, so the pointer is offset by how far
 * the strip has travelled.
 */
function aim(s: Aim, geometry: Geometry) {
  const x = s.pointerX + s.travel;
  for (let i = 0; i < s.target.length; i++) {
    const distance = Math.abs(x - (geometry.centres[i] ?? 0)) / geometry.unit;
    s.target[i] =
      distance >= REACH
        ? 0
        : 0.5 * (1 + Math.cos((Math.PI * distance) / REACH));
  }
}

type Sim = Springs &
  Travel &
  Drift &
  Aim & { hovering: boolean; drag: unknown; reduced: boolean };

/** Advance the whole simulation by `dt` seconds. Returns whether anything is
 * still moving. */
function step(s: Sim, dt: number): boolean {
  let moving = creep(s, dt);
  // Re-aim every frame: the pile may be drifting under a still pointer.
  if (s.hovering && s.geometry) aim(s, s.geometry);
  moving = integrate(s, dt) || moving;
  return settleTravel(s, dt) || moving;
}

/** Write the simulation to the DOM. Returns how many prints are in view. */
function paint(
  s: Sim,
  zone: HTMLElement | null,
  tiles: (HTMLLIElement | null)[],
): number {
  layout(s.g, s.geometry, s.travel, tiles);
  if (!s.geometry) return 0;
  if (zone) fadeLeft(zone, s.travel, s.geometry.fade);
  return countInView(s.g, s.geometry, s.travel);
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

type Springs = { g: number[]; v: number[]; target: number[] };

/** Advance every print's spring by `dt` seconds. Returns whether any is still moving. */
function integrate(s: Springs, dt: number): boolean {
  let moving = false;
  for (let i = 0; i < s.g.length; i++) {
    const g = s.g[i] ?? 0;
    const v = s.v[i] ?? 0;
    const target = s.target[i] ?? 0;
    const nextV = v + (STIFFNESS * (target - g) - DAMPING * v) * dt;
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
function layout(
  g: number[],
  geometry: Geometry | null,
  travel: number,
  tiles: (HTMLLIElement | null)[],
) {
  const half = geometry ? (geometry.zoneWidth - geometry.fade) / 2 : 1;
  let x = 0;
  for (let i = 0; i < g.length; i++) {
    if (i > 0 && geometry) x += separation(g, geometry, i - 1);
    // Where this print's centre sits across the window right now.
    const t = geometry
      ? clamp(((geometry.centres[i] ?? 0) + x - travel - half) / half, -1, 1)
      : (REST_CURVE[i] ?? 0);
    pose(t, g[i] ?? 0, x - travel, tiles[i]);
  }
}

/** Write a print's pose: `t` is its place across the window (-1 to 1), `g`
 * its prominence, `x` its horizontal offset. */
function pose(
  t: number,
  g: number,
  x: number,
  tile: HTMLLIElement | null | undefined,
) {
  const shadow = tile?.firstElementChild as HTMLElement | null | undefined;
  if (!(tile && shadow)) return;
  const y = t * t * DROP - g * LIFT;
  const lean = t * LEAN * (1 - g);
  tile.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${lean.toFixed(3)}deg) scale(${(1 + g * GROWTH).toFixed(4)})`;
  shadow.style.opacity = g.toFixed(3);
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
 * How many prints, counting from the first, have their left edge inside the
 * visible window (the zone less its fade) right now. Drives lazy loading: a
 * print gets its real image the first time it comes into view.
 */
function countInView(g: number[], geometry: Geometry, travel: number): number {
  const visible = geometry.zoneWidth - geometry.fade;
  let x = 0;
  let count = 0;
  for (let i = 0; i < g.length; i++) {
    if (i > 0) x += separation(g, geometry, i - 1);
    if ((geometry.lefts[i] ?? 0) + x - travel < visible) count = i + 1;
  }
  return count;
}

/**
 * How much further apart prints `k` and `k+1` sit than at rest, in px. Two
 * parts: print k+1 slides off print k in proportion to k's prominence, until
 * at full prominence it has cleared the overlap plus a little daylight; and
 * both make room for each other's growth, since each scales about its own
 * centre. Chained along the pile, this keeps every print uncovered exactly as
 * much as it has come forward, with no change of stacking order ever needed.
 */
function separation(g: number[], geometry: Geometry, k: number): number {
  const gk = g[k] ?? 0;
  const gn = g[k + 1] ?? 0;
  const wk = geometry.widths[k] ?? 0;
  const wn = geometry.widths[k + 1] ?? 0;
  const overlap = geometry.overlaps[k] ?? 0;
  return gk * (overlap + GAP) + ((wk * gk + wn * gn) * GROWTH) / 2;
}
