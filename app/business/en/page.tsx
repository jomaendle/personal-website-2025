import type { Metadata } from "next";
import { BusinessContent } from "@/components/business/business-content";
import { BusinessStructuredData } from "@/components/structured-data";

export const dynamic = "force-static";

const description =
  "Senior full-stack developer for small and mid-sized businesses. Next.js, React, TypeScript. GDPR-aware, performant, maintainable.";

export const metadata: Metadata = {
  title: "Web Development for Businesses",
  description,
  keywords: [
    "Next.js developer",
    "Freelance full-stack developer",
    "GDPR-compliant website",
    "Real estate website",
    "SaaS marketing site",
    "Astro developer",
  ],
  alternates: {
    canonical: "/business/en",
    languages: {
      de: "/business",
      en: "/business/en",
    },
    types: {
      "text/markdown": "/business/en.md",
    },
  },
  openGraph: {
    title: "Web Development for Businesses | Jo Mändle",
    description,
    url: "https://jomaendle.com/business/en",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Development for Businesses | Jo Mändle",
    description,
  },
};

export default function BusinessEnPage() {
  return (
    <>
      <BusinessStructuredData lang="en" />
      <BusinessContent lang="en" />
    </>
  );
}
