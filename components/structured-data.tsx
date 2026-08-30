import Script from "next/script";
import { SITE } from "@/lib/config/site";
import { BUSINESS_COPY, type Lang, PRICING } from "@/lib/state/business-copy";

const WHITESPACE = /\s+/;

interface PersonStructuredData {
  "@context": "https://schema.org";
  "@type": "Person";
  name: string;
  alternateName?: string[];
  jobTitle: string;
  url: string;
  sameAs: string[];
  description: string;
  worksFor?: {
    "@type": "Organization";
    name: string;
  };
}

interface BlogPostStructuredData {
  "@context": "https://schema.org";
  "@type": "BlogPosting";
  headline: string;
  description?: string | undefined;
  author: {
    "@type": "Person";
    name: string;
    url: string;
  };
  datePublished: string;
  dateModified?: string;
  url: string;
  image?: string | undefined;
  articleBody?: string | undefined;
  wordCount?: number | undefined;
  timeRequired?: string | undefined;
  publisher: {
    "@type": "Person";
    name: string;
    url: string;
  };
}

interface WebsiteStructuredData {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  description: string;
  author: {
    "@type": "Person";
    name: string;
    url: string;
  };
  potentialAction: {
    "@type": "SearchAction";
    target: {
      "@type": "EntryPoint";
      urlTemplate: string;
    };
    "query-input": string;
  };
}

export function PersonStructuredData() {
  const structuredData: PersonStructuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Johannes Mändle",
    alternateName: [
      "Jo Mändle",
      "jo maendle",
      "johannes maendle",
      "Jo Maendle",
      "Johannes Maendle",
    ],
    jobTitle: "Principal Solution Architect",
    url: "https://www.jomaendle.com",
    sameAs: [
      "https://www.linkedin.com/in/johannes-maendle/",
      "https://github.com/jomaendle",
    ],
    description:
      "Full-stack engineer writing about the web platform and building software with AI.",
  };

  return (
    <Script
      id="person-structured-data"
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD scripts can only be injected this way; the payload is JSON.stringify of locally-defined data, never user input
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
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
  const structuredData: BlogPostStructuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    author: {
      "@type": "Person",
      name: "Johannes Mändle",
      url: "https://www.jomaendle.com",
    },
    datePublished,
    dateModified: dateModified || datePublished,
    url,
    image,
    articleBody: content,
    wordCount: content ? content.split(WHITESPACE).length : undefined,
    timeRequired: readTime ? `PT${readTime}` : undefined,
    publisher: {
      "@type": "Person",
      name: "Johannes Mändle",
      url: "https://www.jomaendle.com",
    },
  };

  return (
    <Script
      id="blog-post-structured-data"
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD scripts can only be injected this way; the payload is JSON.stringify of locally-defined data, never user input
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}

/**
 * `Service` + `FAQPage` JSON-LD for /business.
 *
 * Two graph nodes in one script. The `Service` describes the offer and its
 * provider and carries the three ladder rungs as an `OfferCatalog`; the
 * `FAQPage` is generated from the same `BUSINESS_COPY.faq` the page renders,
 * so the markup can never answer a question the page does not ask. Google
 * retired FAQ rich results in 2026, but the type is still valid and is read by
 * the AI crawlers `app/robots.ts` admits by name.
 *
 * Prices come from `PRICING` rather than from the display strings, so the
 * markup cannot drift from the page when a number moves. The audit is a
 * one-off figure; the other two rungs are monthly, which is why they carry a
 * `UnitPriceSpecification` with a `MON` billing duration rather than a bare
 * price. The programme is a band, so it states min and max instead of a point.
 */
