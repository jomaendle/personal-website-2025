import { supabase } from "@/lib/supabaseClient";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { slug } = req.body;

    if (!slug) {
      return res.status(400).json({ error: "Slug is required" });
    }

    // Check if the slug exists
    const { data: page, error } = await supabase
      .from("page_views")
      .select("views")
      .eq("slug", slug)
      .single();

    if (error) {
      // If the slug doesn't exist, insert it with initial view count
      const { error: insertError } = await supabase
        .from("page_views")
        .insert({ slug, views: 1 });

      if (insertError) {
        return res.status(500).json({ error: insertError.message });
      }

      return res.status(200).json({ views: 1 });
    } else {
      // If the slug exists, increment the view count
      const { error: updateError } = await supabase
        .from("page_views")
        .update({ views: page.views + 1 })
        .eq("slug", slug);

      if (updateError) {
        return res.status(500).json({ error: updateError.message });
      }

      return res.status(200).json({ views: page.views + 1 });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
