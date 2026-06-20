import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { checkRateLimit } from "@/lib/route-helpers";

export async function GET(req: NextRequest) {
  const rateLimited = checkRateLimit(req, {
    maxRequests: 60,
    windowMs: 60 * 1000,
    message: "Too many requests, please try again later",
  });
  if (rateLimited) return rateLimited;

  const { data: pageViews, error } = await supabase
    .from("page_views")
    .select("slug, views");

  if (error) {
    console.error("Error fetching view counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch view counts" },
      { status: 500 },
    );
  }

  return NextResponse.json(pageViews, {
    headers: {
      "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
    },
  });
}
