import Script from "next/script";

interface PersonStructuredData {
  "@context": "https://schema.org";
  "@type": "Person";
  name: string;
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