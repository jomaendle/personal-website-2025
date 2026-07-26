/**
 * Bilingual copy for the /business route.
 *
 * Lifted out of `components/business/business-content.tsx` so the page renders
 * as a server component and the `/business.md` mirrors generate from the same
 * source instead of drifting as hand-maintained template literals.
 *
 * Positioning: senior contract engineering for CTOs and engineering leads —
 * React/Next.js at enterprise scale plus LLM work that actually reaches
 * production. Not fixed-price website builds.
 */

export type Lang = "de" | "en";

/**
 * Option values accepted by `/api/inquiry` for the two optional select fields.
 *
 * The API validates against these arrays and silently drops anything it does
 * not recognize, so the form and the endpoint can never disagree about what a
 * valid value is.
 */
export const ENGAGEMENT_TYPES = [
  "contract-engineering",
  "ai-integration",
  "architecture-review",
  "other",
] as const;

export const TIMELINES = ["now", "next-quarter", "later", "unsure"] as const;

export type EngagementType = (typeof ENGAGEMENT_TYPES)[number];
export type Timeline = (typeof TIMELINES)[number];

interface SelectOption {
  value: string;
  label: string;
}

interface ServiceItem {
  title: string;
  desc: string;
}

interface ProcessStep {
  num: string;
  title: string;
  desc: string;
}

/** One labelled row of the stack table — label plus its technologies. */
interface StackGroup {
  label: string;
  items: string[];
}

