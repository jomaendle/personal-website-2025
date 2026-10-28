import type { Transition } from "framer-motion";
import { clamp, FPS, lerp, type Rect } from "./motion";

/**
 * The app launch, close and card drag, run on the compositor.
 *
 * Driving the window frame by frame from script (a motion value per frame)
 * leaves every frame at the mercy of the main thread, which at the start of
 * a launch is busy building the app: on a phone the zoom stuttered at its
 * fastest. So each move is worked out in advance instead. The springs are
 * simulated once, every element's pose is sampled from them at 120 frames a
 * second (120 for ProMotion), and each element gets one Web Animation of transform and opacity,
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
  /** The cover: 1 while the icon (or widget) art must stay over the window
   * because the app inside hasn't rendered yet (its code still loading on
   * a first open), 0 once it has. iOS holds the launch image the same way. */
  c: number;
}

type Key = keyof LaunchState;
const KEYS: Key[] = ["a", "p", "dx", "dy", "k", "c"];
/** What a finger can take hold of: everything but the cover, which keeps
 * fading as the app underneath arrives. */
const GRASPABLE: Key[] = ["a", "p", "dx", "dy", "k"];

/** What the scene reads of a framer-motion transition (motion.ts): a
 * spring's visual duration and bounce, or a tween's duration in seconds. */
export interface SceneTransition {
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

/** Simulation step, and keyframe spacing (FPS a second). */
export const STEP = 1000 / FPS;
/** At most this long, whatever the springs do. */
const LONGEST = 2500;
/** Rest thresholds, per value: within this much, moving this slowly (per
 * second), as framer-motion's restDelta and restSpeed. */
const REST: Record<Key, [number, number]> = {
  // About half a pixel of the window's height: rested any sooner, the last
  // keyframe snaps the final 1.7px in one step.
  a: [0.0005, 0.012],
  p: [0.0005, 0.012],
  k: [0.0005, 0.012],
  dx: [0.5, 10],
  dy: [0.5, 10],
  c: [0.002, 0.05],
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
export function simulate({
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

export const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

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
  /** The launch screen: the app's background with its icon, small, in the
   * middle, under the icon art. Shows only while the cover holds (the app
   * still loading), once the art has handed over, as iOS shows an app's
   * launch image between its icon and its first frame. */
  splash: HTMLElement | null;
  /** The home screen grid, which leans in as the app opens over it. */
  homeZoom: HTMLElement | null;
  /** The black over the home screen behind the app. */
  dim: HTMLElement | null;
}

type ElementKey = keyof SceneElements;
type Styles = Partial<Record<ElementKey, Keyframe>>;

/** How small a dragged card gets as it's pulled, `p` from 0 to 1. */
export const cardScale = (p: number) => 1 - 0.45 * clamp(p, 0, 1);

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
  const scale = lerp(s0, 1, a) * cardScale(p);
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
      window: {
        transform: "none",
        opacity: ac,
        borderRadius: `${ac >= 0.999 ? 0 : radius}px`,
      },
      content: { transform: "none" },
      icon: { opacity: 0 },
      widget: { opacity: 0 },
      splash: { opacity: clamp(state.c, 0, 1) },
      homeZoom: { transform: "none" },
      dim: { opacity: 0.5 * ac },
    };
  }
  const { ac, p, origin, scale, cx, cy, shown, r } = frameOf(state, g);
  const squash = shown / h;
  // Open and still, the window fills the screen, whose own corners are
  // drawn over everything: a round clip there would only cost a masked
  // pass on every frame of whatever moves inside the app.
  const corner = ac >= 0.999 && p <= 0.001 ? 0 : r;
  return {
    window: {
      transform: `translate3d(${cx - w / 2}px, ${cy - h / 2}px, 0) scale(${scale}, ${scale * squash})`,
      // Out of anything but an icon or widget (a song's cover, a banner),
      // the app fades in over it as it grows; with nothing to cover it, not
      // before it has rendered.
      opacity:
        g.fromIcon || g.fromWidget
          ? 1
          : clamp(state.a / 0.3, 0, 1) * (1 - clamp(state.c, 0, 1)),
      borderRadius: `${corner}px / ${corner / squash}px`,
    },
    content: { transform: `scale(1, ${1 / squash})` },
    icon: {
      // Hands over early in the zoom: to the app, or to the launch screen.
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
    // Under the art, whole while the cover holds: the art fades over it.
    // Fading in as the art fades out, the two would leave a dip where
    // neither covers the window.
    splash: { opacity: clamp(state.c, 0, 1) },
    homeZoom: { transform: `scale(${1 + 0.08 * ac * (1 - p)})` },
    dim: { opacity: 0.5 * ac * (1 - p) },
  };
}

/** The properties a browser composites: transform and opacity. */
const COMPOSITED = new Set(["transform", "opacity"]);

/** Keyframes split into those the compositor runs and the rest, either
 * missing when it has none. */
export function split(
  keyframes: Keyframe[],
): [Keyframe[] | null, Keyframe[] | null] {
  const fast: Keyframe[] = [];
  const slow: Keyframe[] = [];
  for (const frame of keyframes) {
    const f: Keyframe = {};
    const s: Keyframe = {};
    for (const [property, value] of Object.entries(frame)) {
      if (COMPOSITED.has(property)) {
        f[property] = value;
      } else {
        s[property] = value;
      }
    }
    fast.push(f);
    slow.push(s);
  }
  return [changing(fast) ? fast : null, changing(slow) ? slow : null];
}

/** Whether a run of keyframes changes anything: one that holds still the
 * whole way (the launch screen on a warm start, the icon art on a widget
 * launch) needs no animation, and would only be work for the compositor. */
function changing(keyframes: Keyframe[]): boolean {
  const first = keyframes[0];
  if (!first || Object.keys(first).length === 0) {
    return false;
  }
  return keyframes.some((frame) =>
    Object.keys(first).some((property) => frame[property] !== first[property]),
  );
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
    c: { kind: "still", value: 0 },
  };
  private running: Animation[] = [];
  /** Whoever is waiting on a move: the values it asked for, and the
   * answer. Settled true when everything rests; false as soon as one of
   * its values is moved or set by someone else. A move of other values
   * (the cover fading while a close runs) leaves it waiting. */
  private waiters: { keys: Set<Key>; resolve: (completed: boolean) => void }[] =
    [];
  private timer: ReturnType<typeof setTimeout> | undefined;
  private elements: SceneElements = {
    window: null,
    content: null,
    icon: null,
    widget: null,
    splash: null,
    homeZoom: null,
    dim: null,
  };
  private stage: HTMLElement | null = null;
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

