import { Link } from "next-view-transitions";
import { InquiryForm } from "@/components/business/inquiry-form";
import { Footer } from "@/components/ui/footer";
import { H1, H2, H3 } from "@/components/ui/heading";
import { PageTopBar } from "@/components/ui/page-top-bar";
import { SITE } from "@/lib/config/site";
import { BUSINESS_COPY, type Lang } from "@/lib/state/business-copy";
import { CLIENT_PROJECTS, CLIENTS } from "@/lib/state/business-projects";
import { cn } from "@/lib/utils";

/**
 * BusinessContent — the single business page.
 *
 * One offer for one buyer, laid out as a one-pager: the problem, the money,
 * the three priced steps, why the measurement holds, proof, and how to start.
 * This absorbed the former /ki-wirkung and /ai-impact routes, which sold the
 * audit as a separate offer to the same person and then handed them off at the
 * end of it.
 *
 * A server component: no framer-motion, no client state, matching /about. Only
 * the inquiry form is a client island, and the FAQ is native details/summary,
 * so the rest of the page ships no JavaScript.
 *
 * Two sections carry more visual weight than the rest, on purpose. The
 * economics block is the only oversized figure on the site, because that
 * number decides whether a monthly fee reads as large or as a rounding error.
 * The featured ladder tier is the only tinted panel in the flow. Everything
 * else stays on the hairline-and-mono system the other routes use.
 *
 * Copy comes from `lib/state/business-copy.ts` and engagements from
 * `lib/state/business-projects.ts`, so this file is presentation only and the
 * `/business.md` mirrors render the same data without duplicating it.
 */

/** Shared focus ring, so every interactive element on the page matches. */
const FOCUS =
  "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Solid ink call to action. Used for the two booking links. */
const CTA_SOLID = cn(
  "inline-flex h-11 items-center justify-center rounded-lg bg-foreground px-6 font-mono text-[0.75rem] text-background uppercase tracking-[0.14em] transition-opacity hover:opacity-90",
  FOCUS,
);

/** Outlined call to action, for the lower-commitment path beside it. */
const CTA_OUTLINE = cn(
  "inline-flex h-11 items-center justify-center rounded-lg border border-border px-6 font-mono text-[0.75rem] text-foreground uppercase tracking-[0.14em] transition-colors hover:border-brand hover:text-brand",
  FOCUS,
);

