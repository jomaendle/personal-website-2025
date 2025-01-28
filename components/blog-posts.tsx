import { H2, H3 } from "@/components/ui/heading";
import { Link } from "next-view-transitions";
import { ViewCounterWithProvider } from "@/components/view-counter-provider";
import { blogPosts } from "@/lib/state/blog";

export function BlogPosts() {
  return (
    <>
      {blogPosts.map((post, index) => (
        <article key={index}>
          <Link
            href={"/blog/" + post.slug}
            className="group -mx-3 flex items-center gap-4 rounded-[.25rem] px-3 py-2 transition-colors hover:bg-white/[0.03]"
            prefetch={false}
          >
            <div className="flex-1">
              <H3 className="line-clamp-2">{post.title}</H3>
              <p className="text-sm text-muted-foreground">{post.date}</p>
            </div>
            <ViewCounterWithProvider slug={post.slug} shouldIncrement={false} />
          </Link>
        </article>
      ))}
    </>
  );
}

export function BlogPostList({ currentSlug }: { currentSlug: string }) {
  return (
    <aside className="flex flex-col gap-6 text-sm">
      <H2 className="mb-0">More Posts</H2>

      <div className="flex flex-col gap-4">
        {blogPosts
          .filter((post) => post.slug !== currentSlug)
          .map((post, index) => (
            <article key={index}>
              <Link
                href={"/blog/" + post.slug}
                className="group flex items-center gap-4 transition-colors hover:text-neutral-400"
                prefetch={false}
              >
                <H3 className="line-clamp-2">{post.title}</H3>
              </Link>
            </article>
          ))}
      </div>
    </aside>
  );
}
