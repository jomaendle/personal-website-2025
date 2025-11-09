"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

interface GiscusCommentsProps {
  slug: string;
}

export function GiscusComments({ slug }: GiscusCommentsProps) {
  const commentsRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { resolvedTheme } = useTheme();

  // Get the custom theme URL (static, no query params for better caching)
  const getThemeUrl = () => {
    return `${window.location.origin}/api/giscus-theme`;
  };

  // Initialize Giscus (only once per slug)
  useEffect(() => {
    const currentRef = commentsRef.current;
    if (!currentRef) return;

    // Clear any existing Giscus instance
    currentRef.innerHTML = "";
    setError(null);
    setIsLoaded(false);

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

    // Mark as loaded when script loads
    script.onload = () => {
      setIsLoaded(true);
    };

    currentRef.appendChild(script);

    // Cleanup function
    return () => {
      if (currentRef) {
        currentRef.innerHTML = "";
        setIsLoaded(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Handle theme changes by switching to built-in giscus themes
  // This approach uses giscus's native themes which work reliably
  // while still loading our custom CSS initially
  useEffect(() => {
    if (!isLoaded) return;

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
  }, [resolvedTheme, isLoaded]);

  return (
    <div className="mt-16">
      <h2 className="mb-6 text-2xl font-bold">Comments</h2>
      {error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-500">
          <p>{error}</p>
        </div>
      ) : (
        <div ref={commentsRef} className="giscus" />
      )}
    </div>
  );
}