function BookingCta({
  label,
  className = CTA_SOLID,
}: {
  label: string;
  className?: string;
}) {
  return (
    <a
      href={SITE.contact.booking}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
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
              // -mx-2 keeps the optical position while the padding lifts the
              // tap target to 44px tall (WCAG 2.5.8 needs 24x24; 18x20 failed).
              className={cn(
                "-mx-2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center px-2 font-mono text-muted-foreground text-sm tracking-[0.04em] transition-colors hover:text-brand",
                FOCUS,
              )}
            >
              {t.switchTo}
            </Link>
          }
        />

        {/* `<main>` is a sibling of the top bar and the footer, never their
            parent, so the banner and contentinfo landmarks sit outside the
            main landmark. It carries the section rhythm the container used to
            own, because it is now a single flex child of that container. */}
        <main
          id="main-content"
          tabIndex={-1}
          lang={lang}
          className="flex flex-col gap-16"
        >
          {/* Masthead. A `<header>` nested in `<main>` is not a banner
              landmark, so this does not compete with the top bar. */}
          <header className="flex flex-col gap-6">
            <p className="mb-6 font-mono text-brand text-xs uppercase tracking-[0.16em]">
              {t.hero.eyebrow}
            </p>
            <H1 className="max-w-[20ch]" itemProp="name">
              {t.hero.heading}
            </H1>
            <p
              className="max-w-[56ch] text-[1.05rem] text-foreground/90 leading-relaxed"
              itemProp="description"
            >
              {t.hero.lede}
            </p>

            {/* Both availabilities, stated before the CTAs rather than buried
                in the process section. A reader who cannot wait for the
                programme should learn that the audit starts now before they
                write a message, not after. */}
            <p className="font-mono text-[0.75rem] text-brand uppercase tracking-[0.14em]">
              {t.hero.availability}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <BookingCta label={t.hero.ctaPrimary} />
              {/* An in-page jump rather than a third button: someone who wants
                  the number before the call goes straight to the ladder. */}
              <a
                href="#stufen"
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
          </header>

          {/* Credential band. Three facts a C-level reader uses to decide
              whether to keep reading, in the order they ask them. Hairline
              dividers only, so it reads as a masthead strip and not as a
              statistics widget. */}
          <section
            aria-label={t.credentials.map((c) => c.label).join(". ")}
            className="-mt-6 grid gap-px border-border border-y bg-border sm:grid-cols-3"
          >
            {t.credentials.map((credential) => (
              <div
                key={credential.label}
                className="flex flex-col gap-1.5 bg-background px-1 py-5 sm:px-4"
              >
                <span className="font-normal font-serif text-[1.6rem] text-foreground leading-none tracking-[-0.01em]">
                  {credential.value}
                </span>
                <span className="max-w-[28ch] text-[0.85rem] text-muted-foreground leading-snug">
                  {credential.label}
                </span>
              </div>
            ))}
          </section>

          {/* Client strip. Each name jumps to its own case study below, so the
              strip is a way in rather than a dead list of names. */}
          <section>
            <H2>{t.clients.heading}</H2>
            <div className="flex flex-wrap items-center gap-x-3 font-mono text-[0.8rem] text-muted-foreground uppercase tracking-widest">
              {CLIENTS.map((client, i) => (
                <span key={client.id} className="whitespace-nowrap">
                  <a
                    href={client.anchor}
                    className={cn(
                      "inline-flex min-h-[36px] items-center underline decoration-border decoration-from-font underline-offset-[6px] transition-colors hover:text-brand hover:decoration-brand",
                      FOCUS,
                    )}
                  >
                    {client.name}
                  </a>
                  {/* The separator stays glued to the name before it, so a wrap
                      never orphans it onto a line of its own. */}
                  {i < CLIENTS.length - 1 && (
                    <span aria-hidden="true" className="ml-3 text-border">
                      ·
                    </span>
                  )}
                </span>
              ))}
            </div>
          </section>

          {/* The problem, as hairline rows. Deliberately not `ledger-row`:
              nothing here is clickable, and the vermilion margin rule plus
              tint would promise an interaction that does not exist. */}
          <section>
            <H2>{t.problem.heading}</H2>
            <div className="flex flex-col">
              {t.problem.items.map((item) => (
                <div key={item.title} className="border-border border-b py-4">
                  <H3 interactive={false}>{item.title}</H3>
                  <p className="mt-1 max-w-[62ch] text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-6 max-w-[60ch] text-[1.05rem] text-foreground/90 leading-relaxed">
              {t.problem.closing}
            </p>
          </section>

          {/* The economics. The only oversized figure on the site: this is the
              number that reframes a monthly fee, so it gets the weight and
              nothing else on the page competes with it. The arithmetic is
              shown rather than asserted, so a reader can substitute theirs. */}
          <section>
            <H2>{t.economics.heading}</H2>
            <div className="flex flex-col gap-6 rounded-[0.35rem] border border-brand/25 bg-brand/5 p-6 sm:p-8">
              <div className="flex flex-col gap-2">
                <span className="font-normal font-serif text-[clamp(3.25rem,13vw,5.5rem)] text-brand leading-[0.9] tracking-[-0.02em]">
                  {t.economics.figure}
                </span>
                <span className="font-mono text-[0.7rem] text-muted-foreground uppercase tracking-[0.14em]">
                  {t.economics.figureLabel}
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {t.economics.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="max-w-[58ch] text-[1.05rem] text-foreground/90 leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              <p className="max-w-[58ch] text-muted-foreground text-sm">
                {t.economics.note}
              </p>
            </div>
          </section>

          {/* The ladder. Full-width stacked panels rather than a three-column
              pricing table: each tier carries four to six lines of scope, and
              at this measure three columns would set them at roughly 14rem.
              Exactly one tier is tinted, so the page recommends one thing. */}
          <section id="stufen" className="scroll-mt-8">
            <H2>{t.ladder.heading}</H2>
            <p className="mb-8 max-w-[60ch] text-[1.05rem] text-foreground/90 leading-relaxed">
              {t.ladder.lede}
            </p>

            <div className="flex flex-col gap-4">
              {t.ladder.tiers.map((tier) => (
                <article
                  key={tier.id}
                  className={cn(
                    "flex flex-col gap-5 rounded-[0.35rem] border p-6 sm:p-7",
                    // The recommended rung carries the 3px brand left rule
                    // `app/editorial-theme.css` already uses for blockquotes.
                    // Tint alone did not separate it from the rung above: at
                    // 5% on the dark ground the two panels read as identical.
                    tier.featured
                      ? "border-brand/40 border-l-[3px] border-l-brand bg-brand/[0.07]"
                      : "border-border",
                  )}
                >
                  {/* Price sits opposite the name on a shared baseline, and
                      wraps under it below `sm` where the two cannot share a
                      line without one of them shrinking. */}
                  <header className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                    <div className="flex flex-col gap-1.5">
                      <span className="font-mono text-[0.7rem] text-brand uppercase tracking-[0.14em]">
                        {tier.step}
                      </span>
                      <H3 interactive={false} className="text-[1.5rem]">
                        {tier.name}
                      </H3>
                    </div>
                    <div className="flex flex-col gap-1 sm:items-end sm:text-right">
                      <span className="font-normal font-serif text-[1.75rem] text-foreground leading-none tracking-[-0.01em]">
                        {tier.price}
                      </span>
                      <span className="font-mono text-[0.7rem] text-muted-foreground uppercase tracking-[0.12em]">
                        {tier.terms}
                      </span>
                    </div>
                  </header>

                  <p className="max-w-[58ch] font-serif text-[1.15rem] text-foreground leading-snug">
                    {tier.audience}
                  </p>

                  <p className="max-w-[62ch] text-muted-foreground">
                    {tier.desc}
                  </p>

                  <ul className="flex flex-col gap-2 text-muted-foreground text-sm">
                    {tier.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span
                          aria-hidden="true"
                          className="shrink-0 text-brand"
                        >
                          →
                        </span>
                        <span className="max-w-[62ch]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <p className="mt-5 max-w-[60ch] text-muted-foreground text-sm">
              {t.ladder.note}
            </p>

            {/* Second call to action, directly under the prices. Someone who
                has just read the numbers is at the point of deciding. */}
            <div className="mt-8">
              <BookingCta label={t.hero.ctaPrimary} />
            </div>
          </section>

          {/* Why the measurement holds. The argument the price rests on, so it
              follows the price rather than preceding it. Hairline rows here,
              because the tinted panel is already spent on the economics. */}
          <section>
            <H2>{t.moat.heading}</H2>
            <div className="flex flex-col gap-8">
              {t.moat.blocks.map((block) => {
                // Read out of the block so the separator below can compare
                // against a definite length rather than an optional one.
                const terms = block.terms ?? [];

                return (
                  <div key={block.title} className="flex flex-col gap-3">
                    <H3 interactive={false}>{block.title}</H3>
                    {block.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="max-w-[62ch] text-foreground/90 leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                    {/* The stack, where it belongs: evidence for the claim in
                        the paragraph above it, not a menu of things to hire. */}
                    {terms.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1.5 font-mono text-[0.8rem] text-muted-foreground">
                        {terms.map((term, i) => (
                          <span key={term} className="whitespace-nowrap">
                            {term}
                            {i < terms.length - 1 && (
                              <span
                                aria-hidden="true"
                                className="ml-3 text-border"
                              >
                                ·
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Selected client work */}
          <section>
            <H2>{t.work.heading}</H2>
            <p className="mb-6 max-w-[60ch] text-muted-foreground">
              {t.work.lede}
            </p>
            <div className="flex flex-col">
              {CLIENT_PROJECTS.map((project) => (
                <article
                  key={project.id}
                  id={`client-${project.id}`}
                  // Not a `ledger-row`: only the title links out, and a case
                  // study is mostly reading matter, so turning the whole card
                  // into a click target would cost text selection. The `group`
                  // sits on the link instead, where the click actually is.
                  className="scroll-mt-16 border-border border-b py-6"
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
                      <H3 itemProp="name">{project.title}</H3>
                      <span
                        aria-hidden="true"
                        className="font-mono text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
                      >
                        ↗
                      </span>
                      <span className="sr-only"> (opens in new window)</span>
                    </a>
                    <p className="font-mono text-[0.7rem] text-muted-foreground uppercase tracking-[0.12em]">
                      {project.period[lang]} · {project.role[lang]}
                    </p>
                  </header>

                  <p
                    className="mt-2 max-w-[62ch] text-muted-foreground"
                    itemProp="description"
                  >
                    {project.context[lang]}
                  </p>

                  <ul className="mt-4 flex flex-col gap-1.5 text-muted-foreground text-sm">
                    {project.highlights[lang].map((highlight) => (
                      <li key={highlight} className="flex gap-2">
                        <span
                          aria-hidden="true"
                          className="shrink-0 text-brand"
                        >
                          →
                        </span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.stack?.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground uppercase tracking-widest"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* How we start */}
          <section>
            <H2>{t.process.heading}</H2>
            <div className="grid gap-8 sm:grid-cols-3">
              {t.process.steps.map((step) => (
                <div key={step.num} className="flex flex-col gap-3">
                  <span className="font-mono text-[0.8rem] text-brand">
                    {step.num}
                  </span>
                  <H3 interactive={false} className="text-[1.25rem]">
                    {step.title}
                  </H3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ. Native disclosure widgets: keyboard and screen reader
              behaviour comes from the browser, and the page ships no JS for
              it. The default triangle is removed on both engines and replaced
              with a `+` that rotates into a `×` when the row is open. */}
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
                      "flex cursor-pointer list-none items-baseline justify-between gap-4 py-4 font-serif text-[1.2rem] text-foreground leading-snug transition-colors hover:text-brand [&::-webkit-details-marker]:hidden",
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

          {/* Close */}
          <section id="engage" className="scroll-mt-8">
            <H2>{t.engage.heading}</H2>
            <p className="mb-8 max-w-[60ch] text-[1.05rem] text-foreground/90 leading-relaxed">
              {t.engage.lede}
            </p>

            <InquiryForm lang={lang} />

            {/* Booking panel. The lower-commitment path, kept visible for
                someone who will not fill in a form, but outlined so it does
                not compete with the form's solid submit directly above. */}
            <div className="mt-10 flex flex-col gap-5 rounded-[0.35rem] border border-brand/25 bg-brand/5 p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-7">
              <div>
                <H3 interactive={false}>{t.engage.bookingTitle}</H3>
                <p className="mt-1.5 text-[0.95rem] text-muted-foreground">
                  {t.engage.bookingDesc}
                </p>
              </div>
              <BookingCta
                label={t.engage.bookingCta}
                className={cn(
                  CTA_OUTLINE,
                  "shrink-0 border-brand/50 text-brand hover:bg-brand hover:text-background",
                )}
              />
            </div>

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
