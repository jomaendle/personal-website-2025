// app/api/og.ts

import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const title = url.searchParams.get("title");
  const description = url.searchParams.get("description");

  if (!title || !description) {
    return new Response("Title and description are required", { status: 400 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          textAlign: "center",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <h1 style={{ fontSize: 64 }}>{title}</h1>
        <p style={{ fontSize: 32 }}>{description}</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
