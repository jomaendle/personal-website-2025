import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { H1 } from "@/components/ui/heading";
import { Footer } from "@/components/ui/footer";
import { PageTopBar } from "@/components/ui/page-top-bar";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="page-container">
      <div className="glass-container mx-auto flex max-w-3xl flex-col gap-10 sm:gap-16">
        <PageTopBar />

        <main id="main-content" tabIndex={-1} className="flex flex-col gap-6">
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-brand">
            404
          </span>
          <H1 className="max-w-[16ch]">This page wandered off.</H1>
          <p className="max-w-[52ch] text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or may have
            moved.
          </p>
          <Link
            href="/"
            className="font-mono text-sm text-brand underline-offset-4 transition-colors hover:underline"
          >
            ← Back to homepage
          </Link>
        </main>

        <Footer />
      </div>
    </div>
  );
}
