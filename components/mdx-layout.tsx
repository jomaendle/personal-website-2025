import { ViewCounterWithProvider } from "@/components/view-counter-provider";
import { BlogPostList } from "@/components/blog-posts";
import { Footer } from "@/components/ui/footer";
import { Link } from "next-view-transitions";
import NewsletterForm from "@/components/newsletter";
import { NameHeading } from "@/components/name-heading";
import { ReadMoreArticles } from "@/components/read-more-articles";

export default function MdxLayout({
  children,
  metadata,
  slug,
}: {
  children: React.ReactNode;
  slug: string;
  metadata: { date: string };
}) {
  return (
    <main className="px-6 py-16 md:px-16 md:py-24 lg:px-24">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <NameHeading />
        </div>

        <div className="xl:hidden">
          <BackLink />
        </div>

        <div className="mb-12 flex items-center justify-between gap-3">
          {metadata.date}
          <ViewCounterWithProvider slug={slug} shouldIncrement={true} />
        </div>

        <div className="fixed left-12 top-[100px] hidden max-w-[240px] flex-col gap-6 xl:flex">
          <BackLink />

          <BlogPostList currentSlug={slug} />
        </div>

        <div className="prose">{children}</div>

        <hr className="my-12" />

        <ReadMoreArticles currentSlug={slug} />

        <NewsletterForm />

        <Footer />
      </div>
    </main>
  );
}

function BackLink() {
  return (
    <Link
      href="/"
      className="mb-12 inline-block text-sm text-muted-foreground transition-colors hover:text-primary"
    >
      ← Back
    </Link>
  );
}
