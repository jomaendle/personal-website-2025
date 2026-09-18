/**
 * Section index for the writing.
 *
 * An agent working on "what has Jo written about CSS" should not have to pull
 * the whole site manual to find out. Same convention as the root `llms.txt`,
 * scoped to one area, rendered from `BLOG_POSTS` so it cannot list a draft.
 */

import { BASE_URL } from "@/lib/config/identity";
import { BLOG_POSTS } from "@/lib/state/blog";

export const dynamic = "force-static";

const content = `# Writing — Jo Mändle

> Notes on building for the web, lately with Claude Code and agent-facing
> infrastructure. ${BLOG_POSTS.length} published articles.

Each article has a markdown twin: append \`.md\` to its path.

## Articles

${BLOG_POSTS.map(
  (post) =>
    `- [${post.title}](${BASE_URL}/blog/${post.slug}) — ${post.date}. Markdown: ${BASE_URL}/blog/${post.slug}.md`,
).join("\n")}

## Related

- [Index as markdown](${BASE_URL}/blog.md)
- [All articles as JSON-LD](${BASE_URL}/feeds/blog.jsonl), one object per line
- [Whole site index](${BASE_URL}/llms.txt)
- [When to use this site](${BASE_URL}/agents.md)
`;

export function GET() {
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
