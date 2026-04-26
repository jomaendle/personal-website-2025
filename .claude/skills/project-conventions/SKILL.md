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

- Dark mode is the **default** theme — never assume light as the baseline when writing styles
- CSS variables from `app/globals.css` are the source of truth for colors and spacing — prefer these over hardcoded values
- Link colors: `#2997ff` default, `#0070f3` hover
- Typography uses the Inter font; prose styling is defined in `globals.css`
- Follow shadcn/ui patterns for new UI components

## Performance conventions

- Use `export const dynamic = "force-static"` on blog post pages
- Images should use Next.js `<Image>` component for optimization
- Prefer `tailwindcss-motion` and Framer Motion (`motion` package) for animations — don't add new animation libraries
