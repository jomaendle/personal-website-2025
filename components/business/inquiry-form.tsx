"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BUSINESS_COPY, type Lang } from "@/lib/state/business-copy";

/**
 * InquiryForm — Editorial design layer.
 *
 * The lead-capture form on /business, posting to `/api/inquiry`. Three required
 * fields (name, email, message) plus three optional qualifiers that make an
 * inbound lead triageable without a follow-up round trip.
 *
 * Unlike `components/contact-form.tsx`, the `<form>` is never unmounted: status
 * is rendered as a sibling live region, so a failed submission keeps every value
 * the visitor typed and can simply be retried.
 */

type Status = "idle" | "loading" | "success" | "error";

const fieldBase =
  "w-full rounded-[0.25rem] border border-border bg-transparent px-3 py-2 text-[0.95rem] text-foreground transition-colors placeholder:text-muted-foreground/70 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50";

const labelBase =
  "mb-2 flex items-baseline gap-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground";

function OptionalTag({ children }: { children: string }) {
  return (
    <span className="text-[0.65rem] normal-case tracking-normal text-muted-foreground/60">
      ({children})
    </span>
  );
}

export function InquiryForm({ lang }: { lang: Lang }) {
  const t = BUSINESS_COPY[lang].form;

  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [values, setValues] = useState({
    name: "",
    email: "",
    message: "",
    company: "",
    engagementType: "",
    timeline: "",
  });

  const isLoading = status === "loading";

  const set = (key: keyof typeof values) => (value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, lang }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus("success");
        setValues({
          name: "",
          email: "",
          message: "",
          company: "",
          engagementType: "",
          timeline: "",
        });
      } else {
        setStatus("error");
        setErrorMessage(data.details || data.error || t.genericError);
      }
    } catch {
      setStatus("error");
      setErrorMessage(t.networkError);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <h3 className="font-serif text-[1.35rem] font-normal leading-[1.15] text-foreground">
        {t.heading}
      </h3>

      {status === "success" && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-[0.25rem] border border-brand/40 bg-brand/5 px-4 py-3 text-sm text-foreground"
        >
          {t.success}
        </p>
      )}

      {status === "error" && (
        <p
          role="alert"
          className="rounded-[0.25rem] border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-foreground"
        >
          {errorMessage || t.genericError}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate={false}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="inquiry-name" className={labelBase}>
              {t.name}
              <span aria-hidden="true" className="text-brand">
                *
              </span>
              <span className="sr-only">({t.required})</span>
            </label>
            <input
              id="inquiry-name"
              name="name"
              type="text"
              value={values.name}
              onChange={(e) => set("name")(e.target.value)}
              placeholder={t.namePlaceholder}
              className={fieldBase}
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="inquiry-email" className={labelBase}>
              {t.email}
              <span aria-hidden="true" className="text-brand">
                *
              </span>
              <span className="sr-only">({t.required})</span>
            </label>
            <input
              id="inquiry-email"
              name="email"
              type="email"
              value={values.email}
              onChange={(e) => set("email")(e.target.value)}
              placeholder={t.emailPlaceholder}
              className={fieldBase}
              required
              maxLength={254}
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="inquiry-company" className={labelBase}>
              {t.company}
              <OptionalTag>{t.optional}</OptionalTag>
            </label>
            <input
              id="inquiry-company"
              name="company"
              type="text"
              value={values.company}
              onChange={(e) => set("company")(e.target.value)}
              placeholder={t.companyPlaceholder}
              className={fieldBase}
              maxLength={100}
              autoComplete="organization"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="inquiry-timeline" className={labelBase}>
              {t.timeline}
              <OptionalTag>{t.optional}</OptionalTag>
            </label>
            <select
              id="inquiry-timeline"
              name="timeline"
              value={values.timeline}
              onChange={(e) => set("timeline")(e.target.value)}
              className={cn(fieldBase, "h-[42px]")}
              disabled={isLoading}
            >
              <option value="">—</option>
              {t.timelineOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="inquiry-engagement" className={labelBase}>
            {t.engagementType}
            <OptionalTag>{t.optional}</OptionalTag>
          </label>
          <select
            id="inquiry-engagement"
            name="engagementType"
            value={values.engagementType}
            onChange={(e) => set("engagementType")(e.target.value)}
            className={cn(fieldBase, "h-[42px]")}
            disabled={isLoading}
          >
            <option value="">—</option>
            {t.engagementTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="inquiry-message" className={labelBase}>
            {t.message}
            <span aria-hidden="true" className="text-brand">
              *
            </span>
            <span className="sr-only">({t.required})</span>
          </label>
          <textarea
            id="inquiry-message"
            name="message"
            value={values.message}
            onChange={(e) => set("message")(e.target.value)}
            placeholder={t.messagePlaceholder}
            rows={6}
            className={cn(fieldBase, "resize-y leading-relaxed")}
            required
            minLength={10}
            maxLength={2000}
            aria-describedby="inquiry-message-count"
            disabled={isLoading}
          />
          <p
            id="inquiry-message-count"
            className="mt-1.5 text-right font-mono text-[0.7rem] text-muted-foreground/60"
          >
            {values.message.length}/2000
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          // `self-start` (not `w-auto`) is what un-stretches the button: this is
          // a `flex flex-col`, whose default `align-items: stretch` overrides
          // any cross-axis width utility.
          className="inline-flex h-11 w-full items-center justify-center gap-2 self-stretch rounded-[0.25rem] bg-foreground px-8 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:self-start"
        >
          {isLoading && <Loader2 className="size-4 animate-spin" />}
          {isLoading ? t.submitting : t.submit}
        </button>
      </form>
    </div>
  );
}
