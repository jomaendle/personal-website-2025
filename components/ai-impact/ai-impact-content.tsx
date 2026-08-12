import { Link } from "next-view-transitions";
import { H1, H2, H3 } from "@/components/ui/heading";
import { Footer } from "@/components/ui/footer";
import { PageTopBar } from "@/components/ui/page-top-bar";
import { SITE } from "@/lib/config/site";
import { AI_IMPACT_COPY, type Lang } from "@/lib/state/ai-impact-copy";

/**
 * AiImpactContent — the four-week AI impact audit, /ki-wirkung and /ai-impact.
 *
 * A server component with no client island at all: this page has no form, and
 * the FAQ is native `details`/`summary`, so nothing here needs JavaScript.
 *
 * One call to action on the whole page, the booking link, repeated three times
 * (hero, after the price, at the close). There is deliberately no inquiry form
 * and no newsletter: the buyer here owns a budget line and is deciding whether
 * to spend 20 minutes, not filling in six fields.
 *
 * Copy lives in `lib/state/ai-impact-copy.ts`, so this file is presentation
 * only and the `.md` mirrors render from the same source.
 */

/** Shared link classes, so the three CTAs cannot drift apart. */
const CTA_CLASS =
  "inline-flex h-11 items-center justify-center rounded-[0.25rem] bg-foreground px-6 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function BookingCta({ label }: { label: string }) {
  return (
    <a
      href={SITE.contact.booking}
      target="_blank"
      rel="noopener noreferrer"
      className={CTA_CLASS}
    >
      {label}
      <span className="sr-only"> (opens in new window)</span>
    </a>
  );
}

