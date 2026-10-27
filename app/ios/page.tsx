import type { Metadata, Viewport } from "next";
import { Iphone } from "@/components/iphone/iphone";
import { NOW_SCRIPT } from "@/components/iphone/now-script";
import { PREPAINT_SCRIPT } from "@/components/iphone/persist";
import { getNoteSummaries } from "@/lib/iphone-notes";
import { getPhotoBytes } from "@/lib/iphone-photos";
import { IOS_PATH, IPHONE_COPY } from "@/lib/state/iphone-copy";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: IPHONE_COPY.metaTitle,
  description: IPHONE_COPY.metaDescription,
  alternates: { canonical: IOS_PATH },
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
    url: `https://www.jomaendle.com${IOS_PATH}`,
    type: "website",
    siteName: "Jo Mändle",
    // The image is the phone itself: opengraph-image.png and twitter-image.png
    // beside this page, a capture of its home screen.
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
 * Reached from the masthead's Web | iOS switch, not the site's nav; in
 * the sitemap, with its own share card.
 */
export default function IphonePage() {
  return (
    <>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: a constant, locally defined one-liner that has to run before first paint
        dangerouslySetInnerHTML={{ __html: PREPAINT_SCRIPT }}
      />
      <Iphone notes={getNoteSummaries()} photoBytes={getPhotoBytes()} />
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: a constant, locally defined script that fills in the reader's time before first paint
        dangerouslySetInnerHTML={{ __html: NOW_SCRIPT }}
      />
    </>
  );
}
