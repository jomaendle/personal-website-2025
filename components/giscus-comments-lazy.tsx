"use client";

import dynamic from "next/dynamic";

// Lazy load Giscus comments (below the fold) in a Client Component
const GiscusComments = dynamic(
  () =>
    import("@/components/giscus-comments").then((mod) => ({
      default: mod.GiscusComments,
    })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    ),
    ssr: false,
  },
);

export default GiscusComments;
