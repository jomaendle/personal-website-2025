import type { Metadata } from "next";
import { BlogH1, H2 } from "@/components/ui/heading";
import { Footer } from "@/components/ui/footer";
import { PageTopBar } from "@/components/ui/page-top-bar";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum gemäß § 5 TMG.",
  alternates: { canonical: "/impressum" },
};

export default function ImpressumPage() {
  return (
    <div className="page-container">
      <div
        className="glass-container mx-auto flex max-w-3xl flex-col gap-16"
        style={{ viewTransitionName: "main-content" }}
      >
        <PageTopBar />

        {/* The page is German under `<html lang="en">`, so the content root
            carries lang="de". The bar and footer above and below it stay
            English, which is why the attribute sits here and not on the
            container. */}
        <main
          id="main-content"
          tabIndex={-1}
          lang="de"
          className="flex flex-col gap-10"
        >
          <section>
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.16em] text-brand">
              Rechtliches
            </p>
            <BlogH1>Impressum</BlogH1>
            <p className="text-xs text-muted-foreground">
              Angaben gemäß § 5 TMG
            </p>
          </section>

          <section>
            <H2>Anbieter</H2>
            <div className="space-y-1 text-muted-foreground">
              <p>Johannes Mändle</p>
              <p>Im Hirschmorgen 12</p>
              <p>69181 Leimen</p>
              <p>Deutschland</p>
            </div>
          </section>

          <section>
            <H2>Kontakt</H2>
            <div className="space-y-1 text-muted-foreground">
              <p>
                E-Mail:{" "}
                <a
                  href="mailto:me@jomaendle.com"
                  className="underline transition-colors hover:text-brand"
                >
                  me@jomaendle.com
                </a>
              </p>
            </div>
          </section>

          <section>
            <H2>Verantwortlich für den Inhalt</H2>
            <p className="text-muted-foreground">
              Johannes Mändle (Anschrift wie oben), verantwortlich i.S.d. § 18
              Abs. 2 MStV.
            </p>
          </section>

          <section>
            <H2>Haftungshinweis</H2>
            <p className="text-muted-foreground">
              Trotz sorgfältiger inhaltlicher Kontrolle übernehme ich keine
              Haftung für die Inhalte externer Links. Für den Inhalt der
              verlinkten Seiten sind ausschließlich deren Betreiber
              verantwortlich.
            </p>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
