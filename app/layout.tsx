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
  title: "Jo Mändle | Building for the Web.",
  description: "Frontend developer based in Bremen, Germany.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" href="/favicon-32x32.png" />
        </head>
        <body
          className={`${inter.variable} font-sans min-h-screen bg-background text-foreground antialiased`}
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
