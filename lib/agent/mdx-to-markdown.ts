/**
 * The MDX body of an article, reduced to plain markdown.
 *
 * The `.md` twin of an article is only worth serving if it carries the article.
 * A stub that says "read the HTML version" wastes the fetch it cost, so this
 * reads `app/blog/<slug>/page.mdx` and strips it back to what a markdown reader
 * can use: prose, headings, lists, links and code.
 *
 * This is deliberately a lossy, rule-based pass rather than a real MDX parse.
 * Everything it cannot represent — a Sandpack demo, a live playground — is
 * dropped rather than rendered as broken JSX, and the twin links back to the
 * canonical page where those run. `mdxToMarkdown` is only ever called during the
 * build (every published slug is in `generateStaticParams`), so the filesystem
 * read never happens on a request.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

/** `import ... from "..."`, single or multi-line. */
const IMPORT = /^import[\s\S]*?from\s+["'][^"']+["'];?\s*$/gm;
/** `export const metadata = { ... };` and friends. */
const EXPORT_BLOCK = /^export\s+(const|default|function)[\s\S]*?^\}?;?\s*$/gm;
/** `export const dynamic = 'force-static'` — a one-liner the block misses. */
const EXPORT_LINE = /^export\s+const\s+\w+\s*=\s*[^;\n]+;?\s*$/gm;
/** A bare JSX expression on its own line. */
const EXPRESSION_LINE = /^\s*\{[^}]*\}\s*$/gm;
/** `<CodeBlock language="ts" code={`…`} />`, in any attribute order. */
const CODE_BLOCK =
  /<CodeBlock\b(?=[^>]*\bcode=\{`)[^>]*?\/>|<CodeBlock\b[\s\S]*?\/>/g;
const CODE_ATTR = /code=\{`([\s\S]*?)`\}/;
const LANGUAGE_ATTR = /language=["']([^"']+)["']/;
/**
 * A component element starting at column zero — self-closing or paired.
 *
 * The `^` anchor matters: the same syntax indented inside a code fence is an
 * example the article is teaching, not markup to delete.
 */
const JSX_ELEMENT = /^<([A-Z]\w*)\b[\s\S]*?(?:\/>|<\/\1>)\s*$/gm;
/** Inline presentational HTML the prose uses (`<i>`, `<br/>`, `<kbd>`). */
const INLINE_HTML = /<\/?(?:i|b|em|strong|kbd|br|small|sub|sup)\s*\/?>/g;
/** Three or more blank lines, left behind by the strips above. */
const BLANK_RUN = /\n{3,}/g;
/** `{metadata.title}` / `{metadata.date}` — every post titles itself this way. */
const METADATA_TITLE = /\{\s*metadata\.title\s*\}/g;
const METADATA_DATE = /\{\s*metadata\.date\s*\}/g;

/**
 * Placeholder for a code fence lifted out before the JSX strips run.
 *
 * It has to be a string no article would ever write, and printable — an ASCII
 * control character here would leave NUL bytes in the served markdown.
 */
const FENCE_OPEN = "@@mdx-fence-";
const FENCE_CLOSE = "-mdx-fence@@";
const FENCE_REF = /@@mdx-fence-(\d+)-mdx-fence@@/g;

function toFence(match: string): string {
  const code = CODE_ATTR.exec(match)?.[1];
  if (!code) return "";
  const language = LANGUAGE_ATTR.exec(match)?.[1] ?? "";
  return `\`\`\`${language}\n${code.trim()}\n\`\`\``;
}

/**
 * Convert one article's MDX source to markdown.
 *
 * Returns `null` when the file is missing or strips down to nothing, so a slug
 * that is listed in `BLOG_POSTS` but unreadable on disk degrades to the stub
 * twin instead of throwing the whole build.
 */
export function mdxToMarkdown(
  slug: string,
  meta: { title: string; date: string },
): string | null {
  let source: string;
  try {
    source = readFileSync(
      join(process.cwd(), "app", "blog", slug, "page.mdx"),
      "utf8",
    );
  } catch {
    return null;
  }

  const fences: string[] = [];
  let body = source.replace(CODE_BLOCK, (match) => {
    const fence = toFence(match);
    if (!fence) return "";
    fences.push(fence);
    return `${FENCE_OPEN}${fences.length - 1}${FENCE_CLOSE}`;
  });

  body = body
    .replace(METADATA_TITLE, meta.title)
    .replace(METADATA_DATE, meta.date)
    .replace(IMPORT, "")
    .replace(EXPORT_BLOCK, "")
    .replace(EXPORT_LINE, "")
    .replace(JSX_ELEMENT, "")
    .replace(EXPRESSION_LINE, "")
    .replace(INLINE_HTML, "")
    .replace(BLANK_RUN, "\n\n")
    .trim();

  body = body.replace(FENCE_REF, (_, index) => fences[Number(index)] ?? "");

  return body.trim() || null;
}