export function AiImpactContent({ lang }: { lang: Lang }) {
  const t = AI_IMPACT_COPY[lang];

  return (
    <div className="page-container">
      <div
        className="glass-container mx-auto flex max-w-3xl flex-col gap-16"
        style={{ viewTransitionName: "main-content" }}
        itemScope
        itemType="https://schema.org/Service"
      >
        <PageTopBar
          currentPath={t.path}
          trailing={
            <Link
              href={t.switchHref}
              hrefLang={lang === "de" ? "en" : "de"}
              aria-label={t.switchLabel}
              // -mx-2 keeps the optical position while the padding lifts the
              // tap target to 44px tall, matching /business.
              className="-mx-2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center px-2 font-mono text-sm tracking-[0.04em] text-muted-foreground transition-colors hover:text-brand"
            >
              {t.switchTo}
            </Link>
          }
        />

        <main
          id="main-content"
          tabIndex={-1}
          lang={lang}
          className="flex flex-col gap-16"
        >
          {/* Masthead. A `<header>` nested in `<main>` is not a banner
              landmark, so this does not compete with the top bar. */}
          <header className="flex flex-col gap-6">
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.16em] text-brand">
              {t.hero.eyebrow}
            </p>
            <H1 className="max-w-[20ch]" itemProp="name">
              {t.hero.heading}
            </H1>
            <p
              className="max-w-[52ch] text-[1.05rem] leading-relaxed text-foreground/90"
              itemProp="description"
            >
              {t.hero.lede}
            </p>

            {/* The next free slot sits before the CTA rather than after it: a
                date that does not work is the first thing that disqualifies a
                reader, so it should not sit below the fold. */}
            <p className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-brand">
              {t.hero.availability}
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
              <BookingCta label={t.hero.cta} />
              {/* Not a second CTA: an in-page jump for someone who wants to
                  read the scope before booking anything. Text link, so it
                  cannot read as a competing button. */}
              <a
                href="#audit"
                className="inline-flex min-h-[44px] items-center rounded-[0.15rem] font-mono text-[0.75rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t.hero.jumpLabel}{" "}
                <span aria-hidden="true" className="ml-1.5">
                  ↓
                </span>
              </a>
            </div>
          </header>

          {/* The problem, as hairline rows. Same construction as the services
              list on /business: nothing here is clickable, so no `ledger-row`
              and no horizontal bleed. */}
          <section>
            <H2>{t.problem.heading}</H2>
            <div className="flex flex-col">
              {t.problem.items.map((item) => (
                <div key={item.title} className="border-b border-border py-4">
                  <H3 interactive={false}>{item.title}</H3>
                  <p className="mt-1 max-w-[62ch] text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-6 max-w-[60ch] text-[1.05rem] leading-relaxed text-foreground/90">
              {t.problem.closing}
            </p>
          </section>

          {/* The audit itself. `scroll-mt-8` so the hero's jump link does not
              park the heading under the top edge of the viewport. */}
          <section id="audit" className="scroll-mt-8">
            <H2>{t.audit.heading}</H2>
            <p className="mb-8 max-w-[60ch] text-[1.05rem] leading-relaxed text-foreground/90">
              {t.audit.lede}
            </p>
            <dl className="flex flex-col">
              {t.audit.weeks.map((week) => (
                <div
                  key={week.label}
                  className="flex flex-col gap-2 border-b border-border py-5 sm:flex-row sm:gap-6"
                >
                  <dt className="pt-1 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-brand sm:w-24 sm:shrink-0">
                    {week.label}
                  </dt>
                  <dd className="flex flex-col gap-1">
                    <H3 interactive={false}>{week.title}</H3>
                    <p className="max-w-[58ch] text-muted-foreground">
                      {week.desc}
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Deliverables */}
          <section>
            <H2>{t.outcome.heading}</H2>
            <ul className="flex max-w-[60ch] flex-col gap-2 text-muted-foreground">
              {t.outcome.items.map((item) => (
                <li
                  key={item}
                  className="before:mr-2 before:text-brand before:content-['→']"
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-[60ch] text-[1.05rem] leading-relaxed text-foreground/90">
              {t.outcome.closing}
            </p>
          </section>

          {/* The measurement argument. The most important section on the page,
              so it is the only one with a filled surface: the same tinted panel
              /business uses for its booking block, at a larger inset and with
              the section heading pulled inside it. No new token, no new size. */}
          <section className="rounded-[0.35rem] border border-brand/25 bg-brand/[0.05] p-6 sm:p-8">
            <H2>{t.measurement.heading}</H2>
            <div className="flex flex-col gap-8">
              {t.measurement.blocks.map((block) => (
                <div key={block.title} className="flex flex-col gap-3">
                  <H3 interactive={false}>{block.title}</H3>
                  {block.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="max-w-[60ch] leading-relaxed text-foreground/90"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* Scope and price, then the second CTA. Someone who has just read
              the number is at the point of deciding. */}
          <section>
            <H2>{t.scope.heading}</H2>
            <p className="mb-8 font-mono text-[0.8rem] uppercase tracking-[0.12em] text-foreground">
              {t.scope.priceLine}
            </p>
            <dl className="flex flex-col">
              {t.scope.rows.map((row) => (
                <div
                  key={row.term}
                  className="flex flex-col gap-2 border-b border-border py-4 sm:flex-row sm:gap-6"
                >
                  {/* w-40, not w-32: "Passt nicht, wenn" wrapped onto two
                      lines at the narrower width and left the term column
                      taller than the definition beside it. */}
                  <dt className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-brand sm:w-40 sm:shrink-0">
                    {row.term}
                  </dt>
                  <dd className="max-w-[58ch] text-muted-foreground">
                    {row.desc}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-8">
              <BookingCta label={t.hero.cta} />
            </div>
          </section>

          {/* FAQ. Native disclosure widgets: keyboard and screen reader
              behaviour comes from the browser, and the page ships no JS for it.
              The default triangle is removed on both engines and replaced with
              a `+` that rotates into a `×` when the row is open. */}
          <section>
            <H2>{t.faq.heading}</H2>
            <div className="flex flex-col">
              {t.faq.items.map((item) => (
                <details
                  key={item.question}
                  className="group border-b border-border"
                >
                  <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 py-4 font-serif text-[1.2rem] leading-snug text-foreground transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <span
                      aria-hidden="true"
                      className="shrink-0 font-mono text-sm text-brand transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="max-w-[62ch] pb-5 text-muted-foreground">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Close. Third and last CTA. */}
          <section>
            <H2>{t.close.heading}</H2>
            <p className="max-w-[52ch] font-serif text-[1.5rem] leading-snug text-foreground">
              {t.close.lede}
            </p>
            <p className="mt-5 max-w-[60ch] text-[1.05rem] leading-relaxed text-foreground/90">
              {t.close.body}
            </p>

            <div className="mt-8">
              <BookingCta label={t.close.cta} />
            </div>

            <address className="mt-8 flex flex-col gap-2 text-sm not-italic text-muted-foreground">
              <span>
                {t.close.emailLabel}:{" "}
                <a
                  href={`mailto:${SITE.contact.email}`}
                  className="text-foreground transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  itemProp="email"
                >
                  {SITE.contact.email}
                </a>
              </span>
              <a
                href={t.markdownHref}
                className="w-fit text-xs text-muted-foreground transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t.markdownLabel}
              </a>
            </address>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
