# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start the development server (http://localhost:3000)
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check for code issues

## Architecture Overview

This is a Next.js 15 personal website built with the App Router, featuring a blog with MDX content, dynamic components, and modern web technologies.

### Core Technologies
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom design system using CSS variables
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

### Design System

The site uses a custom dark-first design system built on Tailwind CSS:
- CSS variables defined in `app/globals.css` for consistent theming
- Color scheme uses HSL values for better color manipulation
- Custom link colors: `#2997ff` (default) and `#0070f3` (hover)
- Typography uses Inter font with specific prose styling
- Components follow shadcn/ui patterns

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