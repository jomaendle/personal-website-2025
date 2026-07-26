import { NextApiRequest, NextApiResponse } from "next";
import resend from "@/lib/resend";
import { withRateLimit } from "@/lib/rate-limit";
import { withCsrfProtection, composeMiddleware } from "@/lib/csrf-protection";
import { isValidEmail } from "@/lib/email-validation";
import { escapeHtml } from "@/lib/html-utils";
import { sanitizeInput } from "@/lib/input-sanitization";
import {
  BUSINESS_COPY,
  ENGAGEMENT_TYPES,
  TIMELINES,
} from "@/lib/state/business-copy";

/**
 * Business inquiry endpoint backing the /business page form.
 *
 * Deliberately separate from `/api/contact`: that route is hardwired to a
 * personal inbox and a "New contact form message from …" subject, and it still
 * serves the freelance-tool blog post. Business leads need to land in the
 * business inbox with a subject that is findable months later, so the two
 * routes stay independent while sharing the same middleware and validators.
 */

const RECIPIENT = "me@jomaendle.com";

/**
 * Resolves an optional select value to a human label.
 *
 * The value must be a member of the allowlist — anything unrecognized returns
 * null and is silently dropped, so an attacker cannot inject arbitrary text
 * into the email through these fields. Labels are read from the English copy
 * so the email is legible regardless of which language the form was in.
 */
function resolveOption(
  value: unknown,
  allowed: readonly string[],
  options: { value: string; label: string }[],
): string | null {
  if (typeof value !== "string") return null;
  if (!allowed.includes(value)) return null;
  return options.find((o) => o.value === value)?.label ?? null;
}

/** One labelled row of the email table. */
function row(label: string, value: string): string {
  return `
<tr>
  <td style="padding:6px 16px 6px 0;vertical-align:top;color:#666;white-space:nowrap;">${escapeHtml(label)}</td>
  <td style="padding:6px 0;vertical-align:top;">${escapeHtml(value)}</td>
</tr>`;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    // `.end()` returns the response object; ApiHandler must resolve to void.
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { name, email, message, company, engagementType, timeline, lang } =
    req.body ?? {};

  if (!name || !email || !message) {
    return res.status(400).json({
      error: "Missing required fields",
      details: "Please fill in your name, email, and message",
    });
  }

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string"
  ) {
    return res.status(400).json({ error: "Invalid field types" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      error: "Invalid email format",
      details: "Please enter a valid email address",
    });
  }

  const sanitizedName = sanitizeInput(name, 100);
  const sanitizedEmail = sanitizeInput(email, 254);
  const sanitizedMessage = sanitizeInput(message, 2000);
  const sanitizedCompany =
    typeof company === "string" ? sanitizeInput(company, 100) : "";

  if (sanitizedName.length < 2) {
    return res.status(400).json({
      error: "Name too short",
      details: "Please enter at least 2 characters for your name",
    });
  }

  if (sanitizedMessage.length < 10) {
    return res.status(400).json({
      error: "Message too short",
      details: "Please enter at least 10 characters for your message",
    });
  }

  // English labels keep the email readable no matter which locale submitted it.
  const enForm = BUSINESS_COPY.en.form;
  const engagementLabel = resolveOption(
    engagementType,
    ENGAGEMENT_TYPES,
    enForm.engagementTypeOptions,
  );
  const timelineLabel = resolveOption(
    timeline,
    TIMELINES,
    enForm.timelineOptions,
  );
  const submittedFrom = lang === "de" ? "/business (DE)" : "/business/en (EN)";

  const rows = [
    row("Name", sanitizedName),
    row("Email", sanitizedEmail),
    sanitizedCompany ? row("Company", sanitizedCompany) : "",
    engagementLabel ? row("Engagement", engagementLabel) : "",
    timelineLabel ? row("Timeline", timelineLabel) : "",
    row("Page", submittedFrom),
  ].join("");

  try {
    const sendMailRes = await resend.emails.send({
      from: "Business Inquiry <jo@contact.jomaendle.com>",
      to: RECIPIENT,
      subject: `Projektanfrage: ${sanitizedCompany || sanitizedName}`,
      html: `
<h1 style="font-size:18px;margin:0 0 16px;">New business inquiry</h1>
<table style="border-collapse:collapse;font-size:14px;line-height:1.5;">${rows}</table>
<h2 style="font-size:15px;margin:24px 0 8px;">Message</h2>
<p style="font-size:14px;line-height:1.6;white-space:pre-wrap;margin:0;">${escapeHtml(sanitizedMessage)}</p>
`,
      replyTo: sanitizedEmail,
    });

    if (sendMailRes.error) {
      // Log the full provider error server-side; never leak it to the client.
      console.error("Business inquiry email failed:", sendMailRes.error);
      return res.status(500).json({ error: "Failed to send inquiry" });
    }

    return res.status(200).json({ message: "Inquiry sent successfully" });
  } catch (error) {
    console.error("Business inquiry email threw:", error);
    return res.status(500).json({ error: "Failed to send inquiry" });
  }
}

const middleware = composeMiddleware(withCsrfProtection, (h) =>
  withRateLimit(h, {
    maxRequests: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Too many inquiries submitted, please try again later",
  }),
);

export default middleware(handler);
