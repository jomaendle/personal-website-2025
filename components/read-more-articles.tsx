import { BLOG_POSTS } from "@/lib/state/blog";
import { H2, H3 } from "@/components/ui/heading";
import { categoryFor } from "@/lib/state/writing-categories";
import { Link } from "next-view-transitions";

/**
 * ReadMoreArticles — Editorial design layer.
 *
 * The below-article "more articles" list, shown only under `xl` where the
 * sidebar navigation is hidden. Uses the same hairline ledger row as
 * `blog-posts.tsx` and `writing-index.tsx`: mono category eyebrow, serif title,
 * mono date.
 */

export const ReadMoreArticles = ({ currentSlug }: { currentSlug: string }) => {
  const filteredArticles = BLOG_POSTS.filter(
    (article) => article.slug !== currentSlug,
  ).slice(0, 3);

  return (
    <div className="flex flex-col xl:hidden">
      <H2>more articles</H2>
      <ul className="-mx-3 flex flex-col">
        {filteredArticles.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/blog/${article.slug}`}
              className="group flex items-center gap-4 border-b border-border px-3 py-4 ledger-row"
            >
              <span className="hidden w-[96px] shrink-0 font-mono text-xs uppercase tracking-[0.05em] text-brand sm:block">
                {categoryFor(article.slug)}
              </span>
              <div className="flex-1">
                <H3 className="line-clamp-2">{article.title}</H3>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {article.date}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
