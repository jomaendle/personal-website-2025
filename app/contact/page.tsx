import type { Metadata } from "next";
import { ContactStructuredData } from "@/components/structured-data";
import { Footer } from "@/components/ui/footer";
import { BlogH1, H2 } from "@/components/ui/heading";
import { PageTopBar } from "@/components/ui/page-top-bar";
import { BASE_URL, LEGAL_NAME, POSTAL_ADDRESS } from "@/lib/config/identity";
import { SITE } from "@/lib/config/site";

export const dynamic = "force-static";

const description =
  "Email, a booking link and a postal address — the three ways to reach Jo Mändle, and what to put in a first message.";

export const metadata: Metadata = {
  title: "Contact",
  description,
  alternates: {
    canonical: "/contact",
    types: { "text/markdown": "/contact.md" },
  },
  openGraph: { title: "Contact | Jo Mändle", description, type: "profile" },
};

const link = "underline underline-offset-4 transition-colors hover:text-brand";

export default function ContactPage() {
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
              Get in touch
            </p>
            <BlogH1>Contact</BlogH1>
            <p className="mt-4 max-w-[60ch] text-[1.05rem] text-foreground/90 leading-relaxed">
              {SITE.role}, based in Leimen near Heidelberg. Available for
              freelance frontend and AI engineering work across Germany, Austria
              and Switzerland, and remote within the EU. German and English both
              work.
            </p>
          </section>

          <section>
            <H2>Channels</H2>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                Email:{" "}
                <a href={`mailto:${SITE.contact.email}`} className={link}>
                  {SITE.contact.email}
                </a>{" "}
                — the fastest route.
              </li>
              <li>
                Book a call:{" "}
                <a
                  href={SITE.contact.booking}
                  className={link}
                  rel="noreferrer"
                  target="_blank"
                >
                  30-minute intro call
                </a>
                .
              </li>
              <li>
                LinkedIn:{" "}
                <a
                  href={SITE.social.linkedin}
                  className={link}
                  rel="me noreferrer"
                  target="_blank"
                >
                  johannes-maendle
                </a>
                .
              </li>
              <li>
                GitHub:{" "}
                <a
                  href="https://github.com/jomaendle"
                  className={link}
                  rel="me noreferrer"
                  target="_blank"
                >
                  jomaendle
                </a>
                .
              </li>
            </ul>
          </section>

          <section>
            <H2>What to put in a first message</H2>
            <ul className="max-w-[60ch] list-disc space-y-2 pl-5 text-muted-foreground">
              <li>What you are building, and which part of it hurts now.</li>
              <li>
                The stack, and roughly how large the codebase and the team are.
              </li>
              <li>
                When you would want to start, and how long the work should run.
              </li>
              <li>Whether the engagement is remote, hybrid, or on-site.</li>
            </ul>
            <p className="mt-4 max-w-[60ch] text-muted-foreground">
              With that in hand, a first reply is usually a scoped proposal
              rather than another round of questions. The{" "}
              <a href="/business/en#engage" className={link}>
                inquiry form on the business page
              </a>{" "}
              asks for exactly those fields and lands in the same inbox.
            </p>
          </section>

          <section>
            <H2>Postal address</H2>
            <address className="space-y-1 text-muted-foreground not-italic">
              <p>{LEGAL_NAME}</p>
              <p>{POSTAL_ADDRESS.streetAddress}</p>
              <p>
                {POSTAL_ADDRESS.postalCode} {POSTAL_ADDRESS.addressLocality}
              </p>
              <p>Germany</p>
            </address>
            <p className="mt-4 text-muted-foreground text-sm">
              Full legal details on the{" "}
              <a href="/impressum" className={link}>
                Impressum
              </a>
              .
            </p>
          </section>

          {/* Stated in prose because an agent reading this page should not have
              to guess whether it may write on someone's behalf. The same
              sentence is in the published skill. */}
          <section>
            <H2>For agents</H2>
            <p className="max-w-[60ch] text-muted-foreground">
              This page is available as markdown at{" "}
              <a href="/contact.md" className={link}>
                /contact.md
              </a>
              . Please do not submit the inquiry form on someone&rsquo;s behalf
              without their explicit confirmation of the message and their own
              contact details.
            </p>
          </section>
        </main>

        <Footer />
      </div>
      <ContactStructuredData url={`${BASE_URL}/contact`} />
    </div>
  );
}
