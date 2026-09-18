/** Served at `/.well-known/agent-skills/index.json` — see `next.config.mjs`. */

import { agentSkillsIndex } from "@/lib/agent/catalog";

export const dynamic = "force-static";

export function GET() {
  return Response.json(agentSkillsIndex(), {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
