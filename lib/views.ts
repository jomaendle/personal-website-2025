/**
 * Article view counts, read from and written to Supabase through the API
 * routes. Shared by the blog's ViewCounter and the /ios Notes app.
 */

import { useEffect, useState } from "react";

export interface ViewsResponse {
  views: number;
  slug?: string;
}

// One request serves every counter on the page (the blog index renders one per
// post). This module-level promise is the whole caching story that
// @tanstack/react-query used to provide here — it was the library's only
// consumer, and dropping it keeps ~50KB of JS off every page.
let allViewsPromise: Promise<ViewsResponse[]> | null = null;

export function fetchAllViews(): Promise<ViewsResponse[]> {
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

// Totals this visit's increments returned. They beat the list, which was
// fetched (and cached) before the increment, so a reopened article can't
// show a count lower than the one it showed the first time.
const counted = new Map<string, number>();

/** Count a read, once per slug per visit. Resolves to the new total, or null
 * when it was already counted, skipped in development, or failed. */
export function incrementView(slug: string): Promise<number | null> {
  if (process.env.NODE_ENV === "development" || incrementedSlugs.has(slug)) {
    return Promise.resolve(null);
  }
  incrementedSlugs.add(slug);
  return fetch("/api/increment-view", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ slug }),
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data: ViewsResponse | null) => {
      const total = data?.views || null;
      if (total) {
        counted.set(slug, total);
      }
      return total;
    })
    .catch(() => null);
}

/**
 * An article's view count, and with `increment`, this read counted in it.
 * The increment is awaited before falling back to the list, so the count
 * shows once, already including this read, rather than flipping up by one.
 */
export function useViewCount(slug: string, increment = false) {
  const fresh = (forSlug: string) => ({
    slug: forSlug,
    views: counted.get(forSlug) ?? null,
    failed: false,
  });
  const [state, setState] = useState(() => fresh(slug));
  // Keyed by slug, so a hook handed a new one starts over rather than
  // showing the last one's count until the fetch comes back.
  const current = state.slug === slug ? state : fresh(slug);

  useEffect(() => {
    let live = true;
    const fromList = () =>
      fetchAllViews()
        .then((all) => {
          if (live) {
            const views =
              counted.get(slug) ??
              all.find((item) => item.slug === slug)?.views ??
              0;
            setState({ slug, views, failed: false });
          }
        })
        .catch(() => {
          if (live) {
            setState((s) =>
              s.slug !== slug || s.views === null
                ? { slug, views: null, failed: true }
                : s,
            );
          }
        });
    if (increment) {
      incrementView(slug).then((total) => {
        if (!live) {
          return;
        }
        if (total) {
          setState({ slug, views: total, failed: false });
        } else {
          fromList();
        }
      });
    } else {
      fromList();
    }
    return () => {
      live = false;
    };
  }, [slug, increment]);

  return { views: current.views, failed: current.failed };
}
