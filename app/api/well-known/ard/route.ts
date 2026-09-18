/**
 * Served at `/.well-known/ard.json` and `/.well-known/ai-catalog.json`.
 *
 * Both paths are rewrites (see `next.config.mjs`) because the App Router does
 * not route a `.well-known` directory of its own. One document answers both
 * specs, which treat each other's discovery path as an equivalent source.
 */

import { ardCatalog } from "@/lib/agent/catalog";

export const dynamic = "force-static";

export function GET() {
  return Response.json(ardCatalog(), {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
