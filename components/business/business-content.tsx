"use client";

import { Link } from "next-view-transitions";
import { motion, type Variants } from "framer-motion";
import {
  ArrowUpRight,
  ExternalLinkIcon,
  Gauge,
  LineChart,
  Plug,
  Rocket,
  Wrench,
} from "lucide-react";
import { H2, H3 } from "@/components/ui/heading";
import { Footer } from "@/components/ui/footer";
import { ThemeToggle } from "@/components/theme-toggle";

type Lang = "de" | "en";

type Project = {
  id: string;
  title: string;
  href: string;
  period: { de: string; en: string };
  role: { de: string; en: string };
  context: { de: string; en: string };
  highlights: { de: string[]; en: string[] };
  stack: string[];
};

const PROJECTS: Project[] = [
  {
    id: "immokaepsele",
    title: "ImmoKäpsele",
    href: "https://immokaepsele.de",
    period: { de: "2024 – heute", en: "2024 – present" },
    role: {
      de: "Sole Developer & Tech Lead",
      en: "Sole developer & tech lead",
    },
    context: {
      de: "Komplette Neuentwicklung der Website eines Maklerbüros: von der Architektur über die Anbindung an das Flowfact-CRM bis zum Live-Gang. Direkte Zusammenarbeit mit dem Inhaber, klare Sprints, regelmäßige Abnahmen.",
      en: "Complete rebuild of a real-estate agency's website — architecture, Flowfact CRM integration and go-live. Direct collaboration with the owner, clear sprints and regular reviews.",
    },
    highlights: {
      de: [
        "Statisch generierte Objektseiten mit täglicher CRM-Synchronisation via GitHub Actions",
        "Wertermittlungsrechner mit Server-Validierung und versendeter Zusammenfassung an Inhaber:in und Interessent:in",
        "Lighthouse 95+ über alle Seiten, Bilder als WebP/AVIF aus AWS S3 + Cloudinary",
        "Vollständig DSGVO-konform: rechtskonformes Impressum, Datenschutz, kein Tracking ohne Notwendigkeit",
      ],
      en: [
        "Statically generated property pages with daily CRM sync via GitHub Actions",
        "Valuation calculator with server-side validation and email summary to both owner and prospect",
        "Lighthouse 95+ across all pages, WebP/AVIF images served from AWS S3 + Cloudinary",
        "Fully GDPR-compliant: legally correct imprint, privacy notice, no unnecessary tracking",
      ],
    },
    stack: ["Next.js 15", "TypeScript", "Tailwind", "Flowfact CRM", "Cloudinary", "Netlify"],
  },
  {
    id: "emerge-tech",
    title: "Emerge Tech — EasyEngage",
    href: "https://emerge-tech.io/",
    period: { de: "2024 – heute", en: "2024 – present" },
    role: {
      de: "Lead Frontend Developer",
      en: "Lead frontend developer",
    },
    context: {
      de: "Aufbau von EasyEngage, einer Astro-basierten Plattform, die für jeden Mandanten individuelle Customer-Funnels rendert. Schwerpunkte: Multi-Tenant-Routing, schnelle Builds und ein Editor-Workflow, mit dem das Produkt-Team Funnels ohne Entwickler:innen ausspielen kann.",
      en: "Building EasyEngage, an Astro-based platform that renders bespoke customer funnels per tenant. Focus areas: multi-tenant routing, fast builds, and an editor workflow that lets the product team ship funnels without developer involvement.",
    },
    highlights: {
      de: [
        "Multi-Tenant-Architektur mit isolierten Datenpfaden und kundenspezifischen Themes",
        "Reduzierte Build-Zeiten durch inkrementelle Astro-Generierung und gezieltes Caching",
        "Komponenten-Bibliothek, die sowohl im Editor als auch im gerenderten Funnel verwendet wird",
      ],
      en: [
        "Multi-tenant architecture with isolated data paths and per-customer theming",
        "Reduced build times through incremental Astro generation and targeted caching",
        "Component library reused across both the editor and the rendered funnel",
      ],
    },
    stack: ["Astro", "TypeScript", "Multi-Tenant", "Tailwind"],
  },
  {
    id: "beauty-of-earth",
    title: "The Beauty of Earth",
    href: "https://thebeautyof.earth",
    period: { de: "2023", en: "2023" },
    role: {
      de: "Sole Developer",
      en: "Sole developer",
    },
    context: {
      de: "Bildlastige Landschaftsfotografie-Sammlung mit Anspruch auf hervorragende Performance auf Mobile-Geräten — Bilder dürfen nie zur Bremse werden.",
      en: "An image-heavy landscape photography collection that has to stay fast on mobile — images must never become the bottleneck.",
    },
    highlights: {
      de: [
        "Lazy-loaded Galerien mit responsiven AVIF/WebP-Auslieferungen aus Cloudinary",
        "Optimierte Largest Contentful Paint und stabiler Cumulative Layout Shift",
      ],
      en: [
        "Lazy-loaded galleries with responsive AVIF/WebP delivery via Cloudinary",
        "Optimized Largest Contentful Paint and a stable Cumulative Layout Shift",
      ],
    },
    stack: ["Astro", "Cloudinary"],
  },
  {
    id: "photography",
    title: "Jo Maendle Photography",
    href: "https://photo.jomaendle.com",
    period: { de: "2022", en: "2022" },
    role: {
      de: "Sole Developer",
      en: "Sole developer",
    },
    context: {
      de: "Persönliches Fotografie-Portfolio mit Porträt- und Landschaftsaufnahmen — Maßstab für Performance und Tonalität, an dem ich mich auch in Kundenprojekten messe.",
      en: "Personal photography portfolio with portrait and landscape work — a benchmark for the performance and tone of voice I aim for in client projects.",
    },
    highlights: {
      de: [
        "Komplett statisch, 100/100 Lighthouse-Performance",
        "Eigene Animation-Patterns für ruhige, fokussierte Bildpräsentation",
      ],
      en: [
        "Fully static, 100/100 Lighthouse performance",
        "Custom animation patterns for calm, focused image presentation",
      ],
    },
    stack: ["Next.js", "Static Export"],
  },
];