  /** Set values outright, no motion: a finger's drag, a restore, a reset.
   * The keys named stop there; any other motion carries on. A drag passes
   * `held`: once the window has moved, it counts as moving until it rests,
   * so wiggling near the start doesn't swap its glass back and forth. */
  jump(values: Partial<LaunchState>, held = false) {
    this.freeze(Object.keys(values) as Key[], values, held);
  }

  /** The screen the scene plays on: it carries the moving flag too, for
   * the home screen's glass under the window. */
  setStage(el: HTMLElement | null) {
    this.stage = el;
  }

  /**
   * Leave a copy of the window where it is on screen, fading as it shrinks
   * on a little, for when the next launch takes the scene before this one
   * has gone home: the card doesn't vanish in one frame. Its styles are the
   * live ones, read from its running animations.
   */
  ghost() {
    const win = this.elements.window;
    const parent = win?.parentElement;
    if (!(win && parent)) {
      return;
    }
    const clone = win.cloneNode(true) as HTMLElement;
    const live = (src: HTMLElement, dst: HTMLElement) => {
      const cs = getComputedStyle(src);
      dst.style.transform = cs.transform;
      dst.style.opacity = cs.opacity;
      dst.style.borderRadius = cs.borderRadius;
    };
    live(win, clone);
    // The window's own parts (content, icon art, launch screen, widget)
    // are found in the copy by their place among the window's elements.
    const all = [...win.querySelectorAll<HTMLElement>("*")];
    const copies = [...clone.querySelectorAll<HTMLElement>("*")];
    for (const el of Object.values(this.elements)) {
      const i = el && el !== win ? all.indexOf(el) : -1;
      const copy = copies[i];
      if (el && copy) {
        live(el, copy);
      }
    }
    clone.removeAttribute("role");
    clone.removeAttribute("aria-modal");
    clone.setAttribute("aria-hidden", "true");
    clone.inert = true;
    clone.style.pointerEvents = "none";
    parent.append(clone);
    const { opacity } = clone.style;
    const transform =
      clone.style.transform === "none" ? "" : clone.style.transform;
    const fade = clone.animate(
      [
        { transform: transform || "none", opacity },
        { transform: `${transform} scale(0.9)`.trim(), opacity: 0 },
      ],
      { duration: 180, easing: "ease-in", fill: "forwards" },
    );
    fade.onfinish = () => clone.remove();
    setTimeout(() => clone.remove(), 400);
  }

  /** Stop wherever everything is (a finger took hold). */
  hold() {
    this.freeze(GRASPABLE, {});
  }

  private freeze(keys: Key[], values: Partial<LaunchState>, held = false) {
    const now = performance.now();
    const state = { ...this.get(), ...values };
    const stillMoving = KEYS.some(
      (key) => !(keys.includes(key) || valueAt(this.motions[key], now).done),
    );
    this.stop(keys);
    for (const key of KEYS) {
      this.motions[key] = keys.includes(key)
        ? { kind: "still", value: state[key] }
        : this.next(key, undefined, now);
    }
    if (stillMoving) {
      this.play(now);
    } else {
      this.write(state, undefined, held ? "held" : true);
    }
  }

  /**
   * Move the given values, each on its own spring, carrying on from where
   * and how fast they're going; the rest carry on as they were. Resolves
   * true once everything rests, false if interrupted first.
   */
  animate(targets: Partial<Record<Key, Target>>): Promise<boolean> {
    const now = performance.now();
    const keys = Object.keys(targets) as Key[];
    this.interrupt(keys);
    for (const key of KEYS) {
      this.motions[key] = this.next(key, targets[key], now);
    }
    this.play(now);
    return new Promise((resolve) => {
      this.waiters.push({ keys: new Set(keys), resolve });
    });
  }

