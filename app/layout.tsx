import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { ViewTransitions } from "next-view-transitions";
import PlausibleProvider from "next-plausible";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Metadata } from "next";
import { Provider as JotaiProvider } from "jotai";
import {
  PersonStructuredData,
  WebsiteStructuredData,
} from "@/components/structured-data";
import { ReactQueryProvider } from "./providers";

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
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-32x32.png", type: "image/png" },
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
        <body className={`${inter.variable} min-h-[100dvh] font-sans text-foreground antialiased`}>
          <ReactQueryProvider>
            <JotaiProvider>
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
            </JotaiProvider>
          </ReactQueryProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
