import { Link } from "next-view-transitions";
import { Footer } from "@/components/ui/footer";
import { BlogPostList } from "@/components/blog-posts";
import { ViewCounterWithProvider } from "@/components/view-counter-provider";
import { blogPosts } from "@/lib/state/blog";

interface BlogPostProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ params: { slug: p.slug } }));
}

export const dynamicParams = false;

export default async function BlogPost({ params }: BlogPostProps) {
  const slug = params.slug;

  const { default: Post, metadata } = await import(
    `@/content/blog/${slug}.mdx`
  );

  if (!metadata || !metadata.date) {
    throw new Error(`Metadata is missing for blog post: ${slug}`);
  }

  return (
    <main className="px-6 py-16 md:px-16 md:py-24 lg:px-24">
      <div className="max-w-2xl mx-auto">
        <div className="xl:hidden">
          <BackLink />
        </div>

        <div className="flex justify-between items-center gap-3 mb-12">
          {metadata.date}
          <ViewCounterWithProvider slug={slug} shouldIncrement={true} />
        </div>

        <div className="fixed hidden xl:flex top-[100px] left-12 flex-col gap-6 max-w-[240px]">
          <BackLink />

          <BlogPostList currentSlug={slug} />
        </div>

        <div className="prose">
          <Post />
        </div>

        <Footer />
      </div>
    </main>
  );
}

function BackLink() {
  return (
    <Link
      href="/"
      className="inline-block text-sm text-muted-foreground hover:text-primary transition-colors mb-12"
    >
      ← Back
    </Link>
  );
}
