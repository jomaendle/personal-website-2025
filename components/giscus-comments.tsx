"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { GiscusSkeleton } from "@/components/ui/skeleton";

interface GiscusCommentsProps {
  slug: string;
}

/**
 * How long to wait for the iframe to announce itself before telling the reader
 * something went wrong. `script.onerror` only covers client.js failing to
 * download; everything after that — a content blocker that lets the script
 * through but blocks the giscus.app frame, a connection dropped mid-navigation,
 * a frame that errors on entry — produces no event at all. Without a deadline
 * those cases leave a skeleton pulsing forever.
 *
 * Generous on purpose: the giscus container is never torn down when this fires,
 * so a frame that is merely slow still arrives, flips the state back to ready
 * and removes the notice on its own.
 */
const GISCUS_LOAD_TIMEOUT_MS = 15_000;

const GISCUS_ORIGIN = "https://giscus.app";

type Status = "loading" | "ready" | "error";

export function GiscusComments({ slug }: GiscusCommentsProps) {
  const commentsRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("loading");
  const { resolvedTheme } = useTheme();

  const giscusTheme = resolvedTheme === "light" ? "light" : "dark";
  // The message listener has to post the *current* theme, but re-subscribing on
  // every theme change would drop messages during the swap. A ref keeps the
  // listener stable and still current.
  const themeRef = useRef(giscusTheme);
  themeRef.current = giscusTheme;

  // Reset load/error state when the post changes. Done during render rather
  // than inside the effect below — React's documented pattern for deriving
  // state from a changed prop, and it avoids the cascading re-render that
  // calling setState synchronously in an effect body causes.
  const [prevSlug, setPrevSlug] = useState(slug);
  if (prevSlug !== slug) {
    setPrevSlug(slug);
    setStatus("loading");
  }

  // Scoped to our own container rather than the document: on a slug change the
  // old frame can still be in the tree for a tick, and a page with two comment
  // sections would otherwise configure whichever frame happened to be first.
  const currentFrame = useCallback(
    () =>
      commentsRef.current?.querySelector<HTMLIFrameElement>(
        "iframe.giscus-frame",
      ) ?? null,
    [],
  );

  const postTheme = useCallback(
    (theme: string) => {
      currentFrame()?.contentWindow?.postMessage(
        { giscus: { setConfig: { theme } } },
        GISCUS_ORIGIN,
      );
    },
    [currentFrame],
  );

  // Giscus announces itself by posting a `{ giscus: ... }` message from inside
  // the iframe once that iframe has actually navigated to giscus.app. That is
  // the only safe moment to configure it: `script.onload` fires when client.js
  // finishes downloading, before the iframe it injects has left about:blank,
  // so a `postMessage(..., GISCUS_ORIGIN)` at that point is rejected with a
  // target-origin mismatch and the config is silently dropped.
  //
  // The theme is re-posted on *every* message rather than once on a latched
  // "ready" flag. Giscus re-navigates its own frame when a reader signs in, and
  // the reloaded document falls back to the `data-theme` stylesheet — a config
  // sent only on the first message never reaches it, and the frame reverts to
  // whichever theme that stylesheet describes.
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== GISCUS_ORIGIN) return;
      if (typeof event.data !== "object" || event.data === null) return;
      if (!("giscus" in event.data)) return;
      // Ignore anything from a frame we no longer own. A resize message queued
      // by the previous slug's iframe can land after the reset above, and
      // treating it as readiness would hide the skeleton over a frame that does
      // not exist yet.
      const frame = currentFrame();
      if (!frame || event.source !== frame.contentWindow) return;

      setStatus("ready");
      postTheme(themeRef.current);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [currentFrame, postTheme]);

  // Initialize Giscus (only once per slug)
  useEffect(() => {
    const currentRef = commentsRef.current;
    if (!currentRef) return;

    // Custom theme URL (static, no query params for better caching)
    const getThemeUrl = () => `${window.location.origin}/api/giscus-theme`;

    // Clear any existing Giscus instance
    currentRef.innerHTML = "";

    const script = document.createElement("script");
    script.src = `${GISCUS_ORIGIN}/client.js`;
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

    // Covers the script itself failing to download. Everything past that point
    // is covered by the deadline below.
    script.onerror = () => {
      setStatus("error");
      console.error("Failed to load Giscus script");
    };

    currentRef.appendChild(script);

    const timeoutId = window.setTimeout(() => {
      setStatus((current) => (current === "loading" ? "error" : current));
    }, GISCUS_LOAD_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
      currentRef.innerHTML = "";
    };
  }, [slug]);

  // Handle theme changes by switching to built-in giscus themes.
  // This approach uses giscus's native themes which work reliably
  // while still loading our custom CSS initially.
  useEffect(() => {
    if (status !== "ready") return;
    postTheme(giscusTheme);
  }, [giscusTheme, status, postTheme]);

  // The heading and the height reservation are owned by the caller
  // (components/giscus-comments-lazy.tsx and components/mdx-layout.tsx); this
  // component renders only what has to be client-side.
  return (
    <>
      <div
        ref={commentsRef}
        className="giscus"
        aria-busy={status === "loading"}
      />

      {/* The skeleton is decorative and hidden from assistive tech, so without
          this the reader hears "Comments" followed by silence and never learns
          whether the widget is loading, arrived, or failed. */}
      <p className="sr-only" role="status">
        {status === "loading" ? "Loading comments…" : ""}
        {status === "ready" ? "Comments loaded." : ""}
      </p>

      {status === "error" && (
        // red-700 on the tinted panel, not red-500: over the light theme's
        // cream the 500 measured 3.01:1 against the panel tint, short of the
        // 4.5:1 WCAG AA wants for body text. Dark mode keeps a lighter red.
        <div
          role="alert"
          className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-700 dark:text-red-400"
        >
          <p>Failed to load comments. Please try refreshing the page.</p>
        </div>
      )}

      {/* Overlaid rather than swapped: the giscus container above stays
          mounted underneath while the skeleton covers it, so the script always
          has its mount point and the iframe can size itself from a rendered
          frame. Rendering one *or* the other would tear down the iframe.
          Opaque and click-through: the frame paints its own placeholder as soon
          as it navigates, which would otherwise show through the gaps between
          the shimmer blocks, and a transparent overlay would still swallow
          clicks aimed at the frame underneath it. */}
      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 bg-background">
          <GiscusSkeleton />
        </div>
      )}
    </>
  );
}
