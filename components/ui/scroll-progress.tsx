"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Reading-progress hairline along the top of an article.
 *
 * A rAF-throttled scroll listener writing `transform: scaleX()` directly,
 * where framer-motion's `useScroll` used to do the same thing. The listener
 * is passive, at most one style write per frame, and `scaleX` never touches
 * layout. This and the theme toggle were the two components keeping framer
 * in the critical bundle of routes that animate nothing else.
 */
export const ScrollProgress = ({
  className,
  style,
  ref,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      el.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn(
        "fixed inset-x-0 top-0 z-[101] h-0.5 origin-left bg-brand",
        className,
      )}
      // scaleX(0) before the first measurement, so the bar can never flash
      // full-width on load.
      style={{ transform: "scaleX(0)", ...style }}
      {...props}
    />
  );
};

ScrollProgress.displayName = "ScrollProgress";
