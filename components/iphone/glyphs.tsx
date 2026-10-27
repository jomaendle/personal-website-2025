/**
 * Small SF Symbol stand-ins. All decorative: whatever they sit in carries the
 * accessible name.
 */
import type { SVGProps } from "react";
import styles from "./iphone.module.css";

type GlyphProps = SVGProps<SVGSVGElement>;

const base = {
  focusable: false,
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export const Chevron = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 8 14"
    strokeWidth="2"
    {...base}
    {...props}
  >
    <path d="M1.5 1.5 L6.5 7 L1.5 12.5" />
  </svg>
);

export const BackChevron = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 12 20"
    width="12"
    height="20"
    strokeWidth="2.6"
    {...base}
    {...props}
  >
    <path d="M10 2 L2 10 L10 18" />
  </svg>
);

export const Padlock = ({
  open,
  ...props
}: GlyphProps & { open?: boolean }) => (
  <svg aria-hidden="true" viewBox="0 0 14 18" {...base} {...props}>
    <path
      d={
        open ? "M3 8 V5 a4 4 0 0 1 7.6 -1.7" : "M3.5 8 V5 a3.5 3.5 0 0 1 7 0 V8"
      }
      strokeWidth="1.8"
    />
    <rect
      x="1"
      y="8"
      width="12"
      height="9.5"
      rx="2.2"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

export const Flashlight = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="22"
    height="22"
    strokeWidth="1.7"
    {...base}
    {...props}
  >
    <path d="M7 3 h10 v4 l-2.5 3.5 V21 h-5 V10.5 L7 7 Z" />
    <path d="M12 13 v2.5" />
  </svg>
);

export const Camera = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="22"
    height="22"
    strokeWidth="1.7"
    {...base}
    {...props}
  >
    <path d="M3 8.5 a2 2 0 0 1 2 -2 h2.2 l1.6 -2 h6.4 l1.6 2 H19 a2 2 0 0 1 2 2 V18 a2 2 0 0 1 -2 2 H5 a2 2 0 0 1 -2 -2 Z" />
    <circle cx="12" cy="13" r="3.6" />
  </svg>
);

export const Signal = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 18 12"
    width="18"
    height="12"
    focusable={false}
    fill="currentColor"
    {...props}
  >
    <rect x="0" y="8" width="3" height="4" rx="0.8" />
    <rect x="5" y="5.5" width="3" height="6.5" rx="0.8" />
    <rect x="10" y="3" width="3" height="9" rx="0.8" />
    <rect x="15" y="0" width="3" height="12" rx="0.8" />
  </svg>
);

export const Wifi = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 16 12"
    width="16"
    height="12"
    focusable={false}
    fill="currentColor"
    {...props}
  >
    <path d="M8 2.2c2.4 0 4.6.9 6.3 2.5l1.2-1.3A10.8 10.8 0 0 0 8 .4C5.1.4 2.5 1.5.5 3.4l1.2 1.3A9 9 0 0 1 8 2.2Z" />
    <path d="M8 5.6c1.5 0 2.9.6 4 1.6l1.2-1.3A7.6 7.6 0 0 0 8 3.8c-2 0-3.8.8-5.2 2.1L4 7.2c1.1-1 2.5-1.6 4-1.6Z" />
    <path d="M8 9c.6 0 1.2.2 1.6.6L8 11.5 6.4 9.6C6.8 9.2 7.4 9 8 9Z" />
  </svg>
);

/** The status bar battery. `level` 0 to 1 fills it (about 0.8 when the
 * browser doesn't say); green while charging, red when low, as on iOS. */
export const Battery = ({
  level = 0.8,
  charging = false,
  ...props
}: GlyphProps & { level?: number; charging?: boolean }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 28 13"
    width="27"
    height="13"
    focusable={false}
    {...props}
  >
    <rect
      x="0.5"
      y="0.5"
      width="24"
      height="12"
      rx="3.8"
      fill="none"
      stroke="currentColor"
      strokeOpacity="0.4"
    />
    <rect
      x="2"
      y="2"
      width={Math.max(2, 21 * Math.min(1, level))}
      height="9"
      rx="2.4"
      fill={charging ? "#34c759" : level <= 0.2 ? "#ff3b30" : "currentColor"}
    />
    <path
      d="M26 4.5 v4 a2 2 0 0 0 0 -4 Z"
      fill="currentColor"
      fillOpacity="0.4"
    />
  </svg>
);

export const Magnifier = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 16 16"
    width="15"
    height="15"
    strokeWidth="2"
    {...base}
    {...props}
  >
    <circle cx="6.8" cy="6.8" r="5" />
    <path d="M10.6 10.6 L14.5 14.5" />
  </svg>
);

