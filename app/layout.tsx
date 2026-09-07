import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import "./editorial-theme.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import PlausibleProvider from "next-plausible";
import { ViewTransitions } from "next-view-transitions";
import {
  PersonStructuredData,
  WebsiteStructuredData,
} from "@/components/structured-data";
import { MotionProvider } from "./providers";

const ogImageDescription = encodeURIComponent(
  "I build things for the web and write about it here.",
);

export const metadata: Metadata = {
  metadataBase: new URL("https://www.jomaendle.com/"),
  title: {
    default: "Jo Mändle",
    template: "%s | Jo Mändle",
  },
  description: "I build things for the web and write about it here.",
  keywords: ["Jo Mändle", "Johannes Mändle", "jo maendle", "johannes maendle"],
  authors: [{ name: "Johannes Mändle", url: "https://www.jomaendle.com" }],
  creator: "Johannes Mändle",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      // These two live in `public/`, not `app/`. The App Router only
      // auto-serves reserved names (favicon.ico, icon.*, apple-icon.*) from
      // `app/`, so while they sat there both 404'd on every route.
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
  },
  openGraph: {
    images: [
      {
        url: `/api/og-image?title=Jo+M%C3%A4ndle&description=${ogImageDescription}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        suppressHydrationWarning
        data-scroll-behavior="smooth"
        style={{
          scrollbarGutter: "stable",
        }}
      >
        <head>
          {/* DNS prefetch for lazy-loaded external domains */}
          <link rel="dns-prefetch" href="https://giscus.app" />
          <link rel="dns-prefetch" href="https://plausible.io" />

          {/* Preload critical fonts */}
          <link
            rel="preload"
            href="/fonts/GeistVF.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          {/* Newsreader is deliberately NOT preloaded: at 132KB it starved the
              (much smaller, LCP-critical) Geist fetch on slow connections, and
              its metric-matched Georgia fallback makes the late swap shift-free. */}
        </head>
        {/* `font-sans` resolves to the Geist stack via --font-sans (globals.css
            @theme). The inline fontFamily this class used to need — from when
            the token wasn't wired up — is gone. */}
        <body className="min-h-dvh font-sans text-foreground antialiased">
          {/* Each route owns its own `<main id="main-content">`, and it has to
              start below the PageTopBar and above the Footer. Wrapping the
              whole page in it instead makes this link jump to a point above the
              nav it is meant to skip, and swallows the banner/contentinfo
              landmarks. */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-200 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:font-medium focus:text-foreground focus:text-sm focus:shadow-lg focus:outline-hidden focus:ring-2 focus:ring-brand"
          >
            Skip to content
          </a>
          <MotionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem={true}
              enableColorScheme={true}
              storageKey="theme"
            >
              <PlausibleProvider domain="jomaendle.com">
                {children}
              </PlausibleProvider>
              <SpeedInsights />
              <PersonStructuredData />
              <WebsiteStructuredData />
            </ThemeProvider>
          </MotionProvider>
          <Analytics />
        </body>
      </html>
    </ViewTransitions>
  );
}
