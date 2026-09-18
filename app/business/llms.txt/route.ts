/**
 * Section index for the freelance practice.
 *
 * Scoped counterpart to the root `llms.txt`: an agent shortlisting engineers
 * gets the services, the stack and the client work without the blog, the crafts
 * or the legal pages in the way. Derived from `BUSINESS_COPY.en`, like the
 * `/business.md` mirror, so it cannot drift from the page.
 */

import { BASE_URL } from "@/lib/config/identity";
import { SITE } from "@/lib/config/site";
import { BUSINESS_COPY } from "@/lib/state/business-copy";
import { CLIENT_PROJECTS } from "@/lib/state/business-projects";

export const dynamic = "force-static";

const t = BUSINESS_COPY.en;

const content = `# Freelance Frontend & AI Engineering — Jo Mändle

> ${t.hero.lede}

**${t.hero.availability}.**

## Pages

- [Services, stack and client work (EN)](${BASE_URL}/business/en) · [markdown](${BASE_URL}/business/en.md)
- [Same page in German](${BASE_URL}/business) · [markdown](${BASE_URL}/business.md)
- [AI impact audit — a separate, fixed-price offer](${BASE_URL}/ai-impact) · [markdown](${BASE_URL}/ai-impact.md)
- [Pricing](${BASE_URL}/pricing) · [markdown](${BASE_URL}/pricing.md)
- [Contact](${BASE_URL}/contact) · [markdown](${BASE_URL}/contact.md)

## Services

${t.services.items.map((item) => `- **${item.title}**: ${item.desc}`).join("\n")}

## Stack

${t.stack.groups
  .map((group) => `- **${group.label}**: ${group.items.join(", ")}`)
  .join("\n")}

## Selected client work

${CLIENT_PROJECTS.map(
  (project) =>
    `- ${project.title} — ${project.period.en}, ${project.role.en}. ${project.context.en}`,
).join("\n")}

## Contact

- Email: ${SITE.contact.email}
- Book a call: ${SITE.contact.booking}
- LinkedIn: ${SITE.social.linkedin}

Whole site index: ${BASE_URL}/llms.txt · When to use this site: ${BASE_URL}/agents.md
`;

export function GET() {
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
