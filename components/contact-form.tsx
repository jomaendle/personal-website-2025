"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<null | "success" | "error">(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSubmitStatus(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, topic }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitStatus("success");
        setName("");
        setEmail("");
        setTopic("");
      } else {
        setSubmitStatus("error");
        setErrorMessage(data.details || data.error || "Failed to send message");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setSubmitStatus("error");
      setErrorMessage(
        `Network error. Please check your connection and try again: ${errorMessage}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="my-8 rounded-lg border border-border bg-card px-6 pb-6">
      <h2 className="my-4 text-xl font-semibold text-foreground">Get in touch</h2>

      {/* Bordered panels rather than coloured text — see newsletter.tsx and
          business/inquiry-form.tsx: colour carries the border and wash only. */}
      {submitStatus === "success" ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-[0.25rem] border border-brand/40 bg-brand/5 px-4 py-3 text-sm text-foreground"
        >
          Thank you! Your message has been sent.
        </div>
      ) : submitStatus === "error" ? (
        <div
          role="alert"
          className="rounded-[0.25rem] border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-foreground"
        >
          {errorMessage || "Something went wrong. Please try again later."}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm text-muted-foreground">
              Name <span aria-hidden="true" className="text-brand">*</span>
              <span className="sr-only">(required)</span>
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              placeholder="Your Name"
              onChange={(e) => setName(e.target.value)}
              required
              aria-required="true"
              disabled={isSubmitting}
              minLength={2}
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-muted-foreground">
              Email <span aria-hidden="true" className="text-brand">*</span>
              <span className="sr-only">(required)</span>
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              disabled={isSubmitting}
              maxLength={254}
            />
          </div>

          <div>
            <label htmlFor="topic" className="mb-2 block text-sm text-muted-foreground">
              Message <span aria-hidden="true" className="text-brand">*</span>
              <span className="sr-only">(required)</span>
            </label>
            <Textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={4}
              placeholder="I'm interested in a new software product and would like to know more about your services."
              className="w-full"
              required
              aria-required="true"
              disabled={isSubmitting}
              minLength={10}
              maxLength={1000}
            />
            <div className="mt-1 text-xs text-muted-foreground">
              {topic.length}/1000 characters
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
