import { useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { bindTo } from "./compositor-spring";
import { clamp } from "./motion";
import { useLatest } from "./use-latest";

/**
 * A navigation stack's motion, as UIKit pushes: `nav` 0 shows the page
 * underneath, 1 the one pushed over it, which slides in from the right
 * while the page underneath drifts left and dims. Reduced motion
 * cross-fades instead.
 *
 * The three layers' styles follow `nav` through motion values while a
 * finger drags it (the swipe back), and are registered with the compositor
 * spring for everything else, so a push, a pop or a let-go swipe runs off
 * the main thread (compositor-spring).
 */
export function usePushStack(initial: number) {
  const reduced = useReducedMotion() ?? false;
  const reducedRef = useLatest(reduced);
  const nav = useMotionValue(initial);
  const backRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backX = useTransform(nav, (n) => (reduced ? "0%" : `${-30 * n}%`));
  const dim = useTransform(nav, [0, 1], [0, 0.35]);
  const frontX = useTransform(nav, (n) =>
    reduced ? "0%" : `${(1 - n) * 100}%`,
  );
  const frontOpacity = useTransform(nav, (n) => (reduced ? n : 1));
  useState(() =>
    bindTo(nav, () => {
      const still = reducedRef.current;
      return [
        {
          el: backRef.current,
          style: (n) => ({ transform: `translateX(${still ? 0 : -30 * n}%)` }),
        },
        {
          el: dimRef.current,
          style: (n) => ({ opacity: 0.35 * clamp(n, 0, 1) }),
        },
        {
          el: frontRef.current,
          style: (n) => ({
            transform: `translateX(${still ? 0 : (1 - n) * 100}%)`,
            opacity: still ? n : 1,
          }),
        },
      ];
    }),
  );
  return {
    nav,
    reduced,
    backRef,
    dimRef,
    frontRef,
    backX,
    dim,
    frontX,
    frontOpacity,
  };
}
