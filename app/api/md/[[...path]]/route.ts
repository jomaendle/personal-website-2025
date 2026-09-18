/**
 * Every public page, as markdown.
 *
 * `middleware.ts` rewrites three kinds of request here: a `.md` URL, a request
 * carrying `Accept: text/markdown`, and `?mode=agent`. They all end up in the
 * same renderer, so the three entry points can never disagree about what a page
 * says.
 *
 * The catch-all is an optional segment rather than a `?path=` query on purpose:
 * `generateStaticParams` can then prerender every known twin at build time,
 * which is the only moment `mdxToMarkdown` is allowed to touch the filesystem.
 * A path that is not prerendered still renders — as the 404 body below.
 */

import {
  renderMarkdownForPath,
  renderNotFoundMarkdown,
} from "@/lib/agent/markdown";
import { BLOG_POSTS } from "@/lib/state/blog";

/** Twins that are worth building ahead of time — i.e. all of them. */
const STATIC_PATHS = [
  [],
  ["index"],
  ["blog"],
  ["contact"],
  ["pricing"],
  ["impressum"],
  ["datenschutz"],
  ["agents"],
  ["business"],
  ["business", "en"],
  ["ai-impact"],
  ["ki-wirkung"],
];

export function generateStaticParams() {
  return [
    ...STATIC_PATHS.map((path) => ({ path })),
    ...BLOG_POSTS.map((post) => ({ path: ["blog", post.slug] })),
  ];
}

const HEADERS = {
  "Content-Type": "text/markdown; charset=utf-8",
  // Without `Accept` in `Vary`, a CDN that cached the HTML variant first would
  // hand it to the next agent asking for markdown, and vice versa. The two
  // representations share a URL, so this is what keeps them apart.
  Vary: "Accept",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  const pathname = `/${(path ?? []).join("/")}`;

  const markdown = renderMarkdownForPath(pathname);
  if (markdown) {
    return new Response(markdown, {
      headers: {
        ...HEADERS,
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  }

  return new Response(renderNotFoundMarkdown(pathname), {
    status: 404,
    headers: { ...HEADERS, "Cache-Control": "no-store" },
  });
}