export function BusinessStructuredData({ lang }: { lang: Lang }) {
  const isDe = lang === "de";
  const t = BUSINESS_COPY[lang];
  const url = isDe
    ? "https://www.jomaendle.com/business"
    : "https://www.jomaendle.com/business/en";

  /** One offer per rung, priced from `PRICING`. */
  const offers = [
    {
      "@type": "Offer",
      name: t.ladder.tiers[0]?.name,
      description: t.ladder.tiers[0]?.audience,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: PRICING.audit,
        priceCurrency: "EUR",
      },
    },
    {
      "@type": "Offer",
      name: t.ladder.tiers[1]?.name,
      description: t.ladder.tiers[1]?.audience,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        minPrice: PRICING.program.small,
        maxPrice: PRICING.program.large,
        priceCurrency: "EUR",
        billingDuration: 1,
        billingIncrement: 1,
        unitCode: "MON",
      },
    },
    {
      "@type": "Offer",
      name: t.ladder.tiers[2]?.name,
      description: t.ladder.tiers[2]?.audience,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: PRICING.advisory,
        priceCurrency: "EUR",
        billingDuration: 1,
        billingIncrement: 1,
        unitCode: "MON",
      },
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${url}#service`,
        name: isDe
          ? "KI im Engineering: Messung, Einführung und Begleitung · Jo Mändle"
          : "AI in engineering: measurement, rollout and advisory · Jo Mändle",
        description: t.hero.lede,
        url,
        inLanguage: isDe ? "de-DE" : "en-US",
        image: "https://www.jomaendle.com/avatar.jpeg",
        // Team- and repository-level only. Stating the category this way keeps
        // the markup in step with the page's central claim: no per-developer
        // analysis, which is what makes it survivable under § 87 BetrVG.
        serviceType: isDe
          ? [
              "Audit der KI-Wirkung in der Softwareentwicklung",
              "Einführung KI-nativer Entwicklung",
              "Engineering-Kennzahlen ohne personenbezogene Auswertung",
              "Begleitung von Engineering-Organisationen",
            ]
          : [
              "Audit of AI impact on software delivery",
              "AI-native development rollout",
              "Engineering metrics without per-developer analysis",
              "Ongoing engineering advisory",
            ],
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
        areaServed: [
          { "@type": "Country", name: "Germany" },
          { "@type": "Country", name: "Austria" },
          { "@type": "Country", name: "Switzerland" },
          { "@type": "Place", name: "Remote / EU" },
        ],
        audience: {
          "@type": "BusinessAudience",
          audienceType: isDe
            ? "VP Engineering, CTO, Budgetverantwortliche"
            : "VP Engineering, CTO, budget owners",
          numberOfEmployees: {
            "@type": "QuantitativeValue",
            minValue: 50,
            maxValue: 800,
            unitText: isDe ? "Entwickler:innen" : "developers",
          },
        },
        provider: {
          "@type": "Person",
          "@id": "https://www.jomaendle.com#person",
          name: "Johannes Mändle",
          alternateName: ["Jo Mändle", "Jo Maendle", "Johannes Maendle"],
          jobTitle: "Principal Solution Architect",
          url: "https://www.jomaendle.com",
          email: `mailto:${SITE.contact.email}`,
          address: {
            "@type": "PostalAddress",
            streetAddress: "Im Hirschmorgen 12",
            postalCode: "69181",
            addressLocality: "Leimen",
            addressCountry: "DE",
          },
          sameAs: [
            "https://www.linkedin.com/in/johannes-maendle/",
            "https://github.com/jomaendle",
          ],
          // Kept in step with the terms listed under the third credibility
          // block in `lib/state/business-copy.ts`: if a technology is claimed
          // there, it belongs here too.
          knowsAbout: [
            "AI-native Software Development",
            "Large Language Models",
            "LLM Integration",
            "Model Context Protocol",
            "Engineering Metrics",
            "DORA Metrics",
            "Developer Productivity Measurement",
            "Works Council Compliance",
            "Betriebsvereinbarung",
            "Next.js",
            "React",
            "Angular",
            "Vue.js",
            "Astro",
            "TypeScript",
            "Node.js",
            "NestJS",
            "Frontend Architecture",
            "Automated Testing",
            "GDPR",
            "DSGVO",
          ],
          knowsLanguage: ["de", "en"],
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: t.ladder.heading,
          itemListElement: offers,
        },
        potentialAction: {
          "@type": "ReserveAction",
          name: t.hero.ctaPrimary,
          target: SITE.contact.booking,
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: isDe ? "Projektanfrage" : "Business inquiries",
          email: SITE.contact.email,
          url: `${url}#engage`,
          availableLanguage: ["de", "en"],
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

  const scriptProps = {
    id: `business-structured-data-${lang}`,
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(structuredData) },
  };
  return <Script {...scriptProps} />;
}

export function WebsiteStructuredData() {
  const structuredData: WebsiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Jo Mändle | Building for the Web",
    url: "https://www.jomaendle.com",
    description:
      "Full-stack engineer writing about the web platform and building software with AI.",
    author: {
      "@type": "Person",
      name: "Johannes Mändle",
      url: "https://www.jomaendle.com",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://www.jomaendle.com/blog?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Script
      id="website-structured-data"
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD scripts can only be injected this way; the payload is JSON.stringify of locally-defined data, never user input
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
