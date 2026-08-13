"use client";

import { Loader2 } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { H2 } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "finished"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setErrorMessage(data.details || data.error || "Failed to subscribe");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatus("error");
      setErrorMessage(
        `Network error. Please check your connection and try again: ${errorMessage}`,
      );
    }
  };

  // Handle status timeout transitions with proper cleanup
  useEffect(() => {
    if (status === "success") {
      const timeoutId = setTimeout(() => setStatus("finished"), 3000);
      return () => clearTimeout(timeoutId);
    }
    if (status === "error") {
      const timeoutId = setTimeout(() => setStatus("idle"), 5000);
      return () => clearTimeout(timeoutId);
    }
    return;
  }, [status]);

  const isLoading = useMemo(() => status === "loading", [status]);

  return (
    <div className="w-full py-8">
      <div className="mb-6 space-y-2">
        <H2 className="">Newsletter</H2>
        <p className="text-muted-foreground text-sm">
          Get an email when I publish something new.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row">
        <div className="flex-1">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            required
            disabled={isLoading}
            // Focus styling is left entirely to the base Input's brand
            // `focus-visible` ring — the old `focus:ring-primary/20` here fired
            // on mouse clicks and fought that ring for the same box-shadow.
            className="h-11"
            maxLength={254}
            aria-describedby="email-help"
          />
          <p id="email-help" className="sr-only">
            Enter your email address to subscribe to the newsletter
          </p>
        </div>
        {/* A plain button. The motion.button/AnimatePresence pair it replaces
            configured a spring but animated no values, so nothing visible is
            lost, and dropping it takes framer-motion out of every route that
            renders the newsletter. */}
        <button
          type="submit"
          disabled={isLoading}
          // Same CTA language as the /business submit button: ink fill, mono
          // uppercase label, h-11 — the one height every form CTA now shares.
          className="inline-flex h-11 w-full items-center justify-center overflow-hidden whitespace-nowrap rounded-[0.25rem] bg-foreground px-8 font-mono text-[0.75rem] text-background uppercase tracking-[0.14em] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
        >
          <span className="inline-flex items-center gap-1">
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Subscribing</span>
              </>
            ) : (
              "Subscribe"
            )}
          </span>
        </button>
      </form>

      {/* Bordered panels rather than coloured text: the old mint/salmon ran at
          1.58:1 and 2.51:1 on paper. Colour now carries only the border and
          wash, and the text itself stays on `text-foreground`. */}
      {/* Both regions stay mounted with only their text changing. A region
          inserted at the moment it gains content is unreliable: screen readers
          register live regions as the DOM is built, so one that appears late is
          often never announced. `mt-3` is on the inner panel so an empty region
          reserves no vertical space. */}
      <p role="status" aria-live="polite">
        {status === "success" && (
          <span className="motion-preset-slide-down-md motion-opacity-in-0 mt-3 block rounded-[0.25rem] border border-brand bg-brand/5 px-4 py-3 text-foreground text-sm opacity-100">
            Thanks for subscribing. You&apos;ll get an email shortly.
          </span>
        )}
      </p>

      <p role="alert">
        {status === "error" && (
          <span className="motion-preset-slide-down-md motion-opacity-in-0 mt-3 block rounded-[0.25rem] border border-destructive bg-destructive/5 px-4 py-3 text-foreground text-sm opacity-100">
            {errorMessage || "Failed to subscribe. Please try again."}
          </span>
        )}
      </p>
    </div>
  );
}
