"use client";

import NumberFlow from "@number-flow/react";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const isDevelopment = process.env.NODE_ENV === "development";

interface ViewsResponse {
  views: number;
  slug?: string;
}

// One request serves every counter on the page (the blog index renders one per
// post). This module-level promise is the whole caching story that
// @tanstack/react-query used to provide here — it was the library's only
// consumer, and dropping it keeps ~50KB of JS off every page.
let allViewsPromise: Promise<ViewsResponse[]> | null = null;

function fetchAllViews(): Promise<ViewsResponse[]> {
  allViewsPromise ??= fetch("/api/list-view-count")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to load view counts: ${res.statusText}`);
      }
      return res.json() as Promise<ViewsResponse[]>;
    })
    .catch((err) => {
      // Drop the cached promise on ANY failure — HTTP error or network-level
      // rejection — so the next mount retries instead of replaying the same
      // rejection for the rest of the session.
      allViewsPromise = null;
      throw err;
    });
  return allViewsPromise;
}

// Guard against duplicate increments from effect re-runs (StrictMode
// double-invokes effects in dev; navigations remount the article layout).
const incrementedSlugs = new Set<string>();

export function ViewCounter({
  slug,
  shouldIncrement,
}: {
  slug: string;
  shouldIncrement?: boolean | undefined;
}) {
  const [views, setViews] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);
  // Once the increment response lands, the (possibly cached, pre-increment)
  // list response must not overwrite it — the old react-query code had the
  // same precedence via `incrementedData?.views ?? allViews`.
  const hasIncrementedValue = useRef(false);

  useEffect(() => {
    let cancelled = false;

    fetchAllViews()
      .then((all) => {
        if (!(cancelled || hasIncrementedValue.current)) {
          setViews(all.find((item) => item.slug === slug)?.views ?? 0);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHasError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    // In development, skip incrementing views to avoid skewing data
    if (!shouldIncrement || isDevelopment || incrementedSlugs.has(slug)) {
      return;
    }
    incrementedSlugs.add(slug);

    fetch("/api/increment-view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slug }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ViewsResponse | null) => {
        if (data?.views) {
          hasIncrementedValue.current = true;
          setViews(data.views);
        }
      })
      .catch(() => {
        // The displayed count just stays at the pre-increment value.
      });
  }, [shouldIncrement, slug]);

  if (hasError) {
    return <p className="text-muted-foreground text-sm">- views</p>;
  }

  if (views === null) {
    return <Loader2 className="size-4 animate-spin" />;
  }

  return (
    <p className="motion-preset-fade-md flex items-center gap-1 text-muted-foreground text-sm">
      <NumberFlow value={views} /> views
    </p>
  );
}
