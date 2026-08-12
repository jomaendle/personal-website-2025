import type { Metadata } from "next";
import { AiImpactContent } from "@/components/ai-impact/ai-impact-content";
import { AiImpactStructuredData } from "@/components/structured-data";

export const dynamic = "force-static";

// The title carries the search term ("KI im Engineering messen") ahead of the
// format, because the buyer searches for the problem and not for the word
// "Audit". `| Jo Mändle` is appended by the template in app/layout.tsx.
const title = "KI im Engineering messen · 4-Wochen-Audit";
const description =
  "Ihr Team arbeitet mit KI-Werkzeugen. Ich messe in vier Wochen aus Ihren eigenen System- und Prozessdaten, was sich verändert hat. Ohne personenbezogene Auswertung.";

const ogImage = `/api/og-image?title=${encodeURIComponent(
  "KI im Engineering messen",
)}&description=${encodeURIComponent(
  "4-Wochen-Audit. Aus Ihren Daten, ohne personenbezogene Auswertung.",
)}`;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "KI Wirkung messen Engineering",
    "AI Coding Assistant ROI",
    "Developer Productivity Audit",
    "DORA Metriken KI",
    "KI Produktivität Entwicklung messen",
    "Betriebsvereinbarung KI Entwicklung",
    "Engineering Metriken ohne Leistungskontrolle",
    "GitHub Copilot Nutzen belegen",
    "Engineering Audit Festpreis",
  ],
  alternates: {
    canonical: "/ki-wirkung",
    languages: {
      de: "/ki-wirkung",
      en: "/ai-impact",
    },
    types: {
      "text/markdown": "/ki-wirkung.md",
    },
  },
  openGraph: {
    title: `${title} | Jo Mändle`,
    description,
    url: "https://www.jomaendle.com/ki-wirkung",
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

export default function KiWirkungPage() {
  return (
    <>
      <AiImpactStructuredData lang="de" />
      <AiImpactContent lang="de" />
    </>
  );
}
