# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

This is the single source for how this project works. Conventions live here
rather than in a separate skill, because a second file drifts: the old
`project-conventions` skill still described Inter and a blue link colour months
after the editorial redesign, and was quietly instructing every session to use
them.

## What this site is for

Jo Mändle's personal site. It exists, in order:

1. **To win freelance work.** A client or a recruiter lands here and decides
   whether to get in touch. That decision is the point.
2. **To earn respect from other engineers.** Depth and technical honesty over
   polish that does not survive a second look.
3. **To be standing proof he can build.** The site is the portfolio. Nothing on
   it should need an argument in words for why it is good.

What follows from that, and what to weigh when a decision is not obvious:

- **Legibility beats novelty.** A visitor gives this page seconds. Something
  obscure that only a specialist recognises is worth less than something they
  understand instantly and find impressive. Rarity is not a proxy for quality;
  if nobody is doing a thing, that is as likely to be a reason as an opening.
- **Restraint is the house style, but the work inside it need not be.** The
  page stays quiet. The things on the page can be loud.
- **Nothing ships that only works when it works.** Server-rendered content,
  honest fallbacks, real accessibility. A craft that breaks with JS off is a
  liability on a site whose job is to prove competence.

## Development commands

The package manager is pnpm (`pnpm-lock.yaml` is the lockfile).

- `pnpm dev` — dev server. **It runs on http://localhost:3001**; port 3000 is
  another project on this machine
- `pnpm build` — production build
- `pnpm start` — production server (`PORT=… pnpm start` to move it)
- `pnpm lint` — Biome: lint, format and import order
- `pnpm lint:fix` — Biome's safe fixes
- `pnpm format` — format only

There is **no test suite**. See *Verification* below for what to do instead.

## Architecture

Next.js 15, App Router.

- **Styling**: Tailwind CSS 4, CSS-first config in `app/globals.css` via
  `@theme`/`@plugin`. **There is no `tailwind.config` file**
- **Linting**: Biome (`biome.json`), strict a11y/complexity/correctness/security.
  CSS files are excluded because Tailwind's syntax trips the parser
- **Content**: MDX blog posts
- **Data**: Supabase (view counters), Resend (contact email)
- **Analytics**: Plausible and Vercel Speed Insights
- **Animation**: `lib/motion/` for crafts; Framer Motion for site chrome only,
  lazy-loaded through `<LazyMotion strict>`, so **only `m.*` components work**

### Layout

- `app/` — routes and layouts. `blog/[slug]/page.mdx` for posts,
  `crafts/` for the craft index
- `pages/api/` — API routes deliberately on the **Pages** Router (contact,
  newsletter, view tracking, OG images)
- `components/ui/` — generic reusable UI · `components/blog/` — blog-specific ·
  `components/crafts/` — interactive crafts · `components/` — feature components
- `lib/motion/` — the shared animation engine
- `lib/state/` — content as data (projects, blog, crafts, copy)
- `lib/config/` — site and navigation config
- `docs/solutions/` — write-ups of past problems, with YAML frontmatter
  (`module`, `tags`, `problem_type`). Check here before debugging something
  that smells familiar

## Design system

An editorial system: cream paper in light mode, near-black in dark, one
vermilion accent.

- Tokens are HSL CSS variables in `app/editorial-theme.css`. `app/globals.css`
  holds the Tailwind `@theme`, fonts and base styles
- Use tokens (`--brand`, `--background`, `--foreground`, `--card`, `--border`,
  `--muted-foreground`), not hardcoded colours. The accent is `--brand`; there
  is no blue link colour anywhere
- Type: **Newsreader** (serif) for titles, **Geist** for body, **Geist Mono**
  for eyebrows, dates and labels. Geist is self-hosted from `app/fonts`; see
  `app/layout.tsx`
- The mono eyebrow idiom is
  `font-mono text-brand text-xs uppercase tracking-wider`
- Lists are hairline ledger rows (`.ledger-row`), brand rule and tint on hover
- **Dark is the default.** The theme is a **class on the root** (`.light` vs
  `:root:not(.light)`), not a media query. Canvas and SVG cannot read CSS
  variables, so code that needs a token must resolve it with `getComputedStyle`
  and re-resolve on a `MutationObserver` watching `documentElement`
- Both themes must work. Dark mode is rarely an inversion: a contact sheet
  becomes a light table, paper stays paper rather than going white-on-black

### Objects sit in the palette; they are not made of it

The page is restrained. A craft object is not. Real material belongs on the
object: leather, chrome, vinyl, turned wood, white plastic. Tinting an object
to the design tokens is what turns it into a diagram of itself.

What separates an object from a diagram, concretely:

- One light source, upper-left, consistent across every surface
- Shadows always stack: a tight contact shadow that glues it to the page, a
  form shadow for thickness, a wide soft ambient pool. A single `box-shadow`
  reads as a sticker
- No flat fills. Every surface is a gradient
- A bevel is two lines, a light one on the top-left lip and a dark one on the
  bottom-right, via `inset` shadows. A 1px border is neither. A recess inverts
  this
- Surface grain via a low-opacity `feTurbulence` data URI, **not** stacked
  `repeating-linear-gradient`s, which beat into visible ribs at 2x
- **Mask every texture pass by the light.** Texture that shows evenly across a
  surface is the signature of a diagram; a real surface shows its grain where
  light rakes across it and hides it elsewhere. Uniform detail is the single
  most common reason a CSS object reads as fake
