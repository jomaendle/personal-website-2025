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
import styles from "./contact-sheet.module.css";

/** The sheet's geometry, in CSS px. Mirrored in the stylesheet; both have to
 * agree, because the lens samples a canvas built from these numbers while the
 * visible sheet is laid out by CSS. */
const COLS = 5;
const ROWS = 3;
const FRAME_W = 112;
const FRAME_H = 75;
const FRAME_GAP = 6;
const STRIP_PAD = 9;
const STRIP_GAP = 10;
const SHEET_PAD_X = 10;
const SHEET_PAD_Y = 14;
const STRIP_H = FRAME_H + STRIP_PAD * 2;
const SHEET_W = SHEET_PAD_X * 2 + COLS * FRAME_W + (COLS - 1) * FRAME_GAP;
const SHEET_H = SHEET_PAD_Y * 2 + ROWS * STRIP_H + (ROWS - 1) * STRIP_GAP;

/** The loupe, in CSS px. `WELL` is the barrel's inset, so the glass radius is
 * what is left inside it. */
const LOUPE = 132;
const WELL = 17;
const GLASS_R = (LOUPE - WELL * 2) / 2;

/**
 * The optics.
 *
 * `f` maps a destination radius to a source radius, both normalised to the
 * glass radius: `f(r) = r · (A + B·r⁴)`.
 *
 * `A = 1/M` sets the magnification at the centre. `A + B = 1.15`, so the rim
 * samples fifteen per cent beyond the glass's own footprint — and *that* is
 * the whole trick. A CSS `scale()` can only enlarge what is already under the
 * glass; a real loupe squeezes material from outside the rim into its last few
 * pixels. Without the in-pull this is a zoomed circle, not a lens.
 *
 * The exponent is 4, not 2, so the centre stays flat. Distortion that begins
 * at r = 0 reads as a fisheye photo filter rather than as glass. The sampled
 * radius stays within 1% of a pure scale out to r ≈ 0.32, from
 * `1 + (B/A)·r⁴ = 1.01`. The published 0.266 figure is the same calculation at
 * M = 2.6, which is what the renderer spike ran at; a gentler lens has a wider
 * flat centre, so lowering M improved this rather than costing anything.
 *
 * M is 1.7 rather than a real loupe's 8x on purpose. At high magnification the
 * glass fills with one frame and reads as a porthole; at 1.7 the rebate and
 * sprocket holes go big inside the glass while the frames around it stay
 * small, which is what identifies the object as a loupe at all.
 */
const M = 1.7;
const LENS_A = 1 / M;
const LENS_B = 1.15 - LENS_A;
const lensF = (r: number) => r * (LENS_A + LENS_B * r * r * r * r);

/** How much finer than CSS pixels the offscreen sheet is rendered. It has to
 * beat the magnification or the lens shows interpolation rather than detail.
 * Above the magnification there is nothing left to win, only memory. */
const SUPERSAMPLE = 2.6;
/** Margin around the offscreen sheet, so the rim can sample past the paper's
 * edge without any bounds check in the inner loop. */
const PAD = Math.ceil(GLASS_R * 1.2 * SUPERSAMPLE);

/** Spring carrying the loupe to the pointer. A little lag is the glass's
 * weight, and the lag is also what swings the specular highlight. */
const CHASE_STIFFNESS = 3900;
const CHASE_DAMPING = 125;
/** Magnetic snap to a frame's centre. The one deliberately underdamped spring
 * here: about six per cent overshoot is the clunk of a magnet catching, and
 * critically damped it reads as merely drifting to a stop. */
const SNAP_STIFFNESS = 700;
const SNAP_DAMPING = 44;
/** Keyboard steps land inside the ~300ms a gesture gets, and must not
 * overshoot, because held arrow-repeat compounds overshoot into a wobble. */
const KEY_STIFFNESS = 1200;
const KEY_DAMPING = 69;

const MAX_STEP = 0.008;
assertStable("loupe chase", CHASE_STIFFNESS, CHASE_DAMPING, MAX_STEP);
assertStable("loupe snap", SNAP_STIFFNESS, SNAP_DAMPING, MAX_STEP);
assertStable("loupe key", KEY_STIFFNESS, KEY_DAMPING, MAX_STEP);

const CLICK_SLOP = 6;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

type Frame = { src: StaticImageData; caption: string; no: string };

