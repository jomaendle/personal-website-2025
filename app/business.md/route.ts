export const dynamic = "force-static";

const md = `# Webentwicklung für Unternehmen — Jo Mändle

Senior Full-Stack Developer für kleine und mittelständische Unternehmen.
Next.js · React · TypeScript · DSGVO-bewusst · seit 2022.

- E-Mail: me@jomaendle.com
- LinkedIn: https://www.linkedin.com/in/johannes-maendle/

## Worum es geht

Ich entwickle zuverlässige Webprodukte für kleine und mittelständische Unternehmen — Maklerbüros, SaaS-Anbieter, Fotograf:innen und alles dazwischen.

Über sechs Jahre Erfahrung mit TypeScript, React und Next.js. Aktuell als Principal Solution Architect bei E.ON, davor bei StudySmarter und Memberspot.

## Leistungen

- **Website-Relaunch** — Next.js, statisch, SEO- und barrierefrei.
- **Performance-Audit** — Lighthouse 95+, Core Web Vitals, Bildoptimierung.
- **API- & CMS-Integration** — Headless-CMS, CRM-Sync, externe Datenquellen.
- **Wartung & Weiterentwicklung** — Verlässliche Iteration nach dem Launch.
- **SEO-Grundlagen** — Sitemap, strukturierte Daten, technisches SEO.

## Ausgewählte Projekte

### ImmoKäpsele — https://immokaepsele.de
**2024 – heute · Sole Developer & Tech Lead · Next.js · Flowfact CRM · Cloudinary**

Komplette Neuentwicklung der Website eines Maklerbüros: von der Architektur über die Anbindung an das Flowfact-CRM bis zum Live-Gang. Direkte Zusammenarbeit mit dem Inhaber, klare Sprints, regelmäßige Abnahmen.

- Statisch generierte Objektseiten mit täglicher CRM-Synchronisation via GitHub Actions
- Wertermittlungsrechner mit Server-Validierung und versendeter Zusammenfassung an Inhaber:in und Interessent:in
- Lighthouse 95+ über alle Seiten, Bilder als WebP/AVIF aus AWS S3 + Cloudinary
- Vollständig DSGVO-konform: rechtskonformes Impressum, Datenschutz, kein Tracking ohne Notwendigkeit

### Emerge Tech — EasyEngage — https://emerge-tech.io/
**2024 – heute · Lead Frontend Developer · Astro · Multi-Tenant · TypeScript**

Aufbau von EasyEngage, einer Astro-basierten Plattform, die für jeden Mandanten individuelle Customer-Funnels rendert. Schwerpunkte: Multi-Tenant-Routing, schnelle Builds und ein Editor-Workflow, mit dem das Produkt-Team Funnels ohne Entwickler:innen ausspielen kann.

- Multi-Tenant-Architektur mit isolierten Datenpfaden und kundenspezifischen Themes
- Reduzierte Build-Zeiten durch inkrementelle Astro-Generierung und gezieltes Caching
- Komponenten-Bibliothek, die sowohl im Editor als auch im gerenderten Funnel verwendet wird

### The Beauty of Earth — https://thebeautyof.earth
**2023 · Sole Developer · Astro · Cloudinary**

Bildlastige Landschaftsfotografie-Sammlung mit Anspruch auf hervorragende Performance auf Mobile-Geräten.

- Lazy-loaded Galerien mit responsiven AVIF/WebP-Auslieferungen aus Cloudinary
- Optimierte Largest Contentful Paint und stabiler Cumulative Layout Shift

### Jo Maendle Photography — https://photo.jomaendle.com
**2022 · Sole Developer · Next.js · Static Export**

Persönliches Fotografie-Portfolio mit Porträt- und Landschaftsaufnahmen.

- Komplett statisch, 100/100 Lighthouse-Performance
- Eigene Animation-Patterns für ruhige, fokussierte Bildpräsentation

## So arbeiten wir zusammen

1. **Gespräch** (ca. 1 Woche) — Kostenlos, unverbindlich. Ziele, Umfang, Technologien klären.
2. **Angebot** (ca. 2 Wochen) — Klares Festpreis-Angebot mit Zeitplan und Meilensteinen.
3. **Launch** (4 – 8 Wochen) — Schnelle Iteration, regelmäßige Previews, sauberer Go-Live.

## Warum ich

- Senior In-House-Erfahrung in produktiven Web-Anwendungen
- Schnelle Iteration ohne Abstriche bei der Codequalität
- Deutsch und Englisch auf Augenhöhe
- DSGVO-bewusst, transparente Kommunikation, faire Preise

## Kontakt

- E-Mail: me@jomaendle.com
- LinkedIn: https://www.linkedin.com/in/johannes-maendle/
- HTML version: https://jomaendle.com/business
- English version: https://jomaendle.com/business/en
`;

export function GET() {
  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
