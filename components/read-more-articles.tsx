import { BLOG_POSTS } from "@/lib/state/blog";
import { H2 } from "@/components/ui/heading";

export const ReadMoreArticles = ({ currentSlug }: { currentSlug: string }) => {
  const filteredArticles = BLOG_POSTS.filter(
    (article) => article.slug !== currentSlug,
  ).slice(0, 3);

  return (
    <div className="flex flex-col xl:hidden">
      <H2>Read more articles</H2>
      <ul className="flex flex-col gap-4">
        {filteredArticles.map((article) => (
          <li
            key={article.slug}
            className="mb-2 rounded-md border border-neutral-800 px-3 py-2 hover:bg-neutral-900"
          >
            <a
              href={`/blog/${article.slug}`}
              className="flex flex-col text-primary"
            >
              <span>{article.title}</span>
              <span className="text-xs text-muted-foreground">
                {article.date}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
