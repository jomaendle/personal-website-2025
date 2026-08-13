/**
 * Bilingual copy for the AI-impact audit route (/ki-wirkung, /ai-impact).
 *
 * Same shape as `lib/state/business-copy.ts`: copy is data, the page component
 * is presentation only, and `lib/ai-impact-markdown.ts` renders the `.md`
 * mirrors from this file rather than from a hand-maintained template.
 *
 * Positioning: one self-contained offer, sold to whoever owns the budget line.
 * /business sells developer capacity to engineering leads; this page sells a
 * four-week measurement mandate to a VP Engineering or CTO. The two pages
 * deliberately share no sections and link to each other exactly once.
 *
 * Source text: `docs/ki-wirkung-copy.md`, with two sets of edits on top.
 *
 * First, the source uses em dashes, which the site's writing voice bans
 * outright. Each one is resolved into two sentences or a colon, the fix that
 * rule asks for.
 *
 * Second, a pass for register. The source reached for clipped fragments as
 * punchlines ("Zwei parallel, mehr nicht.", "Und was nicht.") and for swipes at
 * unnamed competitors ("Der Punkt, an dem andere Anbieter scheitern.", "Kein
 * Foliensatz, den nach vier Wochen niemand mehr öffnet."). Read by a VP
 * Engineering weighing a five-figure mandate, that is swagger rather than
 * confidence, so those lines are stated plainly instead. Every claim survives;
 * only the delivery changed.
 */

export type Lang = "de" | "en";

/**
 * The two values that go stale.
 *
 * Both appear in more than one place once the markdown mirrors are counted, so
 * they are interpolated rather than typed out. Change them here and the page,
 * both mirrors and the JSON-LD follow.
 *
 * A flat fixed price, deliberately without an "ab": the scope section pins the
 * engagement to 50 to 800 developers and four weeks, so the price can be a
 * commitment rather than an opening position. The figure follows the concept
 * document behind the page.
 *
 * `PRICE_EUR` is the number; the display strings are derived from it, and the
 * JSON-LD `offers` node in `components/structured-data.tsx` reads it directly.
 * That keeps the price a single value even though it renders in three shapes.
 */
export const PRICE_EUR = 18000;

const PRICE = {
  de: `${PRICE_EUR.toLocaleString("de-DE")} € Festpreis`,
  en: `€${PRICE_EUR.toLocaleString("en-US")} fixed price`,
};
const NEXT_SLOT = { de: "September 2026", en: "September 2026" };

interface LabelledItem {
  title: string;
  desc: string;
}

/** One week of the audit: mono week label, serif title, body. */
interface AuditWeek {
  label: string;
  title: string;
  desc: string;
}

