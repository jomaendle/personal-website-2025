import type { MotionValue, Transition } from "framer-motion";
import { type CSSProperties, useLayoutEffect, useState } from "react";
import {
  easeOut,
  type SceneTransition,
  STEP,
  simulate,
  split,
} from "./launch-scene";
import { lerp } from "./motion";

/**
 * A motion value's spring, run on the compositor: the same idea as the
 * launch scene (launch-scene.ts) for the simpler motions a single value
 * drives, such as the unlock or a navigation push.
 *
 * A finger moves the value frame by frame as before. Once it lets go, the
 * spring is simulated up front and every style the value drives is handed
 * to the browser as one Web Animation, which keeps running however busy the
 * main thread gets. The value itself jumps to where it's headed straight
 * away, so its own style bindings write the final style once, hidden under
 * the animation, and nothing flashes when the animation is dropped at the
 * end. Read where it actually is mid-flight with `motionNow`, and catch it
 * with `halt`, which commits the animated style at that instant.
 */

/** One style the value drives: an element, and its style for a value. */
export interface Binding {
  el: Element | null | undefined;
  style: (value: number) => Keyframe;
}

interface Run {
  t0: number;
  samples: number[];
  animations: Animation[];
  resolve: (completed: boolean) => void;
}

const runs = new WeakMap<MotionValue<number>, Run>();
/** The styles each value drives, for whoever springs it (a gesture hook
 * that knows the value but not the elements). */
const registry = new WeakMap<MotionValue<number>, () => Binding[]>();

/** Say what `mv` drives; read afresh each time it's sprung. */
export function bindTo(mv: MotionValue<number>, bindings: () => Binding[]) {
  registry.set(mv, bindings);
}

/** An identity transform written as `none`, as framer-motion writes it: any
 * other transform, even one that moves nothing, makes the element a
 * containing block for fixed children and a stacking context. */
const IDENTITY = /^(translate[XY]?\(0(px|%)?\)|scale\(1\))$/;
const atRest = (style: Keyframe): Keyframe =>
  typeof style.transform === "string" && IDENTITY.test(style.transform)
    ? { ...style, transform: "none" }
    : style;

const writeAll = (bindings: Binding[], value: number) => {
  for (const { el, style } of bindings) {
    if (el instanceof HTMLElement) {
      Object.assign(el.style, atRest(style(value)));
    }
  }
};

/**
 * Drive elements from `mv` with one style function each, for both ways the
 * value moves: written straight to the element as it changes (a finger, a
 * jump), and handed to the compositor when it springs (`bindTo`). Two copies
 * of a mapping, one for each path, would show a jump wherever they differed.
 *
 * Returns each binding's style at the value's starting point, for the first
 * render and the server's HTML. React keeps that object; the element's style
 * is written directly after that, and again after every commit, so an
 * element mounted later (a pushed page) starts from where the value is.
 */
export function useDrive(
  mv: MotionValue<number>,
  bindings: () => Binding[],
): CSSProperties[] {
  const [initial] = useState(() => {
    bindTo(mv, bindings);
    const value = mv.get();
    return bindings().map(({ style }) => atRest(style(value)) as CSSProperties);
  });
  // Every render: the latest bindings (refs, reduced motion) for the
  // spring, and the current style for anything just mounted. Mid-spring the
  // value already holds its target, the style under the animation.
  useLayoutEffect(() => {
    bindTo(mv, bindings);
    writeAll(bindings(), mv.get());
  });
  useLayoutEffect(
    () =>
      mv.on("change", (value) => writeAll(registry.get(mv)?.() ?? [], value)),
    [mv],
  );
  return initial;
}

function sampleAt(run: Run, now: number) {
  const i = (now - run.t0) / STEP;
  const last = run.samples.length - 1;
  if (i >= last) {
    return run.samples[last] ?? 0;
  }
  const lo = Math.max(0, Math.floor(i));
  return lerp(run.samples[lo] ?? 0, run.samples[lo + 1] ?? 0, i - lo);
}

