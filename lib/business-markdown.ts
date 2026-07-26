/**
 * Agent-readable markdown mirror of the /business page.
 *
 * Both `/business.md` and `/business/en.md` render through this function, so
 * the mirror is derived from the same `BUSINESS_COPY` and `CLIENT_PROJECTS`
 * the page renders from. Previously each route held a hand-maintained template
 * literal, which silently drifted the moment the page copy changed.
 */

import { SITE } from "@/lib/config/site";
import { BUSINESS_COPY, type Lang } from "@/lib/state/business-copy";
import { CLIENT_PROJECTS, CLIENTS } from "@/lib/state/business-projects";

export function renderBusinessMarkdown(lang: Lang): string {
  const t = BUSINESS_COPY[lang];
  const isDe = lang === "de";

  const projects = CLIENT_PROJECTS.map((project) =>
    [
      `### ${project.title} — ${project.href}`,
      `**${[project.period[lang], project.role[lang], project.stack?.join(" · ")]
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
- ${isDe ? "Gespräch buchen" : "Book a call"}: ${SITE.contact.booking}
- LinkedIn: ${SITE.social.linkedin}

## ${t.clients.heading}

${CLIENTS.map((client) => client.name).join(" · ")}

## ${t.pitch.heading}

${t.pitch.paragraphs.join("\n\n")}

## ${t.services.heading}

${t.services.items.map((item) => `- **${item.title}** — ${item.desc}`).join("\n")}

## ${t.stack.heading}

${t.stack.groups.map((group) => `- **${group.label}** — ${group.items.join(" · ")}`).join("\n")}

${t.stack.note}

## ${t.work.heading}

${projects}

## ${t.process.heading}

${t.process.steps.map((step, i) => `${i + 1}. **${step.title}** — ${step.desc}`).join("\n")}

## ${t.why.heading}

${t.why.items.map((item) => `- ${item}`).join("\n")}

## ${t.engage.heading}

${t.engage.lede}

- ${isDe ? "Anfrageformular" : "Inquiry form"}: https://jomaendle.com${isDe ? "/business" : "/business/en"}#engage
- ${isDe ? "E-Mail" : "Email"}: ${SITE.contact.email}
- ${t.engage.bookingCta}: ${SITE.contact.booking}
- LinkedIn: ${SITE.social.linkedin}
- HTML version: https://jomaendle.com${isDe ? "/business" : "/business/en"}
- ${isDe ? "English version" : "German version"}: https://jomaendle.com${isDe ? "/business/en" : "/business"}
`;
}
