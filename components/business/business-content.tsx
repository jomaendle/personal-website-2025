import { Link } from "next-view-transitions";
import { InquiryForm } from "@/components/business/inquiry-form";
import { Footer } from "@/components/ui/footer";
import { H1, H2, H3 } from "@/components/ui/heading";
import { PageTopBar } from "@/components/ui/page-top-bar";
import { SITE } from "@/lib/config/site";
import { BUSINESS_COPY, type Lang } from "@/lib/state/business-copy";
import { CLIENT_PROJECTS } from "@/lib/state/business-projects";
import { cn } from "@/lib/utils";

/**
 * BusinessContent — the single business page.
 *
 * Six sections: the research, the prices, why me, clients, questions, a call.
 * Deliberately short. The previous version ran to ten sections and roughly
 * 7,500px, which buried the prices below three screens of argument.
 *
 * A server component. Only the inquiry form is a client island, and the FAQ
 * plus the form disclosure are native `details`, so the rest ships no JS.
 *
 * Two elements carry the visual weight. The KPI row makes the argument out of
 * published research instead of adjectives, and the cost figure is the one
 * oversized number on the site. Both follow the stat-tile spec rather than
 * being charts: three headline magnitudes in different units are a KPI row,
 * and there is no honest time series here to plot.
 */

const FOCUS =
  "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const CTA_SOLID = cn(
  "inline-flex h-12 items-center justify-center rounded-lg bg-foreground px-7 font-mono text-[0.75rem] text-background uppercase tracking-[0.14em] transition-opacity hover:opacity-90",
  FOCUS,
);

function BookingCta({ label }: { label: string }) {
  return (
    <a
      href={SITE.contact.booking}
      target="_blank"
      rel="noopener noreferrer"
      className={CTA_SOLID}
    >
      {label}
      <span className="sr-only"> (opens in new window)</span>
    </a>
  );
}

