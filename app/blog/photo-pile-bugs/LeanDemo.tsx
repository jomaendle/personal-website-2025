"use client";

import { useEffect, useRef, useState } from "react";

/** Two ways to lean a fanned row, side by side and draggable.
 *
 * "Per print" gives each print a fixed rotation, which is the obvious approach
 * and looks wrong the moment the row moves: the lean is stuck to the paper.
 * "From the window" takes the angle from the middle of the visible box, so a
 * print stands upright as it passes the centre and the row rolls as it slides.
 *
 * Deliberately schematic. Plain cards rather than photographs, so the only
 * thing to look at is the angle. */
const CARD = 52;
const STEP = 38;
const LEAN = 10;
const RADIUS = 150;

export function LeanDemo() {
  const [mode, setMode] = useState<"print" | "window">("window");
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [width, setWidth] = useState(640);
  const box = useRef<HTMLDivElement>(null);
  const from = useRef(0);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Enough cards to fill the window and a little over, so the row never ends.
  const count = Math.ceil(width / STEP) + 3;
  const span = count * STEP;

  useEffect(() => {
    if (dragging) return;
    // Idle drift is decoration; leave it out under reduced motion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      setOffset((o) => (o + dt * 0.03) % span);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dragging, span]);

  const half = width / 2;

  return (
    <figure className="not-prose my-8">
      <div className="mb-3 flex gap-2">
        {(["print", "window"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-md border px-3 py-1.5 font-mono text-xs transition-colors ${
              mode === m
                ? "border-brand bg-brand/10 text-brand"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "print" ? "lean per print" : "lean from the window"}
          </button>
        ))}
      </div>

      <div
        ref={box}
        className="relative h-[150px] cursor-grab touch-pan-y overflow-hidden rounded-lg border border-border bg-muted/30 active:cursor-grabbing"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          from.current = e.clientX + offset;
          setDragging(true);
        }}
        onPointerMove={(e) => {
          if (!dragging) return;
          setOffset((((from.current - e.clientX) % span) + span) % span);
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        {Array.from({ length: count }, (_, i) => {
          // wrap each card around the row so it is continuous in both directions
          const x = ((((i * STEP - offset) % span) + span) % span) - STEP * 2;
          // The two modes are identical at rest. In "per print" the lean is
          // baked in from the card's home slot, so it travels with the card;
          // in "from the window" it is read from where the card is now.
          const home = ((i * STEP) % span) - STEP * 2;
          const centre = (mode === "print" ? home : x) + CARD / 2;
          const angle = Math.atan2(centre - half, Math.max(half, RADIUS));
          const lean = Math.max(
            -LEAN,
            Math.min(LEAN, ((angle * 180) / Math.PI) * (LEAN / 45)),
          );
          const drop = Math.min(12, (1 - Math.cos(angle)) * 44);
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: a fixed positional row
              key={i}
              aria-hidden="true"
              className="absolute bottom-8 rounded-[3px] border-2 border-background bg-foreground/80 shadow-sm"
              style={{
                left: 0,
                width: CARD,
                height: 72,
                transformOrigin: "50% 100%",
                // rounded so the server and client render the same string
                transform: `translate(${x.toFixed(2)}px, ${drop.toFixed(2)}px) rotate(${lean.toFixed(2)}deg)`,
              }}
            />
          );
        })}
      </div>

      <figcaption className="mt-3 text-muted-foreground text-sm">
        Drag the row. Fixed per print, the lean travels with the paper and the
        whole row slides as a block. Taken from the window, each print rolls
        upright as it passes the middle.
      </figcaption>
    </figure>
  );
}
