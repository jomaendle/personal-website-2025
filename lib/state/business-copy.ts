/**
 * Bilingual copy for the /business route.
 *
 * Positioning: one offer, one buyer. The page sells AI in the engineering
 * lifecycle to whoever owns that budget in an organisation of 50 to 800
 * developers. It is priced as an outcome on a three-step ladder, never as a
 * day rate.
 *
 * This replaces two pages that pointed in opposite directions. `/business`
 * used to sell embedded contract engineering, which is capacity priced by
 * time and benchmarked against every other contractor. `/ki-wirkung` sold a
 * four-week audit as a separate offer with its own buyer, and ended by telling
 * that buyer the implementation was somebody else's mandate. The audit is now
 * step one of the ladder on this page, and the engineering work is proof
 * rather than the offer: it appears in the credibility section and in one FAQ
 * answer, not in a service list.
 *
 * Copy lives here rather than in the component so the page stays a server
 * component and `lib/business-markdown.ts` renders the `/business.md` mirrors
 * from the same source instead of drifting.
 */

export type Lang = "de" | "en";

/**
 * Earliest quarter the ongoing programme can start.
 *
 * The audit is four weeks and fits alongside a full-time role, so it carries
 * no such gate and the hero says so separately. Interpolated into the hero
 * availability line, the ladder, and process step 03, because four hardcoded
 * copies drifted apart the first time the date moved.
 */
const AVAILABLE_FROM = "Q1 2027";

/**
 * Every published price, in euro. One object so the page, the JSON-LD offer
 * catalogue and the markdown mirrors can never disagree.
 *
 * `audit` is a one-off flat price, deliberately without an "ab": the scope
 * pins it to four weeks and to 50 to 800 developers, so it can be a number.
 * `program` and `advisory` are monthly. The programme is banded by developer
 * count rather than by days, because a day count invites the reader to divide
 * and arrive back at an hourly rate.
 */
export const PRICING = {
  audit: 18_000,
  program: { small: 10_000, mid: 15_000, large: 20_000 },
  advisory: 6_000,
} as const;

/**
 * The reference organisation the economics section is calculated from.
 *
 * Deliberately conservative on both inputs: 200 developers is the middle of
 * the 50 to 800 band, and 120k is a fully loaded annual cost that no German
 * engineering lead will call inflated. The section shows its own arithmetic so
 * a reader can substitute their numbers, which is the point of it.
 */
const REFERENCE_ORG = { developers: 200, costPerDeveloper: 120_000 } as const;

/** Assumed throughput gain used to show the return side of the comparison. */
const THROUGHPUT_GAIN_PERCENT = 3;

const ANNUAL_ENGINEERING_COST =
  REFERENCE_ORG.developers * REFERENCE_ORG.costPerDeveloper;
const PROGRAM_ANNUAL_COST = PRICING.program.mid * 12;
const PROGRAM_COST_SHARE =
  (PROGRAM_ANNUAL_COST / ANNUAL_ENGINEERING_COST) * 100;
const THROUGHPUT_GAIN_VALUE =
  ANNUAL_ENGINEERING_COST * (THROUGHPUT_GAIN_PERCENT / 100);

/** Locale-aware money and number formatting, so both languages read natively. */
const money = (value: number, lang: Lang) =>
  lang === "de"
    ? `${value.toLocaleString("de-DE")} €`
    : `€${value.toLocaleString("en-US")}`;

const millions = (value: number, lang: Lang) =>
  lang === "de"
    ? `${(value / 1_000_000).toLocaleString("de-DE")} Millionen Euro`
    : `€${(value / 1_000_000).toLocaleString("en-US")} million`;

/** The headline figure of the economics section, e.g. "0,75 %". */
const COST_SHARE_FIGURE = {
  de: `${PROGRAM_COST_SHARE.toLocaleString("de-DE", { minimumFractionDigits: 2 })} %`,
  en: `${PROGRAM_COST_SHARE.toLocaleString("en-US", { minimumFractionDigits: 2 })}%`,
} as const;

