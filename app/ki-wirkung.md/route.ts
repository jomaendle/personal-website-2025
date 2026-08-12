import { renderAiImpactMarkdown } from "@/lib/ai-impact-markdown";

export const dynamic = "force-static";

const md = renderAiImpactMarkdown("de");

export function GET() {
  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
