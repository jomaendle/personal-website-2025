"use client";

import { useEffect } from "react";
import { Link } from "next-view-transitions";
import { H1 } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { PageTopBar } from "@/components/ui/page-top-bar";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for observability; never render it to the user.
    console.error(error);
  }, [error]);

  return (
    <div className="page-container">
      <div className="glass-container mx-auto flex max-w-3xl flex-col gap-10 sm:gap-16">
        <PageTopBar />

        <main id="main-content" tabIndex={-1} className="flex flex-col gap-6">
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-brand">
            Error
          </span>
          <H1 className="max-w-[16ch]">Something went wrong.</H1>
          <p className="max-w-[52ch] text-muted-foreground">
            An unexpected error occurred. You can try again, or head back to the
            homepage.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Button onClick={reset}>Try again</Button>
            <Link
              href="/"
              className="font-mono text-sm text-brand underline-offset-4 transition-colors hover:underline"
            >
              ← Back to homepage
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
