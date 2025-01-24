import { ViewCounterWithProvider } from "@/components/view-counter-provider";
import { BlogPostList } from "@/components/blog-posts";
import { Footer } from "@/components/ui/footer";
import { Link } from "next-view-transitions";

import "./layout.css";

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
      <div className="container w-full grid">
        <div className="xl:hidden">
          <BackLink />
        </div>

        <div className="flex justify-between items-center gap-3 mb-12 text-content">
          {metadata.date}
          <ViewCounterWithProvider slug={slug} shouldIncrement={true} />
        </div>

        <div className="fixed hidden xl:flex top-[100px] left-12 flex-col gap-6 max-w-[240px]">
          <BackLink />

          <BlogPostList currentSlug={slug} />
        </div>

        <div className="prose full-content grid">{children}</div>
        <Footer className="text-content" />
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
