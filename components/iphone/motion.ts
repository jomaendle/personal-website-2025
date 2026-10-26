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

/** UIKit's navigation push: critically damped, about half a second. */
export const SPRING_PUSH: Transition = {
  type: "spring",
  visualDuration: 0.45,
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

export const clamp = (value: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, value));

export const lerp = (from: number, to: number, t: number) =>
  from + (to - from) * t;

/** Vertical release velocity in px/ms (positive is up), averaged over the
 * last 80ms of samples, so one jittery event can't flick a sheet shut. */
export class VelocityTracker {
  private samples: { y: number; t: number }[] = [];

  add(y: number, t: number) {
    this.samples.push({ y, t });
    while (this.samples.length > 2 && t - (this.samples[0]?.t ?? t) > 80) {
      this.samples.shift();
    }
  }

  velocity() {
    const first = this.samples[0];
    const last = this.samples.at(-1);
    if (!(first && last) || last.t === first.t) {
      return 0;
    }
    return (first.y - last.y) / (last.t - first.t);
  }

  reset() {
    this.samples = [];
  }
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
