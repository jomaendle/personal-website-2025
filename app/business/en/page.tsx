import type { Metadata } from "next";
import { BusinessContent } from "@/components/business/business-content";
import { BusinessStructuredData } from "@/components/structured-data";

export const dynamic = "force-static";

const title = "AI in engineering · Measure and roll out";
// The description sells the outcome and the constraint, not the stack. The
// works-council line is the differentiator against the US measurement tools
// and it is the phrase German engineering leads actually search for.
const description =
  "For organisations of 50 to 800 developers: I measure what your AI tooling returned, from your own system data, then implement what holds up. With no per-developer analysis.";

const ogImage = `/api/og-image?title=${encodeURIComponent(
  "AI in engineering",
)}&description=${encodeURIComponent(
  "Measured first, then rolled out. With no per-developer analysis.",
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
    "AI-native development rollout",
    "AI engineering consultant",
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