export const ArrowUp = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 16 16"
    width="16"
    height="16"
    strokeWidth="2.4"
    {...base}
    {...props}
  >
    <path d="M8 13.5 V2.5 M3 7.5 L8 2.5 L13 7.5" />
  </svg>
);

export const Envelope = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    strokeWidth="1.8"
    {...base}
    {...props}
  >
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="M3.5 6.5 L12 13 L20.5 6.5" />
  </svg>
);

export const Globe = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    strokeWidth="1.8"
    {...base}
    {...props}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12 h18 M12 3 c3 3.2 3 14.8 0 18 M12 3 c-3 3.2 -3 14.8 0 18" />
  </svg>
);

export const CalendarGlyph = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    strokeWidth="1.8"
    {...base}
    {...props}
  >
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
    <path d="M3.5 9.5 h17 M8 3 v4 M16 3 v4" />
  </svg>
);

export const Close = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 14 14"
    width="13"
    height="13"
    strokeWidth="2.2"
    {...base}
    {...props}
  >
    <path d="M2 2 L12 12 M12 2 L2 12" />
  </svg>
);

export const Ellipsis = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="currentColor"
    {...props}
  >
    <circle cx="5.5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="18.5" cy="12" r="2" />
  </svg>
);

export const Reload = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 20 20"
    strokeWidth="1.9"
    {...base}
    {...props}
  >
    <path d="M16 10 a6 6 0 1 1 -1.76 -4.24 M16 3.5 V6.5 H13" />
  </svg>
);

export const Compose = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    strokeWidth="1.8"
    {...base}
    {...props}
  >
    <path d="M20 13 V18.5 A2.5 2.5 0 0 1 17.5 21 H5.5 A2.5 2.5 0 0 1 3 18.5 V6.5 A2.5 2.5 0 0 1 5.5 4 H11" />
    <path d="M18.4 3.6 a1.9 1.9 0 0 1 2.7 2.7 L12.5 14.9 L9 16 L10.1 12.5 Z" />
  </svg>
);

export const Share = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    strokeWidth="1.8"
    {...base}
    {...props}
  >
    <path d="M8 9.5 H6.5 A1.5 1.5 0 0 0 5 11 v8.5 A1.5 1.5 0 0 0 6.5 21 h11 a1.5 1.5 0 0 0 1.5 -1.5 V11 A1.5 1.5 0 0 0 17.5 9.5 H16 M12 14.5 V3 M8.5 6.5 L12 3 L15.5 6.5" />
  </svg>
);

/** Transport controls, filled like SF Symbols' play.fill family. */
export const PlayGlyph = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    {...props}
  >
    <path d="M7 4.8 C7 3.9 7.95 3.35 8.72 3.82 L19.6 10.6 C20.33 11.06 20.33 12.94 19.6 13.4 L8.72 20.18 C7.95 20.65 7 20.1 7 19.2 Z" />
  </svg>
);

export const PauseGlyph = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    {...props}
  >
    <rect x="5.5" y="4" width="4.5" height="16" rx="1.3" />
    <rect x="14" y="4" width="4.5" height="16" rx="1.3" />
  </svg>
);

export const ForwardGlyph = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 32 24"
    width="32"
    height="24"
    fill="currentColor"
    {...props}
  >
    <path d="M2 5.6 C2 4.7 2.98 4.15 3.75 4.63 L13.6 10.9 C14.3 11.35 14.3 12.65 13.6 13.1 L3.75 19.37 C2.98 19.85 2 19.3 2 18.4 Z" />
    <path d="M15 5.6 C15 4.7 15.98 4.15 16.75 4.63 L26.6 10.9 C27.3 11.35 27.3 12.65 26.6 13.1 L16.75 19.37 C15.98 19.85 15 19.3 15 18.4 Z" />
  </svg>
);

export const BackwardGlyph = (props: GlyphProps) => (
  <ForwardGlyph style={{ transform: "scaleX(-1)" }} {...props} />
);

export const ShuffleGlyph = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    strokeWidth="2"
    {...base}
    {...props}
  >
    <path d="M3 7 h3.5 c2.2 0 3.6 1.1 4.8 3 l2.4 4 c1.2 1.9 2.6 3 4.8 3 H21 M3 17 h3.5 c1.6 0 2.8 -.6 3.8 -1.7 M21 7 h-2.5 c-1.6 0 -2.8 .6 -3.8 1.7 M18.5 4.5 L21 7 L18.5 9.5 M18.5 14.5 L21 17 L18.5 19.5" />
  </svg>
);

export const ChevronDown = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 20 12"
    width="20"
    height="12"
    strokeWidth="2.6"
    {...base}
    {...props}
  >
    <path d="M2 2 L10 10 L18 2" />
  </svg>
);

