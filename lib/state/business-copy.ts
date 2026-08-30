/**
 * Bilingual copy for the /business route.
 *
 * One offer, one buyer, three prices. The page sells AI measurement and
 * rollout in the engineering lifecycle to whoever owns that budget in an
 * organisation of 50 to 800 developers.
 *
 * Written short on purpose. An earlier draft ran to roughly twice this length
 * and leaned on rhetorical constructions ("belegt aus Systemdaten statt aus
 * Selbstauskunft", "eingeführt, nicht nur bewertet", "keine Auswertung, keine
 * Rangliste, kein Profil") that read as machine-written. The rules in
 * `.claude/skills/writing-voice` ban those: no antithesis, no tricolons, no
 * aphorisms, no em dashes. Plain declarative sentences and real numbers
 * instead.
 *
 * The argument is carried by published research rather than by adjectives.
 * `MARKET_STATS` holds the three figures, each with its source, because a CTO
 * who recognises the DORA and METR numbers is the buyer this page is for.
 */

export type Lang = "de" | "en";

/**
 * Earliest quarter the ongoing programme can start.
 *
 * The audit is four weeks and fits alongside a full-time role, so it carries
 * no such gate and the hero states the two availabilities separately.
 */
const AVAILABLE_FROM = "Q1 2027";

/**
 * Every published price, in euro. One object, so the page, the JSON-LD offer
 * catalogue and the markdown mirrors can never disagree.
 *
 * Publishing at all is a deliberate position: DX, Jellyfish, Faros and Swarmia
 * all quote through sales, which the FAQ says out loud. The programme is
 * banded by developer count rather than by days, because a day count invites
 * the reader to divide and arrive back at an hourly rate.
 */
export const PRICING = {
  audit: 18_000,
  program: { small: 10_000, mid: 15_000, large: 20_000 },
  advisory: 6_000,
} as const;

/**
 * The reference organisation the cost comparison is calculated from.
 *
 * Conservative on both inputs: 200 developers is the middle of the 50 to 800
 * band, and 120k is a fully loaded annual cost no engineering lead will call
 * inflated. The page shows the arithmetic so a reader can substitute theirs.
 */
const REFERENCE_ORG = { developers: 200, costPerDeveloper: 120_000 } as const;

const ANNUAL_ENGINEERING_COST =
  REFERENCE_ORG.developers * REFERENCE_ORG.costPerDeveloper;
const PROGRAM_ANNUAL_COST = PRICING.program.mid * 12;
const PROGRAM_COST_SHARE =
  (PROGRAM_ANNUAL_COST / ANNUAL_ENGINEERING_COST) * 100;

const money = (value: number, lang: Lang) =>
  lang === "de"
    ? `${value.toLocaleString("de-DE")} €`
    : `€${value.toLocaleString("en-US")}`;

const millions = (value: number, lang: Lang) =>
  lang === "de"
    ? `${(value / 1_000_000).toLocaleString("de-DE")} Millionen Euro`
    : `€${(value / 1_000_000).toLocaleString("en-US")} million`;

/** The single oversized figure on the page, e.g. "0,75 %". */
const COST_SHARE_FIGURE = {
  de: `${PROGRAM_COST_SHARE.toLocaleString("de-DE", { minimumFractionDigits: 2 })} %`,
  en: `${PROGRAM_COST_SHARE.toLocaleString("en-US", { minimumFractionDigits: 2 })}%`,
} as const;

/**
 * Option values accepted by `/api/inquiry` for the two optional select fields.
 *
 * The API validates against these arrays and drops anything it does not
 * recognise, so the form and the endpoint cannot disagree about what is valid.
 * A value added here needs a label in *both* language blocks below, or the
 * option renders blank and never reaches the email.
 */
export const ENGAGEMENT_TYPES = [
  "audit",
  "program",
  "advisory",
  "engineering",
  "other",
] as const;

export const TIMELINES = ["now", "next-quarter", "later", "unsure"] as const;

interface SelectOption {
  value: string;
  label: string;
}

