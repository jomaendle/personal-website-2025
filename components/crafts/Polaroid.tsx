"use client";

import type { StaticImageData } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  assertStable,
  useAnimationLoop,
  useOnScreen,
  useReducedMotion,
} from "@/lib/motion";
import dsc00465 from "@/public/assets/DSC00465.webp";
import dsc00645 from "@/public/assets/DSC00645.webp";
import dsc00911 from "@/public/assets/DSC00911.webp";
import dsc05383 from "@/public/assets/DSC05383.webp";
import dsc05480 from "@/public/assets/DSC05480.webp";
import styles from "./polaroid.module.css";

const PRINTS: { src: StaticImageData; caption: string }[] = [
  { src: dsc05383, caption: "Beach, low sun" },
  { src: dsc00645, caption: "Ridge line" },
  { src: dsc00911, caption: "Undergrowth" },
  { src: dsc00465, caption: "Water, long lens" },
  { src: dsc05480, caption: "Evening, harbour" },
];

/** How far the print may be dragged from the centre of the card, in px. */
const REACH_X = 96;
const REACH_Y = 44;
/** Spring carrying the print to the pointer. Critically damped, ~0.17s. A
 * little lag is the print's weight; a print that tracks 1:1 feels like a
 * cursor with a picture attached. */
const CHASE_STIFFNESS = 1400;
const CHASE_DAMPING = 75;
/** Spring bringing it home when released. Slower, so letting go reads as
 * setting something down rather than as a snap. */
const HOME_STIFFNESS = 320;
const HOME_DAMPING = 36;
/** Degrees of tilt per px/s of lateral speed, and the cap. The print leans
 * into the direction it is being thrown, the way a held card does. */
const TILT_PER_SPEED = 0.012;
const TILT_MAX = 13;
/** Resting angle. Never zero: a print squared to the card reads as a UI
 * element rather than as something someone put down. */
const REST_ANGLE = -2.5;

/** A reversal faster than this, in px/s, counts as a shake rather than a
 * wander. Below it you are moving the print, not developing it. */
const SHAKE_SPEED = 260;
/** What one shake adds to the energy pool, and how fast that pool drains.
 * Draining matters: it means sustained shaking develops the print and a
 * single flick does almost nothing, which is how the real thing behaves. */
const SHAKE_IMPULSE = 0.34;
const SHAKE_DECAY = 1.9;
/** The print flexing while it is shaken: degrees and px at full energy, and
 * the rate the oscillation runs at, in radians per second. Kept small. The
 * wobble should be felt rather than watched; past a couple of degrees it
 * stops reading as a held object and starts reading as an animation. */
const WOBBLE_DEG = 1.5;
const WOBBLE_PX = 2.2;
const WOBBLE_RATE = 27;
/** Development per second at full shake energy, and the rate it comes up at
 * on its own. The creep is what lets someone who never touches it still watch
 * a photograph arrive. */
const SHAKE_GAIN = 0.62;
const CREEP = 0.052;
/** Once developed, how long the print is admired before a fresh one is
 * pulled, in seconds. */
const ADMIRE = 5.5;
/** The eject: the finished print slides off and the next one rises. */
const EJECT_STIFFNESS = 240;
const EJECT_DAMPING = 31;

const MAX_STEP = 0.008;
assertStable("polaroid chase", CHASE_STIFFNESS, CHASE_DAMPING, MAX_STEP);
assertStable("polaroid home", HOME_STIFFNESS, HOME_DAMPING, MAX_STEP);
assertStable("polaroid eject", EJECT_STIFFNESS, EJECT_DAMPING, MAX_STEP);

/** A drag shorter and briefer than this is a click. Repo convention. */
const CLICK_SLOP = 6;
const CLICK_TIME = 500;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

/**
 * An instant print you shake to develop.
 *
 * Shaking is the whole interaction, and it is one almost everyone already
 * knows without being told. Drag the print back and forth: each reversal
 * faster than SHAKE_SPEED tops up an energy pool that drains continuously, so
 * sustained shaking brings the image up and a single flick does next to
 * nothing. Left alone it still develops, slowly, which is what a visitor who
 * never touches it sees.
 *
 * The image comes up the way a real print does, shadows before highlights:
 * low development is washed out, warm and low in contrast rather than simply
 * transparent. That curve is a CSS filter ramp rather than a canvas, because
 * development here is uniform over the frame. The darkroom tray in the
 * backlog needs a canvas precisely because there it is not.
 *
 * One rAF loop owns the pose, the shake pool and the development, and writes
 * to the DOM directly. React re-renders only when the phase label changes or
 * a new print is pulled.
 *
 * The server renders a finished photograph. The picture is the content, so it
 * is never behind an interaction, a script or a preference.
 */
