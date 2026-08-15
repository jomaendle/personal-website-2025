"use client";

import dynamic from "next/dynamic";
import { GiscusSkeleton } from "@/components/ui/skeleton";

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

export default GiscusComments;
