import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge", // ensure the Edge runtime is used
};

/**
 * Sanitize OG image parameters to prevent abuse.
 * Limits length and trims whitespace.
 */
function sanitizeOgParam(
  param: string | null,
  maxLength: number,
  defaultValue: string
): string {
  if (!param) return defaultValue;
  return param.trim().slice(0, maxLength);
}

export default async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = sanitizeOgParam(searchParams.get("title"), 100, "Jo Maendle");
  const description = sanitizeOgParam(
    searchParams.get("description"),
    200,
    "Building for the Web."
  );

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #101010 0%, #1a1a1a 100%)",
          color: "#fff",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "40px",
        }}
      >
        <h1 style={{ fontSize: "108px", margin: 0 }}>{title}</h1>
        <p style={{ fontSize: "32px", margin: "20px 0 0", color: "#a3a3a3" }}>
          {description}
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