const TRUSTED_BY = [
  "E.ON",
  "StudySmarter",
  "Memberspot",
  "ImmoKäpsele",
  "Emerge Tech",
];

const COPY = {
  de: {
    switchTo: "EN",
    switchHref: "/business/en",
    hero: {
      eyebrow: "Webentwicklung für Unternehmen",
      heading: "Websites, die Ihr Geschäft tragen.",
      subline:
        "Senior Full-Stack Developer · Next.js · DSGVO-sicher · seit 2022.",
      ctaPrimary: "Projekt anfragen",
      ctaSecondary: "LinkedIn",
    },
    trustedBy: "Im Einsatz bei",
    pitch: {
      heading: "Worum es geht",
      paragraphs: [
        "Ich entwickle zuverlässige Webprodukte für kleine und mittelständische Unternehmen — Maklerbüros, SaaS-Anbieter, Fotograf:innen und alles dazwischen.",
        "Über sechs Jahre Erfahrung mit TypeScript, React und Next.js. Aktuell bei E.ON, davor bei StudySmarter und Memberspot. Ich kenne die Anforderungen an Performance, Wartbarkeit und Compliance, die zählen, wenn eine Website wirklich Geschäft tragen muss.",
      ],
    },
    services: {
      heading: "Leistungen",
      items: [
        {
          icon: "rocket",
          title: "Website-Relaunch",
          desc: "Next.js, statisch, SEO- und barrierefrei.",
        },
        {
          icon: "gauge",
          title: "Performance-Audit",
          desc: "Lighthouse 95+, Core Web Vitals, Bildoptimierung.",
        },
        {
          icon: "plug",
          title: "API- & CMS-Integration",
          desc: "Headless-CMS, CRM-Sync, externe Datenquellen.",
        },
        {
          icon: "wrench",
          title: "Wartung & Weiterentwicklung",
          desc: "Verlässliche Iteration nach dem Launch.",
        },
        {
          icon: "linechart",
          title: "SEO-Grundlagen",
          desc: "Sitemap, strukturierte Daten, technisches SEO.",
        },
      ],
    },
    work: { heading: "Ausgewählte Projekte" },
    process: {
      heading: "So arbeiten wir zusammen",
      steps: [
        {
          n: "01",
          title: "Gespräch",
          time: "ca. 1 Woche",
          desc: "Kostenlos, unverbindlich. Ziele, Umfang, Technologien klären.",
        },
        {
          n: "02",
          title: "Angebot",
          time: "ca. 2 Wochen",
          desc: "Klares Festpreis-Angebot mit Zeitplan und Meilensteinen.",
        },
        {
          n: "03",
          title: "Launch",
          time: "4 – 8 Wochen",
          desc: "Schnelle Iteration, regelmäßige Previews, sauberer Go-Live.",
        },
      ],
    },
    why: {
      heading: "Warum ich",
      items: [
        "Senior In-House-Erfahrung in produktiven Web-Anwendungen",
        "Schnelle Iteration ohne Abstriche bei der Codequalität",
        "Deutsch und Englisch auf Augenhöhe",
        "DSGVO-bewusst, transparente Kommunikation, faire Preise",
      ],
    },
    contact: {
      heading: "Kontakt",
      email: "me@jomaendle.com",
      emailLabel: "E-Mail",
      linkedin: "LinkedIn",
    },
  },
  en: {
    switchTo: "DE",
    switchHref: "/business",
    hero: {
      eyebrow: "Web development for businesses",
      heading: "Websites your business can rely on.",
      subline:
        "Senior full-stack developer · Next.js · GDPR-aware · since 2022.",
      ctaPrimary: "Start a project",
      ctaSecondary: "LinkedIn",
    },
    trustedBy: "Trusted by",
    pitch: {
      heading: "What I do",
      paragraphs: [
        "I build reliable web products for small and mid-sized businesses — real estate agencies, SaaS companies, photographers and everything in between.",
        "Six plus years of TypeScript, React and Next.js experience. Currently at E.ON, previously at StudySmarter and Memberspot. I know the performance, maintainability and compliance bar a website needs to clear when it actually carries the business.",
      ],
    },
    services: {
      heading: "Services",
      items: [
        {
          icon: "rocket",
          title: "Website rebuild",
          desc: "Next.js, statically rendered, SEO and accessibility ready.",
        },
        {
          icon: "gauge",
          title: "Performance audit",
          desc: "Lighthouse 95+, Core Web Vitals, image optimization.",
        },
        {
          icon: "plug",
          title: "API & CMS integration",
          desc: "Headless CMS, CRM sync, external data sources.",
        },
        {
          icon: "wrench",
          title: "Maintenance & iteration",
          desc: "Reliable post-launch iteration and support.",
        },
        {
          icon: "linechart",
          title: "SEO foundations",
          desc: "Sitemap, structured data, technical SEO.",
        },
      ],
    },
    work: { heading: "Selected Work" },
    process: {
      heading: "How we'll work together",
      steps: [
        {
          n: "01",
          title: "Conversation",
          time: "~1 week",
          desc: "Free and no-strings. Clarify goals, scope, technology.",
        },
        {
          n: "02",
          title: "Proposal",
          time: "~2 weeks",
          desc: "Clear fixed-price proposal with timeline and milestones.",
        },
        {
          n: "03",
          title: "Launch",
          time: "4 – 8 weeks",
          desc: "Fast iteration, regular previews, clean go-live.",
        },
      ],
    },
    why: {
      heading: "Why work with me",
      items: [
        "Senior in-house experience shipping production web apps",
        "Fast iteration without cutting corners on code quality",
        "Fluent in English and German",
        "GDPR-aware, transparent communication, fair pricing",
      ],
    },
    contact: {
      heading: "Contact",
      email: "me@jomaendle.com",
      emailLabel: "Email",
      linkedin: "LinkedIn",
    },
  },
} as const;

