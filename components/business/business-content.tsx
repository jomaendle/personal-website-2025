import { Link } from "next-view-transitions";
import { H1, H2, H3 } from "@/components/ui/heading";
import { Footer } from "@/components/ui/footer";
import { PageTopBar } from "@/components/ui/page-top-bar";
import { InquiryForm } from "@/components/business/inquiry-form";
import { SITE } from "@/lib/config/site";
import { BUSINESS_COPY, type Lang } from "@/lib/state/business-copy";
import { CLIENT_PROJECTS, CLIENTS } from "@/lib/state/business-projects";

/**
 * BusinessContent — Editorial design layer.
 *
 * A server component: no framer-motion, no client state, matching the fully
 * static /about route. Only the inquiry form is a client island.
 *
 * Copy comes from `lib/state/business-copy.ts` and engagements from
 * `lib/state/business-projects.ts`, so this file is presentation only — and the
 * `/business.md` mirrors can render the same data without duplicating it.
 */

export function BusinessContent({ lang }: { lang: Lang }) {
  const t = BUSINESS_COPY[lang];
  const markdownHref = lang === "de" ? "/business.md" : "/business/en.md";

  return (
    <main id="main-content" className="page-container" lang={lang}>
      <div
        className="glass-container mx-auto flex max-w-3xl flex-col gap-16"
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
              // -mx-2 keeps the optical position while the padding lifts the
              // tap target to 44px tall (WCAG 2.5.8 needs 24x24; 18x20 failed).
              className="-mx-2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center px-2 font-mono text-sm tracking-[0.04em] text-muted-foreground transition-colors hover:text-brand"
            >
              {t.switchTo}
            </Link>
          }
        />

        {/* Masthead */}
        <header className="flex flex-col gap-6">
          <H2>{t.hero.eyebrow}</H2>
          <H1 className="max-w-[20ch]" itemProp="name">
            {t.hero.heading}
          </H1>
          <p
            className="max-w-[52ch] text-[1.05rem] leading-relaxed text-foreground/90"
            itemProp="description"
          >
            {t.hero.lede}
          </p>

          {SITE.availableForWork && (
            <span className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-block size-[7px] animate-pulse rounded-full bg-emerald-500" />
              {t.hero.available}
            </span>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="#engage"
              className="inline-flex h-11 items-center justify-center rounded-[0.25rem] bg-foreground px-6 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-background transition-opacity hover:opacity-90"
            >
              {t.hero.ctaPrimary}
            </a>
            <a
              href={SITE.contact.booking}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-[0.25rem] border border-border px-6 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-foreground transition-colors hover:border-brand hover:text-brand"
            >
              {t.hero.ctaSecondary}
              <span className="sr-only"> (opens in new window)</span>
            </a>
          </div>
        </header>

        {/* Client strip */}
        <section>
          <H2>{t.clients.heading}</H2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[0.8rem] uppercase tracking-[0.1em] text-muted-foreground">
            {CLIENTS.map((name, i) => (
              <span key={name} className="contents">
                {i > 0 && (
                  <span aria-hidden="true" className="text-border">
                    ·
                  </span>
                )}
                <span>{name}</span>
              </span>
            ))}
          </div>
        </section>

        {/* Pitch */}
        <section>
          <H2>{t.pitch.heading}</H2>
          <div className="flex max-w-[60ch] flex-col gap-5 text-[1.05rem] leading-relaxed text-foreground/90">
            {t.pitch.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
        </section>

        {/* Services — hairline ledger rows */}
        <section>
          <H2>{t.services.heading}</H2>
          <div className="-mx-3 flex flex-col">
            {t.services.items.map((item) => (
              <div
                key={item.title}
                className="group border-b border-border px-3 py-4 ledger-row"
              >
                <H3>{item.title}</H3>
                <p className="mt-1 text-muted-foreground transition-colors">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Selected client work */}
        <section>
          <H2>{t.work.heading}</H2>
          <div className="-mx-3 flex flex-col">
            {CLIENT_PROJECTS.map((project) => (
              <article
                key={project.id}
                className="group border-b border-border px-3 py-6 ledger-row"
                itemScope
                itemType="https://schema.org/CreativeWork"
              >
                <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-baseline gap-1.5"
                    itemProp="url"
                  >
                    <H3 itemProp="name">{project.title}</H3>
                    <span
                      aria-hidden="true"
                      className="font-mono text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
                    >
                      ↗
                    </span>
                    <span className="sr-only"> (opens in new window)</span>
                  </a>
                  <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground transition-colors">
                    {project.period[lang]} · {project.role[lang]}
                  </p>
                </header>

                <p
                  className="mt-2 max-w-[62ch] text-muted-foreground transition-colors"
                  itemProp="description"
                >
                  {project.context[lang]}
                </p>

                <ul className="mt-4 flex flex-col gap-1.5 text-sm text-muted-foreground transition-colors">
                  {project.highlights[lang].map((highlight) => (
                    <li key={highlight} className="flex gap-2">
                      <span
                        aria-hidden="true"
                        className="shrink-0 text-brand transition-colors"
                      >
                        →
                      </span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.stack.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-muted-foreground transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* How we work */}
        <section>
          <H2>{t.process.heading}</H2>
          <div className="grid gap-8 sm:grid-cols-3">
            {t.process.steps.map((step) => (
              <div key={step.num} className="flex flex-col gap-3">
                <span className="font-mono text-[0.8rem] text-brand">
                  {step.num}
                </span>
                <H3 className="text-[1.25rem]">{step.title}</H3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Why me */}
        <section>
          <H2>{t.why.heading}</H2>
          <ul className="flex max-w-[60ch] flex-col gap-2 text-muted-foreground">
            {t.why.items.map((item) => (
              <li key={item} className="before:mr-2 before:content-['—']">
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Engage */}
        <section id="engage" className="scroll-mt-8">
          <H2>{t.engage.heading}</H2>
          <p className="mb-8 max-w-[60ch] text-[1.05rem] leading-relaxed text-foreground/90">
            {t.engage.lede}
          </p>

          <InquiryForm lang={lang} />

          <div className="mt-10 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <H3 className="text-[1.15rem]">{t.engage.bookingTitle}</H3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.engage.bookingDesc}
              </p>
            </div>
            <a
              href={SITE.contact.booking}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-[0.25rem] border border-border px-6 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-foreground transition-colors hover:border-brand hover:text-brand"
            >
              {t.engage.bookingCta}
              <span className="sr-only"> (opens in new window)</span>
            </a>
          </div>

          <address className="mt-8 flex flex-col gap-2 not-italic text-sm text-muted-foreground">
            <span>
              {t.engage.emailLabel} —{" "}
              <a
                href={`mailto:${SITE.contact.email}`}
                className="text-foreground transition-colors hover:text-brand"
                itemProp="email"
              >
                {SITE.contact.email}
              </a>
            </span>
            <a
              href={markdownHref}
              className="w-fit text-xs text-muted-foreground transition-colors hover:text-brand"
            >
              {t.engage.markdownLabel}
            </a>
          </address>
        </section>

        <Footer />
      </div>
    </main>
  );
}
