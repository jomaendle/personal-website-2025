/**
 * Agent-readable markdown mirror of the /business page.
 *
 * Both `/business.md` and `/business/en.md` render through this function, so
 * the mirror derives from the same `BUSINESS_COPY` and `CLIENT_PROJECTS` the
 * page renders from.
 *
 * The mirror is deliberately fuller than the page. /business now shows one
 * line per client, because a C-level reader skims; the per-project highlights
 * still live here, which is where an agent or a recruiter reading closely
 * will go. Prices are rendered in full so "what does this cost" is answerable
 * without loading the HTML.
 */

import { SITE } from "@/lib/config/site";
import { BUSINESS_COPY, type Lang } from "@/lib/state/business-copy";
import { CLIENT_PROJECTS } from "@/lib/state/business-projects";

export function renderBusinessMarkdown(lang: Lang): string {
  const t = BUSINESS_COPY[lang];
  const isDe = lang === "de";

  const tiers = t.ladder.tiers
    .map((tier) =>
      [
        `### ${tier.step} ${tier.name}`,
        `**${tier.price} ${tier.terms}**`,
        "",
        tier.desc,
        "",
        ...tier.items.map((item) => `- ${item}`),
      ].join("\n"),
    )
    .join("\n\n");

  const projects = CLIENT_PROJECTS.map((project) =>
    [
      `### ${project.title} · ${project.href}`,
      `**${[
        project.period[lang],
        project.role[lang],
        project.stack?.join(" · "),
      ]
        .filter(Boolean)
        .join(" · ")}**`,
      "",
      project.context[lang],
      "",
      ...project.highlights[lang].map((highlight) => `- ${highlight}`),
    ].join("\n"),
  ).join("\n\n");

  return `# ${t.hero.heading}

${t.hero.eyebrow}

${t.hero.lede}

**${t.hero.availability}**

- ${isDe ? "E-Mail" : "Email"}: ${SITE.contact.email}
- ${t.hero.ctaPrimary}: ${SITE.contact.booking}
- LinkedIn: ${SITE.social.linkedin}

## ${t.evidence.heading}

${t.evidence.stats.map((stat) => `- **${stat.value}** ${stat.label} (${stat.source})`).join("\n")}

${t.evidence.closing}

## ${t.ladder.heading}

${tiers}

**${t.ladder.figure}** ${t.ladder.figureNote}

${t.ladder.note}

## ${t.why.heading}

${t.why.items.map((item) => `- ${item}`).join("\n")}

## ${t.work.heading}

${projects}

## ${t.faq.heading}

${t.faq.items.map((item) => `**${item.question}**\n\n${item.answer}`).join("\n\n")}

## ${t.engage.heading}

${t.engage.lede}

- ${t.engage.bookingCta}: ${SITE.contact.booking}
- ${isDe ? "Anfrageformular" : "Inquiry form"}: https://www.jomaendle.com${isDe ? "/business" : "/business/en"}#engage
- ${t.engage.emailLabel}: ${SITE.contact.email}
- LinkedIn: ${SITE.social.linkedin}
- HTML version: https://www.jomaendle.com${isDe ? "/business" : "/business/en"}
- ${isDe ? "English version" : "German version"}: https://www.jomaendle.com${isDe ? "/business/en" : "/business"}
`;
}
