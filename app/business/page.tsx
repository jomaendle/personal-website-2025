import type { Metadata } from "next";
import { BusinessContent } from "@/components/business/business-content";
import { BusinessStructuredData } from "@/components/structured-data";

export const dynamic = "force-static";

const description =
  "Senior Full-Stack Developer für kleine und mittelständische Unternehmen. Next.js, React, TypeScript. DSGVO-bewusst, performant, wartbar.";

export const metadata: Metadata = {
  title: "Webentwicklung für Unternehmen",
  description,
  keywords: [
    "Webentwicklung Stuttgart",
    "Next.js Entwickler",
    "Freelance Full-Stack Developer",
    "DSGVO konforme Website",
    "Maklerwebsite",
    "SaaS Website",
  ],
  alternates: {
    canonical: "/business",
    languages: {
      de: "/business",
      en: "/business/en",
    },
    types: {
      "text/markdown": "/business.md",
    },
  },
  openGraph: {
    title: "Webentwicklung für Unternehmen | Jo Mändle",
    description,
    url: "https://jomaendle.com/business",
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Webentwicklung für Unternehmen | Jo Mändle",
    description,
  },
};

export default function BusinessPage() {
  return (
    <>
      <BusinessStructuredData lang="de" />
      <BusinessContent lang="de" />
    </>
  );
}
