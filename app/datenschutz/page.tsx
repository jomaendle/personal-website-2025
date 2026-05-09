import type { Metadata } from "next";
import { BlogH1, H2 } from "@/components/ui/heading";
import { Footer } from "@/components/ui/footer";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Datenschutzerklärung nach DSGVO.",
  alternates: { canonical: "/datenschutz" },
};

export default function DatenschutzPage() {
  return (
    <div className="page-container">
      <div
        className="glass-container mx-auto flex max-w-3xl flex-col gap-10"
        style={{ viewTransitionName: "main-content" }}
      >
        <section>
          <BlogH1>Datenschutzerklärung</BlogH1>
          <p className="text-xs text-muted-foreground">
            Informationen nach Art. 13, 14 und 21 DSGVO
          </p>
        </section>

        <section>
          <H2>Verantwortlicher</H2>
          <div className="space-y-1 text-muted-foreground">
            <p>Johannes Mändle</p>
            <p>[Straße und Hausnummer]</p>
            <p>[PLZ Ort]</p>
            <p>
              E-Mail:{" "}
              <a
                href="mailto:hello@jomaendle.com"
                className="underline transition-colors hover:text-primary"
              >
                hello@jomaendle.com
              </a>
            </p>
          </div>
        </section>

        <section>
          <H2>Allgemeines</H2>
          <p className="text-muted-foreground">
            Der Schutz Ihrer personenbezogenen Daten ist mir wichtig. Diese
            Datenschutzerklärung informiert Sie darüber, welche Daten beim
            Besuch dieser Website verarbeitet werden, zu welchen Zwecken und
            auf welcher Rechtsgrundlage.
          </p>
        </section>

        <section>
          <H2>Hosting</H2>
          <p className="text-muted-foreground">
            Diese Website wird bei Vercel Inc., 340 S Lemon Ave #4133, Walnut,
            CA 91789, USA gehostet. Beim Aufruf der Website werden technisch
            notwendige Daten (z. B. IP-Adresse, Datum/Uhrzeit, User-Agent) in
            Server-Logs verarbeitet (Art. 6 Abs. 1 lit. f DSGVO; berechtigtes
            Interesse an einem stabilen Betrieb). Mit Vercel besteht ein
            Auftragsverarbeitungsvertrag inklusive EU-Standardvertragsklauseln.
          </p>
        </section>

        <section>
          <H2>Analyse und Reichweitenmessung</H2>
          <p className="text-muted-foreground">
            Ich verwende{" "}
            <a
              href="https://plausible.io/data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors hover:text-primary"
            >
              Plausible Analytics
            </a>
            , eine cookie-freie und datenschutzfreundliche Reichweitenmessung.
            Es werden keine personenbezogenen Daten gespeichert, IP-Adressen
            werden anonymisiert. Zusätzlich kommt Vercel Speed Insights und
            Vercel Analytics zur Performance-Messung zum Einsatz.
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
          </p>
        </section>

        <section>
          <H2>Kommentare</H2>
          <p className="text-muted-foreground">
            Kommentare unter Blog-Artikeln werden über{" "}
            <a
              href="https://giscus.app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors hover:text-primary"
            >
              Giscus
            </a>{" "}
            (basierend auf GitHub Discussions) bereitgestellt. Beim Laden des
            Kommentar-Widgets stellt Ihr Browser eine Verbindung zu GitHub
            (GitHub Inc., 88 Colin P Kelly Jr St, San Francisco, CA 94107,
            USA) her. Es gelten die Datenschutzbestimmungen von GitHub.
          </p>
        </section>

        <section>
          <H2>Kontakt per E-Mail</H2>
          <p className="text-muted-foreground">
            Wenn Sie mich per E-Mail kontaktieren, werden Ihre Angaben zur
            Bearbeitung der Anfrage und für den Fall von Anschlussfragen
            gespeichert (Art. 6 Abs. 1 lit. b und f DSGVO). Eine Weitergabe an
            Dritte erfolgt nicht.
          </p>
        </section>

        <section>
          <H2>Ihre Rechte</H2>
          <p className="text-muted-foreground">
            Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung
            (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung
            (Art. 18), Datenübertragbarkeit (Art. 20) sowie ein
            Widerspruchsrecht (Art. 21). Beschwerden können Sie bei der
            zuständigen Datenschutzaufsichtsbehörde einreichen.
          </p>
        </section>

        <section>
          <H2>Aktualität</H2>
          <p className="text-muted-foreground">
            Diese Datenschutzerklärung wird bei Änderungen der Rechtslage oder
            der eingesetzten Dienste angepasst.
          </p>
        </section>

        <Footer />
      </div>
    </div>
  );
}
