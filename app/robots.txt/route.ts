/**
 * robots.txt, hand-rendered rather than built from `MetadataRoute.Robots`.
 *
 * The typed helper covers `User-agent`, `Allow`, `Sitemap` and `Host` and
 * nothing else, and this file needs one more line: a `schemamap:` directive
 * pointing at `/schemamap.xml`, which is how the NLWeb Schema Feeds convention
 * hands an agent structured feeds instead of pages to scrape.
 *
 * The crawler policy is unchanged from the version this replaced: everything is
 * allowed, and the eighteen AI crawlers below are named explicitly so the
 * permission is unambiguous rather than inherited from `*`.
 */

import { BASE_URL } from "@/lib/config/identity";

export const dynamic = "force-static";

const aiCrawlers = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "YouBot",
  "Meta-ExternalAgent",
  "DuckAssistBot",
  "Diffbot",
  "Cohere-ai",
];

const body = `${["*", ...aiCrawlers]
  .map((userAgent) => `User-agent: ${userAgent}\nAllow: /`)
  .join("\n\n")}

Sitemap: ${BASE_URL}/sitemap.xml
Schemamap: ${BASE_URL}/schemamap.xml
Host: ${BASE_URL}

# Machine-readable entry points for agents:
#   ${BASE_URL}/llms.txt                            site index
#   ${BASE_URL}/agents.md                           when to use this site
#   ${BASE_URL}/.well-known/ard.json                capability catalog
#   ${BASE_URL}/.well-known/agent-skills/index.json published skills
# Any public path also answers to a .md suffix, to Accept: text/markdown,
# and to ?mode=agent.
`;

export function GET() {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