export interface BusinessCopy {
  /** Label on the language switch (the language it switches *to*). */
  switchTo: string;
  switchHref: string;
  switchLabel: string;
  hero: {
    eyebrow: string;
    heading: string;
    lede: string;
    /**
     * Earliest start for new engagements. Stated up front so nobody reads the
     * whole page before learning the timeline, and repeated in process step 02
     * where scope and capacity are settled. Deliberately says *when work
     * starts* and nothing about capacity or employment status — neither is
     * decided, and the page must stay true either way.
     */
    availability: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  clients: { heading: string };
  pitch: { heading: string; paragraphs: string[] };
  services: { heading: string; items: ServiceItem[] };
  stack: { heading: string; note: string; groups: StackGroup[] };
  work: { heading: string };
  process: { heading: string; steps: ProcessStep[] };
  why: { heading: string; items: string[] };
  engage: {
    heading: string;
    lede: string;
    bookingTitle: string;
    bookingDesc: string;
    bookingCta: string;
    emailLabel: string;
    markdownLabel: string;
  };
  form: {
    heading: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    company: string;
    companyPlaceholder: string;
    engagementType: string;
    engagementTypeOptions: SelectOption[];
    timeline: string;
    timelineOptions: SelectOption[];
    optional: string;
    required: string;
    /** Art. 13 DSGVO notice shown at the point of collection, above submit. */
    privacyNote: string;
    privacyLinkLabel: string;
    submit: string;
    submitting: string;
    success: string;
    genericError: string;
    networkError: string;
  };
}

export const BUSINESS_COPY: Record<Lang, BusinessCopy> = {
  de: {
    switchTo: "EN",
    switchHref: "/business/en",
    switchLabel: "Switch to English",
    hero: {
      eyebrow: "Freelance · Frontend & AI Engineering",
      heading: "Senior Frontend-Engineering — und KI, die es in Produktion schafft.",
      lede: "Ich arbeite mit Produktteams an den schwierigen Teilen des Frontends — unabhängig vom Framework — und bringe LLMs in Produkte, die Menschen tatsächlich benutzen.",
      availability: "Verfügbar ab Q1 2027",
      ctaPrimary: "Projekt anfragen",
      ctaSecondary: "Gespräch buchen",
    },
    clients: { heading: "Aktuelle Kunden" },
    pitch: {
      heading: "Worum es geht",
      paragraphs: [
        "Die meisten Teams brauchen keine weitere Website — sie brauchen jemanden, der sich in eine gewachsene Codebase einarbeitet, Architekturentscheidungen mitträgt und Features liefert, die im Betrieb halten. Genau da setze ich an.",
        "Hauptberuflich arbeite ich als Principal Solution Architect daran, wie KI in den Entwicklungszyklus großer Teams einzieht — von Architektur und Tooling bis zu den täglichen Gewohnheiten. Über sechs Jahre TypeScript in Produktion, mit Angular ebenso wie mit React und Next.js, dazu Node und NestJS im Backend.",
        "Was mich von einem reinen Frontend-Freelancer unterscheidet: Ich baue LLM-Integrationen, die den Weg in die Produktion tatsächlich schaffen — mit Kontextgrenzen, Evaluierung und einem Menschen an der richtigen Stelle im Review. Keine Demo, die im Meeting glänzt und im Alltag scheitert.",
      ],
    },
    services: {
      heading: "Leistungen",
      items: [
        {
          title: "Embedded Contract Engineering",
          desc: "Ich arbeite als Teil Ihres Teams — Sprints, Reviews, gemeinsame Verantwortung. Kein isolierter Zulieferer.",
        },
        {
          title: "KI- & LLM-Produktintegration",
          desc: "Von der ersten Machbarkeitsfrage bis zum produktiven Feature: Kontextdesign, Evaluierung, Guardrails, Kosten.",
        },
        {
          title: "Frontend-Architektur & Performance",
          desc: "Rendering-Strategie, Caching, Core Web Vitals — Entscheidungen, die auch in zwei Jahren noch tragen.",
        },
        {
          title: "Modernisierung & Migration",
          desc: "Schrittweise Ablösung gewachsener Frontends — auch Angular nach React — ohne das Produkt anzuhalten.",
        },
      ],
    },
    stack: {
      heading: "Stack",
      note: "Ich komme nicht mit einer Framework-Präferenz, sondern arbeite mit dem, was Sie bereits betreiben.",
      groups: [
        {
          label: "Frontend",
          items: ["React", "Next.js", "Angular", "TypeScript", "Vue"],
        },
        {
          label: "Backend",
          items: ["Node.js", "NestJS", "API-Design"],
        },
        {
          label: "KI",
          items: [
            "Claude Code",
            "OpenAI Codex",
            "MCP",
            "LLM-Integration",
            "AI-native SDLC",
          ],
        },
      ],
    },
    work: { heading: "Ausgewählte Kundenprojekte" },
    process: {
      heading: "So arbeiten wir zusammen",
      steps: [
        {
          num: "01",
          title: "Gespräch",
          desc: "15 Minuten, unverbindlich. Was steht an, was ist der Engpass, passt das fachlich überhaupt?",
        },
        {
          num: "02",
          title: "Zuschnitt",
          desc: "Wir klären Umfang, Auslastung und Rahmen — schriftlich, bevor jemand Zeit investiert. Projektstart ab Q1 2027.",
        },
        {
          num: "03",
          title: "Ausliefern",
          desc: "Ich arbeite im Team-Rhythmus mit. Sichtbarer Fortschritt ab der ersten Woche, keine Blackbox.",
        },
      ],
    },
    why: {
      heading: "Warum ich",
      items: [
        "Senior In-House-Erfahrung — ich kenne die Zwänge, unter denen Ihr Team arbeitet, weil ich unter denselben arbeite",
        "KI-Integration aus der Praxis, nicht aus dem Blogpost",
        "Architekturentscheidungen, die ich auch begründen kann — schriftlich, nachvollziehbar",
        "Verhandlungssicher in Deutsch und Englisch, Zusammenarbeit über Zeitzonen hinweg gewohnt",
      ],
    },
    engage: {
      heading: "Zusammenarbeit anfragen",
      lede: "Beschreiben Sie kurz, worum es geht — ich melde mich innerhalb von 24 Stunden. Lieber direkt sprechen? Buchen Sie ein Gespräch.",
      bookingTitle: "Lieber direkt sprechen?",
      bookingDesc: "15 Minuten, unverbindlich, in Ihrem Kalender.",
      bookingCta: "Gespräch buchen",
      emailLabel: "Oder per E-Mail",
      markdownLabel: "Diese Seite als Markdown ansehen",
    },
    form: {
      heading: "Projektanfrage",
      name: "Name",
      namePlaceholder: "Ihr Name",
      email: "E-Mail",
      emailPlaceholder: "sie@unternehmen.de",
      message: "Worum geht es?",
      messagePlaceholder:
        "Kurz zum Vorhaben: Team, Stack, was gerade der Engpass ist.",
      company: "Unternehmen",
      companyPlaceholder: "Firmenname",
      engagementType: "Art der Zusammenarbeit",
      engagementTypeOptions: [
        { value: "contract-engineering", label: "Contract Engineering" },
        { value: "ai-integration", label: "KI-/LLM-Integration" },
        { value: "architecture-review", label: "Architektur-Review" },
        { value: "other", label: "Etwas anderes" },
      ],
      timeline: "Zeitrahmen",
      timelineOptions: [
        { value: "now", label: "So bald wie möglich" },
        { value: "next-quarter", label: "Im nächsten Quartal" },
        { value: "later", label: "Später im Jahr" },
        { value: "unsure", label: "Noch offen" },
      ],
      optional: "optional",
      required: "Pflichtfeld",
      privacyNote:
        "Ihre Angaben verwende ich ausschließlich zur Bearbeitung dieser Anfrage. Details in der",
      privacyLinkLabel: "Datenschutzerklärung",
      submit: "Anfrage senden",
      submitting: "Wird gesendet …",
      success:
        "Danke — Ihre Anfrage ist angekommen. Ich melde mich innerhalb von 24 Stunden.",
      genericError:
        "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
      networkError:
        "Netzwerkfehler. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
    },
  },
  en: {
    switchTo: "DE",
    switchHref: "/business",
    switchLabel: "Zu Deutsch wechseln",
    hero: {
      eyebrow: "Freelance · Frontend & AI Engineering",
      heading: "Senior frontend engineering, with AI that actually ships.",
      lede: "I work with product teams on the hard parts of the frontend — whatever the framework — and bring LLMs into products people actually use.",
      availability: "Available from Q1 2027",
      ctaPrimary: "Start an inquiry",
      ctaSecondary: "Book a call",
    },
    clients: { heading: "Recent clients" },
    pitch: {
      heading: "What I do",
      paragraphs: [
        "Most teams don't need another website — they need someone who can get inside a mature codebase, carry architecture decisions with them, and ship features that hold up in production. That's the seat I take.",
        "In my day job I'm a Principal Solution Architect working on how AI enters the development lifecycle of large teams — from architecture and tooling to the daily habits. Six-plus years of TypeScript in production, in Angular as much as React and Next.js, plus Node and NestJS on the backend.",
        "What separates me from a pure frontend contractor: I build LLM integrations that genuinely reach production — context boundaries, evaluation, guardrails, cost. Not demo magic, but systems that survive contact with real usage.",
      ],
    },
    services: {
      heading: "Services",
      items: [
        {
          title: "Embedded contract engineering",
          desc: "I work as part of your team — sprints, reviews, on-call awareness. Not an isolated vendor.",
        },
        {
          title: "AI & LLM product integration",
          desc: "From the first feasibility question to a shipped feature: context design, evaluation, guardrails, cost.",
        },
        {
          title: "Frontend architecture & performance",
          desc: "Rendering strategy, caching, Core Web Vitals — decisions that still hold two years out.",
        },
        {
          title: "Modernization & migration",
          desc: "Incremental replacement of legacy frontends — including Angular to React — without pausing the product.",
        },
      ],
    },
    stack: {
      heading: "Stack",
      note: "I don't arrive with a framework preference. I work in whatever you already run.",
      groups: [
        {
          label: "Frontend",
          items: ["React", "Next.js", "Angular", "TypeScript", "Vue"],
        },
        {
          label: "Backend",
          items: ["Node.js", "NestJS", "API design"],
        },
        {
          label: "AI",
          items: [
            "Claude Code",
            "OpenAI Codex",
            "MCP",
            "LLM integration",
            "AI-native SDLC",
          ],
        },
      ],
    },
    work: { heading: "Selected client work" },
    process: {
      heading: "How we'll work together",
      steps: [
        {
          num: "01",
          title: "Conversation",
          desc: "15 minutes, no strings. What's on the table, where's the bottleneck, is this even the right fit?",
        },
        {
          num: "02",
          title: "Shape",
          desc: "We settle scope, capacity and terms — in writing, before anyone invests time. Engagements start from Q1 2027.",
        },
        {
          num: "03",
          title: "Ship",
          desc: "I work in your team's rhythm. Visible progress from week one, no black box.",
        },
      ],
    },
    why: {
      heading: "Why work with me",
      items: [
        "Senior in-house experience — I know the constraints your team works under because I work under the same ones",
        "AI integration from practice, not from a blog post",
        "Architecture decisions I can defend — written down, reviewable",
        "Fluent in English and German, used to collaborating across time zones",
      ],
    },
    engage: {
      heading: "Start a conversation",
      lede: "Tell me briefly what you're working on — I'll get back to you within 24 hours. Prefer to talk it through? Book a call.",
      bookingTitle: "Rather talk it through?",
      bookingDesc: "15 minutes, no strings, straight into your calendar.",
      bookingCta: "Book a call",
      emailLabel: "Or by email",
      markdownLabel: "View this page as Markdown",
    },
    form: {
      heading: "Project inquiry",
      name: "Name",
      namePlaceholder: "Your name",
      email: "Email",
      emailPlaceholder: "you@company.com",
      message: "What's this about?",
      messagePlaceholder:
        "A few lines on the work: team, stack, and where the bottleneck is right now.",
      company: "Company",
      companyPlaceholder: "Company name",
      engagementType: "Type of engagement",
      engagementTypeOptions: [
        { value: "contract-engineering", label: "Contract engineering" },
        { value: "ai-integration", label: "AI / LLM integration" },
        { value: "architecture-review", label: "Architecture review" },
        { value: "other", label: "Something else" },
      ],
      timeline: "Timeline",
      timelineOptions: [
        { value: "now", label: "As soon as possible" },
        { value: "next-quarter", label: "Next quarter" },
        { value: "later", label: "Later this year" },
        { value: "unsure", label: "Not decided yet" },
      ],
      optional: "optional",
      required: "required",
      privacyNote:
        "I use your details solely to respond to this inquiry. Details in the",
      privacyLinkLabel: "privacy policy",
      submit: "Send inquiry",
      submitting: "Sending …",
      success:
        "Thanks — your inquiry came through. I'll get back to you within 24 hours.",
      genericError: "Couldn't send your inquiry. Please try again.",
      networkError:
        "Network error. Please check your connection and try again.",
    },
  },
};
