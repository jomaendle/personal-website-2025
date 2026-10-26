import type { Transition } from "framer-motion";
import { clamp, lerp, type Rect } from "./motion";

/**
 * The app launch, close and card drag, run on the compositor.
 *
 * Driving the window frame by frame from script (a motion value per frame)
 * leaves every frame at the mercy of the main thread, which at the start of
 * a launch is busy building the app: on a phone the zoom stuttered at its
 * fastest. So each move is worked out in advance instead. The springs are
 * simulated once, every element's pose is sampled from them at 60 frames a
 * second, and each element gets one Web Animation of transform and opacity,
 * which the browser runs off the main thread (Core Animation in Safari).
 * An interruption reads where the springs are at that instant, position and
 * speed, and carries on from there, so nothing jumps.
 *
 * Only a finger moves the window frame by frame (the card drag), writing
 * the pose straight to the elements.
 */

export interface Geometry {
  w: number;
  h: number;
  scale: number;
  /** The screen's corner radius: 55 in the device frame, 0 full-screen. */
  radius: number;
  /** The icon (or widget) the current app came out of, or is going home
   * to. */
  origin: Rect;
  /** Where it was headed before a retarget, blended into `origin` by `k`
   * so a changed destination doesn't jump. */
  previous: Rect;
  /** Whether that was an app icon, whose art covers the window early on. */
  fromIcon: boolean;
  /** Whether it was a widget, whose snapshot grows with the window and
   * hands over to the app. */
  fromWidget: boolean;
}

/**
 * What the springs move. `a`: 0 at the icon, 1 full screen. `p`: how far
 * the window is pulled into a card, 0 to 1. `dx`, `dy`: the card's offset,
 * in the app's pixels. `k`: 0 at a retargeted close's old destination, 1 at
 * the new one.
 */
export interface LaunchState {
  a: number;
  p: number;
  dx: number;
  dy: number;
  k: number;
}

type Key = keyof LaunchState;
const KEYS: Key[] = ["a", "p", "dx", "dy", "k"];

/** What the scene reads of a framer-motion transition (motion.ts): a
 * spring's visual duration and bounce, or a tween's duration in seconds. */
interface SceneTransition {
  type?: string;
  visualDuration?: number;
  bounce?: number;
  duration?: number;
}

/** A value on its way somewhere, from the moment `t0` (ms). */
type Motion =
  | { kind: "still"; value: number }
  | {
      kind: "spring";
      t0: number;
      /** Sampled every STEP from t0 until it rests. */
      samples: number[];
      to: number;
    }
  | { kind: "tween"; t0: number; from: number; to: number; duration: number };

/** Simulation step, and keyframe spacing: 60 per second. */
const STEP = 1000 / 60;
/** At most this long, whatever the springs do. */
const LONGEST = 2500;
/** Rest thresholds, per value: within this much, moving this slowly (per
 * second), as framer-motion's restDelta and restSpeed. */
const REST: Record<Key, [number, number]> = {
  a: [0.002, 0.05],
  p: [0.002, 0.05],
  k: [0.002, 0.05],
  dx: [0.5, 10],
  dy: [0.5, 10],
};

/** framer-motion's mapping from a visual duration and bounce to a spring:
 * stiffness and damping for a unit mass. */
function springConstants({
  visualDuration = 0.5,
  bounce = 0,
}: SceneTransition) {
  const root = (2 * Math.PI) / (visualDuration * 1.2);
  const stiffness = root * root;
  const damping = 2 * clamp(1 - bounce, 0.05, 1) * Math.sqrt(stiffness);
  return { stiffness, damping };
}

/** A spring from `from` to `to` starting at `velocity` (per second),
 * sampled every STEP until it rests. */
function simulate({
  from,
  to,
  velocity,
  transition,
  rest: [restDelta, restSpeed],
}: {
  from: number;
  to: number;
  velocity: number;
  transition: SceneTransition;
  rest: [number, number];
}): number[] {
  const { stiffness, damping } = springConstants(transition);
  const samples = [from];
  let x = from;
  let v = velocity;
  // Integrated in finer steps than it's sampled, for accuracy.
  const sub = 8;
  const dt = STEP / 1000 / sub;
  for (let t = 0; t < LONGEST; t += STEP) {
    for (let i = 0; i < sub; i++) {
      v += (-stiffness * (x - to) - damping * v) * dt;
      x += v * dt;
    }
    samples.push(x);
    if (Math.abs(x - to) < restDelta && Math.abs(v) < restSpeed) {
      break;
    }
  }
  samples[samples.length - 1] = to;
  return samples;
}

