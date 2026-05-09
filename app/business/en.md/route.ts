export const dynamic = "force-static";

const md = `# Web Development for Businesses — Jo Mändle

Senior full-stack developer for small and mid-sized businesses.
Next.js · React · TypeScript · GDPR-aware · since 2022.

- Email: hello@jomaendle.com
- LinkedIn: https://www.linkedin.com/in/johannes-maendle/

## What I do

I build reliable web products for small and mid-sized businesses — real estate agencies, SaaS companies, photographers and everything in between.

Six plus years of TypeScript, React and Next.js experience. Currently at E.ON, previously at StudySmarter and Memberspot.

## Services

- **Website rebuild** — Next.js, statically rendered, SEO and accessibility ready.
- **Performance audit** — Lighthouse 95+, Core Web Vitals, image optimization.
- **API & CMS integration** — Headless CMS, CRM sync, external data sources.
- **Maintenance & iteration** — Reliable post-launch iteration and support.
- **SEO foundations** — Sitemap, structured data, technical SEO.

## Selected Work

### ImmoKäpsele — https://immokaepsele.de
**2024 – present · Sole developer & tech lead · Next.js · Flowfact CRM · Cloudinary**

Complete rebuild of a real-estate agency's website — architecture, Flowfact CRM integration and go-live. Direct collaboration with the owner, clear sprints and regular reviews.

- Statically generated property pages with daily CRM sync via GitHub Actions
- Valuation calculator with server-side validation and email summary to both owner and prospect
- Lighthouse 95+ across all pages, WebP/AVIF images served from AWS S3 + Cloudinary
- Fully GDPR-compliant: legally correct imprint, privacy notice, no unnecessary tracking

### Emerge Tech — EasyEngage — https://emerge-tech.io/
**2024 – present · Lead frontend developer · Astro · Multi-Tenant · TypeScript**

Building EasyEngage, an Astro-based platform that renders bespoke customer funnels per tenant. Focus areas: multi-tenant routing, fast builds, and an editor workflow that lets the product team ship funnels without developer involvement.

- Multi-tenant architecture with isolated data paths and per-customer theming
- Reduced build times through incremental Astro generation and targeted caching
- Component library reused across both the editor and the rendered funnel

### The Beauty of Earth — https://thebeautyof.earth
**2023 · Sole developer · Astro · Cloudinary**

An image-heavy landscape photography collection that has to stay fast on mobile.

- Lazy-loaded galleries with responsive AVIF/WebP delivery via Cloudinary
- Optimized Largest Contentful Paint and a stable Cumulative Layout Shift

### Jo Maendle Photography — https://photo.jomaendle.com
**2022 · Sole developer · Next.js · Static Export**

Personal photography portfolio with portrait and landscape work.

- Fully static, 100/100 Lighthouse performance
- Custom animation patterns for calm, focused image presentation

## How we'll work together

1. **Conversation** (~1 week) — Free and no-strings. Clarify goals, scope, technology.
2. **Proposal** (~2 weeks) — Clear fixed-price proposal with timeline and milestones.
3. **Launch** (4 – 8 weeks) — Fast iteration, regular previews, clean go-live.

## Why work with me

- Senior in-house experience shipping production web apps
- Fast iteration without cutting corners on code quality
- Fluent in English and German
- GDPR-aware, transparent communication, fair pricing

## Contact

- Email: hello@jomaendle.com
- LinkedIn: https://www.linkedin.com/in/johannes-maendle/
- HTML version: https://jomaendle.com/business/en
- German version: https://jomaendle.com/business
`;

export function GET() {
  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
