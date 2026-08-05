/**
 * Input sanitization shared by the form-backed API routes.
 *
 * Extracted from `pages/api/contact.ts` so `/api/contact` and `/api/inquiry`
 * enforce the same bounds rather than keeping two copies in sync by hand.
 *
 * This trims, collapses newlines and length-caps only — it does NOT make a
 * string safe to embed in HTML. Always pass the result through `escapeHtml`
 * from `lib/html-utils.ts` before interpolating it into an email body.
 */

/** Default cap, matching the 1000-character limit the contact form advertises. */
const DEFAULT_MAX_LENGTH = 1000;

export function sanitizeInput(
  input: string,
  maxLength: number = DEFAULT_MAX_LENGTH,
): string {
  return input.trim().slice(0, maxLength);
}

/**
 * Sanitizes a value destined for an email *subject* line.
 *
 * Same bounds as `sanitizeInput`, plus newline collapsing: both form endpoints
 * interpolate a user-supplied value into the subject. Resend takes JSON rather
 * than raw SMTP so a bare CRLF cannot inject headers today, but keeping the
 * subject single-line costs nothing and closes the class for both routes.
 */
export function sanitizeSubjectInput(
  input: string,
  maxLength: number = DEFAULT_MAX_LENGTH,
): string {
  return sanitizeInput(input, maxLength).replace(/[\r\n]+/g, " ");
}
