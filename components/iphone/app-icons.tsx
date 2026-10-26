import { type CSSProperties, useId } from "react";
import { cn } from "@/lib/utils";
import styles from "./iphone.module.css";

/** Every icon on the home screen: the apps, plus web clips that leave. */
export type IconArt =
  | "notes"
  | "photos"
  | "safari"
  | "mail"
  | "calendar"
  | "contacts"
  | "settings"
  | "music"
  | "github"
  | "linkedin";

/** Weekday and day of month for the Calendar icon, once the client knows
 * them. The server renders the icon without. */
export interface CalendarFace {
  weekday: string;
  day: number;
}

const PETALS = [
  "#f9a23a",
  "#f7d33a",
  "#a6d24b",
  "#4bbe6c",
  "#3db2d6",
  "#6a7be8",
  "#b46bdb",
  "#ee5b7e",
];

const TICKS = Array.from({ length: 48 }, (_, i) => i * 7.5);

/**
 * App icons in the iOS 18 dark style, drawn here rather than copied: each is
 * an SVG on a 60-unit grid, so it stays sharp at any size, including the
 * full-screen width it reaches while an app zooms open.
 */
export function AppIcon({
  art,
  calendar,
  className,
  style,
  ref,
}: {
  art: IconArt;
  ref?: React.Ref<HTMLSpanElement>;
  calendar?: CalendarFace | null;
  className?: string;
  style?: CSSProperties;
}) {
  // Gradient ids are per instance: a document holds many copies of each icon,
  // and a reference that resolves into a hidden copy paints nothing.
  const id = useId();
  return (
    <span
      ref={ref}
      className={cn(styles.icon, className)}
      style={style}
      aria-hidden
    >
      <svg aria-hidden="true" viewBox="0 0 60 60" focusable="false">
        <defs>
          <linearGradient id={`${id}t`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a2a2c" />
            <stop offset="1" stopColor="#141415" />
          </linearGradient>
        </defs>
        <rect width="60" height="60" fill={`url(#${id}t)`} />
        {ART[art](id, calendar ?? null)}
      </svg>
    </span>
  );
}

const ART: Record<
  IconArt,
  (id: string, calendar: CalendarFace | null) => React.ReactNode
> = {
  photos: () => (
    // Capsule petals, as iOS draws them, overlapping at partial opacity so
    // each neighbour tints the next.
    <g>
      {PETALS.map((color, i) => (
        <rect
          key={color}
          x="25"
          y="7"
          width="10"
          height="22"
          rx="5"
          fill={color}
          opacity="0.86"
          transform={`rotate(${i * 45} 30 30)`}
        />
      ))}
    </g>
  ),
  notes: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe14d" />
          <stop offset="1" stopColor="#ffc300" />
        </linearGradient>
      </defs>
      <rect width="60" height="17" fill={`url(#${id}a)`} />
      <line
        x1="0"
        y1="18"
        x2="60"
        y2="18"
        stroke="#5a5a5e"
        strokeDasharray="1 1.4"
      />
      {[29, 39, 49].map((y) => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2="60"
          y2={y}
          stroke="#3a3a3c"
          strokeWidth="0.8"
        />
      ))}
    </>
  ),
  safari: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}a`} cx="0.5" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#3fc1ff" />
          <stop offset="1" stopColor="#0a63f0" />
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="23" fill={`url(#${id}a)`} />
      {TICKS.map((deg) => (
        <line
          key={deg}
          x1="30"
          y1="9"
          x2="30"
          y2={deg % 30 === 0 ? 12.5 : 11}
          stroke="#fff"
          strokeOpacity={deg % 30 === 0 ? 0.95 : 0.55}
          strokeWidth="0.7"
          transform={`rotate(${deg} 30 30)`}
        />
      ))}
      <g transform="rotate(45 30 30)">
        <path d="M30 12 L33.2 30 L26.8 30 Z" fill="#ff3b30" />
        <path d="M30 48 L33.2 30 L26.8 30 Z" fill="#f2f2f7" />
      </g>
      <circle cx="30" cy="30" r="1.4" fill="#fff" />
    </>
  ),
  mail: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3fb2ff" />
          <stop offset="1" stopColor="#0f6bff" />
        </linearGradient>
      </defs>
      <rect x="7" y="15" width="46" height="31" rx="4" fill={`url(#${id}a)`} />
      <path
        d="M8.5 16.5 L30 34 L51.5 16.5"
        fill="none"
        stroke="#0a3d99"
        strokeOpacity="0.6"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </>
  ),
  calendar: (_id, face) => (
    <>
      <text
        x="30"
        y="16.5"
        textAnchor="middle"
        fill="#ff453a"
        fontSize="8.5"
        fontWeight="600"
        fontFamily="-apple-system, BlinkMacSystemFont, system-ui, sans-serif"
      >
        {face?.weekday.toUpperCase()}
      </text>
      <text
        x="30"
        y="47"
        textAnchor="middle"
        fill="#fff"
        fontSize="33"
        fontWeight="300"
        letterSpacing="-1"
        fontFamily="-apple-system, BlinkMacSystemFont, system-ui, sans-serif"
      >
        {face?.day}
      </text>
    </>
  ),
  contacts: () => (
    <>
      <rect x="12" y="10" width="36" height="40" rx="5" fill="#3a3a3c" />
      <circle cx="30" cy="25" r="7" fill="#a1a1a6" />
      <path d="M17.5 43 a12.5 10 0 0 1 25 0 Z" fill="#a1a1a6" />
      {[16, 24, 32].map((y) => (
        <rect key={y} x="46" y={y} width="3" height="5" rx="1" fill="#636366" />
      ))}
    </>
  ),
  settings: (id) => (
    // Two meshed gears in brushed grey: a fine-toothed outer ring and a
    // smaller spoked gear at the hub.
    <>
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c7c7cc" />
          <stop offset="1" stopColor="#6e6e73" />
        </linearGradient>
      </defs>
      <g fill="none" stroke={`url(#${id}a)`}>
        <circle
          cx="30"
          cy="30"
          r="21"
          strokeWidth="3.6"
          strokeDasharray="1.83 1.83"
        />
        <circle cx="30" cy="30" r="18.2" strokeWidth="2.6" />
        <circle
          cx="30"
          cy="30"
          r="10.6"
          strokeWidth="2.6"
          strokeDasharray="1.66 1.11"
        />
        <circle cx="30" cy="30" r="8.6" strokeWidth="1.8" />
        {[0, 30, 60, 90, 120, 150].map((deg) => (
          <line
            key={deg}
            x1="30"
            y1="11.8"
            x2="30"
            y2="48.2"
            strokeWidth="1.6"
            strokeDasharray="7.4 21.6 7.4"
            transform={`rotate(${deg} 30 30)`}
          />
        ))}
        <circle cx="30" cy="30" r="3.2" strokeWidth="2.2" />
      </g>
    </>
  ),
  music: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fb5c74" />
          <stop offset="1" stopColor="#fa233b" />
        </linearGradient>
      </defs>
      <g fill={`url(#${id}a)`} stroke={`url(#${id}a)`}>
        <path d="M24.5 41 V19 L42 15 V37" fill="none" strokeWidth="3.4" />
        <ellipse cx="20.5" cy="41" rx="5" ry="4" stroke="none" />
        <ellipse cx="38" cy="37" rx="5" ry="4" stroke="none" />
      </g>
    </>
  ),
  github: () => (
    <path
      transform="translate(12 12) scale(1.5)"
      fill="#fff"
      d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
    />
  ),
  linkedin: () => (
    <>
      <rect x="11" y="11" width="38" height="38" rx="7" fill="#0a66c2" />
      <text
        x="30.5"
        y="41"
        textAnchor="middle"
        fill="#fff"
        fontSize="25"
        fontWeight="700"
        fontFamily="-apple-system, BlinkMacSystemFont, system-ui, sans-serif"
      >
        in
      </text>
    </>
  ),
};
