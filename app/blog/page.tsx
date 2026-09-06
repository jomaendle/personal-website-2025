import type { Metadata } from "next";
import { Footer } from "@/components/ui/footer";
import { H1 } from "@/components/ui/heading";
import { PageTopBar } from "@/components/ui/page-top-bar";
import { WritingIndex } from "@/components/writing-index";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes on the web platform, front-end details, and building software with AI.",
};

export default function WritingPage() {
  return (
    <div className="page-container">
      <div
        className="glass-container mx-auto flex max-w-3xl flex-col gap-10 sm:gap-16"
        style={{ viewTransitionName: "main-content" }}
      >
        {/* Landmark contract: PageTopBar's <header> and <Footer /> are siblings
            of <main id="main-content">, never inside it — a <header> or
            <footer> nested in sectioning content loses its implicit role. The
            masthead <header> below stays inside <main> for the same reason,
            inverted: outside it the page would expose two banners. */}
        <PageTopBar currentPath="/blog" />

        <main id="main-content" tabIndex={-1} className="flex flex-col gap-16">
          {/* Masthead. The eyebrow carries H2's styling but is a <p>: it labels
              the page rather than opening a section, and as an h2 it put a
              heading above the h1 in the document outline. */}
          <header className="flex flex-col gap-5">
            <p className="mb-6 font-mono text-brand text-xs uppercase tracking-[0.16em]">
              Writing
            </p>
            <H1 className="max-w-[16ch]">
              Notes on the web platform, and on building with AI.
            </H1>
          </header>

          <WritingIndex />
        </main>

        <Footer />
      </div>
    </div>
  );
}
