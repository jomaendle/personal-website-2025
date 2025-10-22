"use client";

import { FormEvent, useMemo, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { H2 } from "@/components/ui/heading";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

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
    } else if (status === "error") {
      const timeoutId = setTimeout(() => setStatus("idle"), 5000);
      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [status]);

  const isLoading = useMemo(() => status === "loading", [status]);

  return (
    <div className="w-full py-8">
      <div className="mb-6 space-y-2">
        <H2 className="">Newsletter</H2>
        <p className="text-sm text-muted-foreground">
          Subscribe to get notified about new articles and updates.
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
            className="bg-input transition-colors focus:ring-2 focus:ring-primary/20"
            maxLength={254}
            aria-describedby="email-help"
          />
          <p id="email-help" className="sr-only">
            Enter your email address to subscribe to the newsletter
          </p>
        </div>
        <motion.button
          type="submit"
          disabled={isLoading}
          transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
          initial={false}
          className="h-10 w-full overflow-hidden whitespace-nowrap rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 md:w-40"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={status}
              className="inline-flex items-center gap-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Subscribing</span>
                </>
              ) : (
                "Subscribe"
              )}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </form>

      {status === "success" && (
        <p className="motion-preset-slide-down-md mt-3 text-sm text-green-400 opacity-100 motion-opacity-in-0">
          Thanks for subscribing! You will receive an email shortly.
        </p>
      )}

      {status === "error" && (
        <p className="motion-preset-slide-down-md mt-3 text-sm text-red-400 opacity-100 motion-opacity-in-0">
          {errorMessage || "Failed to subscribe. Please try again."}
        </p>
      )}
    </div>
  );
}
