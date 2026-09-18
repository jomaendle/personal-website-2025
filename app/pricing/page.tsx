import type { Metadata } from "next";
import { PricingStructuredData } from "@/components/structured-data";
import { Footer } from "@/components/ui/footer";
import { BlogH1, H2 } from "@/components/ui/heading";
import { PageTopBar } from "@/components/ui/page-top-bar";
import { SITE } from "@/lib/config/site";
import { PRICE_EUR } from "@/lib/state/ai-impact-copy";

export const dynamic = "force-static";

const description =
  "One published fixed price — the four-week AI impact audit — and what is quoted per engagement instead. No hidden rate card.";

export const metadata: Metadata = {
  title: "Pricing",
  description,
  alternates: {
    canonical: "/pricing",
    types: { "text/markdown": "/pricing.md" },
  },
  openGraph: { title: "Pricing | Jo Mändle", description },
};

const link = "underline underline-offset-4 transition-colors hover:text-brand";

const priceLabel = `€${PRICE_EUR.toLocaleString("en-US")}`;

export default function PricingPage() {
  return (
    <div className="page-container">
      <div
        className="glass-container mx-auto flex max-w-3xl flex-col gap-10 sm:gap-16"
        style={{ viewTransitionName: "main-content" }}
      >
        <PageTopBar />

        <main id="main-content" tabIndex={-1} className="flex flex-col gap-10">
          <section>
            <p className="mb-6 font-mono text-brand text-xs uppercase tracking-[0.16em]">
              What things cost
            </p>
            <BlogH1>Pricing</BlogH1>
            <p className="mt-4 max-w-[60ch] text-[1.05rem] text-foreground/90 leading-relaxed">
              Two things are on offer. One carries a published fixed price; the
              other is quoted per engagement. Both numbers below are the ones
              the rest of this site publishes — there is no hidden rate card.
            </p>
          </section>

          <section>
            <H2>AI impact audit</H2>
            <p className="font-mono text-2xl text-brand">
              {priceLabel}
              <span className="ml-2 font-sans text-base text-muted-foreground">
                fixed price · four weeks
              </span>
            </p>
            <p className="mt-4 max-w-[60ch] text-muted-foreground">
              A self-contained mandate that measures what AI actually changed in
              your delivery: at team and repository level, with no per-developer
              analysis. All deliverables included. EUR, plus German VAT where
              applicable.
            </p>
            <p className="mt-4 text-muted-foreground">
              Scope, the week-by-week plan and the FAQ:{" "}
              <a href="/ai-impact" className={link}>
                /ai-impact
              </a>{" "}
              (
              <a href="/ki-wirkung" className={link}>
                auf Deutsch
              </a>
              ).
            </p>
          </section>

          <section>
            <H2>Contract engineering</H2>
            <p className="font-mono text-2xl text-foreground">
              Quoted
              <span className="ml-2 font-sans text-base text-muted-foreground">
                per engagement
              </span>
            </p>
            <p className="mt-4 max-w-[60ch] text-muted-foreground">
              Embedded frontend and AI engineering inside a product team. There
              is no public day rate, because it moves with scope, duration and
              whether the work is remote or on-site. What is fixed:
            </p>
            <ul className="mt-4 max-w-[60ch] list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Billing is by the day, invoiced monthly.</li>
              <li>
                Engagements run in blocks — from two weeks for an audit or an
                architecture review, up to several months embedded in a team.
              </li>
              <li>
                Short, time-boxed mandates can start at short notice; ongoing
                work inside a team starts the following quarter.
              </li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              Full description:{" "}
              <a href="/business/en" className={link}>
                /business/en
              </a>{" "}
              (
              <a href="/business" className={link}>
                auf Deutsch
              </a>
              ). To get a number, send the scope to{" "}
              <a href={`mailto:${SITE.contact.email}`} className={link}>
                {SITE.contact.email}
              </a>{" "}
              or{" "}
              <a
                href={SITE.contact.booking}
                className={link}
                rel="noreferrer"
                target="_blank"
              >
                book a call
              </a>
              . A written quote follows the intro call.
            </p>
          </section>

          <section>
            <H2>What is not sold here</H2>
            <p className="max-w-[60ch] text-muted-foreground">
              This site sells engineering time, not software. There is no
              subscription, no API product, no seat-based plan, and nothing an
              agent can purchase autonomously. This page is available as
              markdown at{" "}
              <a href="/pricing.md" className={link}>
                /pricing.md
              </a>
              .
            </p>
          </section>
        </main>

        <Footer />
      </div>
      <PricingStructuredData />
    </div>
  );
}
