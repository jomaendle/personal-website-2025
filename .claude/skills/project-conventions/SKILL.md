---
name: project-conventions
description: Key coding and content conventions for this personal website — apply these automatically when working in the codebase
user-invocable: false
---

When working in this codebase, always apply the following conventions without being asked:

## Code conventions

- Use `cn()` from `@/lib/utils` for conditional Tailwind class merging — never string concatenation or template literals for class names
- API routes live in `pages/api/` (Pages Router), **not** `app/api/` — this is intentional to use Next.js Pages Router for API endpoints
- Supabase client is imported from `@/lib/supabaseClient`; Resend client from `@/lib/resend`
- Components in `components/ui/` are generic reusable UI; `components/blog/` are blog-specific; `components/crafts/` are interactive demo components

## Blog post conventions

- **Always use `<CodeBlock>` component** for code samples in MDX files — never markdown triple-backtick fences. Example: `<CodeBlock language="typescript">...</CodeBlock>`
- Blog metadata (title, date, slug) lives in `lib/state/blog.ts` as named exports — **not** in MDX frontmatter
- Each blog post's `page.tsx` imports metadata from `lib/state/blog.ts` and wraps content in `<MdxLayout>`
- Image assets for a post go in `public/[slug]/` and are referenced as `/[slug]/filename.ext`
- Component-specific styles go in `Styles.module.css` co-located in the blog post directory

## Design conventions

The site runs an **editorial** design system: cream paper in light mode, near-black in dark, one vermilion accent.

- Design tokens are HSL CSS variables in `app/editorial-theme.css`; `app/globals.css` holds the Tailwind 4 `@theme` block, fonts and base styles. There is **no `tailwind.config` file**
- Use the tokens (`--brand`, `--background`, `--foreground`, `--card`, `--border`, `--muted-foreground`) rather than hardcoded colours. The accent is `--brand`; there is no blue link colour
- Typography: **Newsreader** (serif) for titles, **Geist** for body, **Geist Mono** for eyebrows, dates and labels. Geist is self-hosted from `app/fonts`; see `app/layout.tsx` for how each is loaded
- The mono eyebrow idiom is `font-mono text-brand text-xs uppercase tracking-wider`
- Lists are hairline "ledger" rows (`.ledger-row`), with a brand rule and tint on hover
- Both themes must work. Dark mode is selected by a **class on the root** (`.light` vs `:root:not(.light)`), not a media query, so canvas and SVG code that needs a token must resolve it with `getComputedStyle` and re-resolve on a `MutationObserver` watching `documentElement`
- Follow shadcn/ui patterns for new UI components

## Craft and animation conventions

Interactive crafts (`components/crafts/`, plus `components/image-stack.tsx`) all follow one architecture. Reuse `lib/motion/` rather than hand-rolling it again.

- `lib/motion/` provides `useAnimationLoop` (one rAF loop with wake/settle and sub-stepping), `useReducedMotion` (live `matchMedia`), `useOnScreen`, and `spring.ts` (integrator plus the stability bound)
- Keep **all mutable simulation state in one `useRef` object**, so handlers never go stale
- Write `transform`/`opacity` **directly to element refs** in the loop. Call `setState` only when a *semantic* value changes (an `aria-valuenow`, a reveal count)
- Springs are hand-rolled semi-implicit Euler. Past `k·h² + 2c·h < 4` they diverge silently into `NaN`, so sub-step long frames and call `assertStable()` beside each tuning block
- Keep tuning constants at module scope **next to the prose comment that justifies them**. Do not collect them into a shared presets file
- `prefers-reduced-motion` must be honoured **live**, not read once at mount. Reduced motion means gentler, not absent: keep cross-fades and press feedback, drop travel and coasting
- Capture pointer events on a **static hit surface** and hit-test geometrically. Never attach them to moving elements
- Grant `will-change` via `IntersectionObserver`, never on a pointer event
- Content is server-rendered; motion is an enhancement and never the only way content becomes visible

## Performance conventions

- Use `export const dynamic = "force-static"` on blog post pages
- Images should use Next.js `<Image>` component for optimization
- Prefer `tailwindcss-motion` and Framer Motion for animations — don't add new animation libraries. Framer Motion is lazy-loaded through `<LazyMotion strict>`, so only `m.*` components work; crafts use `lib/motion/` instead

## Content conventions

- Before writing or editing any user-visible text (page copy, articles, metadata, form labels), load the `writing-voice` skill and follow it. Most copy lives in `lib/state/` and `lib/config/`, not inline in components.
