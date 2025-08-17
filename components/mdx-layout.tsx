import { ViewCounterWithProvider } from "@/components/view-counter-provider";
import { BlogPostList } from "@/components/blog-posts";
import { Footer } from "@/components/ui/footer";
import { Link } from "next-view-transitions";
import NewsletterForm from "@/components/newsletter";
import { ReadMoreArticles } from "@/components/read-more-articles";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import {
  MobileTableOfContents,
  TableOfContents,
} from "@/components/table-of-contents";
import { ReadingTime } from "@/components/reading-time";
import { BackToTop } from "@/components/back-to-top";

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
      <ScrollProgress />
      <div className="mx-auto max-w-2xl">
        <div className="sticky top-0 z-[100] mb-4 flex h-20 items-center justify-center gap-12 bg-gradient-to-b from-[hsl(var(--background))] from-35% md:h-28 md:from-25%">
          <div className="relative -top-3 flex w-full items-center justify-center md:-top-8">
            <div className="absolute left-0 xl:hidden">
              <BackLink />
            </div>
            <Link href="/">
              <p className="text-white">Jo Mändle</p>
            </Link>
          </div>
        </div>

        <div className="mb-12 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <time dateTime={metadata.date}>{metadata.date}</time>
            <span>•</span>
            <ReadingTime />
          </div>
          <ViewCounterWithProvider slug={slug} shouldIncrement={true} />
        </div>

        <div
          className="fixed left-12 top-[100px] hidden max-w-[240px] flex-col gap-6 overflow-y-hidden xl:flex"
          style={{
            maxHeight: "calc(100vh - 200px)",
          }}
        >
          <div className="mb-12">
            <BackLink />
          </div>

          <BlogPostList currentSlug={slug} />
        </div>

        <MobileTableOfContents />

        <div className="prose">{children}</div>

        <TableOfContents />

        <hr className="my-12" />

        <ReadMoreArticles currentSlug={slug} />

        <NewsletterForm />

        <Footer />
      </div>

      <BackToTop />
    </main>
  );
}

function BackLink() {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-all duration-200 hover:text-primary"
    >
      <span className="transition-transform duration-200">←</span>
      Back
    </Link>
  );
}
