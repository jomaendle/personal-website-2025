import type { Metadata } from "next";
import { BusinessContent } from "@/components/business/business-content";
import { BusinessStructuredData } from "@/components/structured-data";

export const dynamic = "force-static";

const title = "Freelance Frontend- & AI-Engineering";
// "Frontend-Engineering auf Enterprise-Niveau" rather than naming React and
// Next.js as the enterprise stack: the enterprise years are Vue and NestJS at
// E.ON plus Micro Focus, while React and Next.js are the client work.
const description =
  "Senior Contract Engineering für Produktteams: Frontend-Engineering auf Enterprise-Niveau, plus LLM-Integrationen, die es in die Produktion schaffen.";

const ogImage = `/api/og-image?title=${encodeURIComponent(
  "Freelance Frontend & AI Engineering",
)}&description=${encodeURIComponent(
  "Frontend auf Enterprise-Niveau. Und KI, die in Produktion geht.",
)}`;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Freelance Frontend Engineer",
    "Next.js Freelancer",
    "React Contract Engineering",
    "Angular Freelancer",
    "Astro Entwickler",
    "LLM Integration Entwickler",
    "AI Engineering Freelance",
    "KI-native Entwicklung",
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
