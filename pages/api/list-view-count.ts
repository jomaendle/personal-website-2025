import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import { withRateLimit } from "@/lib/rate-limit";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=59",
  );

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // return the number of views for all slugs
  const { data: pageViews, error } = await supabase
    .from("page_views")
    .select("slug, views");

  if (error) {
    console.error("Error fetching view counts:", error);
    return res.status(500).json({ error: "Failed to fetch view counts" });
  }

  return res.status(200).json(pageViews);
}

export default withRateLimit(handler, {
  maxRequests: 60,
  windowMs: 60 * 1000, // 60 requests per minute per IP
  message: "Too many requests, please try again later"
});
