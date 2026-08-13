import { createRequire } from "node:module";
import { join } from "node:path";
import process from "node:process";
import type { Config } from "tailwindcss";

/**
 * Tailwind plugins must be resolved through CommonJS.
 *
 * Two constraints meet here:
 *
 *  1. `next build` loads this config as CJS (a bare `require()` works), but
 *     `next dev` loads it through Node's ESM path, where the `require` global
 *     does not exist. A bare `require()` therefore crashes dev the first time
 *     Tailwind compiles the stylesheet, while the build stays green.
 *  2. Plain `import` statements would fix that, but they flip resolution to
 *     `tailwindcss-motion`'s ESM build, which default-imports Tailwind's
 *     Babel-compiled `flattenColorPalette` and so receives `{ default: fn }`
 *     rather than the function itself — "flattenColorPalette is not a function".
 *
 * `createRequire` seeded with a path (not `import.meta.url`, which is
 * unavailable under CJS) satisfies both: it works under either loader and keeps
 * the plugins on their working CommonJS builds.
 *
 * Knip cannot follow a `createRequire` call statically, so it reports both
 * plugins as unused. They are listed under `ignoreDependencies` in knip.json —
 * remove them there if this file ever goes back to plain imports.
 */
const requirePlugin = createRequire(join(process.cwd(), "tailwind.config.ts"));

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./mdx-components.tsx",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        /* Decorative hairline vs. control boundary — see the comment on the
           tokens in app/editorial-theme.css. Anything a user operates should
           use `border-border-strong` to clear WCAG 1.4.11's 3:1. */
        "border-strong": "hsl(var(--border-strong))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        link: {
          DEFAULT: "hsl(var(--link))",
          hover: "hsl(var(--link-hover))",
        },
        brand: {
          DEFAULT: "hsl(var(--brand))",
          soft: "hsl(var(--brand-soft))",
        },
      },
      fontFamily: {
        // Without this key `font-sans` falls through to Tailwind's default
        // stack — Geist only applied because <body> hard-coded it inline.
        sans: [
          "var(--font-sans)",
          "Geist",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        serif: [
          "var(--font-serif)",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
        mono: [
          "Geist Mono",
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 2s ease-in-out infinite",
      },
      screens: {
        "2xl": "1440px",
        "3xl": "1600px",
      },
    },
  },
  plugins: [
    requirePlugin("tailwindcss-animate"),
    requirePlugin("tailwindcss-motion"),
  ],
};
export default config;
