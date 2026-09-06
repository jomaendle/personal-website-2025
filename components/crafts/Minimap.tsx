"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MARKER_COUNT = 41;
const CENTER = (MARKER_COUNT - 1) / 2;
/** Pointer distance, in px, over which neighbouring ticks stop growing. */
const REACH = 110;

/**
 * A ruler that leans toward the pointer. Ticks near the cursor stretch on a
 * quadratic falloff, and a needle snaps to the nearest tick and reports its
 * index. Works with mouse, touch, and the arrow keys.
 *
 * Tick geometry is read from the DOM on every frame rather than cached, so
 * scrolling and resizing never desynchronise it. Forty-one ticks is cheap.
 */
export function Minimap() {
  const trackRef = useRef<HTMLDivElement>(null);
  const tickRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frameRef = useRef<number | null>(null);
  const [active, setActive] = useState(CENTER);
  const [needleX, setNeedleX] = useState<number | null>(null);

  /** Stretch ticks around `x` (track-relative) and snap the needle to the nearest. */
  const settle = useCallback((x: number) => {
    const track = trackRef.current;
    if (!track) return;
    const left = track.getBoundingClientRect().left;

    let nearest = CENTER;
    let nearestDistance = Infinity;
    let nearestX = 0;

    tickRefs.current.forEach((tick, index) => {
      if (!tick) return;
      const rect = tick.getBoundingClientRect();
      const tickX = rect.left - left + rect.width / 2;
      const distance = Math.abs(x - tickX);
      const t = Math.max(0, 1 - distance / REACH);
      // Short ticks grow the most; the long ones only nod, so nothing
      // collides with the readout above.
      const grow = Number(tick.dataset.grow);
      tick.style.transform = `scaleY(${1 + grow * t * t})`;
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = index;
        nearestX = tickX;
      }
    });

    setActive(nearest);
    setNeedleX(nearestX);
  }, []);

  const release = useCallback(() => {
    for (const tick of tickRefs.current) {
      if (tick) tick.style.transform = "";
    }
  }, []);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const track = trackRef.current;
      if (!track) return;
      const x = event.clientX - track.getBoundingClientRect().left;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => settle(x));
    },
    [settle],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const step =
        event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (step === 0) return;
      event.preventDefault();
      const next = Math.min(MARKER_COUNT - 1, Math.max(0, active + step));
      const tick = tickRefs.current[next];
      const track = trackRef.current;
      if (!(tick && track)) return;
      const rect = tick.getBoundingClientRect();
      settle(rect.left - track.getBoundingClientRect().left + rect.width / 2);
    },
    [active, settle],
  );

  // Park the needle on the centre tick once the ticks have laid out.
  useEffect(() => {
    const tick = tickRefs.current[CENTER];
    const track = trackRef.current;
    if (!(tick && track)) return;
    const rect = tick.getBoundingClientRect();
    setNeedleX(rect.left - track.getBoundingClientRect().left + rect.width / 2);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className="flex size-full flex-col items-center justify-center">
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Ruler"
        aria-valuemin={0}
        aria-valuemax={MARKER_COUNT - 1}
        aria-valuenow={active}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerMove}
        onPointerLeave={release}
        onKeyDown={onKeyDown}
        className="relative flex touch-none select-none items-center rounded-[0.35rem] px-4 py-10 outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        style={{ cursor: "crosshair" }}
      >
        {/* Needle: index readout, triangle, dashed rule. Positioned by
            translateX so the ticks never reflow. Hidden until measured. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 flex w-px flex-col items-center transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none"
          style={{
            transform: `translateX(${needleX ?? 0}px)`,
            opacity: needleX === null ? 0 : 1,
          }}
        >
          <span className="absolute top-1 left-1/2 -translate-x-1/2 font-mono text-[0.65rem] text-brand tabular-nums tracking-[0.12em]">
            {String(active).padStart(2, "0")}
          </span>
          <span className="absolute top-6 h-0 w-0 border-x-[5px] border-x-transparent border-t-[7px] border-t-brand" />
          <span
            className="absolute top-9 bottom-0 w-px"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, hsl(var(--brand)) 0 4px, transparent 4px 8px)",
            }}
          />
        </div>

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
              style={{
                transition: "transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1)",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
