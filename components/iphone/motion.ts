import type { Transition } from "framer-motion";
import { useState } from "react";

/**
 * iOS animates almost everything with critically damped springs: no bounce
 * on the way in, a little on the way home. framer-motion's `visualDuration`
 * is the time to visually arrive, which is how UIKit's `response` reads.
 */
export const SPRING_OPEN: Transition = {
  type: "spring",
  visualDuration: 0.5,
  bounce: 0.06,
  // Done once it has visibly landed, so the window's glass gets its blur
  // back then, not after a long invisible tail.
  restDelta: 0.002,
  restSpeed: 0.05,
};

export const SPRING_CLOSE: Transition = {
  type: "spring",
  visualDuration: 0.42,
  bounce: 0.16,
  // Settle once it's within a pixel or so of the icon, rather than creeping
  // on, so the home screen takes taps as soon as the app has landed.
  restDelta: 0.002,
  restSpeed: 0.05,
};

/** UIKit's navigation push: critically damped, a little over a third of a
 * second to arrive. */
export const SPRING_PUSH: Transition = {
  type: "spring",
  visualDuration: 0.36,
  bounce: 0,
  // Settle when it visually arrives. On a 0–1 value the default thresholds
  // keep a critically damped spring creeping for several hundred ms more,
  // and until it rests the list underneath stays inert to taps.
  restDelta: 0.002,
  restSpeed: 0.05,
};

export const SPRING_UNLOCK: Transition = {
  type: "spring",
  visualDuration: 0.42,
  bounce: 0,
};

/** Reduced motion keeps the change visible, as a short cross-fade, rather
 * than cutting to it (see docs/solutions/frontend-animation). */
export const FADE: Transition = { duration: 0.2, ease: "easeOut" };

/**
 * Keyframes per second for motion worked out ahead (the launch scene, the
 * compositor spring, the photo zoom). The compositor draws straight lines
 * between keyframes, so they're sampled for ProMotion's 120Hz rather than
 * 60, where every other frame would be an interpolation.
 */
export const FPS = 120;

export const clamp = (value: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, value));

export const lerp = (from: number, to: number, t: number) =>
  from + (to - from) * t;

/** Vertical release velocity in px/ms (positive is up), averaged over the
 * last 80ms of samples, so one jittery event can't flick a sheet shut. */
/** How long a finger can rest before letting go and still count as moving,
 * in ms. */
const HELD = 60;

export class VelocityTracker {
  private samples: { y: number; t: number }[] = [];

  add(y: number, t: number) {
    this.samples.push({ y, t });
    while (this.samples.length > 2 && t - (this.samples[0]?.t ?? t) > 80) {
      this.samples.shift();
    }
  }

  /** Read at the release: a finger that stopped before letting go
   * (pointer events only come with movement, so the last samples are
   * from before it stopped) isn't flicking. */
  velocity() {
    const first = this.samples[0];
    const last = this.samples.at(-1);
    if (
      !(first && last) ||
      last.t === first.t ||
      performance.now() - last.t > HELD
    ) {
      return 0;
    }
    return (first.y - last.y) / (last.t - first.t);
  }

  reset() {
    this.samples = [];
  }
}

/**
 * A spring from 0 to 1 as a Web Animation easing (CSS `linear()`), for the
 * hand-offs a motion value can't drive: a photo's transform and clip-path.
 * `velocity` is where the gesture left off, in progress per second, so the
 * animation carries on at the finger's speed instead of starting from rest.
 * Damping 1 settles without overshoot; less lets it overshoot and come back.
 * Falls back to an ease-out curve where `linear()` isn't supported.
 */
export function springEasing(
  velocity: number,
  options: { stiffness?: number; damping?: number } = {},
): { easing: string; duration: number } {
  if (
    typeof CSS === "undefined" ||
    !CSS.supports("animation-timing-function", "linear(0, 1)")
  ) {
    return { easing: "cubic-bezier(0.2, 0.9, 0.25, 1)", duration: 420 };
  }
  const points = springProgress(velocity, options);
  return {
    easing: `linear(${points.map((p) => Number(p.toFixed(4))).join(", ")})`,
    duration: Math.round(((points.length - 1) * 1000) / FPS),
  };
}

/** The same spring from 0 to 1, as its progress every 1/FPS s: for
 * motions built frame by frame (a photo's nested transforms). */
export function springProgress(
  velocity: number,
  {
    stiffness = 280,
    damping = 1,
  }: { stiffness?: number; damping?: number } = {},
): number[] {
  const c = 2 * damping * Math.sqrt(stiffness);
  const sub = 4;
  const step = 1 / (FPS * sub);
  let x = 0;
  let v = velocity;
  let t = 0;
  let n = 0;
  const points = [0];
  while (t < 1.5) {
    v += (stiffness * (1 - x) - c * v) * step;
    x += v * step;
    t += step;
    n += 1;
    if (n % sub === 0) {
      points.push(x);
    }
    if (Math.abs(1 - x) < 0.001 && Math.abs(v) < 0.02) {
      break;
    }
  }
  points.push(1);
  return points;
}

/** One tracker for the component's lifetime, built once rather than on
 * every render. */
export function useVelocityTracker() {
  return useState(() => new VelocityTracker())[0];
}

export interface Rect {
  x: number;
  y: number;
  /** Width. */
  size: number;
  /** Height: the same as `size` for an icon, less for a wide widget. */
  height: number;
  radius: number;
}

/**
 * Where an icon sits inside the screen, in the screen's own unscaled pixels.
 * Walks offsetParents rather than reading getBoundingClientRect, so neither
 * the home screen's zoom nor the device frame's fit-to-window scale leaks
 * into the result.
 */
export function rectWithin(el: HTMLElement, root: HTMLElement): Rect {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  // offsetTop ignores scrolling: take off what any scroller between the
  // element and the screen has scrolled by (a Spotlight result list).
  for (let up = el.parentElement; up && up !== root; up = up.parentElement) {
    x -= up.scrollLeft;
    y -= up.scrollTop;
  }
  const size = el.offsetWidth;
  const height = el.offsetHeight || size;
  const raw = getComputedStyle(el).borderTopLeftRadius;
  const radius = raw.endsWith("%")
    ? (size * Number.parseFloat(raw)) / 100
    : Number.parseFloat(raw) || 0;
  // A superellipse corner is drawn with a larger radius than the circular
  // arc it resembles; clip to the arc's size.
  return {
    x,
    y,
    size,
    height,
    radius: Math.min(radius, Math.min(size, height) * 0.235),
  };
}

/** UIKit's rubber band past an edge: `overshoot` pixels of finger travel
 * against a `dimension`-sized view give this many pixels of movement. */
export const rubberband = (overshoot: number, dimension: number) =>
  (overshoot * dimension * 0.55) / (dimension + 0.55 * Math.abs(overshoot));
