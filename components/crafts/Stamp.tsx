"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  assertStable,
  useAnimationLoop,
  useOnScreen,
  useReducedMotion,
} from "@/lib/motion";
import styles from "./stamp.module.css";

/** What the die says. Fixed rather than today's date: a date computed at
 * render disagrees between server and client the moment they straddle
 * midnight, and the craft is about ink, not about the calendar. */
const LEGEND = "20 SEP 2026";

/** Spring carrying the stamp to the pointer. Heavier than the loupe's: this
 * is a fist-sized lump of wood, not a disc of glass. */
const MOVE_STIFFNESS = 520;
const MOVE_DAMPING = 44;
/** The press. Fast down, because a stamp is driven by a hand that has already
 * decided, and it is the one part of the gesture with no hesitation in it. */
const PRESS_STIFFNESS = 1500;
const PRESS_DAMPING = 78;

/** How far the stamp travels down when pressed, in px, and how much the
 * rubber squashes at full pressure. */
const PRESS_TRAVEL = 26;
const RUBBER_SQUASH = 0.34;

/** Ink gathered per second at full pressure, and the ceiling. A press is a
 * continuous act, so density follows how long and how hard rather than
 * arriving all at once on contact. */
const INK_RATE = 2.1;
const INK_MAX = 1;
/** Below this an impression is too faint to be worth leaving on the page. */
const INK_FLOOR = 0.16;

/** Pointers that report no pressure at all — every mouse — land here. Chosen
 * to sit mid-range, so a mouse gets a good impression from a normal press and
 * the pressure-sensitive devices still have somewhere to go in both
 * directions. */
const DEFAULT_PRESSURE = 0.52;

/** How many impressions stay on the sheet. Old ones are dropped rather than
 * faded: a stamped page does not gradually forget. */
const MAX_IMPRESSIONS = 7;

/** Four turbulence seeds, cycled per impression. A single filter would give
 * every impression an identical ragged edge, and the whole reason to stamp
 * twice is that the second one differs. */
const SEEDS = [3, 17, 41, 73];

const MAX_STEP = 0.008;
assertStable("stamp move", MOVE_STIFFNESS, MOVE_DAMPING, MAX_STEP);
assertStable("stamp press", PRESS_STIFFNESS, PRESS_DAMPING, MAX_STEP);

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

type Impression = {
  id: number;
  x: number;
  y: number;
  rot: number;
  ink: number;
  seed: number;
};

/**
 * A rubber stamp you press into a sheet of paper.
 *
 * Pressure is the input, which is the part worth building. `PointerEvent`
 * carries a 0..1 `pressure` from pens and from trackpads that report force,
 * and almost nothing on the web reads it. Press harder and the ink gathers
 * faster; hold longer and it gathers more. A quick dab leaves a ghost, a firm
 * press leaves a solid mark, and the impressions stay on the page, so the
 * sheet fills with a record of how hard you were pressing.
 *
 * The ink squeeze is the characteristic letterpress artefact and it does not
 * come free. `feMorphology` alone produces *outlined* type, the exact failure
 * it is supposed to avoid. What fixes it is blurring the rim back inward and
 * masking the body with turbulence so coverage is patchy rather than even.
 * Below about 44px the whole thing is sub-pixel and reads as faux-bold, which
 * is why the legend is set at 50.
 *
 * Every impression is a real `<span>` of text, so the sheet's contents are
 * readable, selectable and announced. Without JavaScript there is one
 * impression already on the paper: the craft starts stamped rather than empty.
 */
