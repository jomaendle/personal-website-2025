/**
 * Agent-readable site summary.
 *
 * The business sections are derived from `BUSINESS_COPY` and `CLIENT_PROJECTS`
 * — the same sources `lib/business-markdown.ts` renders the `/business.md`
 * mirrors from. This file was previously a hand-maintained literal and had
 * drifted badly: it still advertised fixed-price website builds for
 * photographers and listed retired photo projects as client work long after
 * /business was repositioned. Since `app/robots.ts` explicitly admits eighteen
 * AI crawlers to this path, that drift was invisible to exactly the audience
 * the file exists for.
 *
 * English throughout — `llms.txt` is an English-language convention, so the
 * copy is read from `BUSINESS_COPY.en` regardless of the DE route existing.
 *
 * The "Background", "Personal site" and "Legal" sections stay literals: they
 * describe the person and the site, not the offer, and have no canonical
 * source to derive from.
 */

import { SITE } from "@/lib/config/site";
import { AI_IMPACT_COPY } from "@/lib/state/ai-impact-copy";
import { BUSINESS_COPY } from "@/lib/state/business-copy";
import { CLIENT_PROJECTS } from "@/lib/state/business-projects";

export const dynamic = "force-static";

const t = BUSINESS_COPY.en;
const aiImpact = AI_IMPACT_COPY.en;

const services = t.services.items
  .map((item) => `- **${item.title}**: ${item.desc}`)
  .join("\n");

const stack = t.stack.groups
  .map((group) => `- **${group.label}**: ${group.items.join(", ")}`)
  .join("\n");

const clientWork = CLIENT_PROJECTS.map(
  (project) =>
    `- [${project.title}](${project.href}): ${project.period.en} · ${project.role.en}. ${project.context.en}`,
).join("\n");

const content = `# ${SITE.name}

> ${t.hero.lede} Freelance contract engineering with product teams and engineering leads.

**${t.hero.availability}.** Short, time-boxed mandates such as an audit or an architecture review can start at short notice. Ongoing work inside a team does not start before that quarter.

Contact:
- Email: ${SITE.contact.email}
- Book a call: ${SITE.contact.booking}
- LinkedIn: ${SITE.social.linkedin}
- GitHub: https://github.com/jomaendle

## For businesses (hire me)

- [Freelance Frontend & AI Engineering (DE)](https://www.jomaendle.com/business): German page describing services, stack, selected client work and how an engagement starts.
- [Freelance Frontend & AI Engineering (EN)](https://www.jomaendle.com/business/en): English version of the same page.
- [Markdown version (EN)](https://www.jomaendle.com/business/en.md): the full page as plain markdown.

## Separate offer: AI impact audit

A self-contained four-week mandate, priced and scoped on its own page. ${aiImpact.hero.lede} Measured at team and repository level, with no per-developer analysis.

- [Measuring AI in engineering (EN)](https://www.jomaendle.com/ai-impact): scope, the four weeks, deliverables, price and FAQ.
- [KI im Engineering messen (DE)](https://www.jomaendle.com/ki-wirkung): German version of the same page.
- [Markdown version (EN)](https://www.jomaendle.com/ai-impact.md): the full page as plain markdown.

## Core services

${services}

## Stack

${stack}

${t.stack.note}

## Selected client work

${clientWork}

## Background

- Currently: Principal Solution Architect at E.ON Digital Technology
- Previously: Memberspot, StudySmarter, Micro Focus
- Six-plus years of TypeScript in production, in Angular as much as React and Next.js
- Languages: German (native), English (fluent)

## Personal site

- [Homepage](https://www.jomaendle.com): Who I am, selected work, work history, and articles.
- [Blog](https://www.jomaendle.com/blog): Notes on building for the web, lately with Claude Code.

## Legal

- [Impressum](https://www.jomaendle.com/impressum)
- [Datenschutzerklärung](https://www.jomaendle.com/datenschutz)
`;

export function GET() {
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
