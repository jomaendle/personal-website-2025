import type { Metadata } from "next";
import { H1, H2 } from "@/components/ui/heading";
import { PageTopBar } from "@/components/ui/page-top-bar";
import { WritingIndex } from "@/components/writing-index";
import NewsletterForm from "@/components/newsletter";
import { Footer } from "@/components/ui/footer";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Essays on craft, the web platform, and building software with AI.",
};

export default function WritingPage() {
  return (
    <main id="main-content" className="page-container">
      <div
        className="glass-container mx-auto flex max-w-3xl flex-col gap-12"
        style={{ viewTransitionName: "main-content" }}
      >
        <PageTopBar />

        {/* Masthead */}
        <header className="flex flex-col gap-5">
          <H2>Writing — Notes on the web &amp; AI</H2>
          <H1 className="max-w-[16ch]">
            Essays on craft, the web platform, and building with AI.
          </H1>
          <p className="max-w-[52ch] text-muted-foreground">
            Long-form notes from the work — what I&apos;m learning about making
            AI a dependable part of how software gets shipped, and the front-end
            details worth sweating.
          </p>
        </header>

        <WritingIndex />

        <NewsletterForm />
        <Footer />
      </div>
    </main>
  );
}
