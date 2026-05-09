import type { Metadata } from "next";
import { BlogH1, H2 } from "@/components/ui/heading";
import { Footer } from "@/components/ui/footer";

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
        className="glass-container mx-auto flex max-w-3xl flex-col gap-10"
        style={{ viewTransitionName: "main-content" }}
      >
        <section>
          <BlogH1>Impressum</BlogH1>
          <p className="text-xs text-muted-foreground">
            Angaben gemäß § 5 TMG
          </p>
        </section>

        <section>
          <H2>Anbieter</H2>
          <div className="space-y-1 text-muted-foreground">
            <p>Johannes Mändle</p>
            <p>[Straße und Hausnummer]</p>
            <p>[PLZ Ort]</p>
            <p>Deutschland</p>
          </div>
        </section>

        <section>
          <H2>Kontakt</H2>
          <div className="space-y-1 text-muted-foreground">
            <p>
              E-Mail:{" "}
              <a
                href="mailto:hello@jomaendle.com"
                className="underline transition-colors hover:text-primary"
              >
                hello@jomaendle.com
              </a>
            </p>
            <p>Telefon: [optional]</p>
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

        <Footer />
      </div>
    </div>
  );
}