export const Heart = ({
  filled = false,
  ...props
}: GlyphProps & { filled?: boolean }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="22"
    height="22"
    strokeWidth="1.8"
    {...base}
    fill={filled ? "currentColor" : "none"}
    {...props}
  >
    <path d="M12 20.2 C5.6 16 3 12.6 3 9.2 A4.7 4.7 0 0 1 12 7.2 A4.7 4.7 0 0 1 21 9.2 C21 12.6 18.4 16 12 20.2 Z" />
  </svg>
);

/** Photos' info button: the "i" in a circle, with Visual Look Up's sparkle. */
export const InfoGlyph = ({
  filled = false,
  ...props
}: GlyphProps & { filled?: boolean }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="22"
    height="22"
    strokeWidth="1.7"
    {...base}
    {...props}
  >
    <circle cx="11" cy="13" r="8" fill={filled ? "currentColor" : "none"} />
    <path
      d="M11 12 V16.6 M9.6 16.6 H12.4"
      stroke={filled ? "#000" : "currentColor"}
    />
    <circle
      cx="11"
      cy="9.2"
      r="0.6"
      fill={filled ? "#000" : "currentColor"}
      stroke="none"
    />
    <path
      d="M19.5 1.8 L20.2 3.8 L22.2 4.5 L20.2 5.2 L19.5 7.2 L18.8 5.2 L16.8 4.5 L18.8 3.8 Z"
      fill="currentColor"
      strokeWidth="0.6"
    />
  </svg>
);

export const Sliders = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="22"
    height="22"
    strokeWidth="1.8"
    {...base}
    {...props}
  >
    <path d="M4 7 H14 M18 7 H20 M4 17 H6 M10 17 H20" />
    <circle cx="16" cy="7" r="2.2" />
    <circle cx="8" cy="17" r="2.2" />
  </svg>
);

export const Trash = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    strokeWidth="1.8"
    {...base}
    {...props}
  >
    <path d="M4 6.5 H20 M9.5 6.5 V4.5 A1 1 0 0 1 10.5 3.5 H13.5 A1 1 0 0 1 14.5 4.5 V6.5 M6 6.5 L7 19.5 A1.5 1.5 0 0 0 8.5 21 H15.5 A1.5 1.5 0 0 0 17 19.5 L18 6.5 M10 10.5 V17 M14 10.5 V17" />
  </svg>
);

/** Photos' filter button: three lines, each shorter than the last. */
export const FilterGlyph = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    strokeWidth="2"
    {...base}
    {...props}
  >
    <path d="M4 7 H20 M7 12 H17 M10 17 H14" />
  </svg>
);

/** Photos' Library tab: a photo on a stack. */
export const LibraryGlyph = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    strokeWidth="1.8"
    {...base}
    {...props}
  >
    <rect x="3.5" y="6.5" width="14" height="14" rx="3" />
    <path d="M7 3.5 H17.5 A3 3 0 0 1 20.5 6.5 V17" />
    <path d="M3.5 17 L8 12.5 L11.5 16 L13.5 14 L17.5 18" />
  </svg>
);

/** Photos' Collections tab: four tiles. */
export const CollectionsGlyph = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    strokeWidth="1.8"
    {...base}
    {...props}
  >
    <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
  </svg>
);

/** The volume slider's ends: a speaker, with sound waves at the loud end. */
export const SpeakerGlyph = ({
  loud = false,
  ...props
}: GlyphProps & { loud?: boolean }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    strokeWidth="1.8"
    {...base}
    {...props}
  >
    <path
      d="M4 9.5 H7.5 L12 5.5 V18.5 L7.5 14.5 H4 Z"
      fill="currentColor"
      stroke="none"
    />
    {loud ? (
      <path d="M15.5 9 A4 4 0 0 1 15.5 15 M18 6.5 A7.5 7.5 0 0 1 18 17.5" />
    ) : null}
  </svg>
);

export const PlusGlyph = (props: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    strokeWidth="2"
    {...base}
    {...props}
  >
    <path d="M12 5 V19 M5 12 H19" />
  </svg>
);

/**
 * Play and pause in one place, swapped the way SF Symbols' replace effect
 * does: the outgoing symbol shrinks and blurs away as the other grows in.
 * Both stay mounted, so a quick double tap reverses mid-swap.
 */
export const PlayPauseGlyph = ({
  playing,
  size,
}: {
  playing: boolean;
  size: number;
}) => (
  <span className={styles.symbolSwap} data-playing={playing || undefined}>
    <PlayGlyph width={size} height={size} />
    <PauseGlyph width={size} height={size} />
  </span>
);
