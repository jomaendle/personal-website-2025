import { supabase } from "@/lib/supabaseClient";
import { NextApiRequest, NextApiResponse } from "next";
import { withRateLimit } from "@/lib/rate-limit";
import { withCsrfProtection, composeMiddleware } from "@/lib/csrf-protection";

// Validate slug format: only lowercase letters, numbers, and hyphens
function isValidSlug(slug: unknown): slug is string {
  if (typeof slug !== 'string') return false;
  return /^[a-z0-9-]+$/.test(slug) && slug.length <= 100;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { slug } = req.body;

    if (!slug || !isValidSlug(slug)) {
      return res.status(400).json({ error: "Invalid or missing slug" });
    }

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=10, stale-while-revalidate=59",
    );

    try {
      // First, try to get the current view count
      const { data: existingData, error: selectError } = await supabase
        .from("page_views")
        .select("views")
        .eq("slug", slug)
        .maybeSingle();

      if (selectError && selectError.code !== "PGRST116") {
        // PGRST116 is "no rows returned", which is fine
        console.error("Error fetching page view:", selectError);
        return res.status(500).json({ error: "Failed to fetch view count" });
      }

      if (existingData) {
        // Record exists, increment the view count
        const newViews = existingData.views + 1;
        const { error: updateError } = await supabase
          .from("page_views")
          .update({ views: newViews })
          .eq("slug", slug);

        if (updateError) {
          console.error("Error updating page view:", updateError);
          return res.status(500).json({ error: "Failed to update view count" });
        }

        return res.status(200).json({ views: newViews });
      } else {
        // Record doesn't exist, create it with initial view count of 1
        const { error: insertError } = await supabase
          .from("page_views")
          .insert({ slug, views: 1 });

        if (insertError) {
          // Handle race condition: if another request just inserted this slug
          if (insertError.code === "23505") {
            // Unique constraint violation - retry the update
            const { data: retryData, error: retryError } = await supabase
              .from("page_views")
              .select("views")
              .eq("slug", slug)
              .single();

            if (retryError) {
              console.error("Error on retry:", retryError);
              return res.status(500).json({ error: "Failed to fetch view count" });
            }

            const newViews = retryData.views + 1;
            const { error: retryUpdateError } = await supabase
              .from("page_views")
              .update({ views: newViews })
              .eq("slug", slug);

            if (retryUpdateError) {
              console.error("Error updating on retry:", retryUpdateError);
              return res.status(500).json({ error: "Failed to update view count" });
            }

            return res.status(200).json({ views: newViews });
          }

          console.error("Error inserting page view:", insertError);
          return res.status(500).json({ error: "Failed to record view" });
        }

        return res.status(200).json({ views: 1 });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

const middleware = composeMiddleware(
  withCsrfProtection,
  (h) => withRateLimit(h, {
    maxRequests: 30,
    windowMs: 60 * 1000, // 30 requests per minute per IP
    message: "Too many requests, please try again later"
  })
);

export default middleware(handler);
