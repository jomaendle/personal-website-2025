import { supabase } from "@/lib/supabaseClient";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * IMPORTANT: This API route requires a PostgreSQL function to be created in your Supabase database.
 * Run this SQL in your Supabase SQL Editor:
 *
 * CREATE OR REPLACE FUNCTION increment_page_view(page_slug TEXT)
 * RETURNS TABLE(views BIGINT) AS $$
 * BEGIN
 *   INSERT INTO page_views (slug, views)
 *   VALUES (page_slug, 1)
 *   ON CONFLICT (slug)
 *   DO UPDATE SET views = page_views.views + 1
 *   RETURNING page_views.views;
 * END;
 * $$ LANGUAGE plpgsql;
 *
 * This function provides atomic increment operation, eliminating race conditions.
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { slug } = req.body;

    if (!slug) {
      return res.status(400).json({ error: "Slug is required" });
    }

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=10, stale-while-revalidate=59",
    );

    try {
      // Use RPC to call the PostgreSQL function that handles atomic increment
      const { data, error } = await supabase.rpc("increment_page_view", {
        page_slug: slug,
      });

      if (error) {
        console.error("Error incrementing page view:", error);
        return res.status(500).json({ error: error.message });
      }

      // The function returns an array with a single row containing the views count
      const views = data?.[0]?.views || data?.views || 1;

      return res.status(200).json({ views });
    } catch (error) {
      console.error("Unexpected error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
