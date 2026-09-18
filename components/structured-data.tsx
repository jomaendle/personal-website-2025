import {
  ALTERNATE_NAMES,
  AREA_SERVED,
  BASE_URL,
  CONTACT_POINTS,
  ID,
  KNOWS_ABOUT,
  LEGAL_NAME,
  OFFERS,
  POSTAL_ADDRESS,
  SAME_AS,
} from "@/lib/config/identity";
import { SITE } from "@/lib/config/site";
import {
  AI_IMPACT_COPY,
  type Lang,
  PRICE_EUR,
} from "@/lib/state/ai-impact-copy";

const WHITESPACE = /\s+/;

/**
 * A real `<script type="application/ld+json">` in the server HTML.
 *
 * This used to be `next/script`. With the default `afterInteractive` strategy
 * the tag never reaches the server-rendered document — it only exists inside
 * the RSC flight payload and is injected by the client runtime. Every crawler
 * that reads HTML without executing JavaScript therefore saw a site with zero
 * structured data, which is exactly the audience JSON-LD is written for. A
 * plain `<script>` is server-rendered, costs nothing, and is what schema.org
 * consumers expect.
 */
function JsonLd({ id, data }: { id: string; data: unknown }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD scripts can only be injected this way; the payload is JSON.stringify of locally-defined data, never user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface BlogPostStructuredData {
  "@type": "BlogPosting";
  "@id": string;
  headline: string;
  description?: string | undefined;
  author: { "@id": string };
  datePublished: string;
  dateModified?: string;
  url: string;
  image?: string | undefined;
  articleBody?: string | undefined;
  wordCount?: number | undefined;
  timeRequired?: string | undefined;
  publisher: { "@id": string };
  isPartOf: { "@id": string };
  mainEntityOfPage: string;
  inLanguage: string;
}

/**
 * The site-wide identity graph: the person, the practice, and the site.
 *
 * One `@graph` rather than three scripts, so a consumer that reads only the
 * first JSON-LD block still gets all of it, and so every node can refer to the
 * others by `@id`. `contactPoint` and `address` are here because they are what
 * an agent checks before it recommends a business to someone; `sameAs` is what
 * lets it confirm the GitHub and LinkedIn profiles are the same person.
 */
export function SiteIdentityStructuredData() {
  const person = {
    "@type": "Person",
    "@id": ID.person,
    name: LEGAL_NAME,
    alternateName: ALTERNATE_NAMES,
    jobTitle: SITE.shortRole,
    description: SITE.description,
    url: BASE_URL,
    mainEntityOfPage: BASE_URL,
    image: `${BASE_URL}/avatar.jpeg`,
    email: `mailto:${SITE.contact.email}`,
    address: POSTAL_ADDRESS,
    sameAs: SAME_AS,
    knowsAbout: KNOWS_ABOUT,
    knowsLanguage: ["de", "en"],
    worksFor: { "@type": "Organization", name: "E.ON Digital Technology" },
  };

  const organization = {
    "@type": "Organization",
    "@id": ID.organization,
    name: `${SITE.name} · Freelance Frontend & AI Engineering`,
    legalName: LEGAL_NAME,
    description:
      "Independent frontend and AI engineering practice: embedded contract engineering with product teams, and audits of what AI changed in a delivery org.",
    url: `${BASE_URL}/business/en`,
    logo: `${BASE_URL}/avatar.jpeg`,
    image: `${BASE_URL}/avatar.jpeg`,
    email: `mailto:${SITE.contact.email}`,
    address: POSTAL_ADDRESS,
    areaServed: AREA_SERVED,
    contactPoint: CONTACT_POINTS,
    sameAs: SAME_AS,
    knowsAbout: KNOWS_ABOUT,
    founder: { "@id": ID.person },
    // A one-person practice. Saying so is more useful to an agent sizing the
    // seat than leaving it to be inferred from the prose.
    numberOfEmployees: { "@type": "QuantitativeValue", value: 1 },
  };

  const website = {
    "@type": "WebSite",
    "@id": ID.website,
    name: "Jo Mändle | Building for the Web",
    url: BASE_URL,
    description: SITE.description,
    inLanguage: "en",
    author: { "@id": ID.person },
    publisher: { "@id": ID.person },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/blog?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [person, organization, website],
  };

  return <JsonLd id="site-identity-structured-data" data={structuredData} />;
}

/**
 * Homepage-only nodes: what this page is, what is on offer, and which part of
 * it a voice assistant should read out.
 *
 * The identity graph above is site-wide and says who Jo is. This one says what
 * the homepage itself is (`ProfilePage`), names the two published offers as
 * `Service` nodes pointing at their own pages, and marks the About section as
 * `speakable`. The CSS selectors are the ones `app/page.tsx` renders, so a
 * consumer reading them aloud gets the About paragraph and nothing else.
 */
export function HomepageStructuredData() {
  const services = OFFERS.map((offer) => ({
    "@type": "Service",
    "@id": `${BASE_URL}${offer.path}#service`,
    name: offer.name,
    description: offer.description,
    url: `${BASE_URL}${offer.path}`,
    provider: { "@id": ID.organization },
    areaServed: AREA_SERVED,
    ...(offer.price === null
      ? {}
      : {
          offers: {
            "@type": "Offer",
            price: offer.price,
            priceCurrency: "EUR",
            url: `${BASE_URL}${offer.path}`,
          },
        }),
  }));

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${BASE_URL}#webpage`,
        url: BASE_URL,
        name: SITE.name,
        description: SITE.description,
        inLanguage: "en",
        isPartOf: { "@id": ID.website },
        about: { "@id": ID.person },
        mainEntity: { "@id": ID.person },
        primaryImageOfPage: `${BASE_URL}/avatar.jpeg`,
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["#main-content h2", "#main-content section p"],
        },
        // The markdown twin, advertised where an agent that already parsed the
        // JSON-LD will see it without a second discovery round.
        encoding: {
          "@type": "MediaObject",
          encodingFormat: "text/markdown",
          contentUrl: `${BASE_URL}/index.md`,
        },
      },
      ...services,
      {
        "@type": "Blog",
        "@id": `${BASE_URL}/blog#blog`,
        url: `${BASE_URL}/blog`,
        name: "Jo Mändle · Writing",
        description:
          "Notes on building for the web, lately with Claude Code and agent-facing infrastructure.",
        inLanguage: "en",
        author: { "@id": ID.person },
        publisher: { "@id": ID.person },
      },
    ],
  };

  return <JsonLd id="homepage-structured-data" data={structuredData} />;
}

