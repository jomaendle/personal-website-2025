/**
 * Every article as a schema.org `BlogPosting`, one JSON object per line.
 *
 * This is the structured-data feed that `robots.txt` advertises with a
 * `schemamap:` directive (NLWeb Schema Feeds). An agent that wants the article
 * list gets it in one request as data, instead of crawling the blog index and
 * parsing ten pages of HTML to rebuild the same table.
 */

import { BASE_URL, ID, LEGAL_NAME } from "@/lib/config/identity";
import { BLOG_POSTS } from "@/lib/state/blog";

export const dynamic = "force-static";

export function GET() {
  const lines = BLOG_POSTS.map((post) => {
    const url = `${BASE_URL}/blog/${post.slug}`;
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: post.title,
      url,
      datePublished: new Date(post.date).toISOString().slice(0, 10),
      inLanguage: "en",
      author: { "@type": "Person", "@id": ID.person, name: LEGAL_NAME },
      isPartOf: { "@id": `${BASE_URL}/blog#blog` },
      // The markdown twin carries the full body; the HTML page carries the
      // live demos. Naming both saves a consumer a round of guessing.
      encoding: {
        "@type": "MediaObject",
        encodingFormat: "text/markdown",
        contentUrl: `${url}.md`,
      },
    });
  });

  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
