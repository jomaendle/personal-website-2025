import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Read the static CSS file with both light and dark theme definitions
    const filePath = path.join(
      process.cwd(),
      "public",
      "giscus-custom-theme.css",
    );
    const css = fs.readFileSync(filePath, "utf8");

    // Return CSS with CORS headers
    // Note: Headers are also set in next.config.mjs for consistency
    return new NextResponse(css, {
      headers: {
        "Content-Type": "text/css; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Vary": "Origin",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error serving giscus theme:", error);
    return new NextResponse("/* Error loading theme */", {
      status: 500,
      headers: {
        "Content-Type": "text/css; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "false",
      "Access-Control-Max-Age": "86400",
    },
  });
}
