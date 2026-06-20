import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { checkRateLimit, checkCsrf } from "@/lib/route-helpers";

function isValidSlug(slug: unknown): slug is string {
  if (typeof slug !== "string") return false;
  return /^[a-z0-9-]+$/.test(slug) && slug.length <= 100;
}

export async function POST(req: NextRequest) {
  const rateLimited = checkRateLimit(req, {
    maxRequests: 30,
    windowMs: 60 * 1000,
    message: "Too many requests, please try again later",
  });
  if (rateLimited) return rateLimited;

  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  const body = await req.json();
  const { slug } = body;

  if (!slug || !isValidSlug(slug)) {
    return NextResponse.json(
      { error: "Invalid or missing slug" },
      { status: 400 },
    );
  }

  try {
    const { data: existingData, error: selectError } = await supabase
      .from("page_views")
      .select("views")
      .eq("slug", slug)
      .maybeSingle();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Error fetching page view:", selectError);
      return NextResponse.json(
        { error: "Failed to fetch view count" },
        { status: 500 },
      );
    }

    if (existingData) {
      const newViews = existingData.views + 1;
      const { error: updateError } = await supabase
        .from("page_views")
        .update({ views: newViews })
        .eq("slug", slug);

      if (updateError) {
        console.error("Error updating page view:", updateError);
        return NextResponse.json(
          { error: "Failed to update view count" },
          { status: 500 },
        );
      }

      return NextResponse.json(
        { views: newViews },
        {
          headers: {
            "Cache-Control":
              "public, s-maxage=10, stale-while-revalidate=59",
          },
        },
      );
    } else {
      const { error: insertError } = await supabase
        .from("page_views")
        .insert({ slug, views: 1 });

      if (insertError) {
        if (insertError.code === "23505") {
          const { data: retryData, error: retryError } = await supabase
            .from("page_views")
            .select("views")
            .eq("slug", slug)
            .single();

          if (retryError) {
            console.error("Error on retry:", retryError);
            return NextResponse.json(
              { error: "Failed to fetch view count" },
              { status: 500 },
            );
          }

          const newViews = retryData.views + 1;
          const { error: retryUpdateError } = await supabase
            .from("page_views")
            .update({ views: newViews })
            .eq("slug", slug);

          if (retryUpdateError) {
            console.error("Error updating on retry:", retryUpdateError);
            return NextResponse.json(
              { error: "Failed to update view count" },
              { status: 500 },
            );
          }

          return NextResponse.json({ views: newViews });
        }

        console.error("Error inserting page view:", insertError);
        return NextResponse.json(
          { error: "Failed to record view" },
          { status: 500 },
        );
      }

      return NextResponse.json({ views: 1 });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
