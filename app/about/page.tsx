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
    "Jo Mändle — full-stack engineer and Principal Solution Architect making AI a first-class teammate in how software gets built.",
};

export default function AboutPage() {
  return (
    <main id="main-content" className="page-container">
      <div
        className="glass-container mx-auto flex max-w-3xl flex-col gap-16"
        style={{ viewTransitionName: "main-content" }}
      >
        <PageTopBar currentPath="/about" />

        {/* Masthead */}
        <header className="flex flex-col gap-6">
          <H2>About — {SITE.name}</H2>
          <H1 className="max-w-[18ch]">
            Engineer by craft, architect by trade, writer by habit.
          </H1>
          <div className="flex items-center gap-5">
            <Image
              src={SITE.avatar}
              alt={SITE.name}
              width={96}
              height={96}
              className="size-20 rounded-full object-cover md:size-24"
            />
            {SITE.availableForWork && (
              <span className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-block size-[7px] animate-pulse rounded-full bg-emerald-500" />
                Available for work
              </span>
            )}
          </div>
        </header>

        {/* Bio */}
        <section className="flex max-w-[60ch] flex-col gap-5 text-[1.05rem] leading-relaxed text-foreground/90">
          <p>
            I&apos;m a full-stack engineer and Principal Solution Architect at
            E.ON Digital Technology, where I lead how AI is woven into the
            software development lifecycle — from architecture and tooling to
            the day-to-day habits of the teams shipping the work.
          </p>
          <p>
            My background is front-end at its core. I came up sweating the
            details of the web platform — performance, accessibility, the new
            CSS and HTML primitives — and that obsession with craft is still the
            lens I bring to everything, including where AI genuinely helps and
            where it just adds noise.
          </p>
          <p>
            Outside the day job I build: a photography platform, a links
            archive, a music player for my band, a freelance-tracking tool. I
            write about what I learn and keep a public trail of side projects
            because making things is how I think.
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
                <H3 className="text-[1.25rem]">{p.title}</H3>
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
        <Footer />
      </div>
    </main>
  );
}
