import { ViewCounter } from "@/components/view-counter";
import { SidebarNavigation } from "@/components/sidebar-navigation";
import { Footer } from "@/components/ui/footer";
import { Link } from "next-view-transitions";
import Image from "next/image";
import NewsletterForm from "@/components/newsletter";
import { ReadMoreArticles } from "@/components/read-more-articles";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { MobileTableOfContents } from "@/components/table-of-contents";
import { BackToTop } from "@/components/back-to-top";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import GiscusComments from "@/components/giscus-comments-lazy";
import { categoryFor } from "@/lib/state/writing-categories";
import { SITE } from "@/lib/config/site";

/**
 * MdxLayout — Editorial design layer.
 *
 * Same props (children, slug, metadata) and structure (sidebar, scroll
 * progress, ToC, comments, read-more). The only change is an editorial meta
 * header above the article: a brand category eyebrow and an author row,
 * replacing the bare date line. Serif title, drop-cap and pull-quotes come
 * from `app/editorial-theme.css`.
 */

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
    <>
      <ScrollProgress />

      <aside
        className="fixed left-12 top-[100px] z-[51] hidden w-[240px] flex-col gap-6 xl:flex 3xl:w-[300px]"
        style={{ maxHeight: "calc(100svh - 200px)" }}
      >
        <div className="mb-12">
          <BackLink />
        </div>
        <SidebarNavigation currentSlug={slug} />
      </aside>

      <div className="page-container">
        <div
          className="glass-container"
          style={{ viewTransitionName: "main-content" }}
        >
          <div className="z-[51] flex h-24 items-center justify-center gap-12">
            <div className="relative flex w-full max-w-3xl items-center justify-center p-6 md:px-11 lg:px-24">
              <div className="absolute left-0 z-10 xl:hidden">
                <BackLink />
              </div>
              <Link href="/">
                <p className="relative z-10 font-serif text-lg tracking-tight">
                  {SITE.name}
                </p>
              </Link>
              <div className="absolute right-0 z-10">
                <ThemeToggle />
              </div>
            </div>
          </div>

          <main className="glass-container-spacing overflow-x-clip">
            <div className="mx-auto max-w-3xl">
              <div className="mb-4 h-4"></div>

              {/* Editorial meta header */}
              <div className="mb-10 flex items-start justify-between gap-3">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.05em] text-muted-foreground">
                    <span className="text-brand">{categoryFor(slug)}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={metadata.date}>{metadata.date}</time>
                  </div>
                  <div className="flex items-center gap-3">
                    <Image
                      src={SITE.avatar}
                      alt={SITE.name}
                      width={36}
                      height={36}
                      className="size-9 rounded-full object-cover"
                    />
                    <div className="leading-tight">
                      <div className="text-sm font-medium text-foreground">
                        {SITE.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {SITE.shortRole}
                      </div>
                    </div>
                  </div>
                </div>
                <ViewCounter slug={slug} shouldIncrement={true} />
              </div>

              <div className="relative -mt-2 mb-8 h-10 xl:hidden">
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
              <GiscusComments slug={slug} />
              <hr className="my-12" />
              <ReadMoreArticles currentSlug={slug} />
              <NewsletterForm />
              <Footer />
            </div>
          </main>
        </div>
        <BackToTop />
      </div>
    </>
  );
}

function BackLink() {
  return (
    <Link
      href="/blog"
      className="group inline-flex items-center gap-2 font-mono text-sm text-foreground transition-all duration-200 hover:text-brand"
    >
      <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
        ←
      </span>
      All writing
    </Link>
  );
}
