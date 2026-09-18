/**
 * The facts an agent needs to say who this site belongs to — in one place.
 *
 * `components/structured-data.tsx` builds JSON-LD from these, the `.well-known`
 * catalogs quote them, and `llms.txt` links them. Before this module the same
 * address, the same `sameAs` list and the same `knowsAbout` array were typed out
 * again in every one of those files, so a changed profile link fixed one reader
 * and silently lied to the rest.
 *
 * Nothing here is a claim the site does not already make in prose: the postal
 * address is the one on the Impressum, the profiles are the ones the footer
 * links, and the topics are the stack table on /business.
 */

import { SITE } from "@/lib/config/site";
import { PRICE_EUR } from "@/lib/state/ai-impact-copy";

/** Canonical origin. The apex 308s here, so every absolute URL uses `www`. */
export const BASE_URL = "https://www.jomaendle.com";

/**
 * Stable JSON-LD node ids.
 *
 * Every graph on the site refers to the person and the practice by `@id`
 * instead of repeating the node, which is what lets a consumer merge the
 * homepage, /business and an article into one entity rather than three.
 */
export const ID = {
  person: `${BASE_URL}#person`,
  organization: `${BASE_URL}#organization`,
  website: `${BASE_URL}#website`,
} as const;

export const LEGAL_NAME = "Johannes Mändle";

export const ALTERNATE_NAMES = [
  "Jo Mändle",
  "jo maendle",
  "johannes maendle",
  "Jo Maendle",
  "Johannes Maendle",
];

/** As published on /impressum. */
export const POSTAL_ADDRESS = {
  "@type": "PostalAddress" as const,
  streetAddress: "Im Hirschmorgen 12",
  postalCode: "69181",
  addressLocality: "Leimen",
  addressRegion: "Baden-Württemberg",
  addressCountry: "DE",
};

/** Profiles that prove the same person is behind each mention. */
export const SAME_AS = [SITE.social.linkedin, "https://github.com/jomaendle"];

/** Kept in step with the stack table in `lib/state/business-copy.ts`. */
export const KNOWS_ABOUT = [
  "Next.js",
  "React",
  "Angular",
  "Vue.js",
  "Astro",
  "TypeScript",
  "Node.js",
  "NestJS",
  "Frontend Architecture",
  "Large Language Models",
  "LLM Integration",
  "Model Context Protocol",
  "AI-native Software Development",
  "Web Performance",
  "Web Accessibility",
  "WCAG",
  "Automated Testing",
  "Legacy Frontend Migration",
  "GDPR",
  "DSGVO",
];

export const AREA_SERVED = [
  { "@type": "Country", name: "Germany" },
  { "@type": "Country", name: "Austria" },
  { "@type": "Country", name: "Switzerland" },
  { "@type": "Place", name: "Remote / EU" },
];

/** Contact channels, in the shape schema.org and the catalogs both want. */
export const CONTACT_POINTS = [
  {
    "@type": "ContactPoint" as const,
    contactType: "Business inquiries",
    email: SITE.contact.email,
    url: `${BASE_URL}/contact`,
    availableLanguage: ["de", "en"],
  },
  {
    "@type": "ContactPoint" as const,
    contactType: "Intro call booking",
    url: SITE.contact.booking,
    availableLanguage: ["de", "en"],
  },
];

/**
 * The public repository this site is built from.
 *
 * Linked from llms.txt and the agent catalogs so a coding agent can read the
 * conventions (CLAUDE.md, the `docs/solutions` notes) instead of guessing them.
 */
export const SOURCE_REPO = "https://github.com/jomaendle/personal-website-2025";

/**
 * One sentence per offer, reused by the catalogs, /pricing and llms.txt.
 *
 * `price` is only set where the site actually publishes a number. The contract
 * engineering seat has no public rate, and inventing a range here to satisfy a
 * schema field would be the one thing structured data must never do.
 */
export const OFFERS = [
  {
    id: "contract-engineering",
    name: "Freelance frontend & AI engineering",
    description:
      "Embedded contract engineering with a product team: frontend engineering at enterprise scale, plus LLM integrations that reach production.",
    path: "/business/en",
    localizedPath: "/business",
    markdownPath: "/business/en.md",
    price: null as number | null,
  },
  {
    id: "ai-impact-audit",
    name: "Measuring AI impact in engineering · 4-week audit",
    description:
      "A self-contained four-week mandate that measures what AI changed in your delivery, at team and repository level, with no per-developer analysis.",
    path: "/ai-impact",
    localizedPath: "/ki-wirkung",
    markdownPath: "/ai-impact.md",
    price: PRICE_EUR,
  },
];
