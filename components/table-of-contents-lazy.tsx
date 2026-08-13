"use client";

import dynamic from "next/dynamic";

/**
 * Deferred mobile TOC, following the `giscus-comments-lazy` pattern.
 *
 * MobileTableOfContents renders nothing until it has read the headings out of
 * the DOM, which is why mdx-layout keeps a decorative placeholder button
 * behind it. `ssr: false` therefore changes nothing in the server output; it
 * only moves the component and its framer-motion import off the critical path.
 */
const MobileTableOfContents = dynamic(
  () =>
    import("@/components/table-of-contents").then((mod) => ({
      default: mod.MobileTableOfContents,
    })),
  { ssr: false },
);

export default MobileTableOfContents;
