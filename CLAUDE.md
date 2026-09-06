# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

The package manager is pnpm (`pnpm-lock.yaml` is the lockfile).

- `pnpm dev` - Start the development server (http://localhost:3000)
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run Biome to check for code issues (lint + format + import order)
- `pnpm lint:fix` - Apply Biome's safe fixes
- `pnpm format` - Format with Biome

## Architecture Overview

This is a Next.js 15 personal website built with the App Router, featuring a blog with MDX content, dynamic components, and modern web technologies.

### Core Technologies

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS 4 (CSS-first config in `app/globals.css` via `@theme`/`@plugin`; no tailwind.config file) with custom design system using CSS variables
- **Linting/Formatting**: Biome (`biome.json`) — strict a11y/complexity/correctness/security rules; CSS files are excluded (Tailwind syntax), plain `.css` is owned by Tailwind/PostCSS
- **Content**: MDX for blog posts with custom components
- **Database**: Supabase for view counters and data persistence
- **Email**: Resend for contact form submissions
- **Analytics**: Plausible Analytics and Vercel Speed Insights
- **Animations**: Framer Motion and tailwindcss-motion
- **Code Demos**: Sandpack for interactive code examples

### Project Structure

#### App Router Structure

- `app/` - Next.js App Router pages and layouts
  - `blog/[slug]/` - Blog post routes with MDX content
  - `page.tsx` - Homepage with sections for work, crafts, articles, experience
  - `layout.tsx` - Root layout with theme provider, analytics, and global metadata

#### Components Architecture

- `components/ui/` - Reusable UI components (Button, Card, Heading, etc.)
- `components/blog/` - Blog-specific components
- `components/crafts/` - Interactive demo components
- `components/` - Feature components (contact form, newsletter, etc.)

#### Content Management

- Blog posts are MDX files located in `app/blog/[slug]/page.mdx`
- Each blog post directory can contain supporting files (components, styles, assets)
- Custom MDX components defined in `mdx-components.tsx`
- Interactive code examples use Sandpack component

#### API Routes

- `pages/api/` - API routes using Pages Router (contact, newsletter, view tracking, OG images)
- Contact form uses Resend for email delivery
- View counter uses Supabase for persistence

#### Documented Solutions

- `docs/solutions/` - documented solutions to past problems (bugs, best practices, workflow patterns), organized by category with YAML frontmatter (`module`, `tags`, `problem_type`)

### Design System

An editorial system: cream paper in light mode, near-black in dark, one vermilion accent (`--brand`).

- Tokens are HSL CSS variables in `app/editorial-theme.css`; `app/globals.css` holds the Tailwind `@theme`, fonts and base styles
- Type: Newsreader (serif) for titles, Geist for body, Geist Mono for eyebrows, dates and labels. Geist is self-hosted from `app/fonts`; see `app/layout.tsx` for how each is loaded
- Lists are hairline "ledger" rows (`.ledger-row`), with a brand rule and tint on hover
- Content is server-rendered; motion is an enhancement and never the only way content becomes visible
- Voice rules for all copy live in `.claude/skills/writing-voice`

### Key Features

#### Interactive Blog Components

- Custom Sandpack integration for live code examples
- Component preview system for showcasing UI components
- Blog image optimization and responsive handling
- View counter tracking with Supabase

#### Content Structure

- Blog posts support embedded React components
- Each post can have its own stylesheet (`Styles.module.css`)
- Public assets organized by blog post in `public/[post-slug]/`

#### Performance & SEO

- Automatic OG image generation via API route
- Sitemap and robots.txt generation
- View transitions using `next-view-transitions`
- Speed insights and analytics integration

## Development Patterns

### Adding New Blog Posts

1. Create directory in `app/blog/[slug]/`
2. Add `page.mdx` file with frontmatter
3. Include supporting components and styles in the same directory
4. Assets go in `public/[slug]/`

### Custom Components in MDX

- Components can be imported and used directly in MDX files
- Use the Sandpack component for interactive code examples
- Follow the existing pattern of co-locating styles with components

### Styling Conventions

- Use Tailwind CSS classes following the existing design system
- Dark mode is the default theme
- Leverage CSS variables for consistent spacing and colors
- Module CSS for component-specific styles when needed

### API Integration

- Supabase client is configured in `lib/supabaseClient.ts`
- Environment variables required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Resend client in `lib/resend.ts` for email functionality
- always use the codeblock component when showing code in the articles

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
