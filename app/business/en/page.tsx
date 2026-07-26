import type { Metadata } from "next";
import { BusinessContent } from "@/components/business/business-content";
import { BusinessStructuredData } from "@/components/structured-data";

export const dynamic = "force-static";

const title = "Freelance Frontend & AI Engineering";
const description =
  "Senior contract engineering for product teams: React and Next.js at enterprise scale, plus LLM integrations that actually reach production.";

const ogImage = `/api/og-image?title=${encodeURIComponent(
  "Freelance Frontend & AI Engineering",
)}&description=${encodeURIComponent(
  "React/Next.js at enterprise scale — and AI that actually ships.",
)}`;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Freelance frontend engineer",
    "Next.js contractor",
    "React contract engineering",
    "LLM integration developer",
    "AI engineering freelance",
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
    url: "https://jomaendle.com/business/en",
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