export function BusinessContent({ lang }: { lang: Lang }) {
  const t = BUSINESS_COPY[lang];
  const markdownHref = lang === "de" ? "/business.md" : "/business/en.md";

  return (
    <div className="page-container">
      <div
        className="glass-container mx-auto flex max-w-3xl flex-col gap-10 sm:gap-16"
        style={{ viewTransitionName: "main-content" }}
        itemScope
        itemType="https://schema.org/ProfessionalService"
      >
        <PageTopBar
          currentPath="/business"
          trailing={
            <Link
              href={t.switchHref}
              hrefLang={lang === "de" ? "en" : "de"}
              aria-label={t.switchLabel}
              className={cn(
                "-mx-2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center px-2 font-mono text-muted-foreground text-sm tracking-[0.04em] transition-colors hover:text-brand",
                FOCUS,
              )}
            >
              {t.switchTo}
            </Link>
          }
        />

        {/* Wider section rhythm than the other routes. This page has six
            sections instead of a dozen, so the air between them is what makes
            it read as a pitch rather than a document. */}
        <main
          id="main-content"
          tabIndex={-1}
          lang={lang}
          className="flex flex-col gap-20 sm:gap-28"
        >
          <header className="flex flex-col gap-6">
            <p className="font-mono text-brand text-xs uppercase tracking-[0.16em]">
              {t.hero.eyebrow}
            </p>
            {/* Larger than the shared H1 default: this is the one line on the
                site doing marketing work, and it needs to hold the screen. */}
            <H1
              className="max-w-[16ch] text-[clamp(2.4rem,6vw,4rem)] leading-[1.04]"
              itemProp="name"
            >
              {t.hero.heading}
            </H1>
            <p
              className="max-w-[50ch] text-[1.15rem] text-foreground/90 leading-relaxed"
              itemProp="description"
            >
              {t.hero.lede}
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
              <BookingCta label={t.hero.ctaPrimary} />
              <a
                href="#leistungen"
                className={cn(
                  "inline-flex min-h-[44px] items-center rounded-[0.15rem] font-mono text-[0.75rem] text-muted-foreground uppercase tracking-[0.14em] transition-colors hover:text-brand",
                  FOCUS,
                )}
              >
                {t.hero.jumpLabel}
                <span aria-hidden="true" className="ml-1.5">
                  ↓
                </span>
              </a>
            </div>

            <p className="pt-1 font-mono text-[0.7rem] text-muted-foreground uppercase tracking-[0.14em]">
              {t.hero.availability}
            </p>
          </header>

          {/* The research. A KPI row of three stat tiles, each with its source,
              carrying the argument the old copy made with adjectives. Not a
              chart: three headline magnitudes in different units. */}
          <section>
            <H2>{t.evidence.heading}</H2>
            <dl className="grid gap-px border-border border-y bg-border sm:grid-cols-3">
              {t.evidence.stats.map((stat) => (
                <div
                  key={stat.source + stat.value}
                  className="flex flex-col gap-2 bg-background py-6 sm:px-5 sm:first:pl-0"
                >
                  {/* Proportional figures, not tabular: at display size
                      `tabular-nums` sets a number like 90 % too loose. */}
                  <dd className="font-normal font-serif text-[2.5rem] text-foreground leading-none tracking-[-0.02em]">
                    {stat.value}
                  </dd>
                  <dt className="max-w-[30ch] text-[0.9rem] text-muted-foreground leading-snug">
                    {stat.label}
                  </dt>
                  <p className="mt-auto pt-3 font-mono text-[0.65rem] text-brand uppercase tracking-[0.14em]">
                    {stat.source}
                  </p>
                </div>
              ))}
            </dl>
            <p className="mt-8 max-w-[54ch] text-[1.05rem] text-foreground/90 leading-relaxed">
              {t.evidence.closing}
            </p>
          </section>

          {/* Prices. Three rungs, one recommended. */}
          <section id="leistungen" className="scroll-mt-10">
            <H2>{t.ladder.heading}</H2>

            <div className="flex flex-col gap-4">
              {t.ladder.tiers.map((tier) => (
                <article
                  key={tier.id}
                  className={cn(
                    "flex flex-col gap-4 rounded-[0.35rem] border p-6 sm:p-7",
                    // The recommended rung carries the 3px brand left rule
                    // `app/editorial-theme.css` already uses for blockquotes.
                    // Tint alone did not separate it from the rung above it.
                    tier.featured
                      ? "border-brand/40 border-l-[3px] border-l-brand bg-brand/[0.07]"
                      : "border-border",
                  )}
                >
                  <header className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-[0.7rem] text-brand tracking-[0.14em]">
                        {tier.step}
                      </span>
                      <H3 interactive={false} className="text-[1.45rem]">
                        {tier.name}
                      </H3>
                    </div>
                    <div className="flex flex-col gap-1 sm:items-end sm:text-right">
                      <span className="font-normal font-serif text-[1.6rem] text-foreground leading-none tracking-[-0.01em]">
                        {tier.price}
                      </span>
                      <span className="font-mono text-[0.68rem] text-muted-foreground uppercase tracking-[0.12em]">
                        {tier.terms}
                      </span>
                    </div>
                  </header>

                  <p className="max-w-[60ch] text-muted-foreground">
                    {tier.desc}
                  </p>

                  <ul className="flex flex-col gap-2 text-muted-foreground text-sm">
                    {tier.items.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <span
                          aria-hidden="true"
                          className="shrink-0 text-brand"
                        >
                          →
                        </span>
                        <span className="max-w-[60ch]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            {/* The one oversized figure on the site. It sits under the prices
                rather than in a section of its own, so the reader meets the
                comparison at the moment the number is still on screen. */}
            <div className="mt-10 flex flex-col gap-5 border-border border-t pt-8 sm:flex-row sm:items-center sm:gap-10">
              <span className="font-normal font-serif text-[clamp(3rem,10vw,4.5rem)] text-brand leading-[0.85] tracking-[-0.02em] sm:shrink-0">
                {t.ladder.figure}
              </span>
              <p className="max-w-[46ch] text-muted-foreground text-sm leading-relaxed">
                {t.ladder.figureNote}
              </p>
            </div>

            <p className="mt-6 text-muted-foreground text-sm">
              {t.ladder.note}
            </p>
          </section>

          {/* Why me. Four lines, no paragraphs. */}
          <section>
            <H2>{t.why.heading}</H2>
            <ul className="flex flex-col">
              {t.why.items.map((item) => (
                <li
                  key={item}
                  className="max-w-[62ch] border-border border-b py-4 text-foreground/90 leading-relaxed last:border-b-0"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Clients. One line each. The full case studies live in the
              `/business.md` mirror, which is where an agent or a recruiter
              reading closely will go. */}
          <section>
            <H2>{t.work.heading}</H2>
            <div className="flex flex-col">
              {CLIENT_PROJECTS.map((project) => (
                <article
                  key={project.id}
                  className="border-border border-b py-5"
                  itemScope
                  itemType="https://schema.org/CreativeWork"
                >
                  <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "group inline-flex items-baseline gap-1.5 rounded-[0.15rem]",
                        FOCUS,
                      )}
                      itemProp="url"
                    >
                      <H3 itemProp="name" className="text-[1.2rem]">
                        {project.title}
                      </H3>
                      <span
                        aria-hidden="true"
                        className="font-mono text-muted-foreground text-sm transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
                      >
                        ↗
                      </span>
                      <span className="sr-only"> (opens in new window)</span>
                    </a>
                    <p className="font-mono text-[0.68rem] text-muted-foreground uppercase tracking-[0.12em]">
                      {project.period[lang]} · {project.role[lang]}
                    </p>
                  </header>
                  <p
                    className="mt-1.5 max-w-[62ch] text-muted-foreground text-sm"
                    itemProp="description"
                  >
                    {project.context[lang]}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Questions. Native disclosure widgets: keyboard and screen reader
              behaviour comes from the browser, and the page ships no JS for
              it. The marker is a `+` that rotates into a `×` when open. */}
          <section>
            <H2>{t.faq.heading}</H2>
            <div className="flex flex-col">
              {t.faq.items.map((item) => (
                <details
                  key={item.question}
                  className="group border-border border-b"
                >
                  <summary
                    className={cn(
                      "flex cursor-pointer list-none items-baseline justify-between gap-4 py-4 font-serif text-[1.15rem] text-foreground leading-snug transition-colors hover:text-brand [&::-webkit-details-marker]:hidden",
                      FOCUS,
                    )}
                  >
                    {item.question}
                    <span
                      aria-hidden="true"
                      className="shrink-0 font-mono text-brand text-sm transition-transform group-open:rotate-45"
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

          {/* Close. One action. The form is a disclosure rather than six
              fields in the flow, because the buyer here is deciding whether
              to spend twenty minutes. */}
          <section id="engage" className="scroll-mt-10">
            <H2>{t.engage.heading}</H2>
            <p className="mb-8 max-w-[46ch] font-serif text-[1.6rem] text-foreground leading-snug">
              {t.engage.lede}
            </p>

            <BookingCta label={t.engage.bookingCta} />

            <details className="group mt-10 border-border border-t pt-6">
              <summary
                className={cn(
                  "flex cursor-pointer list-none items-center gap-2 font-mono text-[0.72rem] text-muted-foreground uppercase tracking-[0.14em] transition-colors hover:text-brand [&::-webkit-details-marker]:hidden",
                  FOCUS,
                )}
              >
                {t.engage.formToggle}
                <span
                  aria-hidden="true"
                  className="text-brand transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="pt-8">
                <InquiryForm lang={lang} />
              </div>
            </details>

            <address className="mt-8 flex flex-col gap-2 text-muted-foreground text-sm not-italic">
              <span>
                {t.engage.emailLabel}:{" "}
                <a
                  href={`mailto:${SITE.contact.email}`}
                  className={cn(
                    "text-foreground transition-colors hover:text-brand",
                    FOCUS,
                  )}
                  itemProp="email"
                >
                  {SITE.contact.email}
                </a>
              </span>
              <a
                href={markdownHref}
                className={cn(
                  "w-fit text-muted-foreground text-xs transition-colors hover:text-brand",
                  FOCUS,
                )}
              >
                {t.engage.markdownLabel}
              </a>
            </address>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
