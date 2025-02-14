import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { ViewTransitions } from "next-view-transitions";
import PlausibleProvider from "next-plausible";
import Head from "next/head";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const ogImageDescription = encodeURIComponent(
  "Full-Stack developer sharing his thoughts on the web.",
);

export const metadata = {
  metadataBase: new URL("https://www.jomaendle.com/"),
  title: "Jo Mändle | Building for the Web.",
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
        style={{
          scrollbarGutter: "stable",
        }}
      >
        <Head>
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" href="/favicon-32x32.png" />
          <link rel="stylesheet" href="/index.css" />
        </Head>
        <body
          className={`${inter.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
        >
          <ThemeProvider attribute="class" defaultTheme="system">
            <PlausibleProvider domain="jomaendle.com">
              {children}
              <SpeedInsights />
            </PlausibleProvider>
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
