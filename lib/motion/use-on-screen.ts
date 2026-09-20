"use client";

import { type RefObject, useEffect, useRef } from "react";

export type OnScreenOptions = {
  rootMargin?: string;
  threshold?: number | number[];
  /**
   * Count a hidden tab as off screen, and re-check when it comes back.
   *
   * Default false, and the default matters. A craft that uses this only to
   * grant compositor layers must *not* drop and re-take them across a tab
   * switch: re-promotion costs a rasterisation, and the pixel jump it can
   * cause would land the moment the reader returns. A craft that uses it to
   * gate a whole animation loop does want this, because a loop running in a
   * background tab is pure battery.
   */
  pauseWhenTabHidden?: boolean;
};

/**
 * Calls `onChange` when the element enters or leaves the screen, and only when
 * that actually changes.
 *
 * `onChange` is held in a ref, so callers need not memoise it.
 */
export function useOnScreen(
  ref: RefObject<Element | null>,
  onChange: (onScreen: boolean) => void,
  options: OnScreenOptions = {},
): void {
  const handler = useRef(onChange);
  handler.current = onChange;

  const { rootMargin, threshold = 0, pauseWhenTabHidden = false } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let current: boolean | null = null;
    const set = (next: boolean) => {
      if (current === next) return;
      current = next;
      handler.current(next);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        if (!entry) return;
        set(entry.isIntersecting && !(pauseWhenTabHidden && document.hidden));
      },
      { rootMargin, threshold },
    );
    observer.observe(element);

    if (!pauseWhenTabHidden) return () => observer.disconnect();

    const onVisibility = () => {
      if (document.hidden) {
        set(false);
      } else {
        // Observing an element that is already observed is a no-op, so drop it
        // and re-add it. That is the only way to be handed a fresh intersection
        // callback for an element whose position has not changed.
        observer.unobserve(element);
        observer.observe(element);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ref, rootMargin, threshold, pauseWhenTabHidden]);
}
