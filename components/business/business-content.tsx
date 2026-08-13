import { Link } from "next-view-transitions";
import { InquiryForm } from "@/components/business/inquiry-form";
import { Footer } from "@/components/ui/footer";
import { H1, H2, H3 } from "@/components/ui/heading";
import { PageTopBar } from "@/components/ui/page-top-bar";
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
              className="-mx-2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center px-2 font-mono text-muted-foreground text-sm tracking-[0.04em] transition-colors hover:text-brand"
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
              className="max-w-[52ch] text-[1.05rem] text-foreground/90 leading-relaxed"
              itemProp="description"
            >
              {t.hero.lede}
            </p>

            {/* Earliest start, stated before the CTAs rather than buried in the
              process section — someone who can't wait that long should
              learn that before writing a message, not after. */}
            <p className="font-mono text-[0.75rem] text-brand uppercase tracking-[0.14em]">
              {t.hero.availability}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="#engage"
                className="inline-flex h-11 items-center justify-center rounded-[0.25rem] bg-foreground px-6 font-mono text-[0.75rem] text-background uppercase tracking-[0.14em] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t.hero.ctaPrimary}
              </a>
              <a
                href={SITE.contact.booking}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-[0.25rem] border border-border px-6 font-mono text-[0.75rem] text-foreground uppercase tracking-[0.14em] transition-colors hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t.hero.ctaSecondary}
                <span className="sr-only"> (opens in new window)</span>
              </a>
            </div>
          </header>

          {/* Client strip */}
          <section>
            <H2>{t.clients.heading}</H2>
            {/* Each client jumps to its own case study below, so the strip is a
              way in rather than a dead list of names. */}
            <div className="flex flex-wrap items-center gap-x-3 font-mono text-[0.8rem] text-muted-foreground uppercase tracking-[0.1em]">
              {CLIENTS.map((client, i) => (
                <span key={client.id} className="whitespace-nowrap">
                  <a
                    href={client.anchor}
                    className="inline-flex min-h-[36px] items-center underline decoration-border decoration-from-font underline-offset-[6px] transition-colors hover:text-brand hover:decoration-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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

          {/* Pitch */}
          <section>
            <H2>{t.pitch.heading}</H2>
            <div className="flex max-w-[60ch] flex-col gap-5 text-[1.05rem] text-foreground/90 leading-relaxed">
              {t.pitch.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </section>

          {/* Services — hairline rows. Deliberately not `ledger-row`/`group`:
            nothing here is clickable, and the vermilion margin rule plus tint
            promised an interaction that does not exist. Without the hover the
            rows also lose the `-mx-3` bleed, so the hairlines line up with the
            text rather than overhanging the gutter. */}
          <section>
            <H2>{t.services.heading}</H2>
            <div className="flex flex-col">
              {t.services.items.map((item) => (
                <div key={item.title} className="border-border border-b py-4">
                  <H3 interactive={false}>{item.title}</H3>
                  <p className="mt-1 text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            {/* One quiet pointer to the audit page, in the same muted style as
                `stack.note` below. The two pages have different buyers, so this
                stays a sentence rather than becoming a promoted block. */}
            <p className="mt-5 max-w-[60ch] text-muted-foreground text-sm">
              {t.services.note}{" "}
              <Link
                href={t.services.noteHref}
                className="text-foreground underline decoration-border decoration-from-font underline-offset-[5px] transition-colors hover:text-brand hover:decoration-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t.services.noteLinkLabel}
              </Link>
            </p>
          </section>

          {/* Stack — breadth lives here so the hero can stay focused on the
            offer rather than turning into a technology list. */}
          <section>
            <H2>{t.stack.heading}</H2>
            {/* No horizontal bleed here: the rows have no hover state, so the
              hairlines start where the text starts instead of overhanging the
              gutter by 12px. */}
            <dl className="flex flex-col">
              {t.stack.groups.map((group) => (
                <div
                  key={group.label}
                  className="flex flex-col gap-2 border-border border-b py-4 sm:flex-row sm:items-baseline sm:gap-6"
                >
                  <dt className="font-mono text-[0.7rem] text-brand uppercase tracking-[0.14em] sm:w-24 sm:shrink-0">
                    {group.label}
                  </dt>
                  <dd className="flex flex-wrap gap-x-3 gap-y-1.5 font-mono text-[0.8rem] text-muted-foreground">
                    {/* The separator travels with the item before it, so a wrap
                      can never leave a dangling `·` at the end of a line or
                      start the next one with it. */}
                    {group.items.map((item, i) => (
                      <span key={item} className="whitespace-nowrap">
                        {item}
                        {i < group.items.length - 1 && (
                          <span aria-hidden="true" className="ml-3 text-border">
                            ·
                          </span>
                        )}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 max-w-[52ch] text-muted-foreground text-sm">
              {t.stack.note}
            </p>
          </section>

          {/* Selected client work */}
          <section>
            <H2>{t.work.heading}</H2>
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
                      className="group inline-flex items-baseline gap-1.5 rounded-[0.15rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                        className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground uppercase tracking-[0.1em]"
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

          {/* Why me */}
          <section>
            <H2>{t.why.heading}</H2>
            <ul className="flex max-w-[60ch] flex-col gap-2 text-muted-foreground">
              {t.why.items.map((item) => (
                <li
                  key={item}
                  className="before:mr-2 before:text-brand before:content-['→']"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Engage */}
          <section id="engage" className="scroll-mt-8">
            <H2>{t.engage.heading}</H2>
            <p className="mb-8 max-w-[60ch] text-[1.05rem] text-foreground/90 leading-relaxed">
              {t.engage.lede}
            </p>

            <InquiryForm lang={lang} />

            {/* Booking panel. Lifted out of a plain hairline row into a tinted
              panel so the lower-commitment path is visible to someone who
              won't fill in a form — but kept as an outlined button so it does
              not compete with the form's solid ink submit directly above. */}
            <div className="mt-10 flex flex-col gap-5 rounded-[0.35rem] border border-brand/25 bg-brand/[0.05] p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-7">
              <div>
                <H3 interactive={false}>{t.engage.bookingTitle}</H3>
                <p className="mt-1.5 text-[0.95rem] text-muted-foreground">
                  {t.engage.bookingDesc}
                </p>
              </div>
              <a
                href={SITE.contact.booking}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-[0.25rem] border border-brand/50 px-7 font-mono text-[0.75rem] text-brand uppercase tracking-[0.14em] transition-colors hover:bg-brand hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t.engage.bookingCta}
                <span className="sr-only"> (opens in new window)</span>
              </a>
            </div>

            <address className="mt-8 flex flex-col gap-2 text-muted-foreground text-sm not-italic">
              <span>
                {t.engage.emailLabel}:{" "}
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
                className="w-fit text-muted-foreground text-xs transition-colors hover:text-brand"
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