/** Where the value is right now, and how fast it's moving (per second). */
export function motionNow(mv: MotionValue<number>) {
  const run = runs.get(mv);
  if (!run) {
    return { value: mv.get(), velocity: mv.getVelocity() };
  }
  const now = performance.now();
  const value = sampleAt(run, now);
  const velocity =
    ((sampleAt(run, now + STEP / 2) - sampleAt(run, now - STEP / 2)) / STEP) *
    1000;
  return { value, velocity };
}

/** Stop wherever it is (a finger took hold): the animated style stays as
 * the elements' own, and the value jumps there. Returns the value. */
export function halt(mv: MotionValue<number>) {
  const run = runs.get(mv);
  if (!run) {
    mv.stop();
    return mv.get();
  }
  const { value } = motionNow(mv);
  runs.delete(mv);
  for (const animation of run.animations) {
    try {
      animation.commitStyles();
    } catch {
      // A detached element: nothing on screen to keep.
    }
    animation.cancel();
  }
  run.resolve(false);
  mv.jump(value);
  return value;
}

/**
 * Spring `mv` to `to` on the compositor, driving every binding. Carries on
 * from wherever it is (mid-flight included), at `velocity` if given (per
 * second). Resolves true once it lands, false if halted or superseded.
 */
export function springTo(
  mv: MotionValue<number>,
  {
    to,
    transition,
    bindings,
    velocity,
  }: {
    to: number;
    transition: Transition;
    /** What it drives; by default, what was registered with `bindTo`. */
    bindings?: Binding[];
    velocity?: number;
  },
): Promise<boolean> {
  const start = motionNow(mv);
  const previous = runs.get(mv);
  const options = transition as SceneTransition & { ease?: unknown };
  let samples: number[];
  if (options.type === "spring" || options.visualDuration !== undefined) {
    samples = simulate({
      from: start.value,
      to,
      velocity: velocity ?? start.velocity,
      transition: options,
      rest: [0.001, 0.02],
    });
  } else {
    // A tween (reduced motion's short fade), eased out.
    const frames = Math.max(
      1,
      Math.round(((options.duration ?? 0.2) * 1000) / STEP),
    );
    samples = Array.from({ length: frames + 1 }, (_, i) =>
      lerp(start.value, to, easeOut(i / frames)),
    );
  }
  const duration = (samples.length - 1) * STEP;
  const t0 = performance.now();
  // Taking over from motion, start now, where the samples start, rather than
  // stand on the first keyframe until the next commit (see launch-scene).
  const handOff =
    Boolean(previous) || Math.abs(velocity ?? start.velocity) > 1e-3;
  const animations: Animation[] = [];
  for (const { el, style } of bindings ?? registry.get(mv)?.() ?? []) {
    if (!el || duration <= 0) {
      continue;
    }
    // Anything the compositor can't run goes in an animation of its own,
    // so it can't take the transform and opacity off the compositor.
    for (const keyframes of split(samples.map(style))) {
      if (keyframes) {
        const animation = el.animate(keyframes, {
          duration,
          easing: "linear",
          fill: "forwards",
        });
        if (handOff) {
          animation.startTime = t0;
        }
        animations.push(animation);
      }
    }
  }
  // The previous run's animations go once the new ones are in, in the same
  // frame, so nothing shows its unanimated style in between.
  if (previous) {
    for (const animation of previous.animations) {
      animation.cancel();
    }
    previous.resolve(false);
  }
  mv.jump(to);
  return new Promise((resolve) => {
    const run: Run = { t0, samples, animations, resolve };
    runs.set(mv, run);
    const done = () => {
      if (runs.get(mv) !== run) {
        return;
      }
      runs.delete(mv);
      for (const animation of animations) {
        animation.cancel();
      }
      resolve(true);
    };
    const lead = animations[0];
    if (lead) {
      lead.finished.then(done, () => undefined);
    } else {
      setTimeout(done, duration);
    }
  });
}
