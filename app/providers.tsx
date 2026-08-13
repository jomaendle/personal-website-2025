"use client";

import { LazyMotion, MotionConfig } from "framer-motion";

const loadMotionFeatures = () =>
  import("./motion-features").then((mod) => mod.default);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    // LazyMotion + `m` components (instead of `motion`) keep the full
    // framer-motion runtime out of the shared chunk; the domMax feature set
    // (loaded async, off the critical path) covers everything this site uses,
    // including the blog list's `layout` animations. `strict` throws in dev
    // if a full `motion` component sneaks back in and silently reinflates
    // every page's bundle.
    //
    // reducedMotion="user" makes every Framer Motion animation respect the
    // OS "reduce motion" setting (transforms/layout are skipped, opacity is
    // kept). CSS-based animations are handled globally in globals.css.
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