export function Polaroid() {
  const rootRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLButtonElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const emulsionRef = useRef<HTMLDivElement>(null);
  const shadowsRef = useRef<HTMLImageElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);

  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(true);

  const sim = useRef({
    // Pose, in px from the card's centre, plus the angle it carries.
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    tx: 0,
    ty: 0,
    rot: REST_ANGLE,
    // Development, 0 to 1, and the shake energy driving it.
    dev: 1,
    shake: 0,
    wobble: 0,
    elapsed: 0,
    // "admiring" is the pause after a print finishes, before the next is pulled.
    phase: "admiring" as "developing" | "admiring" | "ejecting",
    admired: 0,
    index: 0,
    // The gesture. pointerId so a second finger cannot steal it; lastDx to
    // spot the reversals that count as shakes.
    drag: null as null | {
      pointerId: number;
      originX: number;
      originY: number;
      grabX: number;
      grabY: number;
      at: number;
      moved: boolean;
    },
    lastX: 0,
    lastDir: 0,
    reduced: false,
    visible: true,
    // Mirrors of React state, so the loop can read them without a render.
    shownReady: true,
  });

  /** Write the frame. Transforms and filters only; no layout is read here. */
  const paint = useCallback(() => {
    const s = sim.current;
    const print = printRef.current;
    if (print) {
      // The wobble is the print flexing in a hand that is shaking it. It is
      // driven by the shake pool rather than by the pointer, so it keeps
      // going for a moment after the hand stops, the way a sheet of film
      // would. Without it, shaking moves the print but does not feel like
      // shaking anything.
      const wob = s.shake * WOBBLE_DEG;
      const rot = s.rot + Math.sin(s.wobble) * wob;
      const lift = Math.sin(s.wobble * 1.7) * s.shake * WOBBLE_PX;
      print.style.transform = `translate3d(${s.x.toFixed(2)}px, ${(
        s.y + lift
      ).toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg)`;
    }

    // Shadows first, highlights last, in two passes. The multiplied shadow
    // layer comes up over the first half and paints density where the
    // photograph is dark; the full photograph arrives over the second half
    // and brings the midtones and colour back. The overlap between the two
    // ramps is what stops it reading as two separate fades.
    const d = s.dev;
    const shadows = shadowsRef.current;
    if (shadows) shadows.style.opacity = smoothstep(0.02, 0.52, d).toFixed(3);

    const photo = photoRef.current;
    if (photo) {
      photo.style.opacity = smoothstep(0.34, 0.97, d).toFixed(3);
      // Still slightly warm and flat as it arrives, cooling and gaining
      // contrast as the last of the development comes up.
      photo.style.filter =
        `contrast(${(0.72 + 0.28 * d).toFixed(3)}) ` +
        `brightness(${(1.16 - 0.16 * d).toFixed(3)}) ` +
        `sepia(${(0.26 * (1 - d)).toFixed(3)})`;
    }
    const emulsion = emulsionRef.current;
    if (emulsion) emulsion.style.opacity = (1 - 0.28 * d).toFixed(3);

    const time = timeRef.current;
    if (time) {
      const t = s.elapsed;
      time.textContent = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
    }
  }, []);

  const step = useCallback((dt: number) => {
    const s = sim.current;

    // Where the print wants to be.
    let stiffness = HOME_STIFFNESS;
    let damping = HOME_DAMPING;
    if (s.drag) {
      stiffness = CHASE_STIFFNESS;
      damping = CHASE_DAMPING;
    } else if (s.phase === "ejecting") {
      stiffness = EJECT_STIFFNESS;
      damping = EJECT_DAMPING;
    }

    if (s.reduced) {
      // Position snaps. Development is kept: it is the content arriving.
      s.x = s.tx;
      s.y = s.ty;
      s.vx = 0;
      s.vy = 0;
      s.rot = REST_ANGLE;
    } else {
      s.vx += (stiffness * (s.tx - s.x) - damping * s.vx) * dt;
      s.x += s.vx * dt;
      s.vy += (stiffness * (s.ty - s.y) - damping * s.vy) * dt;
      s.y += s.vy * dt;
      const lean = clamp(s.vx * TILT_PER_SPEED, -TILT_MAX, TILT_MAX);
      s.rot += (REST_ANGLE + lean - s.rot) * (1 - Math.exp(-dt * 11));
    }

    // The shake pool drains continuously, so only sustained shaking develops.
    s.shake *= Math.exp(-dt * SHAKE_DECAY);
    if (s.shake < 0.002) s.shake = 0;
    // The wobble runs at a fixed rate whenever there is energy to show, so it
    // never stutters with the pointer's sample rate.
    // Reduced motion keeps the developing, which is the content arriving, and
    // drops the wobble, which is decoration.
    if (s.shake > 0 && !s.reduced) s.wobble += dt * WOBBLE_RATE;
    else s.wobble = 0;

    if (s.phase === "developing") {
      s.elapsed += dt;
      s.dev = clamp(s.dev + (SHAKE_GAIN * s.shake + CREEP) * dt, 0, 1);
      if (s.dev >= 1) {
        s.phase = "admiring";
        s.admired = 0;
      }
    } else if (s.phase === "admiring") {
      s.admired += dt;
      if (s.admired > ADMIRE && !s.drag && !s.reduced) {
        s.phase = "ejecting";
        s.ty = -260;
        s.tx = 40;
      }
    } else if (s.phase === "ejecting" && s.y < -190) {
      // Gone off the top. Reset below and pull the next print.
      s.index = (s.index + 1) % PRINTS.length;
      s.dev = 0;
      s.elapsed = 0;
      s.shake = 0;
      s.x = 0;
      s.y = 150;
      s.vx = 0;
      s.vy = 0;
      s.tx = 0;
      s.ty = 0;
      s.phase = "developing";
      setIndex(s.index);
    }

    // React only hears about the coarse state, never the frame.
    const nowReady = s.dev >= 1;
    if (nowReady !== s.shownReady) {
      s.shownReady = nowReady;
      setReady(nowReady);
    }

    const settled =
      !s.drag &&
      s.phase === "admiring" &&
      s.shake === 0 &&
      Math.abs(s.vx) < 0.4 &&
      Math.abs(s.vy) < 0.4 &&
      Math.abs(s.tx - s.x) < 0.3 &&
      Math.abs(s.ty - s.y) < 0.3 &&
      Math.abs(s.rot - REST_ANGLE) < 0.05 &&
      // Keep running through the admire pause, or the eject would never fire.
      (s.reduced || s.admired > ADMIRE);
    return !settled;
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
      s.vx = 0;
      s.vy = 0;
      s.rot = REST_ANGLE;
      paint();
    },
  });

  const wake = useCallback(() => {
    if (sim.current.visible) loop.wake();
  }, [loop]);

  /** Top up the shake pool. Called on a reversal, and by the keyboard. */
  const addShake = useCallback(
    (amount: number) => {
      const s = sim.current;
      if (s.phase === "admiring" && s.dev >= 1) return;
      s.shake = Math.min(1.6, s.shake + amount);
      wake();
    },
    [wake],
  );

  /** Pull a fresh print, whatever state the current one is in. */
  const freshPrint = useCallback(() => {
    const s = sim.current;
    s.phase = "ejecting";
    s.admired = ADMIRE + 1;
    s.ty = -260;
    s.tx = 40;
    wake();
  }, [wake]);

  const onPointerDown = useCallback(
    (event: PointerEvent) => {
      const s = sim.current;
      if (s.drag) return; // A second finger never steals the gesture.
      const hit = hitRef.current;
      if (!hit) return;
      try {
        hit.setPointerCapture(event.pointerId);
      } catch {
        // A synthetic or already-released pointer. The drag still works.
      }
      s.drag = {
        pointerId: event.pointerId,
        originX: event.clientX,
        originY: event.clientY,
        grabX: s.x,
        grabY: s.y,
        at: performance.now(),
        moved: false,
      };
      s.lastX = event.clientX;
      s.lastDir = 0;
      wake();
    },
    [wake],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      const s = sim.current;
      const drag = s.drag;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const dx = event.clientX - drag.originX;
      const dy = event.clientY - drag.originY;
      if (Math.hypot(dx, dy) > CLICK_SLOP) drag.moved = true;

      s.tx = clamp(drag.grabX + dx, -REACH_X, REACH_X);
      s.ty = clamp(drag.grabY + dy, -REACH_Y, REACH_Y);

      // A shake is a reversal, not a distance. Measuring direction changes
      // rather than travel is why a small fast wiggle develops the print and
      // a long slow sweep does not.
      const stepX = event.clientX - s.lastX;
      const dir = Math.sign(stepX);
      if (dir !== 0 && s.lastDir !== 0 && dir !== s.lastDir) {
        const speed = Math.abs(stepX) / 0.016;
        if (speed > SHAKE_SPEED) addShake(SHAKE_IMPULSE);
      }
      if (dir !== 0) s.lastDir = dir;
      s.lastX = event.clientX;
      wake();
    },
    [addShake, wake],
  );

  /**
   * `pointercancel` is not a release.
   *
   * On touch the browser fires it when it takes the gesture over to scroll the
   * page, and it arrives with no movement and well inside the click window —
   * so treating it as a tap means flicking past the craft on a phone ejects
   * the print you were looking at. The drag simply ends and the print goes
   * home.
   */
  const cancelDrag = useCallback(
    (event: PointerEvent) => {
      const s = sim.current;
      if (!s.drag || s.drag.pointerId !== event.pointerId) return;
      s.drag = null;
      s.tx = 0;
      s.ty = 0;
      wake();
    },
    [wake],
  );

  const endDrag = useCallback(
    (event: PointerEvent) => {
      const s = sim.current;
      const drag = s.drag;
      if (!drag || drag.pointerId !== event.pointerId) return;
      s.drag = null;
      s.tx = 0;
      s.ty = 0;

      const quick = performance.now() - drag.at < CLICK_TIME;
      if (!drag.moved && quick) {
        // A tap on a finished print asks for the next one.
        if (s.dev >= 1) freshPrint();
        else addShake(SHAKE_IMPULSE * 2);
      }
      wake();
    },
    [addShake, freshPrint, wake],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const s = sim.current;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (s.dev >= 1) freshPrint();
        else if (s.reduced) {
          // No shaking to simulate: the key develops the print outright.
          s.dev = 1;
          wake();
        } else addShake(SHAKE_IMPULSE * 2.4);
      } else if (event.key === "Escape") {
        event.preventDefault();
        freshPrint();
      }
    },
    [addShake, freshPrint, wake],
  );

  // Listeners are attached natively rather than through React props, the same
  // way the photo pile does it. A pointer gesture wants `{ passive: false }`
  // and a capture that survives the element re-rendering under it, and React's
  // delegated events give neither.
  useEffect(() => {
    const hit = hitRef.current;
    if (!hit) return;
    hit.addEventListener("pointerdown", onPointerDown);
    hit.addEventListener("pointermove", onPointerMove);
    hit.addEventListener("pointerup", endDrag);
    hit.addEventListener("pointercancel", cancelDrag);
    hit.addEventListener("keydown", onKeyDown);
    return () => {
      hit.removeEventListener("pointerdown", onPointerDown);
      hit.removeEventListener("pointermove", onPointerMove);
      hit.removeEventListener("pointerup", endDrag);
      hit.removeEventListener("pointercancel", cancelDrag);
      hit.removeEventListener("keydown", onKeyDown);
    };
  }, [onPointerDown, onPointerMove, endDrag, cancelDrag, onKeyDown]);

  useReducedMotion((reduced) => {
    const s = sim.current;
    s.reduced = reduced;
    if (reduced) {
      // Nothing to shake, so the print simply finishes coming up.
      s.tx = 0;
      s.ty = 0;
      s.phase = s.dev >= 1 ? "admiring" : "developing";
    }
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
        // Arriving on screen starts the first print coming up.
        if (s.phase === "admiring" && s.dev >= 1 && s.elapsed === 0) {
          s.dev = 0;
          s.phase = "developing";
        }
        wake();
      } else {
        loop.stop();
      }
    },
    { pauseWhenTabHidden: true },
  );

  const print = PRINTS[index] ?? PRINTS[0];
  if (!print) return null;

  return (
    <div ref={rootRef} className={styles.craft}>
      <div ref={printRef} className={styles.print}>
        <div className={styles.window}>
          <div ref={emulsionRef} className={styles.emulsion} />
          {/* A plain <img>, not next/image. Two reasons: next/image renders a
              placeholder wrapper for a static import, so a ref does not reach
              the element whose filter the loop has to write; and the Netlify
              preview's /_next/image optimizer 400s, which would leave the
              craft empty there. The source is already an optimised webp. */}
          {/* The shadow pass. Multiplied onto the emulsion, so it paints
              density where the photograph is dark and nothing where it is
              bright. Decorative: the caption lives on the layer below. */}
          {/** biome-ignore lint/performance/noImgElement: see above */}
          <img
            ref={shadowsRef}
            className={styles.shadows}
            src={print.src.src}
            alt=""
            aria-hidden="true"
            width={188}
            height={182}
            decoding="async"
            loading="lazy"
          />
          {/** biome-ignore lint/performance/noImgElement: see above */}
          <img
            ref={photoRef}
            className={styles.photo}
            src={print.src.src}
            alt={print.caption}
            width={188}
            height={182}
            decoding="async"
            loading="lazy"
          />
          <div className={styles.lip} />
          <div className={styles.grain} />
        </div>
        <div className={styles.readout} aria-hidden="true">
          <span>{ready ? "Ready" : "Developing"}</span>
          <span ref={timeRef}>0:00</span>
        </div>
      </div>

      {/* The pointer's surface is static and sits over everything, so a drag
          never hit-tests against the print it is moving. */}
      <button
        ref={hitRef}
        type="button"
        className={styles.hit}
        aria-label={
          ready
            ? `A finished instant print: ${print.caption}. Press Enter for a new one.`
            : `An instant print developing: ${print.caption}. Drag it back and forth to shake it, or press Enter. Escape pulls a new one.`
        }
      />
    </div>
  );
}