/**
 * `BlogPosting` JSON-LD for a single article.
 *
 * `description` and `content` are optional because the article layout only has
 * the title, slug and date to hand — the MDX body never reaches it as a string.
 * Omitting `articleBody` is deliberate rather than a gap: duplicating a whole
 * post into the head would add kilobytes to every article for a property search
 * engines already read from the rendered page.
 */
export function BlogPostStructuredData({
  title,
  description,
  url,
  datePublished,
  dateModified,
  image,
  readTime,
  content,
}: {
  title: string;
  description?: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  readTime?: string;
  content?: string;
}) {
  const article: BlogPostStructuredData = {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: title,
    description,
    author: { "@id": ID.person },
    datePublished,
    dateModified: dateModified || datePublished,
    url,
    image,
    articleBody: content,
    wordCount: content ? content.split(WHITESPACE).length : undefined,
    timeRequired: readTime ? `PT${readTime}` : undefined,
    publisher: { "@id": ID.person },
    isPartOf: { "@id": `${BASE_URL}/blog#blog` },
    mainEntityOfPage: url,
    inLanguage: "en",
  };

  // Articles sit two levels down. Spelling that out costs a few bytes and
  // saves an agent from inferring the hierarchy from the URL.
  const breadcrumbs = {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumbs`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Writing",
        item: `${BASE_URL}/blog`,
      },
      { "@type": "ListItem", position: 3, name: title, item: url },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [article, breadcrumbs],
  };

  return <JsonLd id="blog-post-structured-data" data={structuredData} />;
}

export function BusinessStructuredData({ lang }: { lang: "de" | "en" }) {
  const isDe = lang === "de";
  const url = isDe
    ? "https://www.jomaendle.com/business"
    : "https://www.jomaendle.com/business/en";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${url}#service`,
    name: isDe
      ? "Freelance Frontend- & AI-Engineering · Jo Mändle"
      : "Freelance Frontend & AI Engineering · Jo Mändle",
    // The enterprise track record is Vue/NestJS at E.ON and Micro Focus; the
    // React and Next.js work is client-side (ImmoKäpsele, Memberspot). So the
    // claim is frontend engineering at enterprise scale, not React and Next.js
    // *as* the enterprise stack. The page body says the same thing.
    description: isDe
      ? "Senior Contract Engineering für Produktteams: Frontend-Engineering auf Enterprise-Niveau, plus LLM-Integrationen, die es in die Produktion schaffen."
      : "Senior contract engineering for product teams: frontend engineering at enterprise scale, plus LLM integrations that reach production.",
    url,
    inLanguage: isDe ? "de-DE" : "en-US",
    image: "https://www.jomaendle.com/avatar.jpeg",
    // No `priceRange`: the site publishes no rate, and the "€€" convention is a
    // restaurant-tier signal that would say something untrue about the seat.
    areaServed: AREA_SERVED,
    // The person node is defined once, site-wide, in the identity graph. This
    // page carries the same `@id` with only the role phrased for its language,
    // so a consumer merges the two instead of seeing two people.
    provider: {
      "@type": "Person",
      "@id": ID.person,
      name: LEGAL_NAME,
      alternateName: ALTERNATE_NAMES,
      jobTitle: isDe
        ? "Freelance Frontend- & AI-Engineer"
        : "Freelance Frontend & AI Engineer",
      url: BASE_URL,
      email: `mailto:${SITE.contact.email}`,
      address: POSTAL_ADDRESS,
      sameAs: SAME_AS,
      knowsAbout: KNOWS_ABOUT,
      knowsLanguage: ["de", "en"],
    },
    parentOrganization: { "@id": ID.organization },
    serviceType: isDe
      ? [
          "Embedded Contract Engineering",
          "Frontend-Entwicklung (React, Next.js, Angular, Vue, Astro)",
          "KI-native Entwicklung und Team-Enablement",
          "KI- und LLM-Produktintegration",
          "Frontend-Architektur, Performance und Barrierefreiheit",
          "Frontend-Modernisierung und Migration",
        ]
      : [
          "Embedded contract engineering",
          "Frontend engineering (React, Next.js, Angular, Vue, Astro)",
          "AI-native development and team enablement",
          "AI and LLM product integration",
          "Frontend architecture, performance and accessibility",
          "Frontend modernization and migration",
        ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: isDe ? "Projektanfrage" : "Business inquiries",
      email: "business@jomaendle.com",
      url: `${url}#engage`,
      availableLanguage: ["de", "en"],
    },
  };

  return (
    <JsonLd id={`business-structured-data-${lang}`} data={structuredData} />
  );
}

