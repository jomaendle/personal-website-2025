"use client";

import { type RefObject, useEffect, useRef } from "react";

/**
 * Live `prefers-reduced-motion`.
 *
 * The important word is *live*. Reading the media query once on mount looks
 * correct and passes every test, because nobody changes the setting while a
 * page is open — except the people who actually rely on it, who turn it on
 * precisely when something starts moving and makes them ill. So `onChange`
 * fires once during the mount effect and again on every change after it.
 *
 * `onChange` is where a caller writes the flag into its own simulation ref and
 * wakes its loop, so the next frame can snap everything into place. It is held
 * in a ref internally, so callers need not memoise it.
 *
 * The returned ref is for callers with no simulation ref of their own. It is
 * false on the server and on the first client render — motion is the default,
 * and the effect corrects it before anything has had time to move.
 */
export function useReducedMotion(
  onChange: (reduced: boolean) => void,
): RefObject<boolean> {
  const reduced = useRef(false);
  const handler = useRef(onChange);
  handler.current = onChange;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      reduced.current = media.matches;
      handler.current(media.matches);
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  return reduced;
}
