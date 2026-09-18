/**
 * The Schema Map that `robots.txt` points at with its `schemamap:` directive.
 *
 * Same idea as a sitemap, one level up: a sitemap lists pages to crawl, this
 * lists the structured-data feeds that make crawling them unnecessary.
 */

import { BASE_URL } from "@/lib/config/identity";

export const dynamic = "force-static";

const feeds = [
  {
    loc: `${BASE_URL}/feeds/blog.jsonl`,
    type: "application/x-ndjson",
    schema: "https://schema.org/BlogPosting",
  },
];

export function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<schemamap xmlns="https://schemamap.org/schemas/0.1">
${feeds
  .map(
    (feed) => `  <feed>
    <loc>${feed.loc}</loc>
    <type>${feed.type}</type>
    <schema>${feed.schema}</schema>
  </feed>`,
  )
  .join("\n")}
</schemamap>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
