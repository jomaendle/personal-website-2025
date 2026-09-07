"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MARKER_COUNT = 41;
const LAST = MARKER_COUNT - 1;
const CENTER = LAST / 2;
/** Distance, in ticks, over which neighbouring ticks stop responding. */
const REACH = 9;
/** Maximum lean of a tick toward the needle, in degrees. */
const MAX_LEAN = 22;
/** Spring constants, in tick units. Mildly underdamped so the needle overshoots a touch. */
const STIFFNESS = 170;
const DAMPING = 19;
/** How long the ruler waits after the last input before it starts drifting again. */
const IDLE_DELAY = 5000;
/** Amplitude, in ticks, and period, in ms, of the idle drift. */
const DRIFT_AMPLITUDE = 6;
const DRIFT_PERIOD = 11000;
/** A click sends a ripple down the scale: speed in ticks per second, width in ticks, lifetime in seconds. */
const WAVE_SPEED = 30;
const WAVE_WIDTH = 1.7;
const WAVE_LIFE = 2.4;
const WAVE_GAIN = 1.5;
/** A drag released faster than this, in ticks per second, throws the needle. */
const FLING_MIN = 10;
const FLING_MAX = 110;
/** Friction while coasting, per second, and how much speed survives a bounce. */
const FRICTION = 1.6;
const BOUNCE = 0.45;
/** Below this speed the needle stops coasting and settles onto a tick. */
const COAST_STOP = 2.5;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/**
 * A ruler that leans toward the pointer. Ticks near the needle stretch and
 * tilt, and the needle itself rides a spring so it overshoots and settles
 * rather than sliding. At rest it drifts slowly, breathing, until someone
 * touches it; five seconds after the last input it starts drifting again.
 *
 * One requestAnimationFrame loop owns every moving part and writes to the
 * DOM directly. React only re-renders when the snapped index changes, which
 * keeps aria-valuenow honest without a render per frame. Reduced motion
 * turns the spring and the drift off and snaps everything into place.
 *
 * Server render puts the needle on the centre tick, so the ruler reads as a
 * ruler before hydration and with scripts disabled.
 */
