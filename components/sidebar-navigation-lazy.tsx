"use client";

import dynamic from "next/dynamic";

/**
 * Deferred sidebar TOC, following the `giscus-comments-lazy` pattern.
 *
 * SidebarNavigation returns null until it has read the headings out of the
 * DOM, so `ssr: false` changes nothing in the server output. What it does
 * change: the component and its framer-motion subtree leave the critical
 * chunk graph, so an article's first paint no longer waits on them.
 */
const SidebarNavigation = dynamic(
  () =>
    import("@/components/sidebar-navigation").then((mod) => ({
      default: mod.SidebarNavigation,
    })),
  { ssr: false },
);

export default SidebarNavigation;