  /** Answer false to whoever was waiting on any of `keys`. */
  private interrupt(keys: Key[]) {
    const taken = new Set(keys);
    const kept: typeof this.waiters = [];
    for (const waiter of this.waiters) {
      if ([...waiter.keys].some((key) => taken.has(key))) {
        waiter.resolve(false);
      } else {
        kept.push(waiter);
      }
    }
    this.waiters = kept;
  }

  /** A value's motion from `now`: a new spring (or tween) toward its
   * target, carrying on from where and how fast it's going; its own motion
   * if it has no new target and is still moving; or still. */
  private next(key: Key, target: Target | undefined, now: number): Motion {
    const current = this.motions[key];
    const here = valueAt(current, now);
    if (!target) {
      return here.done ? { kind: "still", value: here.value } : current;
    }
    const from = target.from ?? here.value;
    const transition = target.transition as SceneTransition;
    if (this.reduced() || transition.type === "tween") {
      return {
        kind: "tween",
        t0: now,
        from,
        to: target.to,
        duration: (transition.duration ?? 0.2) * 1000,
      };
    }
    const velocity =
      target.velocity ??
      (target.from === undefined ? velocityAt(current, now) : 0);
    return {
      kind: "spring",
      t0: now,
      to: target.to,
      samples: simulate({
        from,
        to: target.to,
        velocity,
        transition,
        rest: REST[key],
      }),
    };
  }

  /** Every motion's state each STEP from `now` until all rest. */
  private sample(now: number): LaunchState[] {
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
        return frames;
      }
    }
  }

  /** Sample every motion from `now` until all rest, and run it. */
  private play(now: number) {
    const g = this.geometry();
    const reduced = this.reduced();
    const frames = this.sample(now);
    const previous = this.running;
    clearTimeout(this.timer);
    const final = frames.at(-1) as LaunchState;
    const duration = (frames.length - 1) * STEP;
    this.flag(frames.some(moving));
    const poses = frames.map((state) => pose(state, g, reduced));
    // Taking over from motion (an interruption, a finger's release), the new
    // animations start now, where the samples start. Left to start on their
    // own, they wait for the next frame's commit on keyframe 0: a frame or
    // two standing still in the middle of a movement. From rest they can
    // wait, so a launch's busy first frame isn't skipped.
    const handOff =
      previous.length > 0 ||
      KEYS.some((key) => Math.abs(velocityAt(this.motions[key], now)) > 1e-3);
    this.running = [];
    if (duration > 0) {
      for (const key of Object.keys(this.elements) as ElementKey[]) {
        const el = this.elements[key];
        if (!el) {
          continue;
        }
        // Transform and opacity in one animation, anything else (the
        // window's corner radius) in another: a single property the
        // compositor can't run takes the whole animation off it.
        const [fast, slow] = split(poses.map((p) => p[key] ?? {}));
        for (const keyframes of [fast, slow]) {
          if (keyframes) {
            const animation = el.animate(keyframes, {
              duration,
              easing: "linear",
              fill: "both",
            });
            if (handOff) {
              animation.startTime = now;
            }
            this.running.push(animation);
          }
        }
      }
    }
    // The old animations go once the new ones are in, in the same frame,
    // so nothing shows its unanimated style in between.
    for (const animation of previous) {
      animation.cancel();
    }
    // The final pose as the element's own style, under the animation, so
    // it stays put once the animation is dropped.
    this.write(final, undefined, false);
    // Settle when the animations themselves end (they run on their own
    // clock, which a background tab slows); on a timer when nothing is
    // drawn.
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
    const waiters = this.waiters;
    this.waiters = [];
    for (const waiter of waiters) {
      waiter.resolve(true);
    }
    for (const listener of this.settleListeners) {
      listener(final);
    }
  }

  /** Stop the running animations where they are; whoever waited on any
   * of `keys` is told they didn't finish. */
  private stop(keys: Key[]) {
    clearTimeout(this.timer);
    for (const animation of this.running) {
      animation.cancel();
    }
    this.running = [];
    this.interrupt(keys);
  }

  /** Put elements in a state's pose as their own style. */
  private write(
    state: LaunchState,
    only?: ElementKey,
    flagMoving: boolean | "held" = true,
  ) {
    const styles = pose(state, this.geometry(), this.reduced());
    for (const key of Object.keys(this.elements) as ElementKey[]) {
      const el = this.elements[key];
      if (!el || (only && key !== only)) {
        continue;
      }
      Object.assign(el.style, styles[key]);
    }
    if (flagMoving === "held") {
      if (moving(state)) {
        this.flag(true);
      }
    } else if (flagMoving) {
      this.flag(moving(state));
    }
  }

  /** Mark the window and the screen as moving: glass drops its blur. */
  private flag(on: boolean) {
    this.elements.window?.toggleAttribute("data-moving", on);
    this.stage?.toggleAttribute("data-moving", on);
  }
}