const SERVICE_ICONS = {
  rocket: Rocket,
  gauge: Gauge,
  plug: Plug,
  wrench: Wrench,
  linechart: LineChart,
} as const;

const MotionLink = motion.create(Link);

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

export function BusinessContent({ lang }: { lang: Lang }) {
  const t = COPY[lang];

  return (
    <div className="page-container" lang={lang}>
      <main
        className="glass-container relative mx-auto flex max-w-3xl flex-col gap-20"
        style={{ viewTransitionName: "main-content" }}
        itemScope
        itemType="https://schema.org/ProfessionalService"
      >
        {/* Faint accent orb behind the hero */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[420px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-amber-200/30 via-rose-200/20 to-transparent blur-3xl dark:from-amber-400/10 dark:via-rose-400/10"
        />

        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {t.hero.eyebrow}
            </p>
            <div className="flex items-center gap-3">
              <Link
                href={t.switchHref}
                className="text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
                aria-label={`Switch to ${t.switchTo}`}
              >
                {t.switchTo}
              </Link>
              <ThemeToggle />
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-balance text-4xl font-normal leading-tight tracking-tight md:text-5xl"
          >
            {t.hero.heading}
          </motion.h1>

          <p className="text-muted-foreground">{t.hero.subline}</p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={`mailto:${t.contact.email}`}
              className="group inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm text-background transition-transform hover:-translate-y-0.5"
            >
              {t.hero.ctaPrimary}
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a
              href="https://www.linkedin.com/in/johannes-maendle/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-foreground"
            >
              {t.hero.ctaSecondary}
              <ArrowUpRight className="size-4 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
            </a>
          </div>
        </section>

        <section>
          <p className="mb-4 text-xs uppercase tracking-wider text-muted-foreground">
            {t.trustedBy}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground/80">
            {TRUSTED_BY.map((name, i) => (
              <span key={name} className="inline-flex items-center gap-6">
                {i > 0 && (
                  <span className="text-muted-foreground/40" aria-hidden="true">
                    ·
                  </span>
                )}
                <span className="font-medium tracking-wide">{name}</span>
              </span>
            ))}
          </div>
        </section>

        <section>
          <H2>{t.pitch.heading}</H2>
          <div className="space-y-4 text-muted-foreground">
            {t.pitch.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        <section>
          <H2>{t.services.heading}</H2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {t.services.items.map((item) => {
              const Icon = SERVICE_ICONS[item.icon as keyof typeof SERVICE_ICONS];
              return (
                <div
                  key={item.title}
                  className="hover-accent group -mx-3 rounded-[.25rem] px-3 py-3"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                    <H3>{item.title}</H3>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <H2>{t.work.heading}</H2>
          <div className="space-y-4">
            {PROJECTS.map((project, index) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.4,
                  ease: [0.25, 0.1, 0.25, 1] as [
                    number,
                    number,
                    number,
                    number,
                  ],
                  delay: index * 0.05,
                }}
                className="rounded-md border border-border/60 p-4 transition-colors hover:border-border"
                itemScope
                itemType="https://schema.org/CreativeWork"
              >
                <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-foreground"
                    itemProp="url"
                  >
                    <H3 itemProp="name">{project.title}</H3>
                    <ExternalLinkIcon className="size-3 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                  </a>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground/80">
                    {project.period[lang]} · {project.role[lang]}
                  </p>
                </header>

                <p
                  className="mt-2 text-sm text-muted-foreground"
                  itemProp="description"
                >
                  {project.context[lang]}
                </p>

                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {project.highlights[lang].map((h) => (
                    <li
                      key={h}
                      className="flex gap-2 before:flex-shrink-0 before:content-['→'] before:text-muted-foreground/50"
                    >
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.stack.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-sm border border-border/70 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section>
          <H2>{t.process.heading}</H2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {t.process.steps.map((step) => (
              <div
                key={step.n}
                className="rounded-md border border-border/60 p-4 transition-colors hover:border-border"
              >
                <p className="text-xs font-mono text-muted-foreground/70">
                  {step.n}
                </p>
                <H3 className="mt-1">{step.title}</H3>
                <p className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
                  {step.time}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <H2>{t.why.heading}</H2>
          <ul className="space-y-2 text-muted-foreground">
            {t.why.items.map((item) => (
              <li key={item} className="before:mr-2 before:content-['—']">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <H2>{t.contact.heading}</H2>
          <motion.address
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="flex flex-col gap-2 not-italic"
          >
            <motion.div variants={itemVariants}>
              <a
                href={`mailto:${t.contact.email}`}
                className="group inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
              >
                <span>
                  {t.contact.emailLabel} — {t.contact.email}
                </span>
                <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            </motion.div>
            <motion.div variants={itemVariants}>
              <a
                href="https://www.linkedin.com/in/johannes-maendle/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
              >
                <span>{t.contact.linkedin}</span>
                <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            </motion.div>
            <motion.div variants={itemVariants}>
              <a
                href={lang === "de" ? "/business.md" : "/business/en.md"}
                className="group inline-flex items-center gap-1 text-xs text-muted-foreground/70 transition-colors hover:text-primary"
              >
                <span>
                  {lang === "de"
                    ? "Diese Seite als Markdown ansehen"
                    : "View this page as Markdown"}
                </span>
                <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            </motion.div>
          </motion.address>
        </section>

        <Footer />
      </main>
    </div>
  );
}