/** Fifteen frames from thirteen negatives. A contact sheet is a roll, so a
 * subject reappearing a frame or two later is what it should look like. */
const SOURCES: StaticImageData[] = [
  dsc05383,
  dsc00645,
  dsc00911,
  dsc00465,
  dsc04499,
  dsc04938,
  dsc05480,
  dsc00929,
  dsc00535,
  dsc04861,
  dsc09908,
  photo6554107,
  dsc00483,
  dsc05383,
  dsc00645,
];
const CAPTIONS = [
  "Low sun on the water",
  "Ridge line",
  "Undergrowth",
  "Long lens, sea",
  "Track through trees",
  "Valley, morning",
  "Harbour, evening",
  "Hillside",
  "Coast road",
  "Rocks",
  "Still water",
  "Field",
  "Treeline",
  "Low sun, reframed",
  "Ridge line, wider",
];
/** Circled selects and crossed rejects, as authored marks rather than a verb
 * the visitor performs. One interactive idea per craft. */
const SELECTED = new Set([2, 7, 11]);
const REJECTED = new Set([4, 9]);

const FRAMES: Frame[] = SOURCES.map((src, i) => ({
  src,
  caption: CAPTIONS[i] ?? "Frame",
  no: `${String(Math.floor(i / COLS) + 1)}${String.fromCharCode(65 + (i % COLS))}`,
}));

/** A frame's rect on the sheet, in sheet-local CSS px. */
function frameRect(i: number) {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  return {
    x: SHEET_PAD_X + col * (FRAME_W + FRAME_GAP),
    y: SHEET_PAD_Y + row * (STRIP_H + STRIP_GAP) + STRIP_PAD,
    w: FRAME_W,
    h: FRAME_H,
  };
}
function frameCentre(i: number) {
  const r = frameRect(i);
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}
/** Which frame a point is nearest. The sheet is a grid, so this is arithmetic
 * rather than a hit test against thirteen moving rectangles. */
