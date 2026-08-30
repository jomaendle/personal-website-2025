/**
 * Agent-readable markdown mirror of the /business page.
 *
 * Both `/business.md` and `/business/en.md` render through this function, so
 * the mirror is derived from the same `BUSINESS_COPY` and `CLIENT_PROJECTS`
 * the page renders from. Previously each route held a hand-maintained template
 * literal, which silently drifted the moment the page copy changed.
 *
 * The ladder is rendered with its prices intact. An agent asked "what does
 * this cost" should be able to answer from this file without loading the HTML.
 */

import { SITE } from "@/lib/config/site";
import { BUSINESS_COPY, type Lang } from "@/lib/state/business-copy";
import { CLIENT_PROJECTS, CLIENTS } from "@/lib/state/business-projects";

export function renderBusinessMarkdown(lang: Lang): string {
  const t = BUSINESS_COPY[lang];
  const isDe = lang === "de";

  const tiers = t.ladder.tiers
    .map((tier) =>
      [
        `### ${tier.step}: ${tier.name}`,
        `**${tier.price} ${tier.terms}**`,
        "",
        `*${tier.audience}*`,
        "",
        tier.desc,
        "",
        ...tier.items.map((item) => `- ${item}`),
      ].join("\n"),
    )
    .join("\n\n");

  const moat = t.moat.blocks
    .map((block) =>
      [
        `### ${block.title}`,
        "",
        block.paragraphs.join("\n\n"),
        ...(block.terms ? ["", block.terms.join(" · ")] : []),
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

${t.credentials.map((credential) => `- **${credential.value}** ${credential.label}`).join("\n")}

- ${isDe ? "E-Mail" : "Email"}: ${SITE.contact.email}
- ${t.hero.ctaPrimary}: ${SITE.contact.booking}
- LinkedIn: ${SITE.social.linkedin}

## ${t.clients.heading}

${CLIENTS.map((client) => client.name).join(" · ")}

## ${t.problem.heading}

${t.problem.items.map((item) => `- **${item.title}** ${item.desc}`).join("\n")}

${t.problem.closing}

## ${t.economics.heading}

**${t.economics.figure} ${t.economics.figureLabel}**

${t.economics.paragraphs.join("\n\n")}

${t.economics.note}

## ${t.ladder.heading}

${t.ladder.lede}

${tiers}

${t.ladder.note}

## ${t.moat.heading}

${moat}

## ${t.work.heading}

${t.work.lede}

${projects}

## ${t.process.heading}

${t.process.steps.map((step, i) => `${i + 1}. **${step.title}**: ${step.desc}`).join("\n")}

## ${t.faq.heading}

${t.faq.items.map((item) => `**${item.question}**\n\n${item.answer}`).join("\n\n")}

## ${t.engage.heading}

${t.engage.lede}

- ${isDe ? "Anfrageformular" : "Inquiry form"}: https://www.jomaendle.com${isDe ? "/business" : "/business/en"}#engage
- ${isDe ? "E-Mail" : "Email"}: ${SITE.contact.email}
- ${t.engage.bookingCta}: ${SITE.contact.booking}
- LinkedIn: ${SITE.social.linkedin}
- HTML version: https://www.jomaendle.com${isDe ? "/business" : "/business/en"}
- ${isDe ? "English version" : "German version"}: https://www.jomaendle.com${isDe ? "/business/en" : "/business"}
`;
}