const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

/** A motion's value `t` ms after it started, and whether it has finished. */
function valueAt(
  motion: Motion,
  now: number,
): { value: number; done: boolean } {
  if (motion.kind === "still") {
    return { value: motion.value, done: true };
  }
  if (motion.kind === "tween") {
    const t = clamp((now - motion.t0) / motion.duration, 0, 1);
    return { value: lerp(motion.from, motion.to, easeOut(t)), done: t >= 1 };
  }
  const i = (now - motion.t0) / STEP;
  const last = motion.samples.length - 1;
  if (i >= last) {
    return { value: motion.to, done: true };
  }
  const lo = Math.max(0, Math.floor(i));
  const value = lerp(
    motion.samples[lo] ?? motion.to,
    motion.samples[lo + 1] ?? motion.to,
    i - lo,
  );
  return { value, done: false };
}

/** A motion's speed per second at `now`, for handing on to the next. */
function velocityAt(motion: Motion, now: number) {
  if (motion.kind === "still") {
    return 0;
  }
  const before = valueAt(motion, now - STEP / 2).value;
  const after = valueAt(motion, now + STEP / 2).value;
  return ((after - before) / STEP) * 1000;
}

/** The destination now: the origin, or partway to it from a previous one
 * while a retargeted close blends over (`k` from 0 to 1). */
export function originAt(g: Geometry, k: number): Rect {
  const { origin, previous } = g;
  const t = clamp(k, 0, 1);
  if (t === 1) {
    return origin;
  }
  return {
    x: lerp(previous.x, origin.x, t),
    y: lerp(previous.y, origin.y, t),
    size: lerp(previous.size, origin.size, t),
    height: lerp(previous.height, origin.height, t),
    radius: lerp(previous.radius, origin.radius, t),
  };
}

/** Every element the launch moves. Any may be missing (no app open). */
export interface SceneElements {
  /** The window: positions and clips. */
  window: HTMLElement | null;
  /** The app inside it, counter-scaled so it never stretches. */
  content: HTMLElement | null;
  /** The icon art over the window early in a launch. */
  icon: HTMLElement | null;
  /** A widget's snapshot, for a launch out of a widget. */
  widget: HTMLElement | null;
  /** The home screen grid, which leans in as the app opens over it. */
  homeZoom: HTMLElement | null;
  /** The black over the home screen behind the app. */
  dim: HTMLElement | null;
}

type ElementKey = keyof SceneElements;
type Styles = Partial<Record<ElementKey, Keyframe>>;

/** The window's frame for one state, in the app's pixels. */
function frameOf(state: LaunchState, g: Geometry) {
  const { w, h, radius } = g;
  const { a } = state;
  const ac = clamp(a, 0, 1);
  // The card's pull and offset blend out as the app nears its icon, so a
  // close lands exactly on it whatever the drag's own springs are doing.
  const p = clamp(state.p, 0, 1) * ac;
  const origin = originAt(g, state.k);
  const s0 = Math.max(origin.size, 1) / w;
  const scale = lerp(s0, 1, a) * (1 - 0.45 * p);
  const cx = lerp(origin.x + origin.size / 2, w / 2, a) + state.dx * ac;
  const cy = lerp(origin.y + origin.height / 2, h / 2, a) + state.dy * ac;
  /** How far the window is clipped top and bottom at the start. */
  const startInset = Math.max(0, (h - origin.height / s0) / 2);
  /** How much of the app's height shows. */
  const shown = Math.max(1, h - 2 * startInset * (1 - ac));
  // Radii in the app's pixels: the icon's radius at 0, the screen's at 1,
  // and a card's ~40pt while dragged.
  const r = Math.max(
    lerp(origin.radius / s0, radius, ac),
    (Math.min(1, p * 5) * 40) / Math.max(scale, 0.01),
  );
  return { ac, p, origin, scale, cx, cy, shown, r };
}

/** A fade out over `a` from `start`, `length` long, eased so it doesn't
 * dip linearly. */
function fadeOut(a: number, start: number, length: number) {
  const t = clamp((a - start) / length, 0, 1);
  return 1 - t * t * (3 - 2 * t);
}

