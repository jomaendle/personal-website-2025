/**
 * Small SF Symbol stand-ins. All decorative: whatever they sit in carries the
 * accessible name.
 */
import type { SVGProps } from "react";

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

export const Battery = (props: GlyphProps) => (
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
    <rect x="2" y="2" width="17" height="9" rx="2.4" fill="currentColor" />
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

/** Back, forward, share, bookmarks, tabs: Safari's bottom toolbar. */
export const SafariToolbarGlyphs = () => (
  <>
    <BackChevron />
    <BackChevron style={{ transform: "scaleX(-1)" }} />
    <svg aria-hidden="true" viewBox="0 0 24 24" strokeWidth="1.8" {...base}>
      <path d="M8 9 H6.5 a1.5 1.5 0 0 0 -1.5 1.5 v9 A1.5 1.5 0 0 0 6.5 21 h11 a1.5 1.5 0 0 0 1.5 -1.5 v-9 A1.5 1.5 0 0 0 17.5 9 H16 M12 14 V2.5 M8.5 6 L12 2.5 L15.5 6" />
    </svg>
    <svg aria-hidden="true" viewBox="0 0 24 24" strokeWidth="1.8" {...base}>
      <path d="M12 6.5 C10 4.5 6.5 4 3 4.5 v14 c3.5 -.5 7 0 9 2 c2 -2 5.5 -2.5 9 -2 v-14 c-3.5 -.5 -7 0 -9 2 Z M12 6.5 v14" />
    </svg>
    <svg aria-hidden="true" viewBox="0 0 24 24" strokeWidth="1.8" {...base}>
      <rect x="3" y="7" width="14" height="14" rx="2.5" />
      <path d="M7 3.5 h11.5 a2.5 2.5 0 0 1 2.5 2.5 v11.5" />
    </svg>
  </>
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
