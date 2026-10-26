/**
 * Article view counts, read from and written to Supabase through the API
 * routes. Shared by the blog's ViewCounter and the /iphone Notes app.
 */

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
    .then((data: ViewsResponse | null) => data?.views || null)
    .catch(() => null);
}