/** One row of the scope table: mono term, body definition. */
interface ScopeRow {
  term: string;
  desc: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

export interface AiImpactCopy {
  /** Label on the language switch (the language it switches *to*). */
  switchTo: string;
  switchHref: string;
  switchLabel: string;
  /** Route of the page itself, for the top bar's self-link suppression. */
  path: string;
  markdownHref: string;
  markdownLabel: string;
  hero: {
    eyebrow: string;
    heading: string;
    lede: string;
    /** Next free audit slot, interpolated from `NEXT_SLOT`. */
    availability: string;
    cta: string;
    /** In-page jump to the audit section. Navigation, not a second CTA. */
    jumpLabel: string;
  };
  problem: { heading: string; items: LabelledItem[]; closing: string };
  audit: { heading: string; lede: string; weeks: AuditWeek[] };
  outcome: { heading: string; items: string[]; closing: string };
  /**
   * The measurement section. This is the page's argument, so it renders inside
   * the brand-tinted panel and carries two h3s instead of a flat body.
   */
  measurement: {
    heading: string;
    blocks: { title: string; paragraphs: string[] }[];
  };
  scope: { heading: string; priceLine: string; rows: ScopeRow[] };
  faq: { heading: string; items: FaqItem[] };
  close: {
    heading: string;
    lede: string;
    body: string;
    cta: string;
    emailLabel: string;
  };
}

export const AI_IMPACT_COPY: Record<Lang, AiImpactCopy> = {
  de: {
    switchTo: "EN",
    switchHref: "/ai-impact",
    switchLabel: "Switch to English",
    path: "/ki-wirkung",
    markdownHref: "/ki-wirkung.md",
    markdownLabel: "Diese Seite als Markdown ansehen",
    hero: {
      eyebrow: "Audit · 4 Wochen · Festpreis",
      heading: "Ihr Team arbeitet mit KI. Können Sie belegen, was es bringt?",
      lede: "Lizenzen sind gekauft, die Nutzung ist unklar, und in der nächsten Budgetrunde fragt jemand nach Zahlen. Ich messe in vier Wochen, was sich tatsächlich verändert hat und was nicht.",
      availability: `Nächster Audit-Slot: ${NEXT_SLOT.de}`,
      cta: "Erstgespräch buchen (20 Min)",
      jumpLabel: "Was im Audit passiert",
    },
    problem: {
      heading: "Woran Sie das erkennen",
      items: [
        {
          title: "Die Lizenzkosten stehen im Budget, der Nutzen nicht.",
          desc: "Sie zahlen pro Entwickler:in und Monat. Was zurückkommt, steht in keiner Zeile.",
        },
        {
          title: "Die Erfahrungsberichte widersprechen sich.",
          desc: "Zwei Teams sind begeistert, drei nutzen es nach der Einführungswoche nicht mehr. Niemand weiß, warum.",
        },
        {
          title: "Vorhandene Zahlen tragen nicht.",
          desc: "Akzeptierte Vorschläge und Nutzungsquoten sagen nichts über Durchlaufzeit, Reviewaufwand oder Fehlerrate im Betrieb.",
        },
      ],
      closing:
        "Das ist kein Toolproblem. Es ist ein Messproblem, und es lässt sich lösen, ohne einzelne Entwickler:innen zu bewerten.",
    },
    audit: {
      heading: "Das Audit",
      lede: "Vier Wochen, zwei Termine pro Woche, ein Ergebnisdokument.",
      weeks: [
        {
          label: "Woche 1",
          title: "Baseline",
          desc: "Auswertung von Git, CI und Ticketsystem der letzten zwölf Monate. Durchlaufzeit von Commit bis Produktion, Reviewdauer, Änderungsrate nach Merge, Rollbacks. Der Stand vor der KI-Einführung, aus vorhandenen Daten.",
        },
        {
          label: "Woche 2",
          title: "Ist-Aufnahme",
          desc: "Wo Agenten heute wirklich eingesetzt werden. Sechs bis acht Gespräche à 30 Minuten, quer durch Teams und Senioritäten. Das sind Gespräche und keine anonymisierte Umfrage.",
        },
        {
          label: "Woche 3",
          title: "Wirkungsanalyse",
          desc: "Dieselben Kennzahlen nach der Einführung, gegen die Baseline gestellt. Getrennt nach Team, Codebase-Alter und Aufgabentyp. Hier zeigt sich in der Regel, dass der Effekt nicht gleichmäßig verteilt ist.",
        },
        {
          label: "Woche 4",
          title: "Empfehlung",
          desc: "Wo ausgebaut wird, wo gestoppt, was die Blockade ist. Mit Aufwand und erwartetem Effekt pro Maßnahme.",
        },
      ],
    },
    outcome: {
      heading: "Was Sie danach in der Hand haben",
      items: [
        "Ein Kennzahlen-Set, das Ihr Team ohne mich fortschreiben kann: Definitionen, Abfragen, Skripte",
        "Baseline und Ist-Wert, belegt aus Systemdaten statt aus Selbstauskunft",
        "Eine Seite für die Geschäftsführung, die eine Budgetentscheidung trägt",
        "Drei bis fünf priorisierte Maßnahmen mit Aufwandsschätzung",
        "Alle Rohdaten und Auswertungsskripte, in Ihrem Repository",
      ],
      closing:
        "Die Ergebnisse liegen als Dokument und als Skripte vor, nicht als Foliensatz.",
    },
    measurement: {
      heading: "Warum diese Messung trägt",
      blocks: [
        {
          title: "Messung ohne Leistungskontrolle",
          paragraphs: [
            "Werkzeuge aus den USA messen pro Entwickler:in. In Deutschland ist das mitbestimmungspflichtig und in vielen Häusern der Grund, warum die Einführung im Betriebsrat hängen bleibt.",
            "Ich messe auf Team- und Repository-Ebene. Keine personenbezogene Auswertung, keine Rangliste, kein individuelles Profil. Das Kennzahlen-Set ist so aufgebaut, dass es einer Betriebsvereinbarung standhält. Die Beschreibung, die Sie dafür brauchen, liefere ich mit.",
          ],
        },
        {
          title: "Ich habe das selbst eingeführt, nicht nur bewertet",
          paragraphs: [
            "Als Principal Solution Architect in einem Konzern mit mehreren hundert Entwickler:innen, unter denselben Zwängen, die Sie kennen: Betriebsrat, Beschaffung, gewachsene Codebases, Teams mit Fristen.",
          ],
        },
      ],
    },
    scope: {
      heading: "Umfang und Preis",
      priceLine: `${PRICE.de} · 4 Wochen · remote, ein Tag vor Ort optional`,
      rows: [
        {
          term: "Enthalten",
          desc: "Datenauswertung, sechs bis acht Interviews, Ergebnisdokument, Abschlusspräsentation, Übergabe der Skripte.",
        },
        {
          term: "Nicht enthalten",
          desc: "Umsetzung der Maßnahmen. Das ist ein eigenes Mandat und Sie entscheiden danach, ob mit mir oder ohne.",
        },
        {
          term: "Passt, wenn",
          desc: "50 bis 800 Entwickler:innen, KI-Werkzeuge seit mindestens drei Monaten im Einsatz, Git und CI mit auswertbarer Historie.",
        },
        {
          term: "Passt nicht, wenn",
          desc: "Sie noch vor der Einführung stehen. Dann fehlt die Baseline und das Audit misst nichts. Sinnvoll wird es, sobald die Werkzeuge ein Quartal im Einsatz sind.",
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
          question: "Wie viel Zeit kostet uns das?",
          answer:
            "Sechs bis acht Interviews à 30 Minuten, ein technischer Zugang in Woche 1, ein Abschlusstermin. Zusammen unter zehn Stunden auf Ihrer Seite.",
        },
        {
          question: "Warum nicht eines der fertigen Werkzeuge?",
          answer:
            "Das können Sie tun. Nach dem Audit wissen Sie, welche Kennzahlen bei Ihnen aussagekräftig sind. Vorher kaufen Sie ein Dashboard und stellen erst danach fest, welche Kennzahlen Sie gebraucht hätten.",
        },
      ],
    },
    close: {
      heading: "Nächster Schritt",
      lede: "20 Minuten. Ich stelle Fragen, Sie entscheiden danach.",
      body: "Im Gespräch klären wir, ob Ihre Datenlage ein Audit überhaupt trägt. Wenn nicht, sage ich das im Gespräch und nicht nach der Beauftragung.",
      cta: "Termin wählen",
      emailLabel: "Alternativ per E-Mail",
    },
  },
  en: {
    switchTo: "DE",
    switchHref: "/ki-wirkung",
    switchLabel: "Zu Deutsch wechseln",
    path: "/ai-impact",
    markdownHref: "/ai-impact.md",
    markdownLabel: "View this page as Markdown",
    hero: {
      eyebrow: "Audit · 4 weeks · fixed price",
      heading: "Your team works with AI. Can you show what it returns?",
      lede: "The licences are paid for, the usage is unclear, and in the next budget round someone will ask for numbers. In four weeks I measure what actually changed and what didn't.",
      availability: `Next audit slot: ${NEXT_SLOT.en}`,
      cta: "Book an intro call (20 min)",
      jumpLabel: "What happens in the audit",
    },
    problem: {
      heading: "How you recognise it",
      items: [
        {
          title: "The licence cost is in the budget. The return is not.",
          desc: "You pay per developer per month. Nothing on the other side of that line is written down.",
        },
        {
          title: "The reports from your teams contradict each other.",
          desc: "Two teams are delighted, three stopped using it after the rollout week. Nobody knows why.",
        },
        {
          title: "The numbers you already have don't carry the decision.",
          desc: "Acceptance rates and usage quotas say nothing about lead time, review effort or failure rate in production.",
        },
      ],
      closing:
        "This is not a tooling problem. It is a measurement problem, and it can be solved without rating individual developers.",
    },
    audit: {
      heading: "The audit",
      lede: "Four weeks, two sessions a week, one written result.",
      weeks: [
        {
          label: "Week 1",
          title: "Baseline",
          desc: "Analysis of Git, CI and the ticket system over the last twelve months. Lead time from commit to production, review duration, change rate after merge, rollbacks. The state before AI arrived, from data you already hold.",
        },
        {
          label: "Week 2",
          title: "Current practice",
          desc: "Where agents are genuinely used today. Six to eight conversations of 30 minutes, across teams and seniority levels. These are conversations and not an anonymous survey.",
        },
        {
          label: "Week 3",
          title: "Impact analysis",
          desc: "The same metrics after the rollout, set against the baseline. Split by team, codebase age and type of work. This is usually where it becomes clear that the effect is not evenly distributed.",
        },
        {
          label: "Week 4",
          title: "Recommendation",
          desc: "Where to expand, where to stop, what the blocker is. With effort and expected effect for each measure.",
        },
      ],
    },
    outcome: {
      heading: "What you have at the end",
      items: [
        "A metric set your team can keep running without me: definitions, queries, scripts",
        "Baseline and current value, evidenced from system data rather than self-reporting",
        "One page for the executive board that can carry a budget decision",
        "Three to five prioritised measures with an effort estimate",
        "All raw data and analysis scripts, in your repository",
      ],
      closing:
        "The results come as a document and as scripts, not as a slide deck.",
    },
    measurement: {
      heading: "Why this measurement holds up",
      blocks: [
        {
          title: "Measurement without performance monitoring",
          paragraphs: [
            "Tools built in the US measure per developer. In Germany that triggers works council codetermination, and in many companies it is the reason a rollout stalls there.",
            "I measure at team and repository level. No personal analysis, no ranking, no individual profile. The metric set is built to hold up in a works agreement. I supply the description you need for it.",
          ],
        },
        {
          title: "I have introduced this myself, not only assessed it",
          paragraphs: [
            "As a Principal Solution Architect in a corporate group with several hundred developers, under the same constraints you know: works council, procurement, mature codebases, teams with deadlines.",
          ],
        },
      ],
    },
    scope: {
      heading: "Scope and price",
      priceLine: `${PRICE.en} · 4 weeks · remote, one day on site optional`,
      rows: [
        {
          term: "Included",
          desc: "Data analysis, six to eight interviews, written result, closing presentation, handover of the scripts.",
        },
        {
          term: "Not included",
          desc: "Implementing the measures. That is a separate mandate and you decide afterwards whether it runs with me or without.",
        },
        {
          term: "Fits if",
          desc: "50 to 800 developers, AI tools in use for at least three months, Git and CI with a history that can be queried.",
        },
        {
          term: "Does not fit if",
          desc: "You are still before the rollout. Then the baseline is missing and the audit measures nothing. It becomes worthwhile once the tools have been in use for a quarter.",
        },
      ],
    },
    faq: {
      heading: "Common questions",
      items: [
        {
          question: "What if the result comes out negative?",
          answer:
            "Then that is what the document says. An audit whose result is settled in advance is worth nothing. In that case you have solid grounds to reduce licences. That pays off faster than any optimisation.",
        },
        {
          question: "Do you get access to our code?",
          answer:
            "No. I need metadata: commit timestamps, pull request history, CI runs, tickets. No source code leaves your company, and that is in the contract.",
        },
        {
          question: "How much of our time does this cost?",
          answer:
            "Six to eight interviews of 30 minutes, one technical access in week 1, one closing session. Under ten hours on your side in total.",
        },
        {
          question: "Why not one of the off-the-shelf tools?",
          answer:
            "You can do that. After the audit you know which metrics are meaningful in your company. Before it, you buy a dashboard and only afterwards find out which metrics you needed.",
        },
      ],
    },
    close: {
      heading: "Next step",
      lede: "20 minutes. I ask the questions, you decide afterwards.",
      body: "In the call we work out whether your data even carries an audit. If it doesn't, I say so in the call and not after you have signed.",
      cta: "Pick a time",
      emailLabel: "Or by email",
    },
  },
};