/**
 * Option values accepted by `/api/inquiry` for the two optional select fields.
 *
 * The API validates against these arrays and silently drops anything it does
 * not recognise, so the form and the endpoint can never disagree about what a
 * valid value is. A value added here needs a label in *both* language blocks
 * below, or the option renders blank and never reaches the email.
 *
 * These mirror the ladder, plus `engineering` for the contract work the page
 * no longer advertises but still takes on, and which people do still ask for.
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

interface LabelledItem {
  title: string;
  desc: string;
}

interface ProcessStep {
  num: string;
  title: string;
  desc: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

/** One rung of the offer ladder. */
interface Tier {
  /** Stable id, used for the anchor and the React key. */
  id: string;
  /** Step number rendered as a mono label above the name. */
  step: string;
  name: string;
  /** The price itself, rendered large. */
  price: string;
  /** Term and shape, rendered under the price. */
  terms: string;
  /** One line on who this rung is for. */
  audience: string;
  desc: string;
  items: string[];
  /**
   * The rung the page is actually selling. Exactly one tier carries this: it
   * gets the tinted panel and the solid call to action, the others get a
   * hairline border. Two highlighted tiers would highlight neither.
   */
  featured?: boolean;
}

/** A credibility block, optionally carrying a mono list of supporting terms. */
interface MoatBlock {
  title: string;
  paragraphs: string[];
  /** Rendered as a mono row under the prose. Proof, not a service menu. */
  terms?: string[];
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
    availability: string;
    ctaPrimary: string;
    ctaSecondary: string;
    jumpLabel: string;
  };
  /**
   * The credential band under the hero. Three facts a C-level reader uses to
   * decide whether to keep reading, in the order they ask them: how big, how
   * long, from where.
   */
  credentials: { value: string; label: string }[];
  clients: { heading: string };
  problem: { heading: string; items: LabelledItem[]; closing: string };
  /**
   * The economics section. The one place on the page with an oversized figure,
   * because this is the number that decides whether a monthly fee reads as
   * large or as a rounding error.
   */
  economics: {
    heading: string;
    figure: string;
    figureLabel: string;
    paragraphs: string[];
    note: string;
  };
  ladder: { heading: string; lede: string; tiers: Tier[]; note: string };
  moat: { heading: string; blocks: MoatBlock[] };
  work: { heading: string; lede: string };
  process: { heading: string; steps: ProcessStep[] };
  faq: { heading: string; items: FaqItem[] };
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
      heading: "KI im Engineering. Erst gemessen, dann eingeführt.",
      lede: "Ihre Lizenzen sind bezahlt, die Nutzung ist ungleich verteilt, und in der nächsten Budgetrunde fragt jemand nach Zahlen. Ich messe aus Ihren Systemdaten, was der KI-Einsatz tatsächlich verändert hat, und setze anschließend um, was davon trägt. Auf Team- und Repository-Ebene, ohne personenbezogene Auswertung.",
      availability: `Audit ab sofort · Programm ab ${AVAILABLE_FROM}`,
      ctaPrimary: "Gespräch buchen",
      ctaSecondary: "Anfrage schreiben",
      jumpLabel: "Stufen und Preise",
    },
    credentials: [
      {
        value: "Mehrere hundert",
        label: "Entwickler:innen im Konzern, für die ich das heute verantworte",
      },
      { value: "6+ Jahre", label: "TypeScript in Produktion, nicht im Blog" },
      {
        value: "0 Zeilen",
        label: "Quellcode, die für die Messung Ihr Haus verlassen",
      },
    ],
    clients: { heading: "Kunden" },
    problem: {
      heading: "Woran Sie es erkennen",
      items: [
        {
          title: "Die Lizenzkosten stehen im Budget, der Nutzen nicht.",
          desc: "Sie können auf den Cent genau sagen, was die Werkzeuge kosten. Auf die Frage, was sie eingebracht haben, folgt eine Schätzung.",
        },
        {
          title: "Die Berichte aus Ihren Teams widersprechen sich.",
          desc: "Ein Team meldet doppelte Geschwindigkeit, das nächste hat die Werkzeuge nach drei Wochen wieder ausgeschaltet. Beide beschreiben ihre Erfahrung korrekt.",
        },
        {
          title: "Ihre besten Leute ziehen davon, der Rest steht.",
          desc: "Einzelne holen aus denselben Werkzeugen ein Vielfaches heraus. Warum, kann niemand aufschreiben, und deshalb lässt es sich auch nicht weitergeben.",
        },
        {
          title: "Die Einführung hängt im Betriebsrat.",
          desc: "Das eingekaufte Dashboard wertet pro Entwickler:in aus. Damit ist es mitbestimmungspflichtig, und die Verhandlung läuft seit Monaten.",
        },
      ],
      closing:
        "Alle vier haben dieselbe Ursache. Die Werkzeuge sind eingekauft, die Messung fehlt.",
    },
    economics: {
      heading: "Was das kostet, gemessen an Ihrem Engineering",
      figure: COST_SHARE_FIGURE.de,
      figureLabel: "des jährlichen Engineering-Budgets",
      paragraphs: [
        `Eine Organisation mit ${REFERENCE_ORG.developers} Entwickler:innen kostet Sie bei ${money(REFERENCE_ORG.costPerDeveloper, "de")} Vollkosten rund ${millions(ANNUAL_ENGINEERING_COST, "de")} im Jahr. Das Programm kostet auf der mittleren Stufe ${money(PROGRAM_ANNUAL_COST, "de")} im Jahr.`,
        `Bewegt es den Durchsatz um ${THROUGHPUT_GAIN_PERCENT} Prozent, stehen ${money(THROUGHPUT_GAIN_VALUE, "de")} gegen ${money(PROGRAM_ANNUAL_COST, "de")}. Bewegt es gar nichts, wissen Sie das nach dem Audit und nicht nach zwei Jahren.`,
      ],
      note: "Rechnen Sie mit Ihren eigenen Zahlen nach. An der Größenordnung ändert das nichts.",
    },
    ladder: {
      heading: "Die drei Stufen",
      lede: "Jede Stufe steht für sich, und Sie entscheiden nach jeder neu. Anfangen können Sie nur bei der ersten.",
      tiers: [
        {
          id: "audit",
          step: "Stufe 01",
          name: "Wirkungs-Audit",
          price: `${money(PRICING.audit, "de")}`,
          terms: "Festpreis · 4 Wochen · sofort möglich",
          audience: "Wenn Sie Zahlen für die nächste Budgetrunde brauchen.",
          desc: "Vier Wochen, zwei Termine pro Woche, ein Ergebnisdokument. Baseline aus Systemdaten, sechs bis acht Interviews, Wirkungsanalyse, priorisierte Maßnahmen.",
          items: [
            "Ein Kennzahlen-Set, das Ihr Team ohne mich fortschreiben kann: Definitionen, Abfragen, Skripte",
            "Baseline und Ist-Wert, belegt aus Systemdaten statt aus Selbstauskunft",
            "Eine Seite für die Geschäftsführung, die eine Budgetentscheidung trägt",
            "Drei bis fünf priorisierte Maßnahmen mit Aufwandsschätzung",
            "Alle Rohdaten und Auswertungsskripte, in Ihrem Repository",
          ],
        },
        {
          id: "programm",
          step: "Stufe 02",
          name: "Wirkungsprogramm",
          price: `${money(PRICING.program.small, "de")} – ${money(PRICING.program.large, "de")}`,
          terms: `pro Monat · ab 6 Monaten · ab ${AVAILABLE_FROM}`,
          audience:
            "Wenn die Maßnahmen aus dem Audit umgesetzt werden sollen, nachweisbar.",
          desc: "Ich setze um, was das Audit priorisiert hat, und schreibe die Kennzahlen weiter, damit die Wirkung belegbar bleibt. Zwei bis drei Tage pro Woche, im Rhythmus Ihrer Teams.",
          items: [
            `Preis nach Größe: ${money(PRICING.program.small, "de")} bei 50 bis 150 Entwickler:innen, ${money(PRICING.program.mid, "de")} bis 400, ${money(PRICING.program.large, "de")} bis 800`,
            "Umsetzung der Maßnahmen: Projektregeln, Leitplanken, Agenten-Standards, Spec-first-Workflow, Prüfungen im Pull Request, Evaluierung in der CI",
            "Enablement mit fester Taktung: Sprechstunde, Pairing, eine verantwortliche Person je Team",
            "Monatliches Reporting auf demselben Kennzahlen-Set, in der Form, die Sie im Vorstand vorlegen",
            "Unterlagen für die Betriebsvereinbarung, inklusive der Beschreibung der Messung",
            "Quartalsweise Steuerung mit Ihnen, schriftlich festgehalten",
          ],
          featured: true,
        },
        {
          id: "begleitung",
          step: "Stufe 03",
          name: "Begleitung",
          price: `${money(PRICING.advisory, "de")}`,
          terms: "pro Monat · monatlich kündbar",
          audience:
            "Wenn das Programm steht und nicht wieder einschlafen soll.",
          desc: "Die Stufe nach dem Programm. Ihr Team fährt selbst, ich bleibe an den Zahlen und an den Entscheidungen, die keine Woche Zeit haben.",
          items: [
            "Monatliche Durchsicht der Kennzahlen mit schriftlicher Einordnung",
            "Ein fester Termin im Monat mit Ihnen und den Verantwortlichen",
            "Erreichbarkeit für Architektur- und Werkzeugentscheidungen zwischendurch",
            "Fortschreibung der Standards, wenn sich die Modelle oder die Werkzeuge ändern",
          ],
        },
      ],
      note: "Alle Preise netto, zuzüglich Umsatzsteuer. Reisekosten nur nach Absprache.",
    },
    moat: {
      heading: "Warum das hier trägt",
      blocks: [
        {
          title: "Messung ohne Leistungskontrolle",
          paragraphs: [
            "Werkzeuge aus den USA messen pro Entwickler:in. In Deutschland ist das mitbestimmungspflichtig und in vielen Häusern der Grund, warum die Einführung im Betriebsrat hängen bleibt.",
            "Ich messe auf Team- und Repository-Ebene. Keine personenbezogene Auswertung, keine Rangliste, kein individuelles Profil. Das Kennzahlen-Set ist so aufgebaut, dass es einer Betriebsvereinbarung standhält, und die Beschreibung, die Sie dafür brauchen, liefere ich mit.",
          ],
        },
        {
          title: "Ich habe das selbst eingeführt, nicht nur bewertet",
          paragraphs: [
            "Hauptberuflich bin ich Principal Solution Architect in einem Konzern mit mehreren hundert Entwickler:innen und arbeite genau daran: wie KI in den Entwicklungszyklus großer Teams einzieht, von Architektur und Tooling bis zu den täglichen Gewohnheiten.",
            "Unter denselben Zwängen, die Sie kennen: Betriebsrat, Beschaffung, gewachsene Codebases, Teams mit Fristen.",
          ],
        },
        {
          title: "Ich kann den Code lesen, über den wir reden",
          paragraphs: [
            "Ob der Output eines Agenten trägt, kann nur beurteilen, wer ihn selbst schreiben könnte. Über sechs Jahre TypeScript in Produktion, in Angular ebenso wie in React und Next.js, dazu Node und NestJS im Backend.",
            "Deshalb bleibt es bei Empfehlungen, die in Ihrer Codebase funktionieren, statt bei Folien über KI im Allgemeinen.",
          ],
          terms: [
            "React",
            "Next.js",
            "Angular",
            "Vue",
            "Astro",
            "TypeScript",
            "Node.js",
            "NestJS",
            "Claude Code",
            "OpenAI Codex",
            "MCP",
            "Playwright",
          ],
        },
      ],
    },
    work: {
      heading: "Ausgewählte Kundenprojekte",
      lede: "Freelance-Mandate der letzten Jahre. Sie zeigen, woher die Urteilsfähigkeit kommt, die im Audit und im Programm gebraucht wird.",
    },
    process: {
      heading: "So fangen wir an",
      steps: [
        {
          num: "01",
          title: "Gespräch",
          desc: "20 Minuten. Ich stelle Fragen zu Ihrer Datenlage. Trägt sie kein Audit, sage ich das im Gespräch und nicht nach der Beauftragung.",
        },
        {
          num: "02",
          title: "Audit",
          desc: "Vier Wochen zum Festpreis. Unter zehn Stunden Aufwand auf Ihrer Seite. Am Ende liegt ein Ergebnisdokument vor, mit dem Sie auch ohne mich weiterarbeiten können.",
        },
        {
          num: "03",
          title: "Programm",
          desc: `Sie entscheiden nach dem Audit, ob umgesetzt wird und mit wem. Wenn mit mir, startet das Programm ab ${AVAILABLE_FROM}.`,
        },
      ],
    },
    faq: {
      heading: "Häufige Fragen",
      items: [
        {
          question: "Was, wenn das Ergebnis negativ ausfällt?",
          answer:
            "Dann steht das im Dokument. Ein Audit, dessen Ergebnis vorher feststeht, ist wertlos. In dem Fall haben Sie eine belastbare Grundlage, Lizenzen zu reduzieren. Das rechnet sich schneller als jede Optimierung.",
        },
        {
          question: "Bekommen Sie Zugriff auf unseren Code?",
          answer:
            "Nein. Ich brauche Metadaten: Commit-Zeitstempel, Pull-Request-Historie, CI-Läufe, Tickets. Kein Quellcode verlässt Ihr Haus, das steht im Vertrag.",
        },
        {
          question: "Können wir direkt mit dem Programm starten?",
          answer:
            "Nein. Ohne Baseline setze ich Maßnahmen um, deren Wirkung hinterher niemand belegen kann. Das ist genau das Problem, mit dem Sie hier angekommen sind. Das Audit ist vier Wochen und kostet einen Bruchteil des Programms.",
        },
        {
          question: "Wie viel Zeit kostet uns das Audit?",
          answer:
            "Sechs bis acht Interviews à 30 Minuten, ein technischer Zugang in Woche 1, ein Abschlusstermin. Zusammen unter zehn Stunden auf Ihrer Seite.",
        },
        {
          question: "Warum nicht eines der fertigen Werkzeuge?",
          answer:
            "Das können Sie tun. Nach dem Audit wissen Sie, welche Kennzahlen bei Ihnen aussagekräftig sind. Vorher kaufen Sie ein Dashboard und stellen erst danach fest, welche Kennzahlen Sie gebraucht hätten.",
        },
        {
          question: "Passt das auch unter 50 Entwickler:innen?",
          answer:
            "Selten. Unter 50 ist die Datenmenge zu klein, um Veränderungen von Rauschen zu trennen, und Sie bekommen dieselbe Antwort günstiger durch ein paar Gespräche. Sagen Sie mir Ihre Größe im Erstgespräch, dann klären wir das in fünf Minuten.",
        },
        {
          question: "Übernehmen Sie auch reine Entwicklungsarbeit?",
          answer:
            "Im Rahmen eines laufenden Programms ja, und bei bestehenden Kunden ohnehin. Als eigenständiges Mandat verkaufe ich es nicht mehr. Wenn Sie Frontend-Kapazität suchen, schreiben Sie mir trotzdem: entweder es passt in ein Programm, oder ich empfehle Ihnen jemanden.",
        },
      ],
    },
    engage: {
      heading: "Nächster Schritt",
      lede: "20 Minuten, unverbindlich. Ich stelle Fragen, Sie entscheiden danach. Wenn Ihre Datenlage kein Audit trägt, erfahren Sie das in diesem Gespräch.",
      bookingTitle: "Lieber direkt sprechen?",
      bookingDesc: "20 Minuten, unverbindlich, in Ihrem Kalender.",
      bookingCta: "Gespräch buchen",
      emailLabel: "Oder per E-Mail",
      markdownLabel: "Diese Seite als Markdown ansehen",
    },
    form: {
      heading: "Anfrage",
      name: "Name",
      namePlaceholder: "Ihr Name",
      email: "E-Mail",
      emailPlaceholder: "sie@unternehmen.de",
      message: "Worum geht es?",
      messagePlaceholder:
        "Kurz zur Lage: Wie viele Entwickler:innen, welche KI-Werkzeuge seit wann, und was in der nächsten Budgetrunde beantwortet sein muss.",
      company: "Unternehmen",
      companyPlaceholder: "Firmenname",
      engagementType: "Worum geht es",
      engagementTypeOptions: [
        { value: "audit", label: "Wirkungs-Audit (Stufe 01)" },
        { value: "program", label: "Wirkungsprogramm (Stufe 02)" },
        { value: "advisory", label: "Begleitung (Stufe 03)" },
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
      heading: "AI in engineering. Measured first, then rolled out.",
      lede: "The licences are paid for, the usage is uneven, and in the next budget round someone will ask for numbers. I measure what your AI tooling actually changed, from your own system data, then implement whatever holds up. At team and repository level, with no per-developer analysis.",
      availability: `Audit now · Programme from ${AVAILABLE_FROM}`,
      ctaPrimary: "Book a call",
      ctaSecondary: "Send an inquiry",
      jumpLabel: "Steps and prices",
    },
    credentials: [
      {
        value: "Several hundred",
        label: "developers in the group I do this for today",
      },
      {
        value: "6+ years",
        label: "of TypeScript in production, not in a blog",
      },
      {
        value: "0 lines",
        label: "of source code leave your building for the measurement",
      },
    ],
    clients: { heading: "Clients" },
    problem: {
      heading: "How you recognise it",
      items: [
        {
          title: "The licence cost is in the budget. The return is not.",
          desc: "You can name what the tools cost to the cent. Asked what they returned, you get an estimate.",
        },
        {
          title: "The reports from your teams contradict each other.",
          desc: "One team reports twice the speed, the next switched the tools off after three weeks. Both are describing their experience accurately.",
        },
        {
          title:
            "Your best people are pulling away, the rest are standing still.",
          desc: "A few get a multiple out of the same tools. Nobody can write down why, so nobody can pass it on.",
        },
        {
          title: "The rollout is stuck with the works council.",
          desc: "The dashboard you bought reports per developer. That makes it subject to codetermination, and the negotiation has been running for months.",
        },
      ],
      closing:
        "All four have the same cause. The tools are bought, the measurement is missing.",
    },
    economics: {
      heading: "What this costs, against what your engineering costs",
      figure: COST_SHARE_FIGURE.en,
      figureLabel: "of the annual engineering budget",
      paragraphs: [
        `An organisation of ${REFERENCE_ORG.developers} developers at ${money(REFERENCE_ORG.costPerDeveloper, "en")} fully loaded costs you about ${millions(ANNUAL_ENGINEERING_COST, "en")} a year. The programme at the middle band costs ${money(PROGRAM_ANNUAL_COST, "en")} a year.`,
        `If it moves throughput by ${THROUGHPUT_GAIN_PERCENT} percent, that is ${money(THROUGHPUT_GAIN_VALUE, "en")} against ${money(PROGRAM_ANNUAL_COST, "en")}. If it moves nothing, you know that after the audit rather than after two years.`,
      ],
      note: "Run it with your own numbers. The order of magnitude does not change.",
    },
    ladder: {
      heading: "The three steps",
      lede: "Each step stands on its own and you decide again after each one. The only place to start is the first.",
      tiers: [
        {
          id: "audit",
          step: "Step 01",
          name: "Impact audit",
          price: `${money(PRICING.audit, "en")}`,
          terms: "fixed price · 4 weeks · available now",
          audience: "When you need numbers for the next budget round.",
          desc: "Four weeks, two sessions a week, one written result. Baseline from system data, six to eight interviews, impact analysis, prioritised measures.",
          items: [
            "A metrics set your team can keep running without me: definitions, queries, scripts",
            "Baseline and current value, evidenced from system data rather than self-reporting",
            "One page for the executive board that carries a budget decision",
            "Three to five prioritised measures with effort estimates",
            "All raw data and analysis scripts, in your repository",
          ],
        },
        {
          id: "programme",
          step: "Step 02",
          name: "Impact programme",
          price: `${money(PRICING.program.small, "en")} – ${money(PRICING.program.large, "en")}`,
          terms: `per month · from 6 months · from ${AVAILABLE_FROM}`,
          audience:
            "When the measures from the audit need implementing, provably.",
          desc: "I implement what the audit prioritised and keep the metrics running, so the effect stays evidenced. Two to three days a week, in your teams' rhythm.",
          items: [
            `Priced by size: ${money(PRICING.program.small, "en")} at 50 to 150 developers, ${money(PRICING.program.mid, "en")} up to 400, ${money(PRICING.program.large, "en")} up to 800`,
            "Implementation of the measures: project rules, guardrails, agent standards, spec-first workflow, checks in the pull request, evaluation in CI",
            "Enablement on a fixed cadence: office hours, pairing, one accountable person per team",
            "Monthly reporting on the same metrics set, in the form you take to the board",
            "Documentation for the works agreement, including the description of the measurement",
            "Quarterly steering with you, written down",
          ],
          featured: true,
        },
        {
          id: "advisory",
          step: "Step 03",
          name: "Ongoing advisory",
          price: `${money(PRICING.advisory, "en")}`,
          terms: "per month · cancel monthly",
          audience:
            "When the programme has landed and should not quietly lapse.",
          desc: "The step after the programme. Your team drives, I stay on the numbers and on the decisions that cannot wait a week.",
          items: [
            "Monthly review of the metrics with a written read on them",
            "One fixed session a month with you and the people accountable",
            "Reachable for architecture and tooling decisions in between",
            "Standards kept current as the models and the tools change",
          ],
        },
      ],
      note: "All prices net, plus VAT. Travel costs by agreement only.",
    },
    moat: {
      heading: "Why this holds up",
      blocks: [
        {
          title: "Measurement without performance monitoring",
          paragraphs: [
            "Tools from the US measure per developer. In Germany that is subject to codetermination, and in many companies it is the reason the rollout is stuck with the works council.",
            "I measure at team and repository level. No per-person analysis, no ranking, no individual profile. The metrics set is built to survive a works agreement, and I supply the description you need for it.",
          ],
        },
        {
          title: "I have introduced this myself, not only assessed it",
          paragraphs: [
            "In my day job I'm a Principal Solution Architect in a group with several hundred developers, working on exactly this: how AI enters the development lifecycle of large teams, from architecture and tooling to the daily habits.",
            "Under the same constraints you know: works council, procurement, mature codebases, teams with deadlines.",
          ],
        },
        {
          title: "I can read the code we're discussing",
          paragraphs: [
            "Whether an agent's output holds up can only be judged by someone who could have written it. Six-plus years of TypeScript in production, in Angular as much as React and Next.js, with Node and NestJS on the backend.",
            "That is why this ends in recommendations that work in your codebase rather than slides about AI in general.",
          ],
          terms: [
            "React",
            "Next.js",
            "Angular",
            "Vue",
            "Astro",
            "TypeScript",
            "Node.js",
            "NestJS",
            "Claude Code",
            "OpenAI Codex",
            "MCP",
            "Playwright",
          ],
        },
      ],
    },
    work: {
      heading: "Selected client work",
      lede: "Freelance engagements from the last few years. They show where the judgement used in the audit and the programme comes from.",
    },
    process: {
      heading: "How we start",
      steps: [
        {
          num: "01",
          title: "Conversation",
          desc: "20 minutes. I ask about your data. If it won't carry an audit, you hear that in the call and not after the contract.",
        },
        {
          num: "02",
          title: "Audit",
          desc: "Four weeks at a fixed price. Under ten hours of effort on your side. You end up with a written result you can act on without me.",
        },
        {
          num: "03",
          title: "Programme",
          desc: `After the audit you decide whether to implement, and with whom. If with me, the programme starts from ${AVAILABLE_FROM}.`,
        },
      ],
    },
    faq: {
      heading: "Common questions",
      items: [
        {
          question: "What if the result is negative?",
          answer:
            "Then that is what the document says. An audit whose result is fixed in advance is worthless. In that case you have solid ground to cut licences, which pays back faster than any optimisation.",
        },
        {
          question: "Do you get access to our code?",
          answer:
            "No. I need metadata: commit timestamps, pull request history, CI runs, tickets. No source code leaves your building, and that is in the contract.",
        },
        {
          question: "Can we start with the programme directly?",
          answer:
            "No. Without a baseline I implement measures whose effect nobody can evidence afterwards, which is the exact problem you arrived here with. The audit is four weeks and costs a fraction of the programme.",
        },
        {
          question: "How much of our time does the audit take?",
          answer:
            "Six to eight interviews of 30 minutes, one technical access in week 1, one closing session. Under ten hours on your side in total.",
        },
        {
          question: "Why not one of the off-the-shelf tools?",
          answer:
            "You can. After the audit you know which metrics are meaningful in your organisation. Before it, you buy a dashboard and only then find out which metrics you needed.",
        },
        {
          question: "Does this fit under 50 developers?",
          answer:
            "Rarely. Below 50 the data is too thin to separate change from noise, and you get the same answer more cheaply from a few conversations. Tell me your size in the first call and we settle it in five minutes.",
        },
        {
          question: "Do you take on plain engineering work?",
          answer:
            "Inside a running programme yes, and for existing clients anyway. I no longer sell it as a mandate of its own. If you are looking for frontend capacity, write anyway: either it fits into a programme, or I point you to someone.",
        },
      ],
    },
    engage: {
      heading: "Next step",
      lede: "20 minutes, no strings. I ask the questions, you decide afterwards. If your data won't carry an audit, you find that out in this call.",
      bookingTitle: "Rather talk it through?",
      bookingDesc: "20 minutes, no strings, straight into your calendar.",
      bookingCta: "Book a call",
      emailLabel: "Or by email",
      markdownLabel: "View this page as Markdown",
    },
    form: {
      heading: "Inquiry",
      name: "Name",
      namePlaceholder: "Your name",
      email: "Email",
      emailPlaceholder: "you@company.com",
      message: "What's this about?",
      messagePlaceholder:
        "A few lines on where you are: how many developers, which AI tools since when, and what has to be answered in the next budget round.",
      company: "Company",
      companyPlaceholder: "Company name",
      engagementType: "What this is about",
      engagementTypeOptions: [
        { value: "audit", label: "Impact audit (step 01)" },
        { value: "program", label: "Impact programme (step 02)" },
        { value: "advisory", label: "Ongoing advisory (step 03)" },
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
