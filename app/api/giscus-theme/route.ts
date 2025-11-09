import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "public",
    "giscus-custom-theme.css",
  );
  const css = fs.readFileSync(filePath, "utf8");

  return new NextResponse(css, {
    headers: {
      "Content-Type": "text/css",
      "Access-Control-Allow-Origin": "https://giscus.app",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Private-Network": "true",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "https://giscus.app",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Private-Network": "true",
    },
  });
}
