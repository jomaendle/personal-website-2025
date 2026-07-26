import type { Metadata } from "next";
import { BusinessContent } from "@/components/business/business-content";
import { BusinessStructuredData } from "@/components/structured-data";

export const dynamic = "force-static";

const title = "Freelance Frontend- & AI-Engineering";
const description =
  "Senior Contract Engineering für Produktteams: React und Next.js auf Enterprise-Niveau, plus LLM-Integrationen, die es in die Produktion schaffen.";

const ogImage = `/api/og-image?title=${encodeURIComponent(
  "Freelance Frontend & AI Engineering",
)}&description=${encodeURIComponent(
  "React/Next.js auf Enterprise-Niveau — und KI, die wirklich ausliefert.",
)}`;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Freelance Frontend Engineer",
    "Next.js Freelancer",
    "React Contract Engineering",
    "LLM Integration Entwickler",
    "AI Engineering Freelance",
    "TypeScript Contractor",
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
    title: `${title} | Jo Mändle`,
    description,
    url: "https://jomaendle.com/business",
    locale: "de_DE",
    type: "website",
    images: [{ url: ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | Jo Mändle`,
    description,
    images: [ogImage],
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
