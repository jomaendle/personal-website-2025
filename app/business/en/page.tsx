import type { Metadata } from "next";
import { BusinessContent } from "@/components/business/business-content";
import { BusinessStructuredData } from "@/components/structured-data";

export const dynamic = "force-static";

const title = "Freelance Frontend & AI Engineering";
// "Frontend engineering at enterprise scale" rather than naming React and
// Next.js as the enterprise stack: the enterprise years are Vue and NestJS at
// E.ON plus Micro Focus, while React and Next.js are the client work.
const description =
  "Senior contract engineering for product teams: frontend engineering at enterprise scale, plus LLM integrations that reach production.";

const ogImage = `/api/og-image?title=${encodeURIComponent(
  "Freelance Frontend & AI Engineering",
)}&description=${encodeURIComponent(
  "Frontend at enterprise scale. And AI that reaches production.",
)}`;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Freelance frontend engineer",
    "Next.js contractor",
    "React contract engineering",
    "Angular contractor",
    "Astro developer",
    "LLM integration developer",
    "AI engineering freelance",
    "AI-native development",
    "TypeScript contractor",
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
    title: `${title} | Jo Mändle`,
    description,
    url: "https://www.jomaendle.com/business/en",
    locale: "en_US",
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

export default function BusinessEnPage() {
  return (
    <>
      <BusinessStructuredData lang="en" />
      <BusinessContent lang="en" />
    </>
  );
}