/**
 * The pose of every element for one state. The window's box is the full
 * screen: scaled to the icon's width and squashed to the icon's height it
 * becomes the icon's shape, and the app inside is stretched back by the
 * same amount, so it only ever scales evenly. Its corners are elliptical in
 * the window's own units for the same reason, to come out round on screen.
 */
export function pose(
  state: LaunchState,
  g: Geometry,
  reduced: boolean,
): Styles {
  const { w, h, radius } = g;
  if (reduced) {
    const ac = clamp(state.a, 0, 1);
    return {
      window: { transform: "none", opacity: ac, borderRadius: `${radius}px` },
      content: { transform: "none" },
      icon: { opacity: 0 },
      widget: { opacity: 0 },
      homeZoom: { transform: "none" },
      dim: { opacity: 0.5 * ac },
    };
  }
  const { ac, p, origin, scale, cx, cy, shown, r } = frameOf(state, g);
  const squash = shown / h;
  return {
    window: {
      transform: `translate3d(${cx - w / 2}px, ${cy - h / 2}px, 0) scale(${scale}, ${scale * squash})`,
      // Out of anything but an icon or widget (a song's cover, a banner),
      // the app fades in over it as it grows.
      opacity: g.fromIcon || g.fromWidget ? 1 : clamp(state.a / 0.3, 0, 1),
      borderRadius: `${r}px / ${r / squash}px`,
    },
    content: { transform: `scale(1, ${1 / squash})` },
    icon: {
      opacity: g.fromIcon ? fadeOut(state.a, 0.04, 0.26) : 0,
      // The art covers what the window shows of itself, as iOS scales the
      // icon's snapshot with the window.
      transform: `translateY(-50%) scale(${shown / w})`,
    },
    widget: {
      opacity: g.fromWidget ? fadeOut(state.a, 0.03, 0.22) : 0,
      // Stretched to fill the window, as iOS stretches the snapshot; it has
      // faded by the time the stretch would show.
      transform: `scale(${w / origin.size}, ${shown / origin.height})`,
    },
    homeZoom: { transform: `scale(${1 + 0.08 * ac * (1 - p)})` },
    dim: { opacity: 0.5 * ac * (1 - p) },
  };
}

/** Whether the window is moving in this state: its glass drops its blur. */
const moving = (s: LaunchState) => s.a < 0.999 || s.p > 0.001;

export interface Target {
  to: number;
  transition: Transition;
  /** Start from here instead of where it is. */
  from?: number;
  /** Start at this speed (per second) instead of its own. */
  velocity?: number;
}

export class LaunchScene {
  private motions: Record<Key, Motion> = {
    a: { kind: "still", value: 0 },
    p: { kind: "still", value: 0 },
    dx: { kind: "still", value: 0 },
    dy: { kind: "still", value: 0 },
    k: { kind: "still", value: 1 },
  };
  private running: Animation[] = [];
  private finish: ((completed: boolean) => void) | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private elements: SceneElements = {
    window: null,
    content: null,
    icon: null,
    widget: null,
    homeZoom: null,
    dim: null,
  };
  private settleListeners = new Set<(state: LaunchState) => void>();

  constructor(
    private geometry: () => Geometry,
    private reduced: () => boolean,
  ) {}

  /** Where everything is right now. */
  get(): LaunchState {
    const now = performance.now();
    const state = {} as LaunchState;
    for (const key of KEYS) {
      state[key] = valueAt(this.motions[key], now).value;
    }
    return state;
  }

  /** Hand an element to the scene (or take it back with null); it's put
   * in its current pose straight away. */
  register(key: ElementKey, el: HTMLElement | null) {
    this.elements[key] = el;
    if (el) {
      this.write(this.get(), key);
    }
  }

  /** Called with the final state whenever the scene comes to rest. */
  onSettle(listener: (state: LaunchState) => void) {
    this.settleListeners.add(listener);
    return () => {
      this.settleListeners.delete(listener);
    };
  }

  /** Set values outright, no motion: a finger's drag, a restore, a reset. */
  jump(values: Partial<LaunchState>) {
    const state = { ...this.get(), ...values };
    this.stop(false);
    for (const key of KEYS) {
      this.motions[key] = { kind: "still", value: state[key] };
    }
    this.write(state);
  }

  /** Stop wherever everything is (a finger took hold). */
  hold() {
    this.jump({});
  }

