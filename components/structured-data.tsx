import Script from "next/script";
import { SITE } from "@/lib/config/site";
import { AI_IMPACT_COPY, type Lang } from "@/lib/state/ai-impact-copy";

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
    wordCount: content ? content.split(/\s+/).length : undefined,
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
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
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
    areaServed: [
      { "@type": "Country", name: "Germany" },
      { "@type": "Country", name: "Austria" },
      { "@type": "Country", name: "Switzerland" },
      { "@type": "Place", name: "Remote / EU" },
    ],
    provider: {
      "@type": "Person",
      "@id": "https://www.jomaendle.com#person",
      name: "Johannes Mändle",
      alternateName: ["Jo Mändle", "Jo Maendle", "Johannes Maendle"],
      jobTitle: isDe
        ? "Freelance Frontend- & AI-Engineer"
        : "Freelance Frontend & AI Engineer",
      url: "https://www.jomaendle.com",
      email: "mailto:business@jomaendle.com",
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
      // Kept in step with the stack table in `lib/state/business-copy.ts`: if a
      // technology is claimed there, it belongs here too.
      knowsAbout: [
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
      ],
      knowsLanguage: ["de", "en"],
    },
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

  const scriptProps = {
    id: `business-structured-data-${lang}`,
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(structuredData) },
  };
  return <Script {...scriptProps} />;
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
 * No `offers`: the published price is an entry point ("ab 10.000 €"), and a
 * `PriceSpecification` would state it as the price of every engagement.
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
        },
        provider: {
          "@type": "Person",
          "@id": "https://www.jomaendle.com#person",
          name: "Johannes Mändle",
          alternateName: ["Jo Mändle", "Jo Maendle", "Johannes Maendle"],
          jobTitle: "Principal Solution Architect",
          url: "https://www.jomaendle.com",
          email: `mailto:${SITE.contact.email}`,
          sameAs: [
            "https://www.linkedin.com/in/johannes-maendle/",
            "https://github.com/jomaendle",
          ],
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

  const scriptProps = {
    id: `ai-impact-structured-data-${lang}`,
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
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
