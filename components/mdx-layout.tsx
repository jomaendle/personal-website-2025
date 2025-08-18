import { ViewCounterWithProvider } from "@/components/view-counter-provider";
import { SidebarNavigation } from "@/components/sidebar-navigation";
import { Footer } from "@/components/ui/footer";
import { Link } from "next-view-transitions";
import NewsletterForm from "@/components/newsletter";
import { ReadMoreArticles } from "@/components/read-more-articles";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { MobileTableOfContents } from "@/components/table-of-contents";
import { ReadingTime } from "@/components/reading-time";
import { BackToTop } from "@/components/back-to-top";
import { Button } from "@/components/ui/button";

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
    <main className="overflow-x-hidden px-6 py-6 pb-16 md:px-16 md:py-16 md:pb-24 lg:pb-24">
      <ScrollProgress />
      <div className="mx-auto flex max-w-2xl flex-col items-stretch">
        <div className="glass-header sticky top-0 z-[100] mb-4 flex h-20 items-center justify-center gap-12 md:h-24">
          <div
            className="relative -top-3 z-[200] flex w-full items-center justify-center"
            style={{ zIndex: 10 }}
          >
            <div className="absolute left-0 z-[101] xl:hidden">
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
          className="fixed left-12 top-[100px] hidden w-[240px] flex-col gap-6 overflow-y-hidden xl:flex 2xl:w-[300px]"
          style={{
            maxHeight: "calc(100svh - 200px)",
          }}
        >
          <div className="mb-12">
            <BackLink />
          </div>

          <SidebarNavigation currentSlug={slug} />
        </div>

        <div className="relative -mt-2 mb-8 h-10">
          <div className="absolute inset-0 z-0 h-9 rounded-md border motion-opacity-in">
            <Button variant="outline" className="w-full justify-between">
              On This Page
              <span>↓</span>
            </Button>
          </div>
          <MobileTableOfContents />
        </div>

        <div className="prose">{children}</div>

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
