"use client";

import { useEffect, useState } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

/**
 * Defer analytics loading until after initial page interaction
 * This improves INP (Interaction to Next Paint) by reducing initial JS execution
 */
export function DeferredAnalytics() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Load analytics after a short delay to prioritize initial page interactivity
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 2000); // 2 second delay

    // Or load immediately on first user interaction
    const loadOnInteraction = () => {
      setShouldLoad(true);
      cleanup();
    };

    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", loadOnInteraction);
      window.removeEventListener("scroll", loadOnInteraction);
      window.removeEventListener("touchstart", loadOnInteraction);
    };

    // Load on first interaction
    window.addEventListener("mousemove", loadOnInteraction, { once: true });
    window.addEventListener("scroll", loadOnInteraction, { once: true });
    window.addEventListener("touchstart", loadOnInteraction, { once: true });

    return cleanup;
  }, []);

  if (!shouldLoad) return null;

  return (
    <>
      <SpeedInsights />
      <Analytics />
    </>
  );
}