- The object fills most of its card. Small in a big empty box reads as a
  placeholder

`docs/solutions/frontend-design/css-objects-that-read-as-photographed-2026-09-20.md`
has the long version: blend modes over flat gradients, two densities per
shadow, simulating a physical process by raising a ceiling rather than fading a
layer, and the ink-squeeze filter chain that produces outlined type unless you
blur the rim inward.

## Crafts and motion

Crafts (`components/crafts/`, plus `components/image-stack.tsx`) share one
architecture. Use `lib/motion/` rather than hand-rolling it again.

- `useAnimationLoop` — one rAF loop with wake/settle and sub-stepping
- `useReducedMotion` — live `matchMedia`, not a read at mount
- `useOnScreen` — IntersectionObserver, optionally tab-visibility aware
- `spring.ts` — the integrator, plus `maxStableStep` and `assertStable`

Rules:

- **All mutable simulation state in one `useRef` object**, so handlers never go
  stale
- Write `transform`/`opacity` **directly to element refs** in the loop. Call
  `setState` only when a *semantic* value changes (an `aria-valuenow`, a phase
  label, a reveal count)
- Springs are hand-rolled semi-implicit Euler. Past `k·h² + 2c·h < 4` they
  diverge to `NaN`, which the browser silently drops, so the element simply
  vanishes on slow frames with nothing in the console. Sub-step long frames and
  call `assertStable()` beside each tuning block
- Keep tuning constants at module scope **next to the prose comment that
  justifies them**. Never collect them into a shared presets file
- `prefers-reduced-motion` is honoured **live**. Reduced motion means gentler,
  not absent: keep cross-fades, press feedback and anything that is content
  arriving; drop travel, coasting and decorative wobble
- Capture pointer events on a **static hit surface** and hit-test geometrically.
  Never attach them to moving elements. Use **native listeners in a `useEffect`**,
  the way `image-stack.tsx` does, not React props
- Take `pointerId` ownership so a second finger cannot steal a gesture, and
  handle `pointercancel`
- Grant `will-change` via `IntersectionObserver`, **never on a pointer event**
- Server-render the resting pose. Motion is an enhancement and never the only
  way content becomes visible

Note when debugging: several craft stylesheets are CSS modules with a `.hit`
class, so a selector like `[class*="__hit"]` matches more than one craft. Scope
queries to the craft's own root.

## Content and copy

- **Before writing or editing any user-visible text**, load the `writing-voice`
  skill and follow it. That includes page copy, metadata, alt text and form
  labels
- Most copy is **data, not JSX**: look in `lib/state/` and `lib/config/` before
  editing a component
- `app/llms.txt/route.ts` and `lib/business-markdown.ts` generate public
  markdown mirrors from the same data, so changing copy changes those too

### Blog posts

- **Always use `<CodeBlock>`** for code samples in MDX, never triple-backtick
  fences: `<CodeBlock language="typescript">…</CodeBlock>`
- Metadata (title, date, slug) lives in `lib/state/blog.ts` as named exports,
  **not** in MDX frontmatter
- Each post's `page.tsx` imports its metadata and wraps content in `<MdxLayout>`
- Assets go in `public/[slug]/`, referenced as `/[slug]/filename.ext`
- Component styles co-locate as `Styles.module.css`
- Use `export const dynamic = "force-static"`

## Code conventions

- `cn()` from `@/lib/utils` for conditional Tailwind classes, never string
  concatenation
- Supabase client from `@/lib/supabaseClient`; Resend from `@/lib/resend`.
  Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `noUncheckedIndexedAccess` is on: indexing an array yields `T | undefined`
- Prefer `next/image`, with two exceptions where a plain `<img>` is correct: a
  ref must reach the actual element (a static import renders a placeholder
  wrapper), or the Netlify preview's `/_next/image` optimizer would 400 on it
- Don't add new animation libraries

## Verification

There is no test runner, so verification is instrumented browser work, on a
**production build** (`pnpm build && pnpm start`). The dev overlay pollutes
layout and timing numbers, which this repo has already been bitten by.

- **Confirm the server under test is the one you think it is.** `pkill -f "next
  start"` does not match the `next-server` process, so a restart can silently
  fail on `EADDRINUSE` while a stale server keeps serving. The tell is 400s on
  `_next/static/chunks/*`: HTML cached in the old process pointing at chunk
  names a newer build overwrote. Kill by port (`lsof -ti:PORT | xargs kill -9`),
  delete `.next`, rebuild, and check exactly one server is listening
- For a motion change, assert the **loop stops at rest**: a `MutationObserver`
  counting `style` writes must reach zero after settling
- For sub-stepping, jam the main thread so frames exceed the stability bound,
  then check for `NaN` transforms and that the loop still terminates
- Check reduced motion by toggling it **at runtime without a reload**
  (Playwright's `emulateMedia`), not just by loading with it on
- Compare the **largest single-frame delta** and the **frame count to settle**,
  not the endpoints
- Test in Chromium, WebKit and Firefox. Each has found defects the others did not
- `docs/solutions/frontend-animation/` holds the accumulated pitfalls

## Working together

- **Show a rendered image early.** For anything visual, put a screenshot in
  front of Jo before writing production code. Describing a design in prose
  hides whether it is actually any good, and a wrong direction can survive a
  long time that way
- Report what was measured, not what was expected. If a number came from a
  run that turned out to be invalid, say so and re-run it

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
