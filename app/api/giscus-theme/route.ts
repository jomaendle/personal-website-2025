import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

// Read once at module load rather than on every request; the file only
// changes on deploy. A failed read is kept and reported per request below.
function loadThemeCss(): string | Error {
  try {
    return fs.readFileSync(
      path.join(process.cwd(), "public", "giscus-custom-theme.css"),
      "utf8",
    );
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
}

const themeCss = loadThemeCss();

export async function GET() {
  try {
    // Static CSS file with both light and dark theme definitions
    if (themeCss instanceof Error) throw themeCss;
    const css = themeCss;

    // Return CSS with CORS headers
    // Note: Headers are also set in next.config.mjs for consistency
    return new NextResponse(css, {
      headers: {
        "Content-Type": "text/css; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        Vary: "Origin",
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
