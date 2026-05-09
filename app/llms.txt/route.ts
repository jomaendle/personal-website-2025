export const dynamic = "force-static";

const content = `# Jo Mändle

> Senior full-stack web developer based in Germany. Six plus years of TypeScript, React and Next.js experience. Available for freelance projects with small and mid-sized businesses — real estate agencies, SaaS companies, photographers and similar.

Contact:
- Email: me@jomaendle.com
- LinkedIn: https://www.linkedin.com/in/johannes-maendle/
- GitHub: https://github.com/jomaendle

## For businesses (hire me)

- [Webentwicklung für Unternehmen (DE)](https://jomaendle.com/business): German landing page describing services, selected client work, and a 3-step engagement process.
- [Web Development for Businesses (EN)](https://jomaendle.com/business/en): English version of the business landing page.

## Core services

- Website rebuilds and greenfield builds (Next.js, Astro, static-site setups)
- Performance and SEO audits (Lighthouse 95+, Core Web Vitals)
- Headless CMS and API/CRM integrations
- Ongoing maintenance and iteration
- GDPR-aware implementation (DSGVO)

## Selected client work

- [ImmoKäpsele](https://immokaepsele.de): Real estate website with property listings, valuation calculator, and Flowfact CRM integration. Statically generated property pages, daily CRM sync, Lighthouse 95+.
- [Emerge Tech — EasyEngage](https://emerge-tech.io/): Astro-based platform that renders bespoke customer funnels in a multi-tenant architecture.
- [The Beauty of Earth](https://thebeautyof.earth): Landscape photography collection with performant lazy-loaded AVIF/WebP image delivery.
- [Jo Maendle Photography](https://photo.jomaendle.com): Personal photography portfolio. Fully static, 100/100 Lighthouse performance.

## Background

- Currently: E.ON (in-house full-stack)
- Previously: StudySmarter, Memberspot
- Languages: German (native), English (fluent)
- Stack focus: TypeScript, React, Next.js, Astro, Tailwind CSS

## Personal site

- [Homepage](https://jomaendle.com): Personal portfolio, articles, and crafts.
- [Blog](https://jomaendle.com/blog): Articles on web development, animations, and AI tooling.

## Legal

- [Impressum](https://jomaendle.com/impressum)
- [Datenschutzerklärung](https://jomaendle.com/datenschutz)
`;

export function GET() {
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
