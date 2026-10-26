import type { Metadata, Viewport } from "next";
import { Iphone } from "@/components/iphone/iphone";
import { PREPAINT_SCRIPT } from "@/components/iphone/persist";
import { getNoteSummaries } from "@/lib/iphone-notes";
import { getPhotoBytes } from "@/lib/iphone-photos";
import { IPHONE_COPY } from "@/lib/state/iphone-copy";

export const dynamic = "force-static";

const ogImage = `/api/og-image?title=${encodeURIComponent(
  "Jo’s iPhone",
)}&description=${encodeURIComponent(IPHONE_COPY.metaDescription)}`;

export const metadata: Metadata = {
  title: IPHONE_COPY.metaTitle,
  description: IPHONE_COPY.metaDescription,
  alternates: { canonical: "/iphone" },
  // Added to the Home Screen, it opens full-screen with the status bar over
  // the wallpaper, like a real home screen.
  appleWebApp: {
    capable: true,
    title: "Jo",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: `${IPHONE_COPY.metaTitle} | Jo Mändle`,
    description: IPHONE_COPY.metaDescription,
    url: "https://www.jomaendle.com/iphone",
    images: [{ url: ogImage }],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  // Lets the screen run under the notch and home indicator; the stylesheet
  // pads with env(safe-area-inset-*).
  viewportFit: "cover",
};

/**
 * Unlisted, like /business: reachable by URL, not from the site's nav.
 */
export default function IphonePage() {
  return (
    <>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: a constant, locally defined one-liner that has to run before first paint
        dangerouslySetInnerHTML={{ __html: PREPAINT_SCRIPT }}
      />
      <Iphone notes={getNoteSummaries()} photoBytes={getPhotoBytes()} />
    </>
  );
}