/**
 * `Service` + `FAQPage` JSON-LD for the AI impact audit route.
 *
 * Two graph nodes in one script. The `Service` describes the mandate and its
 * provider; the `FAQPage` is generated from the same `AI_IMPACT_COPY.faq` the
 * page renders, so the markup can never answer a question the page does not
 * ask. Google retired FAQ rich results in 2026, but the type is still valid
 * and is read by the AI crawlers `app/robots.ts` admits by name, which is the
 * audience this page is written for.
 *
 * The `offers` node carries the price because the page publishes a flat fixed
 * price. It reads `PRICE_EUR` from the copy module, so the number cannot
 * drift from what the page and the markdown mirrors display. (An earlier
 * version priced the audit as an "ab" entry point, which is why `offers` was
 * initially omitted.)
 */
export function AiImpactStructuredData({ lang }: { lang: Lang }) {
  const isDe = lang === "de";
  const t = AI_IMPACT_COPY[lang];
  const url = `https://www.jomaendle.com${t.path}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: isDe
          ? "KI-Wirkung im Engineering messen · 4-Wochen-Audit"
          : "Measuring AI impact in engineering · 4-week audit",
        description: t.hero.lede,
        url,
        inLanguage: isDe ? "de-DE" : "en-US",
        serviceType: isDe
          ? "Audit der KI-Wirkung in der Softwareentwicklung"
          : "Audit of AI impact on software delivery",
        // Team- and repository-level only. Stating the category this way keeps
        // the markup in step with the page's central claim: no per-developer
        // analysis, which is what makes it survivable under § 87 BetrVG.
        category: isDe
          ? [
              "Engineering-Kennzahlen",
              "DORA-Metriken",
              "KI-Einsatz in der Softwareentwicklung",
              "Messung ohne personenbezogene Auswertung",
            ]
          : [
              "Engineering metrics",
              "DORA metrics",
              "AI adoption in software delivery",
              "Measurement without per-developer analysis",
            ],
        areaServed: AREA_SERVED,
        audience: {
          "@type": "BusinessAudience",
          audienceType: isDe
            ? "VP Engineering, CTO, Budgetverantwortliche"
            : "VP Engineering, CTO, budget owners",
        },
        provider: {
          "@type": "Person",
          "@id": ID.person,
          name: LEGAL_NAME,
          alternateName: ALTERNATE_NAMES,
          jobTitle: SITE.shortRole,
          url: BASE_URL,
          email: `mailto:${SITE.contact.email}`,
          address: POSTAL_ADDRESS,
          sameAs: SAME_AS,
        },
        offers: {
          "@type": "Offer",
          price: PRICE_EUR,
          priceCurrency: "EUR",
          url,
        },
        potentialAction: {
          "@type": "ReserveAction",
          name: t.hero.cta,
          target: SITE.contact.booking,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        inLanguage: isDe ? "de-DE" : "en-US",
        mainEntity: t.faq.items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };

  return (
    <JsonLd id={`ai-impact-structured-data-${lang}`} data={structuredData} />
  );
}

/**
 * `ContactPage` JSON-LD.
 *
 * A trust anchor as much as a description: an agent deciding whether to put a
 * business in front of someone looks for a contact page with a real address and
 * a named contact point, and this says where both live.
 */
export function ContactStructuredData({ url }: { url: string }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${url}#contactpage`,
    url,
    name: `Contact · ${SITE.name}`,
    description:
      "Email, a booking link and a postal address — the three ways to reach Jo Mändle.",
    inLanguage: "en",
    isPartOf: { "@id": ID.website },
    about: { "@id": ID.organization },
    mainEntity: {
      "@id": ID.organization,
      contactPoint: CONTACT_POINTS,
      address: POSTAL_ADDRESS,
    },
  };

  return <JsonLd id="contact-structured-data" data={structuredData} />;
}

