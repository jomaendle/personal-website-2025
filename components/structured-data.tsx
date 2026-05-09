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
    jobTitle: "Full-Stack Developer",
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
      ? "Webentwicklung für Unternehmen — Jo Mändle"
      : "Web Development for Businesses — Jo Mändle",
    description: isDe
      ? "Senior Full-Stack Developer für kleine und mittelständische Unternehmen. Next.js, React, TypeScript. DSGVO-bewusst, performant, wartbar."
      : "Senior full-stack developer for small and mid-sized businesses. Next.js, React, TypeScript. GDPR-aware, performant, maintainable.",
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
        ? "Full-Stack Developer für Unternehmen"
        : "Full-Stack Developer for Businesses",
      url: "https://jomaendle.com",
      email: "mailto:hello@jomaendle.com",
      sameAs: [
        "https://www.linkedin.com/in/johannes-maendle/",
        "https://github.com/jomaendle",
      ],
      knowsAbout: [
        "Next.js",
        "React",
        "TypeScript",
        "Static Site Generation",
        "Web Performance",
        "GDPR",
        "DSGVO",
        "Headless CMS",
        "SEO",
      ],
      knowsLanguage: ["de", "en"],
    },
    serviceType: isDe
      ? [
          "Website-Relaunch",
          "Next.js-Entwicklung",
          "Performance-Audit",
          "API- und CMS-Integration",
          "Wartung und Weiterentwicklung",
          "Technisches SEO",
        ]
      : [
          "Website rebuild",
          "Next.js development",
          "Performance audit",
          "API and CMS integration",
          "Maintenance and iteration",
          "Technical SEO",
        ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: isDe ? "Vertrieb" : "Sales",
      email: "hello@jomaendle.com",
      url: "https://www.linkedin.com/in/johannes-maendle/",
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