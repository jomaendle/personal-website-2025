"use client";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { H3 } from "@/components/ui/heading";
import { BUSINESS_COPY, type Lang } from "@/lib/state/business-copy";
import { cn } from "@/lib/utils";

/**
 * InquiryForm — Editorial design layer.
 *
 * The lead-capture form on /business, posting to `/api/inquiry`. Three required
 * fields (name, email, message) plus three optional qualifiers that make an
 * inbound lead triageable without a follow-up round trip.
 *
 * Unlike `components/contact-form.tsx`, the `<form>` is never unmounted: status
 * is rendered as a sibling live region, so a failed submission keeps every value
 * the visitor typed and can simply be retried. Both live regions are mounted
 * from the first render and only their text changes, because a region that
 * appears at the same moment as its message is frequently not announced.
 */

type Status = "idle" | "loading" | "success" | "error";

/** The three required fields, and the only ones that can fail validation. */
type FieldName = "name" | "email" | "message";
type FieldErrors = Partial<Record<FieldName, string>>;

// `text-base` (16px) is deliberate and must not be reduced: iOS Safari zooms
// the page on focus for any form control under 16px and never zooms back out.
// `border-border-strong` rather than `border-border`: an operable control needs
// 3:1 against its background under WCAG 1.4.11.
// `min-h-[44px]` so inputs and selects land on the same pointer target size.
// A bare `py-2` left selects at 38px, since a select's intrinsic height comes
// from the UA stylesheet rather than from the line-height inputs honour.
const fieldBase =
  "w-full min-h-[44px] rounded-[0.25rem] border border-border-strong bg-transparent px-3 py-2 text-base leading-6 text-foreground transition-colors placeholder:text-muted-foreground focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

// Invalid keeps the destructive border but NOT a destructive ring. Tinting both
// made a focused invalid field read as a 2px destructive border and nothing
// else — the same hue as the unfocused one, which is precisely the state a
// keyboard user is dropped into after a failed submit. Holding the ring at
// brand keeps "where I am" and "what is wrong" as two separate signals.
const fieldInvalid = "border-destructive focus-visible:border-destructive";

const labelBase =
  "mb-2 flex items-baseline gap-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground";

function OptionalTag({ children }: { children: string }) {
  return (
    <span className="text-[0.7rem] text-muted-foreground normal-case tracking-normal">
      ({children})
    </span>
  );
}

/** Inline reason a field was rejected, referenced from its `aria-describedby`. */
function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 text-destructive text-sm">
      {children}
    </p>
  );
}

export function InquiryForm({ lang }: { lang: Lang }) {
  const t = BUSINESS_COPY[lang].form;

  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [values, setValues] = useState({
    name: "",
    email: "",
    message: "",
    company: "",
    engagementType: "",
    timeline: "",
  });

  const isLoading = status === "loading";

  const set = (key: keyof typeof values) => (value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Clear a field's error as soon as it is edited, rather than making the
    // visitor submit again to find out whether the fix was accepted.
    if (key in fieldErrors) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key as FieldName];
        return next;
      });
    }
  };

  /**
   * Mirrors the constraints the inputs carry and `/api/inquiry` enforces. The
   * form is `noValidate` so these messages replace the browser's own bubbles,
   * which are unstyled and disappear on the next keystroke.
   */
  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (values.name.trim().length < 2) errors.name = t.errors.name;
    if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = t.errors.email;
    if (values.message.trim().length < 10) errors.message = t.errors.message;
    return errors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setStatus("idle");
      setErrorMessage("");
      document.getElementById(`inquiry-${Object.keys(errors)[0]}`)?.focus();
      return;
    }

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
    // No `gap` on this column: the two live regions are always in the DOM and
    // collapse to nothing when empty, and a gap would reserve space for them.
    // Spacing is carried by the elements themselves.
    <div className="flex flex-col">
      <H3 interactive={false} className="mb-5">
        {t.heading}
      </H3>

      <p
        role="status"
        aria-live="polite"
        className={cn(
          status === "success" &&
            "mb-5 rounded-[0.25rem] border border-brand/40 bg-brand/5 px-4 py-3 text-foreground text-sm",
        )}
      >
        {status === "success" ? t.success : ""}
      </p>

      <p
        role="alert"
        className={cn(
          status === "error" &&
            "mb-5 rounded-[0.25rem] border border-destructive/50 bg-destructive/5 px-4 py-3 text-foreground text-sm",
        )}
      >
        {status === "error" ? errorMessage || t.genericError : ""}
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
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
              className={cn(fieldBase, fieldErrors.name && fieldInvalid)}
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              disabled={isLoading}
              aria-invalid={fieldErrors.name ? true : undefined}
              aria-describedby={
                fieldErrors.name ? "inquiry-name-error" : undefined
              }
            />
            <FieldError id="inquiry-name-error">{fieldErrors.name}</FieldError>
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
              className={cn(fieldBase, fieldErrors.email && fieldInvalid)}
              required
              maxLength={254}
              autoComplete="email"
              disabled={isLoading}
              aria-invalid={fieldErrors.email ? true : undefined}
              aria-describedby={
                fieldErrors.email ? "inquiry-email-error" : undefined
              }
            />
            <FieldError id="inquiry-email-error">
              {fieldErrors.email}
            </FieldError>
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
              className={fieldBase}
              disabled={isLoading}
            >
              <option value="">{t.selectPlaceholder}</option>
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
            className={fieldBase}
            disabled={isLoading}
          >
            <option value="">{t.selectPlaceholder}</option>
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
            className={cn(
              fieldBase,
              "resize-y leading-relaxed",
              fieldErrors.message && fieldInvalid,
            )}
            required
            minLength={10}
            maxLength={2000}
            disabled={isLoading}
            aria-invalid={fieldErrors.message ? true : undefined}
            aria-describedby={
              fieldErrors.message
                ? "inquiry-message-count inquiry-message-error"
                : "inquiry-message-count"
            }
          />
          <FieldError id="inquiry-message-error">
            {fieldErrors.message}
          </FieldError>
          <p
            id="inquiry-message-count"
            className="mt-1.5 text-right font-mono text-[0.75rem] text-muted-foreground"
          >
            {values.message.length}/2000
          </p>
        </div>

        {/* Art. 13 DSGVO notice at the point of collection — the form takes
            personal data before the visitor has any reason to visit the footer. */}
        <p className="text-muted-foreground text-xs leading-relaxed">
          {t.privacyNote}{" "}
          <a
            href="/datenschutz"
            className="underline underline-offset-2 transition-colors hover:text-brand"
          >
            {t.privacyLinkLabel}
          </a>
          .
        </p>

        <button
          type="submit"
          disabled={isLoading}
          // On mobile the button fills the column; from `sm` up it shrinks to
          // its content. `sm:self-start` is the part that does the work — this
          // is a `flex flex-col`, whose default `align-items: stretch` would
          // otherwise override `sm:w-auto` on the cross axis.
          className="inline-flex h-11 w-full items-center justify-center gap-2 self-stretch rounded-[0.25rem] bg-foreground px-8 font-mono text-[0.75rem] text-background uppercase tracking-[0.14em] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:self-start"
        >
          {isLoading && <Loader2 className="size-4 animate-spin" />}
          {isLoading ? t.submitting : t.submit}
        </button>
      </form>
    </div>
  );
}
