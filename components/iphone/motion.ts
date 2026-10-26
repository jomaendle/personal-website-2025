import type { Transition } from "framer-motion";

/**
 * iOS animates almost everything with critically damped springs: no bounce
 * on the way in, a little on the way home. framer-motion's `visualDuration`
 * is the time to visually arrive, which is how UIKit's `response` reads.
 */
export const SPRING_OPEN: Transition = {
  type: "spring",
  visualDuration: 0.5,
  bounce: 0.06,
};

export const SPRING_CLOSE: Transition = {
  type: "spring",
  visualDuration: 0.42,
  bounce: 0.16,
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

export interface Rect {
  x: number;
  y: number;
  size: number;
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
  const raw = getComputedStyle(el).borderTopLeftRadius;
  const radius = raw.endsWith("%")
    ? (size * Number.parseFloat(raw)) / 100
    : Number.parseFloat(raw) || 0;
  // A superellipse corner is drawn with a larger radius than the circular
  // arc it resembles; clip to the arc's size.
  return { x, y, size, radius: Math.min(radius, size * 0.235) };
}
