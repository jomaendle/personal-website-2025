/**
 * Agent-readable markdown mirror of the AI impact audit page.
 *
 * Both `/ki-wirkung.md` and `/ai-impact.md` render through this function, so
 * the mirror is derived from the same `AI_IMPACT_COPY` the page renders from.
 * The `/business.md` mirrors work the same way, for the same reason: a
 * hand-maintained template literal drifts the first time the copy moves.
 */

import { SITE } from "@/lib/config/site";
import { AI_IMPACT_COPY, type Lang } from "@/lib/state/ai-impact-copy";

const BASE_URL = "https://www.jomaendle.com";

export function renderAiImpactMarkdown(lang: Lang): string {
  const t = AI_IMPACT_COPY[lang];
  const isDe = lang === "de";

  const weeks = t.audit.weeks
    .map((week) => `### ${week.label} · ${week.title}\n\n${week.desc}`)
    .join("\n\n");

  const faq = t.faq.items
    .map((item) => `### ${item.question}\n\n${item.answer}`)
    .join("\n\n");

  const measurement = t.measurement.blocks
    .map((block) => `### ${block.title}\n\n${block.paragraphs.join("\n\n")}`)
    .join("\n\n");

  return `# ${t.hero.heading}

${t.hero.eyebrow}

${t.hero.lede}

**${t.hero.availability}**

- ${t.hero.cta}: ${SITE.contact.booking}
- ${isDe ? "E-Mail" : "Email"}: ${SITE.contact.email}

## ${t.problem.heading}

${t.problem.items.map((item) => `- **${item.title}** ${item.desc}`).join("\n")}

${t.problem.closing}

## ${t.audit.heading}

${t.audit.lede}

${weeks}

## ${t.outcome.heading}

${t.outcome.items.map((item) => `- ${item}`).join("\n")}

${t.outcome.closing}

## ${t.measurement.heading}

${measurement}

## ${t.scope.heading}

**${t.scope.priceLine}**

${t.scope.rows.map((row) => `- **${row.term}**: ${row.desc}`).join("\n")}

## ${t.faq.heading}

${faq}

## ${t.close.heading}

${t.close.lede}

${t.close.body}

- ${t.close.cta}: ${SITE.contact.booking}
- ${isDe ? "E-Mail" : "Email"}: ${SITE.contact.email}
- HTML version: ${BASE_URL}${t.path}
- ${isDe ? "English version" : "German version"}: ${BASE_URL}${t.switchHref}
`;
}
