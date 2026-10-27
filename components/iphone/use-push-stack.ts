import { useMotionValue, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { useDrive } from "./compositor-spring";
import { clamp } from "./motion";
import { useLatest } from "./use-latest";

/**
 * A navigation stack's motion, as UIKit pushes: `nav` 0 shows the page
 * underneath, 1 the one pushed over it, which slides in from the right
 * while the page underneath drifts left and dims. Reduced motion
 * cross-fades instead.
 *
 * One style function per layer serves both paths (useDrive): written as a
 * finger drags `nav` (the swipe back), and handed to the compositor for a
 * push, a pop or a let-go swipe, which then runs off the main thread.
 */
export function usePushStack(initial: number) {
  const reduced = useReducedMotion() ?? false;
  const reducedRef = useLatest(reduced);
  const nav = useMotionValue(initial);
  const backRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const [backStyle, dimStyle, frontStyle] = useDrive(nav, () => {
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
  });
  return {
    nav,
    reduced,
    backRef,
    dimRef,
    frontRef,
    backStyle,
    dimStyle,
    frontStyle,
  };
}
