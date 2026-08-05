/**
 * Bilingual copy for the /business route.
 *
 * Lifted out of `components/business/business-content.tsx` so the page renders
 * as a server component and the `/business.md` mirrors generate from the same
 * source instead of drifting as hand-maintained template literals.
 *
 * Positioning: senior contract engineering for CTOs and engineering leads.
 * Frontend at enterprise scale, AI-native delivery, and LLM work that actually
 * reaches production. Not fixed-price website builds.
 */

export type Lang = "de" | "en";

/**
 * Earliest quarter a new engagement can start.
 *
 * Interpolated into the hero availability line and process step 02 in both
 * languages, because four hardcoded copies drifted apart the first time the
 * date moved. Change it here and every surface follows, including the
 * `/business.md` mirrors and `/llms.txt`.
 */
export const AVAILABLE_FROM = "Q1 2027";

/**
 * Option values accepted by `/api/inquiry` for the two optional select fields.
 *
 * The API validates against these arrays and silently drops anything it does
 * not recognize, so the form and the endpoint can never disagree about what a
 * valid value is. That also means a value added here needs a label in *both*
 * language blocks below, or the option renders blank and never reaches the
 * email.
 */
export const ENGAGEMENT_TYPES = [
  "contract-engineering",
  "ai-native-delivery",
  "ai-integration",
  "architecture-review",
  "other",
] as const;

