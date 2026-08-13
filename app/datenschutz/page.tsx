import type { Metadata } from "next";
import { Footer } from "@/components/ui/footer";
import { BlogH1, H2 } from "@/components/ui/heading";
import { PageTopBar } from "@/components/ui/page-top-bar";

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
        className="glass-container mx-auto flex max-w-3xl flex-col gap-10 sm:gap-16"
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
            <p className="mb-6 font-mono text-brand text-xs uppercase tracking-[0.16em]">
              Rechtliches
            </p>
            <BlogH1>Datenschutzerklärung</BlogH1>
            <p className="text-muted-foreground text-xs">
              Informationen nach Art. 13, 14 und 21 DSGVO
            </p>
          </section>

          <section>
            <H2>Verantwortlicher</H2>
            <div className="space-y-1 text-muted-foreground">
              <p>Johannes Mändle</p>
              <p>Im Hirschmorgen 12</p>
              <p>69181 Leimen</p>
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
              Auftragsverarbeitungsvertrag inklusive
              EU-Standardvertragsklauseln.
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
                className="underline transition-colors hover:text-brand"
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
                className="underline transition-colors hover:text-brand"
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
            <H2>Eingebettete Inhalte in Artikeln</H2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Einzelne Blog-Artikel enthalten interaktive Code-Beispiele, die
                über CodeSandbox (Sandpack) bereitgestellt werden. Beim Aufruf
                eines solchen Artikels stellt Ihr Browser eine Verbindung zu
                Servern von CodeSandbox her; dabei wird Ihre IP-Adresse
                übermittelt. Es gelten die Datenschutzbestimmungen von
                CodeSandbox. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO
                (Interesse an der Darstellung lauffähiger Code-Beispiele).
              </p>
              <p>
                Einige Artikel zeigen den Browser-Support einer Webtechnologie
                über das Baseline-Status-Widget an. Dafür ruft Ihr Browser Daten
                von api.webstatus.dev ab, einem Dienst von Google; dabei wird
                Ihre IP-Adresse übermittelt. Es gelten die
                Datenschutzbestimmungen von Google. Rechtsgrundlage ist Art. 6
                Abs. 1 lit. f DSGVO.
              </p>
            </div>
          </section>

          <section>
            <H2>Newsletter</H2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Wenn Sie sich für den Newsletter anmelden, verarbeite ich Ihre
                E-Mail-Adresse, um Sie über neue Artikel zu informieren.
                Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a
                DSGVO). Sie können sie jederzeit widerrufen, über den
                Abmeldelink in jeder E-Mail oder formlos per E-Mail an mich.
                Nach der Abmeldung wird Ihre Adresse aus dem Verteiler gelöscht.
              </p>
              <p>
                Der Verteiler wird bei Resend geführt (Anbieterangaben und
                Übermittlungsgrundlage wie im Abschnitt zu den Formularen
                beschrieben).
              </p>
            </div>
          </section>

          <section>
            <H2>Aufrufzähler</H2>
            <p className="text-muted-foreground">
              Blog-Artikel zeigen einen Aufrufzähler. Gezählt wird je Artikel
              eine Gesamtzahl ohne Personenbezug; es werden weder IP-Adressen
              noch Profile gespeichert. Die Zählerstände liegen in einer
              Datenbank bei Supabase Inc. (USA), die Übertragung läuft über
              diese Website, nicht direkt von Ihrem Browser zu Supabase.
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
            </p>
          </section>

          <section>
            <H2>Kontakt per E-Mail</H2>
            <p className="text-muted-foreground">
              Wenn Sie mich per E-Mail kontaktieren, werden Ihre Angaben zur
              Bearbeitung der Anfrage und für den Fall von Anschlussfragen
              gespeichert (Art. 6 Abs. 1 lit. b und f DSGVO). Eine Weitergabe an
              Dritte erfolgt nur, soweit sie zur Bearbeitung erforderlich ist.
              Siehe dazu den folgenden Abschnitt zum eingesetzten
              E-Mail-Dienstleister.
            </p>
          </section>

          <section>
            <H2>Kontakt- und Anfrageformulare</H2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                {/* Named but not linked. Art. 13 DSGVO wants the reader to know
                    exactly which form is meant, so the path stays in the text;
                    an anchor here would be a navigation route into a page that
                    is deliberately unlisted. */}
                Über das Anfrageformular auf <code>/business</code> sowie über
                das Kontaktformular verarbeite ich die von Ihnen angegebenen
                Daten: Name, E-Mail-Adresse und Ihre Nachricht (Pflichtangaben)
                sowie optional Unternehmen, Art der Zusammenarbeit und
                Zeitrahmen. Die Verarbeitung erfolgt ausschließlich zur
                Bearbeitung Ihrer Anfrage und für den Fall von Anschlussfragen.
                Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche
                Maßnahmen), im Übrigen Art. 6 Abs. 1 lit. f DSGVO.
              </p>
              <p>
                Für den Versand dieser Nachrichten setze ich Resend (Resend,
                Inc., 2261 Market Street #5039, San Francisco, CA 94114, USA)
                als Auftragsverarbeiter ein. Dabei werden die Formulardaten in
                die USA übermittelt. Grundlage der Übermittlung ist der{" "}
                <a
                  href="https://resend.com/legal/dpa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline transition-colors hover:text-brand"
                >
                  Auftragsverarbeitungsvertrag von Resend
                </a>
                , der die EU-Standardvertragsklauseln (Modul 2) einbezieht.
                Resend veröffentlicht eine{" "}
                <a
                  href="https://resend.com/legal/subprocessors"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline transition-colors hover:text-brand"
                >
                  Liste der eingesetzten Unterauftragsverarbeiter
                </a>
                .
              </p>
              <p>
                Ihre Angaben werden gelöscht, sobald die Anfrage abschließend
                bearbeitet ist und keine gesetzlichen Aufbewahrungspflichten
                entgegenstehen.
              </p>
            </div>
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
        </main>

        <Footer />
      </div>
    </div>
  );
}
