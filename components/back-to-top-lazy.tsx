"use client";

import dynamic from "next/dynamic";

/**
 * Deferred back-to-top button, following the `giscus-comments-lazy` pattern.
 *
 * BackToTop renders nothing until the reader has scrolled past its threshold,
 * so `ssr: false` changes nothing in the server output while keeping its
 * framer-motion import out of the critical chunk graph.
 */
const BackToTop = dynamic(
  () =>
    import("@/components/back-to-top").then((mod) => ({
      default: mod.BackToTop,
    })),
  { ssr: false },
);

export default BackToTop;
