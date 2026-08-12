import type { Metadata } from "next";
import { AiImpactContent } from "@/components/ai-impact/ai-impact-content";
import { AiImpactStructuredData } from "@/components/structured-data";

export const dynamic = "force-static";

const title = "Measuring AI in engineering · 4-week audit";
const description =
  "Your team works with AI tools. In four weeks I measure what changed, from your own system and process data. No per-developer analysis.";

const ogImage = `/api/og-image?title=${encodeURIComponent(
  "Measuring AI in engineering",
)}&description=${encodeURIComponent(
  "A four-week audit. From your data, with no per-developer analysis.",
)}`;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "measure AI impact engineering",
    "AI coding assistant ROI",
    "developer productivity audit",
    "DORA metrics AI",
    "engineering metrics without performance monitoring",
    "works council AI measurement",
    "GitHub Copilot impact measurement",
    "fixed price engineering audit",
  ],
  alternates: {
    canonical: "/ai-impact",
    languages: {
      de: "/ki-wirkung",
      en: "/ai-impact",
    },
    types: {
      "text/markdown": "/ai-impact.md",
    },
  },
  openGraph: {
    title: `${title} | Jo Mändle`,
    description,
    url: "https://www.jomaendle.com/ai-impact",
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

export default function AiImpactPage() {
  return (
    <>
      <AiImpactStructuredData lang="en" />
      <AiImpactContent lang="en" />
    </>
  );
}
