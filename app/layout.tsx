import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { ViewTransitions } from "next-view-transitions";
import PlausibleProvider from "next-plausible";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  metadataBase: new URL("https://www.jomaendle.com/"),
  title: "Jo Mändle | Building for the Web.",
  description: "Frontend developer based in Bremen, Germany.",
  openGraph: {
    images: [
      {
        url: "/api/og?title=Jo+M%C3%A4ndle&description=Frontend+developer+based+in+Bremen%2C+Germany.",
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
        <head>
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" href="/favicon-32x32.png" />
          <link rel="stylesheet" href="/index.css" />
        </head>
        <body
          className={`${inter.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
        >
          <ThemeProvider attribute="class" defaultTheme="system">
            <PlausibleProvider domain="jomaendle.com">
              {children}
            </PlausibleProvider>
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
