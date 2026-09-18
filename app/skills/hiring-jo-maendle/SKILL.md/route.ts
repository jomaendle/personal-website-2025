/**
 * The skill artifact itself, at `/skills/hiring-jo-maendle/SKILL.md`.
 *
 * The digest in `/.well-known/agent-skills/index.json` is a sha256 of exactly
 * this string, so the two must be served from the same constant — an agent that
 * verifies the download against the index would otherwise reject it.
 */

import { SKILL_MARKDOWN } from "@/lib/agent/catalog";

export const dynamic = "force-static";

export function GET() {
  return new Response(SKILL_MARKDOWN, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
