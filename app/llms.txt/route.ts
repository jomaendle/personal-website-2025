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
import { BUSINESS_COPY } from "@/lib/state/business-copy";
import { CLIENT_PROJECTS } from "@/lib/state/business-projects";

export const dynamic = "force-static";

const t = BUSINESS_COPY.en;

const ladder = t.ladder.tiers
  .map(
    (tier) =>
      `- **${tier.name}** (${tier.step}): ${tier.price} ${tier.terms}. ${tier.desc}`,
  )
  .join("\n");

const evidence = t.evidence.stats
  .map((stat) => `- **${stat.value}** ${stat.label} (${stat.source})`)
  .join("\n");

const credibility = t.why.items.map((item) => `- ${item}`).join("\n");

const clientWork = CLIENT_PROJECTS.map(
  (project) =>
    `- [${project.title}](${project.href}): ${project.period.en} · ${project.role.en}. ${project.context.en}`,
).join("\n");

const content = `# ${SITE.name}

> ${t.hero.lede}

**${t.hero.availability}.** The four-week audit can start at short notice. The ongoing programme does not start before that quarter.

Contact:
- Email: ${SITE.contact.email}
- Book a call: ${SITE.contact.booking}
- LinkedIn: ${SITE.social.linkedin}
- GitHub: https://github.com/jomaendle

## For businesses (hire me)

One page, one offer, with published prices. The former /ki-wirkung and /ai-impact routes were folded into it and now redirect there.

- [AI in engineering (EN)](https://www.jomaendle.com/business/en): the research, the three priced steps, and how an engagement starts.
- [KI im Engineering (DE)](https://www.jomaendle.com/business): German version of the same page.
- [Markdown version (EN)](https://www.jomaendle.com/business/en.md): the full page as plain markdown.

## What the research shows

${evidence}

${t.evidence.closing}

## The offer

Fits organisations of 50 to 800 developers that have been running AI coding tools for at least a quarter. Measured at team and repository level, with no per-developer analysis, so the rollout survives a German works agreement.

${ladder}

**${t.ladder.figure}** ${t.ladder.figureNote} ${t.ladder.note}

## Why me

${credibility}

## Selected client work

${clientWork}

## Background

- Currently: Principal Solution Architect at E.ON Digital Technology
- Previously: Memberspot, StudySmarter, Micro Focus
- Six-plus years of TypeScript in production, in Angular as much as React and Next.js
- Languages: German (native), English (fluent)

## Personal site

- [Homepage](https://www.jomaendle.com): Personal portfolio, articles, and crafts.
- [About](https://www.jomaendle.com/about): Background, principles, and work history.
- [Blog](https://www.jomaendle.com/blog): Articles on web development, AI tooling, and the software development lifecycle.

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