export function Stamp() {
  const rootRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLButtonElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const dieRef = useRef<HTMLDivElement>(null);
  const inkRef = useRef<HTMLSpanElement>(null);
  const nextId = useRef(1);
  const filterId = useId();

  /** One impression is server-rendered, so the sheet is never a blank page. */
  const [impressions, setImpressions] = useState<Impression[]>([
    { id: 0, x: 352, y: 96, rot: -2.4, ink: 0.72, seed: 17 },
  ]);

  const sim = useRef({
    /** Stamp position, in sheet-local px, and where it is headed. */
    x: 150,
    y: 150,
    vx: 0,
    vy: 0,
    tx: 150,
    ty: 150,
    /** The press, 0 to 1, and the ink gathered during it. */
    press: 0,
    pressV: 0,
    pressTarget: 0,
    ink: 0,
    /** The pointer's reported force while it is down. */
    pressure: DEFAULT_PRESSURE,
    down: false,
    pointerId: -1,
    reduced: false,
    visible: true,
  });

  const paint = useCallback(() => {
    const s = sim.current;
    const stamp = stampRef.current;
    if (stamp) {
      // Rotation leans with lateral speed, so a stamp thrown across the page
      // arrives tilted the way a held one would.
      const lean = clamp(s.vx * 0.006, -7, 7);
      stamp.style.transform = `translate3d(${(s.x - 66).toFixed(2)}px, ${(
        s.y - 150 + s.press * PRESS_TRAVEL
      ).toFixed(2)}px, 0) rotate(${lean.toFixed(2)}deg)`;
    }
    // Only the rubber squashes. Wood does not.
    const die = dieRef.current;
    if (die) {
      die.style.transform = `translateX(-50%) scaleY(${(
        1 - s.press * RUBBER_SQUASH
      ).toFixed(3)})`;
    }
    const ink = inkRef.current;
    if (ink) ink.textContent = `${Math.round(s.ink * 100)}%`;
  }, []);

  const step = useCallback((dt: number) => {
    const s = sim.current;

    if (s.reduced) {
      s.x = s.tx;
      s.y = s.ty;
      s.vx = 0;
      s.vy = 0;
      s.press = s.pressTarget;
      s.pressV = 0;
    } else {
      s.vx += (MOVE_STIFFNESS * (s.tx - s.x) - MOVE_DAMPING * s.vx) * dt;
      s.x += s.vx * dt;
      s.vy += (MOVE_STIFFNESS * (s.ty - s.y) - MOVE_DAMPING * s.vy) * dt;
      s.y += s.vy * dt;
      s.pressV +=
        (PRESS_STIFFNESS * (s.pressTarget - s.press) -
          PRESS_DAMPING * s.pressV) *
        dt;
      s.press += s.pressV * dt;
    }

    // Ink gathers only once the rubber has actually met the paper, and then
    // at a rate set by how hard the pointer says it is being pressed.
    if (s.down && s.press > 0.75) {
      s.ink = clamp(s.ink + s.pressure * INK_RATE * dt, 0, INK_MAX);
    }

    return (
      s.down ||
      Math.abs(s.vx) > 0.4 ||
      Math.abs(s.vy) > 0.4 ||
      Math.abs(s.tx - s.x) > 0.3 ||
      Math.abs(s.ty - s.y) > 0.3 ||
      Math.abs(s.pressTarget - s.press) > 0.002 ||
      Math.abs(s.pressV) > 0.02
    );
  }, []);

  const loop = useAnimationLoop({
    step,
    paint,
    maxFrame: 0.032,
    maxStep: MAX_STEP,
    onSettle: () => {
      const s = sim.current;
      s.x = s.tx;
      s.y = s.ty;
      s.press = s.pressTarget;
      s.vx = 0;
      s.vy = 0;
      s.pressV = 0;
      paint();
    },
  });

  const wake = useCallback(() => {
    if (sim.current.visible) loop.wake();
  }, [loop]);

  const toSheet = useCallback((clientX: number, clientY: number) => {
    const sheet = sheetRef.current;
    if (!sheet) return { x: 0, y: 0 };
    const box = sheet.getBoundingClientRect();
    return { x: clientX - box.left, y: clientY - box.top };
  }, []);

  /** Leave what has been gathered on the paper, and lift. */
  const lift = useCallback(() => {
    const s = sim.current;
    if (!s.down) return;
    s.down = false;
    s.pointerId = -1;
    s.pressTarget = 0;

    if (s.ink >= INK_FLOOR) {
      const id = nextId.current++;
      const impression: Impression = {
        id,
        x: s.x,
        y: s.y,
        // Per-impression variation is what makes a second press worth making.
        rot: (Math.random() - 0.5) * 5,
        ink: s.ink,
        seed: SEEDS[id % SEEDS.length] ?? 3,
      };
      setImpressions((prev) => [...prev, impression].slice(-MAX_IMPRESSIONS));
    }
    s.ink = 0;
    wake();
  }, [wake]);

  const onPointerDown = useCallback(
    (event: PointerEvent) => {
      const s = sim.current;
      if (s.down) return; // A second finger never steals the press.
      const hit = hitRef.current;
      if (!hit) return;
      try {
        hit.setPointerCapture(event.pointerId);
      } catch {
        // Synthetic or already-released pointer; the press still works.
      }
      const p = toSheet(event.clientX, event.clientY);
      s.tx = p.x;
      s.ty = p.y;
      s.down = true;
      s.pointerId = event.pointerId;
      s.pressTarget = 1;
      s.ink = 0;
      // A mouse reports 0.5, or 0 on some engines; treat both as "no opinion".
      s.pressure =
        event.pressure > 0 && event.pressure !== 0.5
          ? event.pressure
          : DEFAULT_PRESSURE;
      wake();
    },
    [toSheet, wake],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      const s = sim.current;
      if (!s.down || s.pointerId !== event.pointerId) return;
      // Rocking the stamp while it is down is how a real one smears, and it
      // also lets a pen vary its force mid-press.
      const p = toSheet(event.clientX, event.clientY);
      s.tx = p.x;
      s.ty = p.y;
      if (event.pressure > 0 && event.pressure !== 0.5) {
        s.pressure = event.pressure;
      }
      wake();
    },
    [toSheet, wake],
  );

  const onPointerUp = useCallback(
    (event: PointerEvent) => {
      if (sim.current.pointerId !== event.pointerId) return;
      lift();
    },
    [lift],
  );

  /** A cancelled gesture is the browser taking the pointer to scroll the
   *  page. It lifts the stamp, and deliberately leaves no impression: an
   *  accidental mark while flicking past is worse than a missing one. */
  const onPointerCancel = useCallback(
    (event: PointerEvent) => {
      const s = sim.current;
      if (s.pointerId !== event.pointerId) return;
      s.down = false;
      s.pointerId = -1;
      s.pressTarget = 0;
      s.ink = 0;
      wake();
    },
    [wake],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const s = sim.current;
      const STEP = 26;
      switch (event.key) {
        case "Enter":
        case " ": {
          event.preventDefault();
          // A key has no force, so a keyboard press is a firm, consistent one.
          s.pressure = 0.8;
          s.down = true;
          s.pressTarget = 1;
          s.ink = 0;
          wake();
          window.setTimeout(lift, 260);
          return;
        }
        case "ArrowLeft":
          s.tx = clamp(s.tx - STEP, 40, 520);
          break;
        case "ArrowRight":
          s.tx = clamp(s.tx + STEP, 40, 520);
          break;
        case "ArrowUp":
          s.ty = clamp(s.ty - STEP, 60, 280);
          break;
        case "ArrowDown":
          s.ty = clamp(s.ty + STEP, 60, 280);
          break;
        case "Escape":
          event.preventDefault();
          setImpressions([]);
          return;
        default:
          return;
      }
      event.preventDefault();
      wake();
    },
    [lift, wake],
  );

  useEffect(() => {
    const hit = hitRef.current;
    if (!hit) return;
    hit.addEventListener("pointerdown", onPointerDown);
    hit.addEventListener("pointermove", onPointerMove);
    hit.addEventListener("pointerup", onPointerUp);
    hit.addEventListener("pointercancel", onPointerCancel);
    hit.addEventListener("keydown", onKeyDown);
    return () => {
      hit.removeEventListener("pointerdown", onPointerDown);
      hit.removeEventListener("pointermove", onPointerMove);
      hit.removeEventListener("pointerup", onPointerUp);
      hit.removeEventListener("pointercancel", onPointerCancel);
      hit.removeEventListener("keydown", onKeyDown);
    };
  }, [onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onKeyDown]);

  useReducedMotion((reduced) => {
    sim.current.reduced = reduced;
    wake();
  });

  useOnScreen(
    rootRef,
    (onScreen) => {
      const s = sim.current;
      s.visible = onScreen;
      const root = rootRef.current;
      if (root) root.classList.toggle(styles.armed ?? "armed", onScreen);
      if (onScreen) {
        wake();
      } else {
        // A press interrupted by scrolling away leaves nothing behind.
        s.down = false;
        s.pointerId = -1;
        s.pressTarget = 0;
        s.ink = 0;
        loop.stop();
      }
    },
    { pauseWhenTabHidden: true },
  );

  return (
    <div ref={rootRef} className={styles.craft}>
      {/* One filter per seed. A shared filter would give every impression the
          same ragged edge, and the second press differing from the first is
          the entire reason to press twice. */}
      <svg className={styles.filters} aria-hidden="true" focusable="false">
        <title>Ink squeeze filters</title>
        <defs>
          {SEEDS.map((seed) => (
            <filter
              key={seed}
              id={`${filterId}-${seed}`}
              x="-8%"
              y="-14%"
              width="116%"
              height="132%"
              colorInterpolationFilters="sRGB"
            >
              {/* The squeeze. The erode is deliberately LARGER than the
                  dilate, so the rim comes from ink pooling at the perimeter
                  rather than from the glyph simply growing. */}
              <feMorphology
                in="SourceAlpha"
                operator="dilate"
                radius="0.28"
                result="dil"
              />
              <feMorphology
                in="SourceAlpha"
                operator="erode"
                radius="0.45"
                result="ero"
              />
              <feComposite in="dil" in2="ero" operator="out" result="rimRaw" />
              {/* Without this the rim sits on the edge as a line and the
                  result is outlined type: the exact failure the squeeze is
                  meant to avoid. Blurring it bleeds the ink inward. */}
              <feGaussianBlur in="rimRaw" stdDeviation="0.3" result="rimSoft" />
              <feComponentTransfer in="rimSoft" result="rim">
                <feFuncA type="linear" slope="1.45" />
              </feComponentTransfer>

              {/* Patchy coverage. Even coverage is what makes a simulated
                  impression read as a font weight rather than as ink. */}
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.62"
                numOctaves="2"
                seed={seed}
                result="noise"
              />
              <feColorMatrix
                in="noise"
                type="luminanceToAlpha"
                result="noiseA"
              />
              <feComponentTransfer in="noiseA" result="mottle">
                <feFuncA type="gamma" exponent="1.6" offset="0.55" />
              </feComponentTransfer>
              <feComposite
                in="SourceGraphic"
                in2="mottle"
                operator="in"
                result="bodyMottled"
              />
              <feComponentTransfer in="bodyMottled" result="body">
                <feFuncA type="linear" slope="0.82" />
              </feComponentTransfer>

              {/* Ragged fibre edges. Kept low: past about 1.5px it reads as
                  wet rather than printed. */}
              <feMerge result="inked">
                <feMergeNode in="body" />
                <feMergeNode in="rim" />
              </feMerge>
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.9"
                numOctaves="1"
                seed={seed + 5}
                result="fibre"
              />
              <feDisplacementMap
                in="inked"
                in2="fibre"
                scale="0.55"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          ))}
        </defs>
      </svg>

      <div ref={sheetRef} className={styles.sheet}>
        <div className={styles.impressions}>
          {impressions.map((im) => (
            <p
              key={im.id}
              className={styles.impression}
              style={{
                left: `${im.x}px`,
                top: `${im.y}px`,
                // Sub-pixel offset and a degree or two of rotation per press.
                transform: `translate(-50%, -50%) rotate(${im.rot}deg)`,
                opacity: 0.55 + im.ink * 0.45,
                filter: `url(#${filterId}-${im.seed})`,
              }}
            >
              <span>{LEGEND}</span>
            </p>
          ))}
        </div>

        {/* Resting pose is inline, so the server puts the stamp on the sheet
            rather than in its corner. */}
        <div
          ref={stampRef}
          className={styles.stamp}
          style={{ transform: "translate3d(84px, 0px, 0) rotate(0deg)" }}
        >
          <div className={styles.ambient} />
          <div className={styles.contact} />
          <div className={styles.handle} />
          <div className={styles.mount} />
          <div className={styles.foam} />
          <div ref={dieRef} className={styles.die} />
        </div>

        <p className={styles.readout} aria-hidden="true">
          <b>Ink</b>
          <span ref={inkRef}>0%</span>
        </p>
      </div>

      <button
        ref={hitRef}
        type="button"
        className={styles.hit}
        aria-label="A rubber date stamp on a sheet of paper. Press and hold anywhere on the sheet to stamp it, harder or longer for more ink. Arrow keys move the stamp, Enter presses it, Escape clears the sheet."
      />
    </div>
  );
}