export function Minimap() {
  const rootRef = useRef<HTMLDivElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const deltaRef = useRef<HTMLSpanElement>(null);
  const tickRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(CENTER);
  const [mark, setMark] = useState<number | null>(null);

  // Everything the loop touches lives in one ref so handlers never go stale.
  const sim = useRef({
    pos: CENTER,
    vel: 0,
    target: CENTER,
    /** 0..1, how strongly the ticks respond. Fades in on hover, out on leave. */
    strength: 0,
    strengthTarget: 0,
    /** A click flares the ticks; this decays back to 0. */
    pulse: 0,
    /** Tick index a click planted, measured against by the readout. */
    mark: null as number | null,
    /** Ripples in flight, each from the tick that was struck. */
    waves: [] as { origin: number; at: number; gain: number }[],
    downX: 0,
    dragged: false,
    /** True while the needle is coasting after a throw. */
    free: false,
    /** Recent drag positions, to read the release speed from. */
    samples: [] as { v: number; t: number }[],
    hovering: false,
    focused: false,
    /** False while the ruler is scrolled out of view or the tab is hidden. */
    visible: true,
    idle: false,
    idleTimer: 0 as ReturnType<typeof setTimeout> | 0,
    frame: 0,
    last: 0,
    reduced: false,
    shown: CENTER,
  });

  /**
   * Tick geometry in page px: centre of the first tick, spacing between ticks,
   * and the root's left edge. Cached, since reading it forces layout; the
   * resize and visibility listeners drop the cache.
   */
  const geoRef = useRef<{
    start: number;
    cell: number;
    rootLeft: number;
  } | null>(null);
  const geometry = useCallback(() => {
    if (geoRef.current) return geoRef.current;
    const first = tickRefs.current[0];
    const last = tickRefs.current[LAST];
    const root = rootRef.current;
    if (!(first && last && root)) return null;
    const a = first.getBoundingClientRect();
    const b = last.getBoundingClientRect();
    const start = a.left + a.width / 2;
    geoRef.current = {
      start,
      cell: (b.left + b.width / 2 - start) / LAST,
      rootLeft: root.getBoundingClientRect().left,
    };
    return geoRef.current;
  }, []);

  /** Paint the mark, the hairline to the needle, and the signed distance. */
  const paintMark = useCallback(
    (needleX: number, origin: number, cell: number, shown: number) => {
      const s = sim.current;
      const markEl = markRef.current;
      const spanEl = spanRef.current;
      const deltaEl = deltaRef.current;
      if (!(markEl && spanEl && deltaEl)) return;
      if (s.mark === null) {
        markEl.hidden = true;
        spanEl.hidden = true;
        deltaEl.hidden = true;
        return;
      }
      const markX = origin + s.mark * cell;
      markEl.hidden = false;
      markEl.style.left = `${markX.toFixed(2)}px`;
      const width = Math.abs(needleX - markX);
      spanEl.hidden = width < 1;
      spanEl.style.left = `${Math.min(markX, needleX).toFixed(2)}px`;
      spanEl.style.width = `${width.toFixed(2)}px`;
      const diff = shown - s.mark;
      deltaEl.hidden = diff === 0;
      deltaEl.style.left = `${((markX + needleX) / 2).toFixed(2)}px`;
      deltaEl.textContent = `${diff > 0 ? "+" : "\u2212"}${String(Math.abs(diff)).padStart(2, "0")}`;
    },
    [],
  );

  /**
   * How much the ripples lift tick `i` right now, and which way they push it.
   * Each strike travels outward and comes back once off either end, quieter,
   * which is what the mirrored origins are.
   */
  const ripple = useCallback((i: number, now: number) => {
    let lift = 0;
    let push = 0;
    for (const wave of sim.current.waves) {
      const age = (now - wave.at) / 1000;
      const radius = WAVE_SPEED * age;
      const envelope = Math.exp(-age * 1.7);
      const origins = [wave.origin, -wave.origin, 2 * LAST - wave.origin];
      for (const [k, origin] of origins.entries()) {
        const d = i - origin;
        const g = Math.exp(
          -((Math.abs(d) - radius) ** 2) / (2 * WAVE_WIDTH ** 2),
        );
        const a = g * envelope * wave.gain * (k === 0 ? 1 : 0.55);
        lift += a;
        push += a * Math.sign(d);
      }
    }
    return { lift, push };
  }, []);

  /** Stretch, lean and ink every tick from the needle, the ripples and the mark. */
  const paintTicks = useCallback(() => {
    const s = sim.current;
    const field = Math.min(1.6, s.strength + s.pulse);
    const now = performance.now();
    const mark = s.mark ?? s.pos;
    const inkFrom = Math.min(mark, s.pos) - 0.5;
    const inkTo = Math.max(mark, s.pos) + 0.5;

    tickRefs.current.forEach((tick, i) => {
      if (!tick) return;
      const d = i - s.pos;
      const t = Math.max(0, 1 - Math.abs(d) / REACH);
      const grow = Number(tick.dataset.grow);
      const wave = ripple(i, now);
      const stretch = 1 + grow * (t * t * field + wave.lift * WAVE_GAIN);
      // Lean peaks half way out and dies at the needle, so the nearest tick
      // stands straight under it while its neighbours bow inward. Long ticks
      // are stiffer, like the frame of the ruler, so the scale keeps its shape.
      // A passing ripple pushes ticks along with it.
      const lean =
        Math.min(1, grow) *
        (MAX_LEAN * 4 * t * (1 - t) * field * -Math.sign(d) + wave.push * 12);
      tick.style.transform = `rotate(${lean.toFixed(2)}deg) scaleY(${stretch.toFixed(3)})`;
      // Ticks inside the measured span are inked in the accent.
      const inked = s.mark !== null && i >= inkFrom && i <= inkTo;
      tick.style.backgroundColor = inked ? "hsl(var(--brand))" : "";
    });
  }, [ripple]);

  /** Paint the current simulation state. */
  const paint = useCallback(() => {
    const s = sim.current;
    const geo = geometry();
    if (!geo) return;
    const rootLeft = geo.rootLeft;
    const needleX = geo.start - rootLeft + s.pos * geo.cell;
    paintTicks();

    const needle = needleRef.current;
    if (needle) needle.style.left = `${needleX.toFixed(2)}px`;

    const shown = Math.round(clamp(s.pos, 0, LAST));
    if (shown !== s.shown) {
      s.shown = shown;
      if (readoutRef.current) {
        readoutRef.current.textContent = String(shown).padStart(2, "0");
      }
      setActive(shown);
    }

    paintMark(needleX, geo.start - rootLeft, geo.cell, shown);
  }, [geometry, paintMark, paintTicks]);

  /** Hit the ruler at a tick and send a ripple out from it. */
  const strike = useCallback((origin: number, gain: number) => {
    const s = sim.current;
    s.pulse = Math.max(s.pulse, gain);
    s.waves = [...s.waves.slice(-2), { origin, at: performance.now(), gain }];
  }, []);

  // `interrupt` is defined after the loop that needs it, so it goes through a ref.
  const interruptRef = useRef<() => void>(() => {});

  /** Coast after a throw: friction, a bounce off either end, and a strike on impact. */
  const coast = useCallback(
    (dt: number) => {
      const s = sim.current;
      s.pos += s.vel * dt;
      s.vel *= Math.exp(-dt * FRICTION);
      if (s.pos < 0 || s.pos > LAST) {
        const wall = s.pos < 0 ? 0 : LAST;
        s.pos = wall;
        strike(wall, clamp(Math.abs(s.vel) / 70, 0.35, 1));
        s.vel = -s.vel * BOUNCE;
      }
      if (Math.abs(s.vel) < COAST_STOP) {
        s.free = false;
        s.target = clamp(Math.round(s.pos), 0, LAST);
        s.strengthTarget = s.hovering ? 1 : 0;
        interruptRef.current();
      }
    },
    [strike],
  );

  /** Advance one frame: drift when idle, coast after a throw, otherwise spring. */
  const integrate = useCallback(
    (now: number, dt: number) => {
      const s = sim.current;
      // Drift never runs under a hand or a focused keyboard user.
      if (s.free || s.hovering || s.focused) s.idle = false;
      if (s.idle) {
        s.target =
          CENTER +
          DRIFT_AMPLITUDE * Math.sin((now / DRIFT_PERIOD) * Math.PI * 2);
        s.strengthTarget = 0.55;
      }

      if (s.reduced) {
        // Snap everything, and drop anything that would keep the loop alive.
        s.free = false;
        s.pos = clamp(s.target, 0, LAST);
        s.vel = 0;
        s.strength = s.strengthTarget;
        s.pulse = 0;
        s.waves = [];
        return;
      }
      if (s.free) {
        coast(dt);
      } else {
        const accel = STIFFNESS * (s.target - s.pos) - DAMPING * s.vel;
        s.vel += accel * dt;
        s.pos += s.vel * dt;
      }
      s.strength += (s.strengthTarget - s.strength) * (1 - Math.exp(-dt * 9));
      s.pulse *= Math.exp(-dt * 7);
      if (s.pulse < 0.005) s.pulse = 0;
    },
    [coast],
  );

  const step = useCallback(
    (now: number) => {
      const s = sim.current;
      const dt = Math.min(32, now - (s.last || now)) / 1000;
      s.last = now;

      integrate(now, dt);
      s.waves = s.waves.filter((wave) => now - wave.at < WAVE_LIFE * 1000);

      paint();

      const moving =
        s.free ||
        Math.abs(s.vel) > 0.005 ||
        Math.abs(s.target - s.pos) > 0.002 ||
        Math.abs(s.strengthTarget - s.strength) > 0.002 ||
        s.pulse > 0 ||
        s.waves.length > 0;
      if (s.idle || moving) {
        s.frame = requestAnimationFrame(step);
      } else {
        s.pos = s.target;
        s.vel = 0;
        s.strength = s.strengthTarget;
        paint();
        s.frame = 0;
        s.last = 0;
      }
    },
    [paint, integrate],
  );

  const wake = useCallback(() => {
    const s = sim.current;
    if (!s.frame && s.visible) {
      s.last = 0;
      s.frame = requestAnimationFrame(step);
    }
  }, [step]);

  /** Stop drifting, and schedule the drift to come back after a pause. */
  const interrupt = useCallback(() => {
    const s = sim.current;
    s.idle = false;
    if (s.idleTimer) clearTimeout(s.idleTimer);
    if (s.reduced) return;
    s.idleTimer = setTimeout(() => {
      s.idleTimer = 0;
      if (s.hovering || s.focused || !s.visible) return;
      s.idle = true;
      wake();
    }, IDLE_DELAY);
  }, [wake]);
  interruptRef.current = interrupt;

  const setTarget = useCallback(
    (value: number, strength = 1) => {
      const s = sim.current;
      s.target = clamp(Math.round(value), 0, LAST);
      s.strengthTarget = strength;
      interrupt();
      wake();
    },
    [interrupt, wake],
  );

  const valueAt = useCallback(
    (clientX: number) => {
      const geo = geometry();
      return geo ? (clientX - geo.start) / geo.cell : CENTER;
    },
    [geometry],
  );

  /** Plant a mark on a tick, or lift it if it is already there. */
  const toggleMark = useCallback(
    (value: number) => {
      const s = sim.current;
      const index = clamp(Math.round(value), 0, LAST);
      s.mark = s.mark === index ? null : index;
      if (!s.reduced) strike(index, 1);
      setMark(s.mark);
      interrupt();
      wake();
    },
    [interrupt, strike, wake],
  );

  /**
   * Speed of the drag at release, in ticks per second, read off the last
   * 120ms of movement. A pointer that has been held still is not moving,
   * however fast it got there.
   */
  const releaseSpeed = useCallback(() => {
    const samples = sim.current.samples;
    const last = samples.at(-1);
    if (!last || performance.now() - last.t > 120) return 0;
    const first = samples.find((sample) => last.t - sample.t <= 120);
    if (!first || last.t === first.t) return 0;
    return ((last.v - first.v) / (last.t - first.t)) * 1000;
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const s = sim.current;
      event.currentTarget.setPointerCapture(event.pointerId);
      const value = valueAt(event.clientX);
      s.downX = event.clientX;
      s.dragged = false;
      // A press catches a needle in flight.
      s.free = false;
      s.vel = 0;
      s.samples = [{ v: value, t: performance.now() }];
      s.hovering = event.pointerType === "mouse";
      setTarget(value);
    },
    [setTarget, valueAt],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const s = sim.current;
      const pressed = event.buttons > 0;
      s.hovering = event.pointerType === "mouse";
      // Hovering does not disturb a needle in flight; it has to be caught.
      if (s.free && !pressed) return;
      const value = valueAt(event.clientX);
      if (pressed) {
        if (Math.abs(event.clientX - s.downX) > 4) s.dragged = true;
        s.samples = [
          ...s.samples.slice(-7),
          { v: value, t: performance.now() },
        ];
      }
      setTarget(value);
    },
    [setTarget, valueAt],
  );

  const relax = useCallback(() => {
    const s = sim.current;
    s.hovering = false;
    // A needle in flight keeps the ticks awake until it lands.
    if (!s.free) s.strengthTarget = 0;
    interrupt();
    wake();
  }, [interrupt, wake]);

  /** Let go of a drag: fast enough and the needle keeps going. */
  const fling = useCallback(() => {
    const s = sim.current;
    const speed = releaseSpeed();
    if (s.reduced || Math.abs(speed) < FLING_MIN) return;
    s.free = true;
    s.vel = clamp(speed, -FLING_MAX, FLING_MAX);
    s.strengthTarget = 1;
    interrupt();
    wake();
  }, [interrupt, releaseSpeed, wake]);

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const s = sim.current;
      // A press without a drag is a click, and a click plants a mark.
      if (s.dragged) fling();
      else toggleMark(valueAt(event.clientX));
      // A finger lifting is the pointer leaving; a mouse stays and keeps hovering.
      if (event.pointerType !== "mouse") relax();
    },
    [fling, relax, toggleMark, valueAt],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const s = sim.current;
      // Step from the value on screen: a drifting target is fractional.
      const from = s.shown;
      let next: number | null = null;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowUp":
          next = from + 1;
          break;
        case "ArrowLeft":
        case "ArrowDown":
          next = from - 1;
          break;
        case "PageUp":
          next = from + 5;
          break;
        case "PageDown":
          next = from - 5;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = LAST;
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          toggleMark(from);
          return;
        case "Escape":
          if (s.mark === null) return;
          event.preventDefault();
          toggleMark(s.mark);
          return;
        default:
          return;
      }
      if (next === null) return;
      event.preventDefault();
      setTarget(next);
    },
    [setTarget, toggleMark],
  );

  useEffect(() => {
    const s = sim.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = rootRef.current;
    const apply = () => {
      s.reduced = media.matches;
      if (s.reduced) {
        s.idle = false;
        if (s.idleTimer) clearTimeout(s.idleTimer);
        s.idleTimer = 0;
        wake();
      } else {
        // Motion is allowed again: drift comes back after the usual pause.
        interrupt();
      }
    };
    apply();
    media.addEventListener("change", apply);

    // Start drifting straight away; the pointer will interrupt it.
    if (!s.reduced) s.idle = true;
    wake();

    // The loop only runs while the ruler is on screen and the tab is visible.
    const setVisible = (visible: boolean) => {
      if (s.visible === visible) return;
      s.visible = visible;
      geoRef.current = null;
      if (visible) {
        s.last = 0;
        if (!s.reduced && !s.hovering && !s.focused) s.idle = true;
        wake();
      } else {
        s.idle = false;
        if (s.frame) cancelAnimationFrame(s.frame);
        s.frame = 0;
        if (s.idleTimer) clearTimeout(s.idleTimer);
        s.idleTimer = 0;
      }
    };
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        if (entry) setVisible(entry.isIntersecting && !document.hidden);
      },
      { threshold: 0 },
    );
    if (root) observer.observe(root);
    const onVisibility = () => {
      if (document.hidden) setVisible(false);
      else if (root) {
        // Re-observing an element already observed is a no-op, so drop and
        // re-add it to get a fresh intersection callback.
        observer.unobserve(root);
        observer.observe(root);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onResize = () => {
      geoRef.current = null;
      wake();
    };
    window.addEventListener("resize", onResize);

    return () => {
      media.removeEventListener("change", apply);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      if (s.frame) cancelAnimationFrame(s.frame);
      if (s.idleTimer) clearTimeout(s.idleTimer);
      s.frame = 0;
    };
  }, [wake, interrupt]);

  return (
    <div
      ref={rootRef}
      role="slider"
      tabIndex={0}
      aria-label="Ruler"
      aria-valuemin={0}
      aria-valuemax={LAST}
      aria-valuenow={active}
      aria-valuetext={
        mark === null
          ? undefined
          : `${active}, ${active - mark > 0 ? "+" : ""}${active - mark} from mark at ${mark}`
      }
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={relax}
      onPointerLeave={relax}
      onKeyDown={onKeyDown}
      onFocus={() => {
        sim.current.focused = true;
        setTarget(sim.current.target);
      }}
      onBlur={() => {
        sim.current.focused = false;
        relax();
      }}
      className="relative flex size-full cursor-crosshair touch-none select-none items-center justify-center outline-hidden"
    >
      {/* Needle: index readout, triangle, dashed rule. Server-rendered on the
          centre tick; the loop moves `left` and fades it in once it owns it. */}
      <div
        ref={needleRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-6 flex w-px -translate-x-1/2 flex-col items-center"
        style={{ left: "50%" }}
      >
        <span
          ref={readoutRef}
          className="absolute top-0 left-1/2 -translate-x-1/2 font-mono text-[0.65rem] text-brand tabular-nums tracking-[0.12em]"
        >
          {String(CENTER).padStart(2, "0")}
        </span>
        <span className="absolute top-5 h-0 w-0 border-x-[5px] border-x-transparent border-t-[7px] border-t-brand" />
        <span
          className="absolute top-8 bottom-0 w-px"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, hsl(var(--brand)) 0 4px, transparent 4px 8px)",
          }}
        />
      </div>

      {/* Mark: a click plants it. A hairline runs from it to the needle with
          the signed distance in ticks, so the ruler measures something. */}
      <span
        ref={markRef}
        hidden
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 -translate-x-1/2 border-x-[4px] border-x-transparent border-b-[6px] border-b-brand"
        style={{ top: "calc(50% + 40px)" }}
      />
      <span
        ref={spanRef}
        hidden
        aria-hidden="true"
        className="pointer-events-none absolute h-px bg-brand"
        style={{ top: "calc(50% + 49px)" }}
      />
      <span
        ref={deltaRef}
        hidden
        aria-hidden="true"
        className="pointer-events-none absolute -translate-x-1/2 font-mono text-[0.65rem] text-brand tabular-nums tracking-[0.12em]"
        style={{ top: "calc(50% + 54px)" }}
      />

      <div className="flex items-center px-4">
        {Array.from({ length: MARKER_COUNT }, (_, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: ticks are a fixed positional scale
            key={index}
            className="flex h-24 w-[clamp(6px,2vw,12px)] items-center justify-center"
          >
            <div
              ref={(el) => {
                tickRefs.current[index] = el;
              }}
              data-grow={index % 20 === 0 ? 0.3 : index % 5 === 0 ? 0.9 : 1.8}
              className={
                index % 20 === 0
                  ? "h-16 w-px bg-foreground"
                  : index % 5 === 0
                    ? "h-9 w-px bg-foreground/80"
                    : "h-5 w-px bg-foreground/45"
              }
              style={{ willChange: "transform" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
