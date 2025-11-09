"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface GiscusCommentsProps {
  slug: string;
}

export function GiscusComments({ slug }: GiscusCommentsProps) {
  const commentsRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!commentsRef.current) return;

    // Clear any existing Giscus instance
    commentsRef.current.innerHTML = "";

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
    script.setAttribute(
      "data-theme",
      `${window.location.origin}/api/giscus-theme`,
    );
    script.setAttribute("data-lang", "en");
    script.setAttribute("data-loading", "lazy");
    script.crossOrigin = "anonymous";
    script.async = true;

    commentsRef.current.appendChild(script);
  }, [slug, resolvedTheme]);

  return (
    <div className="mt-16">
      <h2 className="mb-6 text-2xl font-bold">Comments</h2>
      <div ref={commentsRef} className="giscus" />
    </div>
  );
}
