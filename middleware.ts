import { type NextRequest, NextResponse } from "next/server";

/**
 * Agent-facing request handling: markdown twins, and discovery headers.
 *
 * Three ways to ask this site for markdown, all of them landing in
 * `app/api/md/[[...path]]/route.ts`:
 *
 * 1. append `.md` to any path — `/contact.md`, `/blog/html-popover.md`
 * 2. send `Accept: text/markdown` — the cold-discovery path, for an agent that
 *    arrives at a URL from search without having read `llms.txt` first
 * 3. add `?mode=agent` — an explicit, linkable opt-in
 *
 * What this deliberately does *not* do is sniff the User-Agent and serve
 * markdown to GPTBot or ClaudeBot on its own initiative. That earns a point in
 * some agent-readiness rubrics, but it means the crawlers this site most wants
 * to reach would never again see the HTML — including the JSON-LD identity
 * graph, which only exists there. Negotiation stays opt-in.
 *
 * Every HTML response also picks up RFC 8288 `Link` headers, so an agent knows
 * where the sitemap, the LLM index and this page's markdown twin are before it
 * parses a single byte of the body.
 */

/**
 * `.md` routes that render their own copy and must not be rewritten.
 *
 * The first three predate this file; `SKILL.md` is the skill artifact whose
 * sha256 is published in the agent-skills index, so it has to be served byte
 * for byte from its own route.
 */
const HAND_WRITTEN_MD = new Set([
  "/business.md",
  "/business/en.md",
  "/ai-impact.md",
  "/skills/hiring-jo-maendle/SKILL.md",
]);

/** Paths that have a markdown twin — kept in step with `lib/agent/markdown`. */
const TWINNED = new Set([
  "/",
  "/blog",
  "/contact",
  "/pricing",
  "/impressum",
  "/datenschutz",
  "/business",
  "/business/en",
  "/ai-impact",
  "/ki-wirkung",
]);

const BLOG_POST = /^\/blog\/[a-z0-9-]+$/;

function hasTwin(pathname: string): boolean {
  return TWINNED.has(pathname) || BLOG_POST.test(pathname);
}

function markdownUrl(request: NextRequest, pathname: string): URL {
  const url = request.nextUrl.clone();
  // `/index.md` and `/` are the same page; the catch-all resolves both.
  url.pathname = `/api/md${pathname === "/" ? "" : pathname}`;
  url.search = "";
  return url;
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname.endsWith(".md") && !HAND_WRITTEN_MD.has(pathname)) {
    const target = pathname.slice(0, -".md".length) || "/";
    return NextResponse.rewrite(markdownUrl(request, target));
  }

  if (searchParams.get("mode") === "agent") {
    return NextResponse.rewrite(markdownUrl(request, pathname));
  }

  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("text/markdown")) {
    return NextResponse.rewrite(markdownUrl(request, pathname));
  }

  const response = NextResponse.next();
  const links = [
    '</sitemap.xml>; rel="sitemap"; type="application/xml"',
    '</llms.txt>; rel="alternate"; type="text/plain"; title="llms.txt"',
    '</agents.md>; rel="help"; type="text/markdown"; title="Agent guide"',
    '</.well-known/ard.json>; rel="service-desc"; type="application/json"',
  ];
  if (hasTwin(pathname)) {
    const twin = pathname === "/" ? "/index.md" : `${pathname}.md`;
    links.unshift(`<${twin}>; rel="alternate"; type="text/markdown"`);
  }
  response.headers.set("Link", links.join(", "));
  // No `Vary: Accept` on the HTML variant, and not for want of trying: Next
  // rebuilds that header for its own RSC variants after middleware runs, and
  // drops anything set here or in `next.config.mjs` `headers()`. The markdown
  // responses do carry it (`app/api/md/[[...path]]/route.ts`), which is the
  // half that matters — a CDN will not hand cached markdown to a browser. The
  // reverse miss degrades to HTML plus the `Link` header above, which points
  // at the `.md` twin on its own URL.
  return response;
}

export const config = {
  /**
   * Everything except Next's own plumbing and the files that are already
   * machine-readable. `/api` is excluded so the rewrite target cannot rewrite
   * itself, and the asset extensions keep images and fonts out of a header pass
   * they gain nothing from.
   */
  matcher: [
    "/((?!_next/static|_next/image|api/|favicon|fonts/|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|woff2?|mp4|css|js|xml|txt|json)$).*)",
  ],
};
