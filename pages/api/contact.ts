import resend from "@/lib/resend";
import { NextApiRequest, NextApiResponse } from "next";
import { withRateLimit } from "@/lib/rate-limit";
import { withCsrfProtection, composeMiddleware } from "@/lib/csrf-protection";
import { isValidEmail } from "@/lib/email-validation";
import { escapeHtml } from "@/lib/html-utils";

function sanitizeInput(input: string): string {
  return input.trim().slice(0, 1000); // Limit length and trim whitespace
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { name, email, topic } = req.body;

    // Enhanced validation
    if (!name || !email || !topic) {
      return res.status(400).json({ 
        error: "All fields are required",
        details: "Please fill in your name, email, and message"
      });
    }

    if (typeof name !== 'string' || typeof email !== 'string' || typeof topic !== 'string') {
      return res.status(400).json({ error: "Invalid field types" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ 
        error: "Invalid email format",
        details: "Please enter a valid email address"
      });
    }

    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedTopic = sanitizeInput(topic);

    if (sanitizedName.length < 2) {
      return res.status(400).json({ 
        error: "Name too short",
        details: "Please enter at least 2 characters for your name"
      });
    }

    if (sanitizedTopic.length < 10) {
      return res.status(400).json({ 
        error: "Message too short",
        details: "Please enter at least 10 characters for your message"
      });
    }

    try {
      const sendMailRes = await resend.emails.send({
        from: "Contact Form <jo@contact.jomaendle.com>",
        to: "johannes.maendle@outlook.de",
        subject: `New contact form message from ${sanitizedName}`,
        html: `
<h1>New Contact Form Submission</h1>
<p><strong>Name:</strong> ${escapeHtml(sanitizedName)}</p>
<p><strong>Email:</strong> ${escapeHtml(sanitizedEmail)}</p>
<p><strong>Message:</strong> ${escapeHtml(sanitizedTopic)}</p>
`,
        replyTo: sanitizedEmail,
      });

      if (sendMailRes.error) {
        return res.status(500).json({ error: sendMailRes.error.message });
      }

      res.status(200).json({ message: "Message sent successfully" });
    } catch {
      res.status(500).json({ error: "Failed to send message" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

const middleware = composeMiddleware(
  withCsrfProtection,
  (h) => withRateLimit(h, {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Too many contact form submissions, please try again later"
  })
);

export default middleware(handler);
