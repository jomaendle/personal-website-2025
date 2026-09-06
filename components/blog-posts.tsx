import { Link } from "next-view-transitions";
import { H3 } from "@/components/ui/heading";
import { ViewCounter } from "@/components/view-counter";
import { BLOG_POSTS } from "@/lib/state/blog";
import { categoryFor } from "@/lib/state/writing-categories";

const HOMEPAGE_POST_COUNT = 5;

/**
 * The latest articles on the homepage, server-rendered. The full list lives at
 * /blog; a link there replaces the old show-more toggle. `ViewCounter` is the
 * only client island in the row.
 */
export function BlogPosts() {
  return (
    <div className="-mx-3 flex flex-col">
      {BLOG_POSTS.slice(0, HOMEPAGE_POST_COUNT).map((post) => (
        <article
          key={post.slug}
          style={{ viewTransitionName: `blog-card-${post.slug}` }}
        >
          <Link
            href={`/blog/${post.slug}`}
            className="ledger-row group flex items-center gap-4 border-border border-b px-3 py-4"
            prefetch={false}
          >
            <span className="hidden w-[96px] shrink-0 font-mono text-brand text-xs uppercase tracking-wider sm:block">
              {categoryFor(post.slug)}
            </span>
            <div className="flex-1">
              <H3
                className="line-clamp-2"
                style={{ viewTransitionName: `blog-title-${post.slug}` }}
              >
                {post.title}
              </H3>
              <p
                style={{ viewTransitionName: `blog-date-${post.slug}` }}
                className="mt-1 font-mono text-muted-foreground text-xs transition-colors"
              >
                {post.date}
              </p>
            </div>
            <span className="transition-colors group-hover:text-brand">
              <ViewCounter slug={post.slug} shouldIncrement={false} />
            </span>
          </Link>
        </article>
      ))}
      <Link
        href="/blog"
        className="mt-6 inline-flex min-h-[44px] w-fit items-center px-3 font-mono text-muted-foreground text-xs uppercase tracking-[0.14em] transition-colors hover:text-brand"
      >
        All writing
        <span aria-hidden="true" className="ml-1.5">
          →
        </span>
      </Link>
    </div>
  );
}
