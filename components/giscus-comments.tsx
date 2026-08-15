"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { GiscusSkeleton } from "@/components/ui/skeleton";

interface GiscusCommentsProps {
  slug: string;
}

export function GiscusComments({ slug }: GiscusCommentsProps) {
  const commentsRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  // Readiness of the *iframe*, not of the script. See the listener below for
  // why `script.onload` is the wrong signal to configure giscus on.
  const [isFrameReady, setIsFrameReady] = useState(false);
  const { resolvedTheme } = useTheme();

  // Reset load/error state when the post changes. Done during render rather
  // than inside the effect below — React's documented pattern for deriving
  // state from a changed prop, and it avoids the cascading re-render that
  // calling setState synchronously in an effect body causes.
  const [prevSlug, setPrevSlug] = useState(slug);
  if (prevSlug !== slug) {
    setPrevSlug(slug);
    setError(null);
    setIsFrameReady(false);
  }

  // Giscus announces itself by posting a `{ giscus: ... }` message from inside
  // the iframe once that iframe has actually navigated to giscus.app. That is
  // the only safe moment to configure it: `script.onload` fires when client.js
  // finishes downloading, before the iframe it injects has left about:blank,
  // so a `postMessage(..., "https://giscus.app")` at that point is rejected
  // with a target-origin mismatch and the config is silently dropped.
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://giscus.app") return;
      if (typeof event.data !== "object" || event.data === null) return;
      if (!("giscus" in event.data)) return;
      setIsFrameReady(true);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Initialize Giscus (only once per slug)
  useEffect(() => {
    const currentRef = commentsRef.current;
    if (!currentRef) return;

    // Custom theme URL (static, no query params for better caching)
    const getThemeUrl = () => `${window.location.origin}/api/giscus-theme`;

    // Clear any existing Giscus instance
    currentRef.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "jomaendle/personal-website-2025");
    script.setAttribute("data-repo-id", "R_kgDONtoXmg");
    script.setAttribute("data-category", "Blog Comments");
    script.setAttribute("data-category-id", "DIC_kwDONtoXms4CxD2c");
    script.setAttribute("data-mapping", "specific");
    script.setAttribute("data-term", slug);
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", getThemeUrl());
    script.setAttribute("data-lang", "en");
    script.setAttribute("data-loading", "lazy");
    script.crossOrigin = "anonymous";
    script.async = true;

    // Add error handling
    script.onerror = () => {
      setError("Failed to load comments. Please try refreshing the page.");
      console.error("Failed to load Giscus script");
    };

    currentRef.appendChild(script);

    // Cleanup function
    return () => {
      if (currentRef) {
        currentRef.innerHTML = "";
        setIsFrameReady(false);
      }
    };
  }, [slug]);

  // Handle theme changes by switching to built-in giscus themes
  // This approach uses giscus's native themes which work reliably
  // while still loading our custom CSS initially
  useEffect(() => {
    if (!isFrameReady) return;

    const iframe = document.querySelector<HTMLIFrameElement>(
      "iframe.giscus-frame",
    );
    if (!iframe) return;

    // Use giscus built-in themes for reliable theme switching
    // The custom CSS provides the base styling, built-in themes handle colors
    const giscusTheme = resolvedTheme === "light" ? "light" : "dark";

    iframe.contentWindow?.postMessage(
      {
        giscus: {
          setConfig: {
            theme: giscusTheme,
          },
        },
      },
      "https://giscus.app",
    );
  }, [resolvedTheme, isFrameReady]);

  // The heading and the height reservation are owned by the server-rendered
  // caller (components/mdx-layout.tsx); this component renders only what has
  // to be client-side.
  if (error) {
    return (
      // red-700 on the tinted panel, not red-500: over the light theme's
      // cream the 500 measured 3.01:1 against the panel tint, short of the
      // 4.5:1 WCAG AA wants for body text. Dark mode keeps a lighter red.
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-700 dark:text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <div ref={commentsRef} className="giscus" />
      {/* Overlaid rather than swapped: the giscus container above stays
          mounted underneath while the skeleton covers it, so the script always
          has its mount point and the iframe can size itself from a rendered
          frame. Rendering one *or* the other would tear down the iframe. */}
      {!isFrameReady && (
        <div className="absolute inset-0">
          <GiscusSkeleton />
        </div>
      )}
    </>
  );
}