  /**
   * Move the given values, each on its own spring, carrying on from where
   * and how fast they're going; the rest carry on as they were. Resolves
   * true once everything rests, false if interrupted first.
   */
  animate(targets: Partial<Record<Key, Target>>): Promise<boolean> {
    const now = performance.now();
    const reduced = this.reduced();
    for (const key of KEYS) {
      const target = targets[key];
      const current = this.motions[key];
      const from = target?.from ?? valueAt(current, now).value;
      const velocity =
        target?.velocity ??
        (target?.from === undefined ? velocityAt(current, now) : 0);
      const to = target
        ? target.to
        : current.kind === "still"
          ? from
          : current.to;
      const transition = target?.transition as SceneTransition | undefined;
      if (!(target || valueAt(current, now).done === false)) {
        this.motions[key] = { kind: "still", value: from };
      } else if (reduced || transition?.type === "tween") {
        this.motions[key] = {
          kind: "tween",
          t0: now,
          from,
          to,
          duration: (transition?.duration ?? 0.2) * 1000,
        };
      } else if (target && transition) {
        this.motions[key] = {
          kind: "spring",
          t0: now,
          to,
          samples: simulate({
            from,
            to,
            velocity,
            transition,
            rest: REST[key],
          }),
        };
      }
      // A value already moving with no new target keeps its own spring.
    }
    return this.play(now);
  }

  /** Sample every motion from `now` until all rest, and run it. */
  private play(now: number): Promise<boolean> {
    const g = this.geometry();
    const reduced = this.reduced();
    const frames: LaunchState[] = [];
    for (let t = now; ; t += STEP) {
      const state = {} as LaunchState;
      let done = true;
      for (const key of KEYS) {
        const sample = valueAt(this.motions[key], t);
        state[key] = sample.value;
        done &&= sample.done;
      }
      frames.push(state);
      if (done || t - now > LONGEST) {
        break;
      }
    }
    const previous = this.running;
    const resolvePrevious = this.finish;
    this.finish = null;
    clearTimeout(this.timer);
    const final = frames.at(-1) as LaunchState;
    const duration = (frames.length - 1) * STEP;
    this.elements.window?.toggleAttribute("data-moving", frames.some(moving));
    const poses = frames.map((state) => pose(state, g, reduced));
    this.running = [];
    if (duration > 0) {
      for (const key of Object.keys(this.elements) as ElementKey[]) {
        const el = this.elements[key];
        if (!el) {
          continue;
        }
        const keyframes = poses.map((p) => p[key] ?? {});
        this.running.push(
          el.animate(keyframes, { duration, easing: "linear", fill: "both" }),
        );
      }
    }
    // The old animations go once the new ones are in, in the same frame,
    // so nothing shows its unanimated style in between.
    for (const animation of previous) {
      animation.cancel();
    }
    resolvePrevious?.(false);
    // The final pose as the element's own style, under the animation, so
    // it stays put once the animation is dropped.
    this.write(final, undefined, false);
    return new Promise((resolve) => {
      this.finish = resolve;
      // When the animations themselves end (they run on their own clock,
      // which a background tab slows); a timer when nothing is drawn.
      const lead = this.running[0];
      if (lead) {
        lead.finished.then(
          () => {
            if (this.running[0] === lead) {
              this.settle(final);
            }
          },
          // Cancelled: superseded, and the next move took over.
          () => undefined,
        );
      } else {
        this.timer = setTimeout(() => this.settle(final), duration);
      }
    });
  }

  private settle(final: LaunchState) {
    for (const key of KEYS) {
      this.motions[key] = { kind: "still", value: final[key] };
    }
    for (const animation of this.running) {
      animation.cancel();
    }
    this.running = [];
    this.write(final);
    const resolve = this.finish;
    this.finish = null;
    resolve?.(true);
    for (const listener of this.settleListeners) {
      listener(final);
    }
  }

  /** Stop the running animation where it is. */
  private stop(completed: boolean) {
    clearTimeout(this.timer);
    for (const animation of this.running) {
      animation.cancel();
    }
    this.running = [];
    const resolve = this.finish;
    this.finish = null;
    resolve?.(completed);
  }

  /** Put elements in a state's pose as their own style. */
  private write(state: LaunchState, only?: ElementKey, flagMoving = true) {
    const styles = pose(state, this.geometry(), this.reduced());
    for (const key of Object.keys(this.elements) as ElementKey[]) {
      const el = this.elements[key];
      if (!el || (only && key !== only)) {
        continue;
      }
      Object.assign(el.style, styles[key]);
    }
    if (flagMoving) {
      this.elements.window?.toggleAttribute("data-moving", moving(state));
    }
  }
}
