import type { Config } from "tailwindcss";
import { createRequire } from "node:module";
import { join } from "node:path";

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
