import type { Metadata } from "next";
import Image from "next/image";
import { H1, H2, H3 } from "@/components/ui/heading";
import { PageTopBar } from "@/components/ui/page-top-bar";
import { JobPositions } from "@/components/job-positions";
import NewsletterForm from "@/components/newsletter";
import { Footer } from "@/components/ui/footer";
import { SITE } from "@/lib/config/site";
import { PRINCIPLES } from "@/lib/state/principles";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "About",
  description:
    "Jo Mändle. Full-stack engineer and Principal Solution Architect, working on how AI fits into the way software actually gets built.",
};

export default function AboutPage() {
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
        <PageTopBar currentPath="/about" />

        <main id="main-content" tabIndex={-1} className="flex flex-col gap-16">
          {/* Masthead. The portrait sits beside the title and shares its
              baseline, rather than hanging under it on its own line. The eyebrow
              keeps H2's styling but is a <p>: it labels the page rather than
              opening a section, and as an h2 it put a heading above the h1 in
              the document outline. */}
          <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
            <div className="flex flex-col gap-6">
              <p className="mb-6 font-mono text-xs uppercase tracking-[0.16em] text-brand">
                About
              </p>
              <H1 className="max-w-[18ch]">
                I build for the web, and write about how it keeps changing.
              </H1>
            </div>
            {/* The source image has a white disc baked in, which all but
                disappears against the cream paper. The hairline ring in the
                border token gives it an edge again in both themes. */}
            <Image
              src={SITE.avatar}
              alt={SITE.name}
              width={96}
              height={96}
              className="size-20 shrink-0 rounded-full object-cover ring-1 ring-border md:size-24"
            />
          </header>

          {/* Bio */}
          <section className="flex max-w-[60ch] flex-col gap-5 text-[1.05rem] leading-relaxed text-foreground/90">
            <p>
              I&apos;m a full-stack engineer and Principal Solution Architect at
              E.ON Digital Technology. My job is working out how AI fits into
              the way we build software: the architecture, the tooling, and the
              daily habits of the teams doing the shipping.
            </p>
            <p>
              I come from the front end. Years of performance work,
              accessibility, and whatever new CSS and HTML primitive had just
              landed. I still look at everything that way, including AI. It
              makes it easier to see where it helps and where it only adds
              noise.
            </p>
          </section>

          {/* Principles */}
          <section>
            <H2>How I work</H2>
            <div className="grid gap-8 sm:grid-cols-3">
              {PRINCIPLES.map((p) => (
                <div key={p.num} className="flex flex-col gap-3">
                  <span className="font-mono text-[0.8rem] text-brand">
                    {p.num}
                  </span>
                  <H3 interactive={false} className="text-[1.25rem]">
                    {p.title}
                  </H3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Experience */}
          <section>
            <H2>Experience</H2>
            <div className="space-y-6">
              <JobPositions />
            </div>
          </section>

          <NewsletterForm />
        </main>

        <Footer />
      </div>
    </div>
  );
}
