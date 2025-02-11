"use client";

import { FormEvent, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { H2 } from "@/components/ui/heading";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "finished"
  >("idle");

  const handleSubmit = async (e: FormEvent) => {
    setStatus("loading");
    e.preventDefault();
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setStatus("success");
      setEmail("");
    } else {
      setStatus("error");
    }

    setTimeout(() => setStatus("finished"), 5000);
  };

  const isLoading = useMemo(() => status === "loading", [status]);

  return (
    <div className="w-full py-8">
      <div className="mb-6 space-y-2">
        <H2 className="">Newsletter</H2>
        <p className="text-sm text-muted-foreground">
          Subscribe to get notified about new articles and updates.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="border-[#3C3C3C] bg-[#2C2C2C] text-white placeholder:text-[#6C6C6C] focus:border-[#4C4C4C] focus:ring-0"
        />
        <motion.button
          type="submit"
          disabled={isLoading}
          animate={{ width: isLoading ? "10rem" : "8rem" }} // adjust values as needed
          transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
          initial={false}
          className="h-9 overflow-hidden whitespace-nowrap rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
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

      <p
        className={cn(
          "mt-3 text-sm text-muted-foreground",
          status === "success" &&
            "motion-preset-slide-down-md opacity-100 motion-opacity-in-0",
          status === "finished" &&
            "motion-preset-slide-up-md motion-opacity-out-0",
          status !== "success" && status !== "finished" && "opacity-0",
        )}
      >
        Thanks for subscribing! You will receive an email shortly.
      </p>
    </div>
  );
}
