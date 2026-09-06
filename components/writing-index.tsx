import { Link } from "next-view-transitions";
import { H3 } from "@/components/ui/heading";
import { BLOG_POSTS } from "@/lib/state/blog";
import { categoryFor } from "@/lib/state/writing-categories";

/**
 * Every article, newest first, as hairline ledger rows. Server-rendered, no
 * filters: with under twenty posts the category label is enough to scan by.
 */
export function WritingIndex() {
  return (
    <div className="flex flex-col">
      {BLOG_POSTS.map((post) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          prefetch={false}
          className="ledger-row group flex flex-col gap-1 border-border border-b px-3 py-5 sm:grid sm:grid-cols-[120px_1fr_120px] sm:items-baseline sm:gap-6"
        >
          <span className="font-mono text-brand text-xs uppercase tracking-wider">
            {categoryFor(post.slug)}
          </span>
          {/* `as="h2"`: these rows sit directly under the page h1. */}
          <H3
            as="h2"
            className="text-[clamp(1.25rem,2.4vw,1.7rem)] leading-[1.2]"
          >
            {post.title}
          </H3>
          <span className="font-mono text-muted-foreground text-xs transition-colors sm:justify-self-end">
            {post.date}
          </span>
        </Link>
      ))}
    </div>
  );
}
