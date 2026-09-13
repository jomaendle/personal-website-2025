"use client";

import { useEffect, useRef, useState } from "react";

/** The same row twice: one opening on a smooth falloff, one as a discrete
 * state. Move across both, or drag a finger along them. The falloff resizes
 * three or four cards at once and shifts everything after them, so the row
 * never holds still; the discrete version only moves when the pointer reaches
 * a different card. */
const GROWTH = 0.5;
const REACH = 1.7;

function Row({ mode, label }: { mode: "falloff" | "state"; label: string }) {
  const [x, setX] = useState<number | null>(null);
  const [width, setWidth] = useState(320);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Lay the row out from the box, so it fits at any width and still grows.
  const count = 9;
  const pad = 18;
  const step = (width - pad * 2) / (count + 1.6);
  const card = step * 1.15;

  const raised = (i: number) => {
    if (x === null) return 0;
    const centre = pad + i * step + card / 2;
    if (mode === "state") return Math.abs(x - centre) <= step / 2 ? 1 : 0;
    const d = Math.abs(x - centre) / step;
    return d >= REACH ? 0 : 0.5 * (1 + Math.cos((Math.PI * d) / REACH));
  };

  let slide = 0;
  const offsets = Array.from({ length: count }, (_, i) => {
    if (i > 0) slide += ((raised(i - 1) + raised(i)) / 2) * card * GROWTH;
    return slide;
  });

  const track = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    setX(e.clientX - r.left);
  };

  return (
    <div className="flex-1">
      <p className="mb-2 font-mono text-muted-foreground text-xs">{label}</p>
      <div
        ref={box}
        className="relative h-[120px] touch-none overflow-hidden rounded-lg border border-border bg-muted/30"
        onPointerMove={track}
        onPointerDown={track}
        onPointerLeave={() => setX(null)}
      >
        {Array.from({ length: count }, (_, i) => {
          const up = raised(i);
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: a fixed positional row
              key={i}
              aria-hidden="true"
              className="absolute bottom-6 rounded-[3px] border-2 border-background bg-foreground/80"
              style={{
                left: 0,
                width: card,
                height: 66,
                transformOrigin: "50% 100%",
                transform: `translate(${pad + i * step + (offsets[i] ?? 0)}px, ${-up * 8}px) scale(${1 + up * GROWTH})`,
                zIndex: i,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export function HoverDemo() {
  return (
    <figure className="not-prose my-8">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Row mode="falloff" label="smooth falloff" />
        <Row mode="state" label="one card at a time" />
      </div>
      <figcaption className="mt-3 text-muted-foreground text-sm">
        Sweep across both, or drag a finger along them. On the left every pixel
        of movement resizes three or four cards and shifts the rest, so the row
        shimmers. On the right nothing changes until you cross into a different
        card.
      </figcaption>
    </figure>
  );
}