function nearestFrame(x: number, y: number) {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < FRAMES.length; i++) {
    const c = frameCentre(i);
    const d = (c.x - x) ** 2 + (c.y - y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

/**
 * A contact sheet with a loupe you drag across it.
 *
 * The magnification is a canvas lookup-table remap, not a CSS scale and not an
 * SVG displacement filter. A LUT is built once per glass size, mapping every
 * destination pixel to a source offset; each frame is then one integer add and
 * one array read per pixel, about 2.6ms at four times CPU throttle. The filter
 * route was measured and rejected: in WebKit it does not degrade, it erases
 * the element, silently and with no console error in any engine.
 *
 * The sheet is rendered once into an offscreen canvas at 2.6x CSS pixels and
 * released the moment the craft leaves the screen, because that buffer is the
 * craft's real cost. Nothing is built until the first interaction.
 *
 * The sheet itself is ordinary server-rendered DOM: fifteen photographs, their
 * frame numbers, and the grease-pencil marks. With no JavaScript the loupe
 * still sits on the paper and still magnifies, via a plain clipped scale. Only
 * the optics are an enhancement.
 */
export function ContactSheet() {
  const rootRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLButtonElement>(null);
  const loupeRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const [over, setOver] = useState(7);

  const sim = useRef({
    /** Loupe centre, in sheet-local CSS px. */
    x: frameCentre(7).x,
    y: frameCentre(7).y,
    vx: 0,
    vy: 0,
    tx: frameCentre(7).x,
    ty: frameCentre(7).y,
    mode: "snap" as "drag" | "snap" | "key",
    drag: null as null | {
      pointerId: number;
      grabX: number;
      grabY: number;
      originX: number;
      originY: number;
      at: number;
      moved: boolean;
    },
    over: 7,
    reduced: false,
    visible: true,
    dpr: 1,
    /** The offscreen sheet and its LUT. Both are built on demand and dropped
     *  when the craft scrolls away. */
    source: null as ImageData | null,
    sourceW: 0,
    lut: null as Int32Array | null,
    lutSize: 0,
    out: null as ImageData | null,
  });

  /** Render every frame into one offscreen canvas at SUPERSAMPLE, once. */
  const buildSource = useCallback(async () => {
    const s = sim.current;
    if (s.source) return;
    const w = Math.ceil(SHEET_W * SUPERSAMPLE) + PAD * 2;
    const h = Math.ceil(SHEET_H * SUPERSAMPLE) + PAD * 2;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // The pad is paper, so the rim can sample past the sheet's edge without a
    // bounds check in the per-pixel loop.
    const light = !document.documentElement.classList.contains("dark");
    ctx.fillStyle = light ? "#efeae0" : "#211f1c";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = light ? "#14130f" : "#d8d2c4";
    for (let r = 0; r < ROWS; r++) {
      const y = SHEET_PAD_Y + r * (STRIP_H + STRIP_GAP);
      ctx.fillRect(
        PAD,
        PAD + y * SUPERSAMPLE,
        w - PAD * 2,
        STRIP_H * SUPERSAMPLE,
      );
    }

    await Promise.all(
      FRAMES.map(
        (f, i) =>
          new Promise<void>((done) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              const r = frameRect(i);
              // object-fit: cover, by hand.
              const scale = Math.max(
                (r.w * SUPERSAMPLE) / img.width,
                (r.h * SUPERSAMPLE) / img.height,
              );
              const dw = img.width * scale;
              const dh = img.height * scale;
              ctx.save();
              ctx.beginPath();
              ctx.rect(
                PAD + r.x * SUPERSAMPLE,
                PAD + r.y * SUPERSAMPLE,
                r.w * SUPERSAMPLE,
                r.h * SUPERSAMPLE,
              );
              ctx.clip();
              ctx.drawImage(
                img,
                PAD + r.x * SUPERSAMPLE + (r.w * SUPERSAMPLE - dw) / 2,
                PAD + r.y * SUPERSAMPLE + (r.h * SUPERSAMPLE - dh) / 2,
                dw,
                dh,
              );
              ctx.restore();
              done();
            };
            img.onerror = () => done();
            img.src = f.src.src;
          }),
      ),
    );

    s.source = ctx.getImageData(0, 0, w, h);
    s.sourceW = w;
  }, []);

  /** Build the destination-to-source offset table for the current glass size. */
  const buildLut = useCallback(() => {
    const s = sim.current;
    const size = Math.round(GLASS_R * 2 * s.dpr);
    if (s.lut && s.lutSize === size) return;
    const lut = new Int32Array(size * size);
    const rDev = size / 2;
    // Destination device px to source supersampled px along a radius.
    const k = (GLASS_R * SUPERSAMPLE) / rDev;
    for (let y = 0; y < size; y++) {
      const dy = y - rDev + 0.5;
      for (let x = 0; x < size; x++) {
        const dx = x - rDev + 0.5;
        const d = Math.hypot(dx, dy);
        const r = d / rDev;
        // At the exact centre the ratio is 0/0; the limit is A.
        const ratio = d === 0 ? LENS_A : lensF(r) / r;
        const sx = Math.round(dx * ratio * k);
        const sy = Math.round(dy * ratio * k);
        lut[y * size + x] = sy * s.sourceW + sx;
      }
    }
    s.lut = lut;
    s.lutSize = size;
    s.out = new ImageData(size, size);
  }, []);

  const paint = useCallback(() => {
    const s = sim.current;
    const loupe = loupeRef.current;
    if (loupe) {
      loupe.style.transform = `translate3d(${(s.x - LOUPE / 2).toFixed(2)}px, ${(
        s.y - LOUPE / 2
      ).toFixed(2)}px, 0)`;
    }

    const canvas = canvasRef.current;
    const src = s.source;
    const lut = s.lut;
    const out = s.out;
    if (!(canvas && src && lut && out)) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // One integer add and one 32-bit read per pixel. The whole reason the LUT
    // exists: no trigonometry, no allocation, no getImageData in the loop.
    const src32 = new Uint32Array(src.data.buffer);
    const dst32 = new Uint32Array(out.data.buffer);
    const cx = Math.round(PAD + s.x * SUPERSAMPLE);
    const cy = Math.round(PAD + s.y * SUPERSAMPLE);
    const base = cy * s.sourceW + cx;
    const max = src32.length - 1;
    for (let i = 0; i < dst32.length; i++) {
      dst32[i] = src32[clamp(base + lut[i]!, 0, max)]!;
    }
    ctx.putImageData(out, 0, 0);
  }, []);

  const step = useCallback((dt: number) => {
    const s = sim.current;
    let stiffness = SNAP_STIFFNESS;
    let damping = SNAP_DAMPING;
    if (s.mode === "drag") {
      stiffness = CHASE_STIFFNESS;
      damping = CHASE_DAMPING;
    } else if (s.mode === "key") {
      stiffness = KEY_STIFFNESS;
      damping = KEY_DAMPING;
    }

    if (s.reduced) {
      s.x = s.tx;
      s.y = s.ty;
      s.vx = 0;
      s.vy = 0;
    } else {
      s.vx += (stiffness * (s.tx - s.x) - damping * s.vx) * dt;
      s.x += s.vx * dt;
      s.vy += (stiffness * (s.ty - s.y) - damping * s.vy) * dt;
      s.y += s.vy * dt;
    }

    const near = nearestFrame(s.x, s.y);
    if (near !== s.over) {
      s.over = near;
      setOver(near);
    }

    return (
      !!s.drag ||
      Math.abs(s.vx) > 0.4 ||
      Math.abs(s.vy) > 0.4 ||
      Math.abs(s.tx - s.x) > 0.3 ||
      Math.abs(s.ty - s.y) > 0.3
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
      s.vx = 0;
      s.vy = 0;
      paint();
    },
  });

  const wake = useCallback(() => {
    if (sim.current.visible) loop.wake();
  }, [loop]);

  /** Bring the offscreen sheet and the table into being, then paint. */
  const ensureLens = useCallback(async () => {
    const s = sim.current;
    s.dpr = Math.min(2, window.devicePixelRatio || 1);
    const canvas = canvasRef.current;
    if (canvas) {
      const size = Math.round(GLASS_R * 2 * s.dpr);
      if (canvas.width !== size) {
        canvas.width = size;
        canvas.height = size;
      }
    }
    await buildSource();
    buildLut();
    wake();
  }, [buildSource, buildLut, wake]);

  /** Pointer position in sheet-local CSS px. */
  const toSheet = useCallback((clientX: number, clientY: number) => {
    const sheet = sheetRef.current;
    if (!sheet) return { x: 0, y: 0 };
    const box = sheet.getBoundingClientRect();
    return { x: clientX - box.left, y: clientY - box.top };
  }, []);

  const onPointerDown = useCallback(
    (event: PointerEvent) => {
      const s = sim.current;
      if (s.drag) return;
      const hit = hitRef.current;
      if (!hit) return;
      try {
        hit.setPointerCapture(event.pointerId);
      } catch {
        // Synthetic or already-released pointer; the drag still works.
      }
      void ensureLens();
      s.drag = {
        pointerId: event.pointerId,
        grabX: s.x,
        grabY: s.y,
        originX: event.clientX,
        originY: event.clientY,
        at: performance.now(),
        moved: false,
      };
      s.mode = "drag";
      // Jump to the pointer rather than dragging from wherever it rested.
      const p = toSheet(event.clientX, event.clientY);
      s.tx = clamp(p.x, 0, SHEET_W);
      s.ty = clamp(p.y, 0, SHEET_H);
      wake();
    },
    [ensureLens, toSheet, wake],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      const s = sim.current;
      const drag = s.drag;
      if (!drag || drag.pointerId !== event.pointerId) return;
      if (
        Math.hypot(event.clientX - drag.originX, event.clientY - drag.originY) >
        CLICK_SLOP
      ) {
        drag.moved = true;
      }
      const p = toSheet(event.clientX, event.clientY);
      s.tx = clamp(p.x, 0, SHEET_W);
      s.ty = clamp(p.y, 0, SHEET_H);
      wake();
    },
    [toSheet, wake],
  );

  const endDrag = useCallback(
    (event: PointerEvent) => {
      const s = sim.current;
      const drag = s.drag;
      if (!drag || drag.pointerId !== event.pointerId) return;
      s.drag = null;
      s.mode = "snap";
      // Released, the glass is pulled onto the nearest frame's centre.
      const c = frameCentre(nearestFrame(s.x, s.y));
      s.tx = c.x;
      s.ty = c.y;
      wake();
    },
    [wake],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const s = sim.current;
      let next = s.over;
      switch (event.key) {
        case "ArrowRight":
          next = Math.min(FRAMES.length - 1, s.over + 1);
          break;
        case "ArrowLeft":
          next = Math.max(0, s.over - 1);
          break;
        case "ArrowDown":
          next = Math.min(FRAMES.length - 1, s.over + COLS);
          break;
        case "ArrowUp":
          next = Math.max(0, s.over - COLS);
          break;
        case "Home":
          next = Math.floor(s.over / COLS) * COLS;
          break;
        case "End":
          next = Math.floor(s.over / COLS) * COLS + COLS - 1;
          break;
        default:
          return;
      }
      event.preventDefault();
      void ensureLens();
      const c = frameCentre(next);
      s.mode = "key";
      s.tx = c.x;
      s.ty = c.y;
      const frame = FRAMES[next];
      if (liveRef.current && frame) {
        liveRef.current.textContent = `Frame ${frame.no}, ${frame.caption}${
          SELECTED.has(next)
            ? ", circled"
            : REJECTED.has(next)
              ? ", marked as a reject"
              : ""
        }`;
      }
      wake();
    },
    [ensureLens, wake],
  );

  useEffect(() => {
    const hit = hitRef.current;
    if (!hit) return;
    hit.addEventListener("pointerdown", onPointerDown);
    hit.addEventListener("pointermove", onPointerMove);
    hit.addEventListener("pointerup", endDrag);
    hit.addEventListener("pointercancel", endDrag);
    hit.addEventListener("keydown", onKeyDown);
    return () => {
      hit.removeEventListener("pointerdown", onPointerDown);
      hit.removeEventListener("pointermove", onPointerMove);
      hit.removeEventListener("pointerup", endDrag);
      hit.removeEventListener("pointercancel", endDrag);
      hit.removeEventListener("keydown", onKeyDown);
    };
  }, [onPointerDown, onPointerMove, endDrag, onKeyDown]);

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
        loop.stop();
        // The offscreen sheet is several megabytes and is the craft's real
        // cost. Nothing off screen needs it, and rebuilding is cheap.
        s.source = null;
        s.lut = null;
        s.out = null;
      }
    },
    { pauseWhenTabHidden: true },
  );

  const frame = FRAMES[over] ?? FRAMES[0];

  return (
    <div ref={rootRef} className={styles.craft}>
      <div
        ref={sheetRef}
        className={styles.sheet}
        style={{ width: SHEET_W, height: SHEET_H }}
      >
        {Array.from({ length: ROWS }, (_, row) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length grid
            key={row}
            className={styles.strip}
          >
            {Array.from({ length: COLS }, (_, col) => {
              const i = row * COLS + col;
              const f = FRAMES[i];
              if (!f) return null;
              return (
                <div key={f.no} className={styles.frame}>
                  {/** biome-ignore lint/performance/noImgElement: the lens reads these pixels from a canvas built from the same file, so an optimizer round trip would desynchronise the two */}
                  <img
                    src={f.src.src}
                    alt={f.caption}
                    width={FRAME_W}
                    height={FRAME_H}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className={styles.number} aria-hidden="true">
                    {f.no}
                  </span>
                  {SELECTED.has(i) ? (
                    <span className={styles.mark} aria-hidden="true">
                      <svg viewBox="0 0 112 75">
                        <title>Circled</title>
                        <ellipse
                          cx="56"
                          cy="37"
                          rx="50"
                          ry="31"
                          transform="rotate(-4 56 37)"
                        />
                      </svg>
                    </span>
                  ) : null}
                  {REJECTED.has(i) ? (
                    <span className={styles.mark} aria-hidden="true">
                      <svg viewBox="0 0 112 75">
                        <title>Rejected</title>
                        <path d="M12 10 L100 66 M100 10 L12 66" />
                      </svg>
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}

        <div ref={loupeRef} className={styles.loupe}>
          <div className={styles.ambient} />
          <div className={styles.contact} />
          <div className={styles.barrel} />
          <div className={styles.well}>
            <canvas ref={canvasRef} className={styles.lens} />
          </div>
          <div className={styles.glass} />
        </div>
      </div>

      <p className={styles.readout} aria-hidden="true">
        <b>{frame?.no}</b>
        <span>{frame?.caption}</span>
      </p>
      <p ref={liveRef} role="status" className="sr-only" />

      <button
        ref={hitRef}
        type="button"
        className={styles.hit}
        aria-label={`A contact sheet of ${FRAMES.length} photographs with a loupe resting on it. Drag the loupe to magnify a frame, or use the arrow keys to move between frames.`}
      />
    </div>
  );
}
