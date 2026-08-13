"use client";

import { LazyMotion, MotionConfig } from "framer-motion";

const loadMotionFeatures = () =>
  import("./motion-features").then((mod) => mod.default);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    // LazyMotion + `m` components (instead of `motion`) keep the full
    // framer-motion runtime out of the shared chunk; domAnimation covers
    // everything this site uses (animate/exit/gestures/inView — no drag or
    // layout animations) and is loaded async so it leaves the critical path
    // too. `strict` throws in dev if a full `motion` component sneaks back in
    // and silently reinflates every page's bundle.
    //
    // reducedMotion="user" makes every Framer Motion animation respect the
    // OS "reduce motion" setting (transforms/layout are skipped, opacity is
    // kept). CSS-based animations are handled globally in globals.css.
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
