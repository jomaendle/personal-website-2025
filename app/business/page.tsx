import type { Metadata } from "next";
import { BusinessContent } from "@/components/business/business-content";
import { BusinessStructuredData } from "@/components/structured-data";

export const dynamic = "force-static";

const title = "KI im Engineering · Messen und einführen";
// The description sells the outcome and the constraint, not the stack. The
// works-council line is the differentiator against the US measurement tools
// and it is the phrase German engineering leads actually search for.
const description =
  "Für Organisationen mit 50 bis 800 Entwickler:innen: Ich messe aus Ihren Systemdaten, was der KI-Einsatz gebracht hat, und setze um, was trägt. Ohne personenbezogene Auswertung.";

const ogImage = `/api/og-image?title=${encodeURIComponent(
  "KI im Engineering",
)}&description=${encodeURIComponent(
  "Erst gemessen, dann eingeführt. Ohne personenbezogene Auswertung.",
)}`;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "KI-Wirkung messen Engineering",
    "KI Rollout Softwareentwicklung",
    "Entwicklerproduktivität messen Betriebsrat",
    "Engineering-Kennzahlen ohne personenbezogene Auswertung",
    "DORA Metriken KI",
    "GitHub Copilot Nutzen messen",
    "KI-native Entwicklung einführen",
    "Betriebsvereinbarung KI Entwicklung",
    "AI Engineering Beratung",
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
    url: "https://www.jomaendle.com/business",
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
