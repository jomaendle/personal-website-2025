import { renderBusinessMarkdown } from "@/lib/business-markdown";

export const dynamic = "force-static";

const md = renderBusinessMarkdown("en");

export function GET() {
  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
