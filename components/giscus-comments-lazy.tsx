"use client";

import dynamic from "next/dynamic";
import { GISCUS_MIN_HEIGHT, GiscusSkeleton } from "@/components/ui/skeleton";

// Lazy load Giscus comments (below the fold) in a Client Component
const GiscusComments = dynamic(
  () =>
    import("@/components/giscus-comments").then((mod) => ({
      default: mod.GiscusComments,
    })),
  {
    // The same skeleton the loaded component shows while giscus boots, so the
    // chunk arriving is invisible in layout terms. A centred spinner here used
    // to be much shorter than the comments it stood in for, which meant the
    // handover itself moved the page.
    loading: () => <GiscusSkeleton />,
    ssr: false,
  },
);

/**
 * Owns both halves of a contract the loaded component depends on: the height
 * reservation that keeps CLS at zero, and the positioning context its loading
 * overlay anchors to. Splitting these across files once meant a second call
 * site — or a refactor that dropped `relative` — would send that
 * `absolute inset-0` overlay to whatever ancestor happened to be positioned,
 * covering unrelated article content. Keeping them here makes that undroppable.
 *
 * This wrapper is server-rendered even though the component inside it is not:
 * `ssr: false` skips the dynamic import, not the client component holding it,
 * so the reservation still reaches the prerendered HTML.
 */
export default function GiscusCommentsSection({ slug }: { slug: string }) {
  return (
    <div className="relative" style={{ minHeight: GISCUS_MIN_HEIGHT }}>
      <GiscusComments slug={slug} />
    </div>
  );
}
