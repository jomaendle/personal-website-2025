/**
 * Client engagements surfaced on the /business route.
 *
 * Lifted out of `components/business/business-content.tsx` so the page can be a
 * server component and the `.md` mirrors can generate from the same source.
 * Mirrors the `lib/state/projects.ts` pattern; every human-facing string is
 * bilingual so the DE and EN routes share one dataset.
 *
 * Only genuine freelance engagements belong here. Employment is not client
 * work: E.ON and StudySmarter are jobs and stay out, because listing them would
 * be contradicted by the CV on /about (`components/job-positions.tsx`) that any
 * prospect can reach in one click. Those credentials live in
 * `BUSINESS_COPY.pitch` instead.
 *
 * Memberspot appears in both places for a legitimate reason: employed there
 * Aug 2023 – Jul 2024, then re-engaged as a contractor Aug 2024 – Dec 2025.
 * The periods are consecutive and do not overlap, so the two entries agree.
 * If either date changes, change both.
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
  /** Condensed name for the client strip, where the full title is too long. */
  shortName?: string;
  href: string;
  period: Localized;
  role: Localized;
  context: Localized;
  highlights: LocalizedList;
  /** Omit rather than guess — the tag row simply does not render without it. */
  stack?: string[];
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
    shortName: "Emerge Tech",
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
        "Inkrementelle Generierung und gezieltes Caching, um die Build-Zeiten bei wachsender Mandantenzahl stabil zu halten",
        "Komponenten-Bibliothek, die Editor und ausgelieferter Funnel gemeinsam nutzen",
      ],
      en: [
        "Multi-tenant architecture with isolated data paths and per-customer theming",
        "Incremental generation and targeted caching to keep build times stable as tenant count grows",
        "A component library shared by both the editor and the rendered funnel",
      ],
    },
    stack: ["Astro", "TypeScript", "Multi-Tenant", "Tailwind"],
  },
  {
    id: "memberspot",
    title: "Memberspot",
    href: "https://www.memberspot.de",
    period: { de: "Aug 2024 – Dez 2025", en: "Aug 2024 – Dec 2025" },
    role: {
      de: "Freelance Frontend Engineer",
      en: "Freelance frontend engineer",
    },
    context: {
      de: "Frontend-Entwicklung am Produkt — einer B2B-SaaS-Plattform für Kurs-Hosting und interne Schulungen. Zuständig für die Frontend-Features quer durch das Produkt.",
      en: "Frontend engineering on the product — a B2B SaaS platform for course hosting and internal training. Responsible for frontend features across the product.",
    },
    highlights: {
      de: [
        "Frontend-Features quer durch das Produkt, von Kurs-Hosting bis zu internen Schulungen",
        "Als Freelancer zurückgeholt nach einem Jahr im Inhouse-Team — volle Produktkenntnis ab Tag eins, keine Einarbeitung",
      ],
      en: [
        "Frontend features across the product, from course hosting through to internal training",
        "Brought back as a contractor after a year on the in-house team — full product context from day one, no ramp-up",
      ],
    },
  },
];

/**
 * Trust strip — derived from `CLIENT_PROJECTS` rather than hand-maintained, so
 * the strip and the case studies below it can never list different clients.
 * `anchor` targets the matching `<article>` in the selected-work section.
 */
export const CLIENTS = CLIENT_PROJECTS.map((project) => ({
  id: project.id,
  name: project.shortName ?? project.title,
  anchor: `#client-${project.id}`,
}));
