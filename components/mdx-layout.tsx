import Image from "next/image";
import { Link } from "next-view-transitions";
import BackToTop from "@/components/back-to-top-lazy";
import GiscusComments from "@/components/giscus-comments-lazy";
import NewsletterForm from "@/components/newsletter";
import { ReadMoreArticles } from "@/components/read-more-articles";
import SidebarNavigation from "@/components/sidebar-navigation-lazy";
import { BlogPostStructuredData } from "@/components/structured-data";
import MobileTableOfContents from "@/components/table-of-contents-lazy";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { ViewCounter } from "@/components/view-counter";
import { SITE } from "@/lib/config/site";
import { BLOG_POSTS } from "@/lib/state/blog";
import { categoryFor } from "@/lib/state/writing-categories";

/**
 * MdxLayout — Editorial design layer.
 *
 * Same props (children, slug, metadata) and the same furniture (sidebar,
 * scroll progress, ToC, comments, read-more). Two things differ from the
 * plain layout:
 *
 *  · An editorial meta header above the article — a brand category eyebrow
 *    and an author row, replacing the bare date line. Serif title and
 *    pull-quotes come from `app/editorial-theme.css`.
 *  · A two-column shell instead of `.page-container`. The sidebar used to be
 *    `fixed left-12`, which overlapped the centred article between 1280px and
 *    1344px and painted over it. Sidebar and article now share one centred
 *    flex row, so they can never collide and the leftover margin is split
 *    evenly on both sides rather than pooling on the right. The shell inlines
 *    `.page-container`'s `relative z-20` (the ambient light field in
 *    `editorial-theme.css` relies on content sitting above it) but sets its
 *    own widths, since `.page-container`'s `max-w-3xl` would cap the pair.
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
  // `BlogPosting` JSON-LD was written but never rendered, so articles shipped
  // with no Article structured data at all. Title comes from BLOG_POSTS rather
  // than a prop so it cannot drift from the blog index; drafts absent from that
  // array simply emit nothing, which is correct for an unpublished post.
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  return (
    <>
      <ScrollProgress />

      {post && (
        <BlogPostStructuredData
          title={post.title}
          url={`https://www.jomaendle.com/blog/${slug}`}
          datePublished={new Date(post.date).toISOString()}
        />
      )}

      <div className="relative z-20 mx-auto w-full 3xl:max-w-[1132px] max-w-3xl px-3 py-16 sm:px-6 xl:max-w-[1072px]">
        <div className="flex justify-center gap-16">
          <aside
            className="sticky top-[100px] hidden 3xl:w-[300px] w-[240px] shrink-0 flex-col gap-6 self-start xl:flex"
            style={{ maxHeight: "calc(100svh - 200px)" }}
          >
            <div className="mb-12">
              <BackLink />
            </div>
            <SidebarNavigation currentSlug={slug} />
          </aside>

          <div
            className="glass-container min-w-0 flex-1 xl:max-w-3xl"
            style={{ viewTransitionName: "main-content" }}
          >
            {/* Landmark contract: <header> and <Footer /> are siblings of
                <main id="main-content">, all three inside .glass-container.
                Nesting either one inside <main> costs it its implicit
                banner/contentinfo role. */}
            <header className="z-51 flex h-24 items-center justify-center gap-12">
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
            </header>

            <main id="main-content" tabIndex={-1} className="overflow-x-clip">
              <div className="mx-auto max-w-3xl">
                <div className="mb-4 h-4"></div>

                {/* Editorial meta header */}
                <div className="mb-10 flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 font-mono text-muted-foreground text-xs uppercase tracking-wider">
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
                        <div className="font-medium text-foreground text-sm">
                          {SITE.name}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {SITE.shortRole}
                        </div>
                      </div>
                    </div>
                  </div>
                  <ViewCounter slug={slug} shouldIncrement={true} />
                </div>

                <div className="relative -mt-2 mb-8 h-10 xl:hidden">
                  {/* Visual placeholder only: the real, working button renders
                      inside MobileTableOfContents on top of this one once the
                      headings are read from the DOM. Without aria-hidden and
                      tabIndex={-1} this was a second focusable button in the
                      tab order that could never be activated, sitting covered
                      beneath the live one. pointer-events-none keeps it out of
                      hit testing entirely. */}
                  <div
                    aria-hidden="true"
                    className="motion-opacity-in pointer-events-none absolute inset-0 z-0 h-9 rounded-md border"
                  >
                    <Button
                      variant="outline"
                      tabIndex={-1}
                      className="w-full justify-between"
                    >
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
              </div>
            </main>

            {/* Same `mx-auto max-w-3xl` wrapper the article content uses, so
                moving the footer out of <main> changes the landmark tree
                without changing where it sits on the page. This is also the
                only Footer that carries its own top margin: unlike every other
                route, this container is not a flex column, so there is no
                parent gap for the footer to sit in. */}
            <div className="mx-auto max-w-3xl">
              <Footer className="mt-16" />
            </div>
          </div>
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
      className="group inline-flex items-center gap-2 font-mono text-foreground text-sm transition-all duration-200 hover:text-brand"
    >
      <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
        ←
      </span>
      All writing
    </Link>
  );
}