/** One headline figure in the KPI row, with the study it comes from. */
interface Stat {
  value: string;
  label: string;
  source: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

/** One rung of the offer ladder. */
interface Tier {
  id: string;
  step: string;
  name: string;
  price: string;
  terms: string;
  desc: string;
  items: string[];
  /**
   * The rung the page recommends. Exactly one tier carries this: it gets the
   * brand left rule and the tint. Two highlighted tiers would highlight none.
   */
  featured?: boolean;
}

export interface BusinessCopy {
  switchTo: string;
  switchHref: string;
  switchLabel: string;
  hero: {
    eyebrow: string;
    heading: string;
    lede: string;
    availability: string;
    ctaPrimary: string;
    jumpLabel: string;
  };
  /** The published research the page opens on, plus the read on it. */
  evidence: { heading: string; stats: Stat[]; closing: string };
  ladder: {
    heading: string;
    tiers: Tier[];
    /** The cost comparison, carrying the page's one oversized figure. */
    figure: string;
    figureNote: string;
    note: string;
  };
  why: { heading: string; items: string[] };
  work: { heading: string };
  faq: { heading: string; items: FaqItem[] };
  engage: {
    heading: string;
    lede: string;
    bookingCta: string;
    formToggle: string;
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
    selectPlaceholder: string;
    privacyNote: string;
    privacyLinkLabel: string;
    submit: string;
    submitting: string;
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
      eyebrow: "KI im Engineering · 50 bis 800 Entwickler:innen",
      heading: "Der KI-Einsatz in Ihrem Engineering, in Zahlen.",
      lede: "Ich messe aus Ihren System- und Prozessdaten, was sich seit der Einführung verändert hat. Vier Wochen, Festpreis, ohne personenbezogene Auswertung.",
      availability: `Audit ab sofort · Programm ab ${AVAILABLE_FROM}`,
      ctaPrimary: "Gespräch buchen",
      jumpLabel: "Preise",
    },
    evidence: {
      heading: "Der Stand der Forschung",
      stats: [
        {
          value: "90 %",
          label: "der Entwickler:innen nutzen KI bei der Arbeit",
          source: "DORA 2025",
        },
        {
          value: "19 %",
          label:
            "langsamer arbeiteten erfahrene Entwickler:innen mit KI, während sie sich schneller fühlten",
          source: "METR 2025",
        },
        {
          value: "+23,5 %",
          label: "Incidents pro Pull Request bei gestiegener Liefermenge",
          source: "DORA 2024 – 2025",
        },
      ],
      closing:
        "Der Output einzelner Entwickler:innen steigt messbar. Auf Organisationsebene bleiben rund zehn Prozent Zuwachs übrig. Wo Ihr Haus in dieser Spanne liegt, steht in Ihren eigenen Daten.",
    },
    ladder: {
      heading: "Leistungen",
      tiers: [
        {
          id: "audit",
          step: "01",
          name: "Wirkungs-Audit",
          price: money(PRICING.audit, "de"),
          terms: "Festpreis · 4 Wochen · ab sofort",
          desc: "Baseline aus Ihren Systemdaten, sechs bis acht Interviews, ein Ergebnisdokument mit priorisierten Maßnahmen.",
          items: [
            "Kennzahlen-Set mit Definitionen, Abfragen und Skripten, in Ihrem Repository",
            "Eine Seite für die Geschäftsführung",
            "Drei bis fünf Maßnahmen mit Aufwandsschätzung",
          ],
        },
        {
          id: "programm",
          step: "02",
          name: "Wirkungsprogramm",
          price: `${money(PRICING.program.small, "de")} – ${money(PRICING.program.large, "de")}`,
          terms: `pro Monat · ab 6 Monaten · ab ${AVAILABLE_FROM}`,
          desc: "Umsetzung der Maßnahmen im Rhythmus Ihrer Teams, mit monatlichem Reporting auf demselben Kennzahlen-Set.",
          items: [
            "Projektregeln, Leitplanken und Agenten-Standards in Ihrer Codebase",
            "Sprechstunde und Pairing, eine verantwortliche Person je Team",
            "Unterlagen für die Betriebsvereinbarung",
            `Preis nach Größe: ${money(PRICING.program.small, "de")} bis 150 Entwickler:innen, ${money(PRICING.program.mid, "de")} bis 400, ${money(PRICING.program.large, "de")} bis 800`,
          ],
          featured: true,
        },
        {
          id: "begleitung",
          step: "03",
          name: "Begleitung",
          price: money(PRICING.advisory, "de"),
          terms: "pro Monat · monatlich kündbar",
          desc: "Monatliche Durchsicht der Kennzahlen und ein fester Termin, sobald Ihr Team selbst fährt.",
          items: [
            "Schriftliche Einordnung der Zahlen",
            "Erreichbarkeit für Architektur- und Werkzeugentscheidungen",
          ],
        },
      ],
      figure: COST_SHARE_FIGURE.de,
      figureNote: `${REFERENCE_ORG.developers} Entwickler:innen kosten Sie bei ${money(REFERENCE_ORG.costPerDeveloper, "de")} Vollkosten rund ${millions(ANNUAL_ENGINEERING_COST, "de")} im Jahr. Das Programm kostet auf der mittleren Stufe ${money(PROGRAM_ANNUAL_COST, "de")} im Jahr.`,
      note: "Alle Preise netto, zuzüglich Umsatzsteuer.",
    },
    why: {
      heading: "Warum ich",
      items: [
        "Principal Solution Architect in einem Konzern mit mehreren hundert Entwickler:innen. Ich führe das dort selbst ein.",
        "Messung auf Team- und Repository-Ebene, ausgelegt auf § 87 BetrVG. Die Beschreibung für die Betriebsvereinbarung liefere ich mit.",
        "Über sechs Jahre TypeScript in Produktion, in Angular ebenso wie in React und Next.js. Ich kann beurteilen, was die Agenten in Ihrer Codebase produzieren.",
        "Kein Quellcode verlässt Ihr Haus. Ich arbeite mit Metadaten aus Git, CI und Ticketsystem.",
      ],
    },
    work: { heading: "Kunden" },
    faq: {
      heading: "Fragen",
      items: [
        {
          question: "Was, wenn das Ergebnis negativ ausfällt?",
          answer:
            "Dann steht das im Dokument. Sie haben damit eine belastbare Grundlage, Lizenzen zu reduzieren.",
        },
        {
          question: "Bekommen Sie Zugriff auf unseren Code?",
          answer:
            "Nein. Ich brauche Commit-Zeitstempel, Pull-Request-Historie, CI-Läufe und Tickets. Dass kein Quellcode Ihr Haus verlässt, steht im Vertrag.",
        },
        {
          question: "Warum nicht eines der fertigen Werkzeuge?",
          answer:
            "DX, Jellyfish, Faros und Swarmia werten pro Entwickler:in aus und nennen ihre Preise erst im Vertrieb. Nach dem Audit wissen Sie, welche Kennzahlen bei Ihnen aussagekräftig sind, und können ein Werkzeug gezielt auswählen.",
        },
        {
          question: "Können wir direkt mit dem Programm starten?",
          answer:
            "Ohne Baseline lässt sich die Wirkung der Maßnahmen hinterher nicht belegen. Das Audit dauert vier Wochen und kostet einen Bruchteil des Programms.",
        },
        {
          question: "Wie viel Zeit kostet uns das Audit?",
          answer:
            "Unter zehn Stunden auf Ihrer Seite: sechs bis acht Interviews à 30 Minuten, ein technischer Zugang in Woche 1, ein Abschlusstermin.",
        },
        {
          question: "Übernehmen Sie auch reine Entwicklungsarbeit?",
          answer:
            "Innerhalb eines laufenden Programms und bei bestehenden Kunden ja. Als eigenständiges Mandat biete ich es nicht mehr an.",
        },
      ],
    },
    engage: {
      heading: "Gespräch",
      lede: "20 Minuten. Ich frage nach Ihrer Datenlage und sage Ihnen, ob ein Audit bei Ihnen etwas misst.",
      bookingCta: "Termin wählen",
      formToggle: "Lieber schreiben? Anfrage per Formular",
      emailLabel: "E-Mail",
      markdownLabel: "Diese Seite als Markdown",
    },
    form: {
      heading: "Anfrage",
      name: "Name",
      namePlaceholder: "Ihr Name",
      email: "E-Mail",
      emailPlaceholder: "sie@unternehmen.de",
      message: "Worum geht es?",
      messagePlaceholder:
        "Wie viele Entwickler:innen, welche KI-Werkzeuge seit wann, und was in der nächsten Budgetrunde beantwortet sein muss.",
      company: "Unternehmen",
      companyPlaceholder: "Firmenname",
      engagementType: "Worum geht es",
      engagementTypeOptions: [
        { value: "audit", label: "Wirkungs-Audit" },
        { value: "program", label: "Wirkungsprogramm" },
        { value: "advisory", label: "Begleitung" },
        { value: "engineering", label: "Entwicklungskapazität" },
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
      eyebrow: "AI in engineering · 50 to 800 developers",
      heading: "AI in your engineering, in numbers.",
      lede: "I measure what changed since rollout, from your own system and process data. Four weeks, fixed price, with no per-developer analysis.",
      availability: `Audit now · Programme from ${AVAILABLE_FROM}`,
      ctaPrimary: "Book a call",
      jumpLabel: "Pricing",
    },
    evidence: {
      heading: "What the research shows",
      stats: [
        {
          value: "90%",
          label: "of developers use AI at work",
          source: "DORA 2025",
        },
        {
          value: "19%",
          label:
            "slower were experienced developers using AI, while they felt faster",
          source: "METR 2025",
        },
        {
          value: "+23.5%",
          label: "incidents per pull request as delivery volume rose",
          source: "DORA 2024 – 2025",
        },
      ],
      closing:
        "Individual output rises measurably. At organisation level about ten percent of that survives. Where your company sits in that range is in your own data.",
    },
    ladder: {
      heading: "Services",
      tiers: [
        {
          id: "audit",
          step: "01",
          name: "Impact audit",
          price: money(PRICING.audit, "en"),
          terms: "fixed price · 4 weeks · available now",
          desc: "A baseline from your system data, six to eight interviews, and one written result with prioritised measures.",
          items: [
            "A metrics set with definitions, queries and scripts, in your repository",
            "One page for the executive board",
            "Three to five measures with effort estimates",
          ],
        },
        {
          id: "programme",
          step: "02",
          name: "Impact programme",
          price: `${money(PRICING.program.small, "en")} – ${money(PRICING.program.large, "en")}`,
          terms: `per month · from 6 months · from ${AVAILABLE_FROM}`,
          desc: "Implementation of the measures in your teams' rhythm, with monthly reporting on the same metrics set.",
          items: [
            "Project rules, guardrails and agent standards in your codebase",
            "Office hours and pairing, one accountable person per team",
            "Documentation for the works agreement",
            `Priced by size: ${money(PRICING.program.small, "en")} up to 150 developers, ${money(PRICING.program.mid, "en")} up to 400, ${money(PRICING.program.large, "en")} up to 800`,
          ],
          featured: true,
        },
        {
          id: "advisory",
          step: "03",
          name: "Ongoing advisory",
          price: money(PRICING.advisory, "en"),
          terms: "per month · cancel monthly",
          desc: "A monthly review of the metrics and one fixed session, once your team is driving.",
          items: [
            "A written read on the numbers",
            "Reachable for architecture and tooling decisions",
          ],
        },
      ],
      figure: COST_SHARE_FIGURE.en,
      figureNote: `${REFERENCE_ORG.developers} developers at ${money(REFERENCE_ORG.costPerDeveloper, "en")} fully loaded cost you about ${millions(ANNUAL_ENGINEERING_COST, "en")} a year. The programme at the middle band costs ${money(PROGRAM_ANNUAL_COST, "en")} a year.`,
      note: "All prices net, plus VAT.",
    },
    why: {
      heading: "Why me",
      items: [
        "Principal Solution Architect in a group with several hundred developers. I run this there myself.",
        "Measurement at team and repository level, built for § 87 BetrVG. I supply the description your works agreement needs.",
        "Six-plus years of TypeScript in production, in Angular as much as React and Next.js. I can judge the agent output in question.",
        "No source code leaves your building. I work from Git, CI and ticket metadata.",
      ],
    },
    work: { heading: "Clients" },
    faq: {
      heading: "Questions",
      items: [
        {
          question: "What if the result is negative?",
          answer:
            "Then that is what the document says. It gives you solid ground to cut licences.",
        },
        {
          question: "Do you get access to our code?",
          answer:
            "No. I need commit timestamps, pull request history, CI runs and tickets. The contract states that no source code leaves your building.",
        },
        {
          question: "Why not one of the off-the-shelf tools?",
          answer:
            "DX, Jellyfish, Faros and Swarmia report per developer and quote through sales. After the audit you know which metrics are meaningful in your organisation, and can pick a tool deliberately.",
        },
        {
          question: "Can we start with the programme directly?",
          answer:
            "Without a baseline the effect of the measures cannot be evidenced afterwards. The audit takes four weeks and costs a fraction of the programme.",
        },
        {
          question: "How much of our time does the audit take?",
          answer:
            "Under ten hours on your side: six to eight interviews of 30 minutes, one technical access in week 1, one closing session.",
        },
        {
          question: "Do you take on plain engineering work?",
          answer:
            "Inside a running programme and for existing clients, yes. I no longer offer it as a mandate of its own.",
        },
      ],
    },
    engage: {
      heading: "Talk it through",
      lede: "20 minutes. I ask about your data and tell you whether an audit would measure anything.",
      bookingCta: "Pick a slot",
      formToggle: "Rather write? Send an inquiry",
      emailLabel: "Email",
      markdownLabel: "This page as Markdown",
    },
    form: {
      heading: "Inquiry",
      name: "Name",
      namePlaceholder: "Your name",
      email: "Email",
      emailPlaceholder: "you@company.com",
      message: "What's this about?",
      messagePlaceholder:
        "How many developers, which AI tools since when, and what has to be answered in the next budget round.",
      company: "Company",
      companyPlaceholder: "Company name",
      engagementType: "What this is about",
      engagementTypeOptions: [
        { value: "audit", label: "Impact audit" },
        { value: "program", label: "Impact programme" },
        { value: "advisory", label: "Ongoing advisory" },
        { value: "engineering", label: "Engineering capacity" },
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
