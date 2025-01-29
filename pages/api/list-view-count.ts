import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(
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
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(pageViews);
}
