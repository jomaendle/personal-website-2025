"use client";
import React, { useState } from "react";

const ScrollButton = ({
  position,
  icon,
  ariaLabel,
  className = "",
  style = {},
}: {
  position: string;
  icon: React.ReactNode;
  ariaLabel: string;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <button
    className={`absolute flex h-10 w-10 items-center justify-center rounded-full bg-neutral-700 text-xl text-white shadow ${position} ${className}`}
    aria-label={ariaLabel}
    style={{ zIndex: 1, ...style }}
    tabIndex={0}
  >
    {icon}
  </button>
);

const ScrollMarker = ({
  current = false,
  orientation = "horizontal",
  label,
}: {
  current?: boolean;
  orientation?: "horizontal" | "vertical";
  label: string;
}) => {
  const markerClass = current
    ? "inline-block h-4 w-4 rounded-full border border-neutral-700 bg-neutral-400"
    : "inline-block h-4 w-4 rounded-full bg-neutral-700";
  const lineClass =
    orientation === "horizontal"
      ? "h-4 w-0.5 bg-white/40"
      : "h-0.5 w-6 bg-white/40";
  return orientation === "horizontal" ? (
    <span
      className="relative flex flex-col items-center"
      aria-label={label}
      aria-orientation={orientation}
    >
      <span className={markerClass} />
      <span className={lineClass} />
      <span className="mt-2 whitespace-nowrap text-[10px] text-white/80">
        {label}
      </span>
    </span>
  ) : (
    <span className="relative flex items-center">
      <span className={markerClass} />
      <span className={lineClass} />
      <span className="ml-2 whitespace-nowrap text-[10px] text-white/80">
        {label}
      </span>
    </span>
  );
};

export const ScrollButtonAnatomy = () => {
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">(
    "horizontal",
  );

  return (
    <div className="my-8 flex flex-col gap-16">
      <div className="mb-4 flex justify-center">
        <button
          className="rounded border bg-neutral-800 px-4 py-2 text-sm text-white transition hover:bg-neutral-700"
          onClick={() =>
            setOrientation((prev) =>
              prev === "horizontal" ? "vertical" : "horizontal",
            )
          }
        >
          Toggle to {orientation === "horizontal" ? "Vertical" : "Horizontal"}{" "}
          View
        </button>
      </div>

      {orientation === "horizontal" ? (
        <div className="group relative mx-auto w-full max-w-2xl rounded-lg border bg-neutral-900 px-6 py-8 md:py-12">
          {/* Scroll Buttons */}
          <ScrollButton
            position="left-2 md:left-6 top-[54px] -translate-y-1/2 md:top-1/3"
            icon="←"
            ariaLabel="Scroll Left"
          />
          <ScrollButton
            position="md:right-6 right-2 top-[54px] -translate-y-1/2 md:top-1/3"
            icon="→"
            ariaLabel="Scroll Right"
          />

          <div className="flex flex-col md:hidden">
            {/* Scrollable Area */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto px-8 py-2 sm:gap-4 sm:px-16 sm:py-4">
              {["bg-neutral-700", "bg-neutral-500", "bg-neutral-700"].map(
                (bg, i) => (
                  <div
                    key={i}
                    className={`h-10 w-12 flex-shrink-0 rounded-lg sm:w-16 ${bg}`}
                  />
                ),
              )}
            </div>

            {/* Scroll Markers */}
            <div className="relative my-2 flex items-center justify-center gap-4 sm:gap-8">
              <div className="absolute bottom-0 h-4 w-full"></div>
              {[0, 1, 2].map((i) => (
                <ScrollMarker
                  key={i}
                  current={i === 1}
                  label={
                    i === 1
                      ? "::scroll-marker:target-current"
                      : "::scroll-marker"
                  }
                />
              ))}
            </div>
          </div>

          <div className="hidden flex-col md:flex">
            {/* Scrollable Area */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto px-8 py-2 sm:gap-4 sm:px-16 sm:py-4">
              {[
                "bg-neutral-800",
                "bg-neutral-700",
                "bg-neutral-500",
                "bg-neutral-700",
                "bg-neutral-800",
              ].map((bg, i) => (
                <div
                  key={i}
                  className={`h-10 w-12 flex-shrink-0 rounded-lg sm:w-16 ${bg}`}
                />
              ))}
            </div>

            {/* Scroll Markers */}
            <div className="relative my-2 flex items-center justify-center gap-4 sm:gap-8">
              <div className="absolute bottom-0 h-4 w-full"></div>
              {[0, 1, 2, 3, 4].map((i) => (
                <ScrollMarker
                  key={i}
                  current={i === 2}
                  label={
                    i === 2
                      ? "::scroll-marker:target-current"
                      : "::scroll-marker"
                  }
                />
              ))}
            </div>
          </div>

          {/* Labels */}
          <span className="absolute left-2 top-2 text-xs text-white/80 md:left-6 md:top-4">
            ::scroll-button(inline-start)
          </span>
          <span className="absolute right-2 top-2 text-xs text-white/80 md:right-6 md:top-4">
            ::scroll-button(inline-end)
          </span>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 px-1 text-xs text-white/80">
            ::scroll-marker-group
          </span>
        </div>
      ) : (
        <div className="relative mx-auto flex w-full max-w-2xl items-center justify-center gap-6 rounded-lg border bg-neutral-900 px-2 py-16 md:p-6">
          {/* Block-level Scroll Button (Top) */}
          <ScrollButton
            position="left-1/2 top-2 -translate-x-1/2"
            icon="↑"
            ariaLabel="Scroll Up"
          />
          <span className="absolute left-1/2 top-14 -translate-x-1/2 text-xs text-white/80">
            ::scroll-button(block-start)
          </span>
          {/* Scrollable Area */}
          <div className="flex flex-col items-center justify-center gap-2 overflow-y-auto py-8 sm:gap-4 sm:py-20">
            {[
              "bg-neutral-800",
              "bg-neutral-700",
              "bg-neutral-500",
              "bg-neutral-700",
              "bg-neutral-800",
            ].map((bg, i) => (
              <div key={i} className={`h-10 w-24 rounded-lg sm:w-32 ${bg}`} />
            ))}
          </div>
          {/* Scroll Markers (vertical) */}
          <div className="flex min-w-32 flex-col items-start gap-4 sm:gap-8 md:min-w-52">
            {[0, 1, 2, 3, 4].map((i) => (
              <ScrollMarker
                key={i}
                orientation="vertical"
                current={i === 2}
                label={
                  i === 2 ? "::scroll-marker:target-current" : "::scroll-marker"
                }
              />
            ))}
          </div>
          <span className="absolute right-2 top-2 text-xs text-white/80 sm:right-4">
            ::scroll-marker-group
          </span>
          {/* Block-level Scroll Button (Bottom) */}
          <ScrollButton
            position="bottom-2 left-1/2 -translate-x-1/2"
            icon="↓"
            ariaLabel="Scroll Down"
          />
          <span className="absolute bottom-14 left-1/2 -translate-x-1/2 text-xs text-white/80">
            ::scroll-button(block-end)
          </span>
        </div>
      )}
    </div>
  );
};