/**
 * `Offer` JSON-LD for /pricing.
 *
 * Only the audit carries a `price`. The contract engineering seat gets an
 * `Offer` with `availability` and a `url` and no number at all, because the
 * site publishes no day rate — a made-up `priceRange` here would be the one
 * kind of lie structured data is least forgiving of.
 */
export function PricingStructuredData() {
  const url = `${BASE_URL}/pricing`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `Pricing · ${SITE.name}`,
        description:
          "One published fixed price — the four-week AI impact audit — and what is quoted per engagement instead.",
        inLanguage: "en",
        isPartOf: { "@id": ID.website },
        about: { "@id": ID.organization },
      },
      ...OFFERS.map((offer) => ({
        "@type": "Offer",
        "@id": `${url}#${offer.id}`,
        name: offer.name,
        description: offer.description,
        url: `${BASE_URL}${offer.path}`,
        priceCurrency: "EUR",
        offeredBy: { "@id": ID.organization },
        areaServed: AREA_SERVED,
        ...(offer.price === null
          ? {
              priceSpecification: {
                "@type": "PriceSpecification",
                priceCurrency: "EUR",
                valueAddedTaxIncluded: false,
                description:
                  "Quoted per engagement. Billed by the day, invoiced monthly.",
              },
            }
          : {
              price: offer.price,
              priceSpecification: {
                "@type": "PriceSpecification",
                price: offer.price,
                priceCurrency: "EUR",
                valueAddedTaxIncluded: false,
              },
            }),
      })),
    ],
  };

  return <JsonLd id="pricing-structured-data" data={structuredData} />;
}
