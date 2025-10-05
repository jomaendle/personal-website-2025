import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { ViewTransitions } from "next-view-transitions";
import PlausibleProvider from "next-plausible";
import Head from "next/head";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Metadata } from "next";
import { Provider as JotaiProvider } from "jotai";
import {
  PersonStructuredData,
  WebsiteStructuredData,
} from "@/components/structured-data";
import { ThemeAwareBody } from "@/components/theme-aware-body";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const ogImageDescription = encodeURIComponent(
  "Full-Stack developer sharing his thoughts on the web.",
);

export const metadata: Metadata = {
  metadataBase: new URL("https://www.jomaendle.com/"),
  title: {
    default: "Jo Mändle | Building for the Web.",
    template: "%s | Jo Mändle",
  },
  description: "Full-Stack developer sharing his thoughts on the web.",
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
        <Head>
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" href="/favicon-32x32.png" />
          <link rel="modulepreload" href="/_next/static/chunks/pages/_app.js" />
          <link rel="modulepreload" href="/_next/static/chunks/webpack.js" />
          <link rel="modulepreload" href="/_next/static/chunks/main.js" />
        </Head>
        <JotaiProvider>
          <ThemeProvider attribute="class" defaultTheme="system">
            <ThemeAwareBody className={`${inter.variable} font-sans antialiased`}>
              <PlausibleProvider domain="jomaendle.com">
                {children}
              </PlausibleProvider>
              <SpeedInsights />
              <PersonStructuredData />
              <WebsiteStructuredData />
            </ThemeAwareBody>
          </ThemeProvider>
        </JotaiProvider>
      </html>
    </ViewTransitions>
  );
}