export const TIMELINES = ["now", "next-quarter", "later", "unsure"] as const;

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
     * Earliest start for new engagements, interpolated from `AVAILABLE_FROM`.
     * Stated up front so nobody reads the whole page before learning the
     * timeline, and repeated in process step 02 where scope and capacity are
     * settled. Deliberately says *when work
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
    /** Placeholder for the two optional selects, shown while nothing is picked. */
    selectPlaceholder: string;
    /** Art. 13 DSGVO notice shown at the point of collection, above submit. */
    privacyNote: string;
    privacyLinkLabel: string;
    submit: string;
    submitting: string;
    /**
     * Inline validation messages for the three required fields. Rendered under
     * the field that failed and referenced from its `aria-describedby`, so the
     * reason is available to a screen reader and not only to the eye.
     */
    errors: { name: string; email: string; message: string };
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
      heading: "Senior Frontend-Engineering. Und KI, die in Produktion geht.",
      lede: "Ich arbeite mit Produktteams an den schwierigen Teilen des Frontends, unabhängig vom Framework, und bringe LLM-Features über den Demo-Status hinaus.",
      availability: `Verfügbar ab ${AVAILABLE_FROM}`,
      ctaPrimary: "Projekt anfragen",
      ctaSecondary: "Gespräch buchen",
    },
    clients: { heading: "Aktuelle Kunden" },
    pitch: {
      heading: "Worum es geht",
      paragraphs: [
        "Die meisten Teams brauchen keine weitere Website. Sie brauchen jemanden, der sich in eine gewachsene Codebase einarbeitet, Architekturentscheidungen mitträgt und Features liefert, die im Betrieb halten.",
        "Hauptberuflich bin ich Principal Solution Architect und arbeite daran, wie KI in den Entwicklungszyklus großer Teams einzieht: von Architektur und Tooling bis zu den täglichen Gewohnheiten. Über sechs Jahre TypeScript in Produktion, mit Angular ebenso wie mit React und Next.js, dazu Node und NestJS im Backend.",
        "Was in den meisten Frontend-Projekten fehlt, ist alles nach der Demo. Ich baue LLM-Integrationen mit den unspektakulären Teilen: Kontextgrenzen, Evaluierung, ein Mensch an der richtigen Stelle im Review, und ein Kostenbudget.",
      ],
    },
    services: {
      heading: "Leistungen",
      items: [
        {
          title: "Embedded Contract Engineering",
          desc: "Ich arbeite in Ihrem Team mit. Sprints, Reviews, gemeinsame Verantwortung, wie alle anderen auch.",
        },
        {
          title: "KI-native Entwicklung im Team",
          desc: "Spec zuerst, Agenten schreiben den Code, geprüft im PR gegen Tests, Typen und Lint. Ich richte das in Ihrer Codebase ein, mit Projektregeln und Leitplanken, und zeige Ihrem Team, wo KI trägt und wo sie bremst.",
        },
        {
          title: "KI- & LLM-Produktintegration",
          desc: "Von der ersten Machbarkeitsfrage bis zum produktiven Feature: Kontextdesign, Evaluierung, Guardrails, Kosten.",
        },
        {
          title: "Frontend-Architektur & Performance",
          desc: "Rendering-Strategie, Caching, Core Web Vitals, Barrierefreiheit nach WCAG. Entscheidungen, die auch in zwei Jahren noch tragen.",
        },
        {
          title: "Modernisierung & Migration",
          desc: "Gewachsene Frontends Stück für Stück ablösen, auch Angular nach React, ohne das Produkt anzuhalten. Abgesichert mit Tests in Jest, Vitest, Playwright und Cypress.",
        },
      ],
    },
    stack: {
      heading: "Stack",
      note: "Ich komme nicht mit einer Framework-Präferenz. Ich arbeite mit dem, was Sie bereits betreiben.",
      groups: [
        {
          label: "Frontend",
          items: ["React", "Next.js", "Angular", "Vue", "Astro", "TypeScript"],
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
          desc: "15 Minuten, unverbindlich. Was ansteht, wo der Engpass ist, ob ich fachlich überhaupt passe.",
        },
        {
          num: "02",
          title: "Zuschnitt",
          desc: `Wir klären Umfang, Auslastung und Rahmen schriftlich, bevor jemand Zeit investiert. Projektstart ab ${AVAILABLE_FROM}.`,
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
        "Senior In-House-Erfahrung: Ich kenne die Zwänge, unter denen Ihr Team arbeitet, weil ich unter denselben arbeite",
        "KI-Integration aus der Praxis, nicht aus dem Blogpost",
        "Architekturentscheidungen, die ich begründen kann, schriftlich und nachvollziehbar",
        "Qualität ist Teil der Lieferung: Coding-Standards und Refactorings bei Memberspot eingeführt, bei Micro Focus ein Framework für Unit-Tests aufgebaut",
        "Remote-first, mit Terminen vor Ort im Umkreis von rund 50 km um Leimen",
        "Verhandlungssicher in Deutsch und Englisch, Zusammenarbeit über Zeitzonen gewohnt",
      ],
    },
    engage: {
      heading: "Zusammenarbeit anfragen",
      lede: "Beschreiben Sie kurz, worum es geht. Ich melde mich innerhalb von 24 Stunden.",
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
        { value: "ai-native-delivery", label: "KI-native Entwicklung im Team" },
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
      selectPlaceholder: "Bitte wählen",
      privacyNote:
        "Ihre Angaben verwende ich ausschließlich zur Bearbeitung dieser Anfrage. Details in der",
      privacyLinkLabel: "Datenschutzerklärung",
      submit: "Anfrage senden",
      submitting: "Wird gesendet …",
      errors: {
        name: "Bitte geben Sie Ihren Namen an, mindestens zwei Zeichen.",
        email: "Bitte geben Sie eine gültige E-Mail-Adresse an.",
        message:
          "Bitte beschreiben Sie kurz Ihr Vorhaben, mindestens zehn Zeichen.",
      },
      success:
        "Danke, Ihre Anfrage ist angekommen. Ich melde mich innerhalb von 24 Stunden.",
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
      heading: "Senior frontend engineering. And AI that reaches production.",
      lede: "I join product teams for the hard parts of the frontend, whatever the framework, and I build LLM features that make it past the demo.",
      availability: `Available from ${AVAILABLE_FROM}`,
      ctaPrimary: "Start an inquiry",
      ctaSecondary: "Book a call",
    },
    clients: { heading: "Recent clients" },
    pitch: {
      heading: "What I do",
      paragraphs: [
        "Most teams don't need another website. They need someone who can get inside a mature codebase, take on architecture decisions, and ship features that hold up in production.",
        "In my day job I'm a Principal Solution Architect, working on how AI enters the development lifecycle of large teams: architecture, tooling, and the daily habits. Six-plus years of TypeScript in production, in Angular as much as React and Next.js, with Node and NestJS on the backend.",
        "The part most frontend projects skip is everything after the demo. I build LLM integrations with the unglamorous pieces in place: context boundaries, evaluation, a human at the right point in review, and a cost budget.",
      ],
    },
    services: {
      heading: "Services",
      items: [
        {
          title: "Embedded contract engineering",
          desc: "I work inside your team. Sprints, reviews, shared ownership, same as anyone else on it.",
        },
        {
          title: "AI-native development in your team",
          desc: "Spec first, agents write the code, checked in the PR against tests, types and lint. I set that up inside your codebase, with project rules and guardrails, and show your team where AI carries the work and where it slows it down.",
        },
        {
          title: "AI & LLM product integration",
          desc: "From the first feasibility question to a shipped feature: context design, evaluation, guardrails, cost.",
        },
        {
          title: "Frontend architecture & performance",
          desc: "Rendering strategy, caching, Core Web Vitals, WCAG accessibility. Decisions that still hold up two years out.",
        },
        {
          title: "Modernization & migration",
          desc: "Replacing a legacy frontend piece by piece, Angular to React included, without pausing the product. Covered by tests in Jest, Vitest, Playwright and Cypress.",
        },
      ],
    },
    stack: {
      heading: "Stack",
      note: "I don't arrive with a framework preference. I work in whatever you already run.",
      groups: [
        {
          label: "Frontend",
          items: ["React", "Next.js", "Angular", "Vue", "Astro", "TypeScript"],
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
          desc: "15 minutes, no strings. What's on the table, where the bottleneck is, whether I'm the right fit.",
        },
        {
          num: "02",
          title: "Shape",
          desc: `We settle scope, capacity and terms in writing, before anyone invests time. Engagements start from ${AVAILABLE_FROM}.`,
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
        "Senior in-house experience, so I know the constraints your team works under. I work under the same ones",
        "AI integration from practice, not from a blog post",
        "Architecture decisions I can defend, written down and reviewable",
        "Quality ships with the work: I introduced coding standards and refactorings at Memberspot, and built a unit-testing framework at Micro Focus",
        "Remote-first, with on-site days within roughly 50 km of Leimen",
        "Fluent in English and German, used to working across time zones",
      ],
    },
    engage: {
      heading: "Start a conversation",
      lede: "Tell me what you're working on. I'll get back to you within 24 hours.",
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
        {
          value: "ai-native-delivery",
          label: "AI-native development in your team",
        },
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
      selectPlaceholder: "Select one",
      privacyNote:
        "I use your details solely to respond to this inquiry. Details in the",
      privacyLinkLabel: "privacy policy",
      submit: "Send inquiry",
      submitting: "Sending …",
      errors: {
        name: "Please enter your name, at least two characters.",
        email: "Please enter a valid email address.",
        message: "Please describe the work in at least ten characters.",
      },
      success:
        "Thanks, that came through. I'll get back to you within 24 hours.",
      genericError: "Couldn't send your inquiry. Please try again.",
      networkError:
        "Network error. Please check your connection and try again.",
    },
  },
};
