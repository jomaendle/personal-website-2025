import Script from "next/script";

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
  description: string;
  author: {
    "@type": "Person";
    name: string;
    url: string;
  };
  datePublished: string;
  dateModified?: string;
  url: string;
  image?: string | undefined;
  articleBody: string;
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
    url: "https://jomaendle.com",
    sameAs: [
      "https://www.linkedin.com/in/johannes-maendle/",
      "https://github.com/jomaendle",
    ],
    description: "Full-Stack developer sharing his thoughts on the web.",
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
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  readTime?: string;
  content: string;
}) {
  const structuredData: BlogPostStructuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    author: {
      "@type": "Person",
      name: "Johannes Mändle",
      url: "https://jomaendle.com",
    },
    datePublished,
    dateModified: dateModified || datePublished,
    url,
    image,
    articleBody: content,
    wordCount: content.split(/\s+/).length,
    timeRequired: readTime ? `PT${readTime}` : undefined,
    publisher: {
      "@type": "Person",
      name: "Johannes Mändle",
      url: "https://jomaendle.com",
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
    ? "https://jomaendle.com/business"
    : "https://jomaendle.com/business/en";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${url}#service`,
    name: isDe
      ? "Freelance Frontend- & AI-Engineering — Jo Mändle"
      : "Freelance Frontend & AI Engineering — Jo Mändle",
    description: isDe
      ? "Senior Contract Engineering für Produktteams: React und Next.js auf Enterprise-Niveau, plus LLM-Integrationen, die es in die Produktion schaffen."
      : "Senior contract engineering for product teams: React and Next.js at enterprise scale, plus LLM integrations that actually reach production.",
    url,
    inLanguage: isDe ? "de-DE" : "en-US",
    image: "https://jomaendle.com/avatar.jpeg",
    priceRange: "€€",
    areaServed: [
      { "@type": "Country", name: "Germany" },
      { "@type": "Country", name: "Austria" },
      { "@type": "Country", name: "Switzerland" },
      { "@type": "Place", name: "Remote / EU" },
    ],
    provider: {
      "@type": "Person",
      "@id": "https://jomaendle.com#person",
      name: "Johannes Mändle",
      alternateName: ["Jo Mändle", "Jo Maendle", "Johannes Maendle"],
      jobTitle: isDe
        ? "Freelance Frontend- & AI-Engineer"
        : "Freelance Frontend & AI Engineer",
      url: "https://jomaendle.com",
      email: "mailto:me@jomaendle.com",
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
      knowsAbout: [
        "Next.js",
        "React",
        "TypeScript",
        "Frontend Architecture",
        "Large Language Models",
        "LLM Integration",
        "Model Context Protocol",
        "Web Performance",
        "Legacy Frontend Migration",
        "GDPR",
        "DSGVO",
      ],
      knowsLanguage: ["de", "en"],
    },
    serviceType: isDe
      ? [
          "Embedded Contract Engineering",
          "Frontend-Entwicklung (React, Next.js)",
          "KI- und LLM-Produktintegration",
          "Next.js-Architektur und Performance",
          "Frontend-Modernisierung und Migration",
        ]
      : [
          "Embedded contract engineering",
          "Frontend engineering (React, Next.js)",
          "AI and LLM product integration",
          "Next.js architecture and performance",
          "Frontend modernization and migration",
        ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: isDe ? "Projektanfrage" : "Business inquiries",
      email: "me@jomaendle.com",
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

export function WebsiteStructuredData() {
  const structuredData: WebsiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Jo Mändle | Building for the Web",
    url: "https://jomaendle.com",
    description: "Full-Stack developer sharing his thoughts on the web.",
    author: {
      "@type": "Person",
      name: "Johannes Mändle",
      url: "https://jomaendle.com",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://jomaendle.com/blog?search={search_term_string}",
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