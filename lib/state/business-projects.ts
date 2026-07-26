/**
 * Client engagements surfaced on the /business route.
 *
 * Lifted out of `components/business/business-content.tsx` so the page can be a
 * server component and the `.md` mirrors can generate from the same source.
 * Mirrors the `lib/state/projects.ts` pattern; every human-facing string is
 * bilingual so the DE and EN routes share one dataset.
 *
 * Note: E.ON is deliberately absent — it is Jo's employer, not a client. That
 * credential lives in `BUSINESS_COPY.pitch` instead.
 */

/** A string rendered in both site languages. */
export interface Localized {
  de: string;
  en: string;
}

/** A list rendered in both site languages. */
export interface LocalizedList {
  de: string[];
  en: string[];
}

export interface ClientProject {
  id: string;
  title: string;
  href: string;
  period: Localized;
  role: Localized;
  context: Localized;
  highlights: LocalizedList;
  stack: string[];
}

export const CLIENT_PROJECTS: ClientProject[] = [
  {
    id: "immokaepsele",
    title: "ImmoKäpsele",
    href: "https://immokaepsele.de",
    period: { de: "2024 – heute", en: "2024 – present" },
    role: {
      de: "Sole Developer & Tech Lead",
      en: "Sole developer & tech lead",
    },
    context: {
      de: "Vollständige Neuentwicklung als alleiniger Entwickler: Next.js-Architektur, Anbindung an das Flowfact-CRM und eine LLM-gestützte Content-Pipeline, die Blogartikel über Claude Code und einen eigenen MCP-Server erzeugt und veröffentlicht.",
      en: "Complete rebuild as sole engineer: Next.js architecture, Flowfact CRM integration, and an LLM-backed content pipeline that drafts and publishes blog articles through Claude Code and a purpose-built MCP server.",
    },
    highlights: {
      de: [
        "Blog-Automatisierung via Claude Code + eigenem MCP-Server — vom Briefing bis zum veröffentlichten Artikel, mit Mensch im Review",
        "Statisch generierte Objektseiten mit täglicher CRM-Synchronisation über GitHub Actions",
        "Wertermittlungsrechner mit Server-Validierung und automatischer Zusammenfassung an Inhaber:in und Interessent:in",
        "Lighthouse 95+ über alle Seiten, DSGVO-konform ohne unnötiges Tracking",
      ],
      en: [
        "Blog automation via Claude Code and a custom MCP server — briefing to published article, with a human in the review loop",
        "Statically generated property pages with daily CRM sync via GitHub Actions",
        "Valuation calculator with server-side validation and an automatic summary to both owner and prospect",
        "Lighthouse 95+ across every page, GDPR-compliant with no unnecessary tracking",
      ],
    },
    stack: [
      "Next.js 15",
      "TypeScript",
      "Claude Code",
      "MCP",
      "Flowfact CRM",
      "Cloudinary",
    ],
  },
  {
    id: "emerge-tech",
    title: "Emerge Tech — EasyEngage",
    href: "https://emerge-tech.io/",
    period: { de: "2024 – heute", en: "2024 – present" },
    role: {
      de: "Lead Frontend Developer",
      en: "Lead frontend developer",
    },
    context: {
      de: "Aufbau von EasyEngage, einer Astro-Plattform, die pro Mandant eigene Customer-Funnels rendert. Schwerpunkte: Multi-Tenant-Routing, kurze Build-Zeiten und ein Editor-Workflow, mit dem das Produktteam Funnels ohne Entwickler:innen ausspielt.",
      en: "Building EasyEngage, an Astro platform rendering bespoke customer funnels per tenant. Focus areas: multi-tenant routing, short build times, and an editor workflow that lets the product team ship funnels without engineering involvement.",
    },
    highlights: {
      de: [
        "Multi-Tenant-Architektur mit isolierten Datenpfaden und kundenspezifischen Themes",
        "Deutlich kürzere Build-Zeiten durch inkrementelle Generierung und gezieltes Caching",
        "Komponenten-Bibliothek, die Editor und ausgelieferter Funnel gemeinsam nutzen",
      ],
      en: [
        "Multi-tenant architecture with isolated data paths and per-customer theming",
        "Substantially shorter build times through incremental generation and targeted caching",
        "A component library shared by both the editor and the rendered funnel",
      ],
    },
    stack: ["Astro", "TypeScript", "Multi-Tenant", "Tailwind"],
  },
  {
    id: "memberspot",
    title: "Memberspot",
    href: "https://memberspot.de",
    period: { de: "2022 – 2023", en: "2022 – 2023" },
    role: {
      de: "Senior Frontend Engineer",
      en: "Senior frontend engineer",
    },
    context: {
      de: "Frontend-Entwicklung an einer produktiven SaaS-Plattform für Online-Kurse — eingebettet im Produktteam, mit Verantwortung für Architekturentscheidungen im Frontend und die Qualität der ausgelieferten Features.",
      en: "Frontend engineering on a production SaaS platform for online courses — embedded in the product team, owning frontend architecture decisions and the quality bar of shipped features.",
    },
    highlights: {
      de: [
        "Feature-Entwicklung in einer gewachsenen Codebase mit echten Nutzer:innen und echtem Umsatz",
        "Refactorings, die Ladezeiten und Wartbarkeit messbar verbessert haben",
        "Enge Abstimmung zwischen Produkt, Design und Backend",
      ],
      en: [
        "Feature work in a mature codebase with real users and real revenue behind it",
        "Refactors that measurably improved load times and maintainability",
        "Close collaboration across product, design and backend",
      ],
    },
    stack: ["Angular", "TypeScript", "SaaS"],
  },
];

/** Trust strip — organizations Jo has shipped production work for. */
export const CLIENTS = [
  "StudySmarter",
  "Memberspot",
  "ImmoKäpsele",
  "Emerge Tech",
];
