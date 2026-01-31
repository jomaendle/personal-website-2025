import resend from "@/lib/resend";
import { NextApiRequest, NextApiResponse } from "next";
import { withRateLimit } from "@/lib/rate-limit";
import { withCsrfProtection, composeMiddleware } from "@/lib/csrf-protection";
import { generateUnsubscribeUrl } from "@/lib/unsubscribe-token";
import { isValidEmail, sanitizeEmail } from "@/lib/email-validation";
import { escapeHtml, escapeHtmlAttribute } from "@/lib/html-utils";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { email } = req.body;

    // Enhanced validation
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        error: "Email is required",
        details: "Please enter your email address",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Invalid email format",
        details: "Please enter a valid email address",
      });
    }

    const sanitizedEmail = sanitizeEmail(email);

    try {
      const audienceId = process.env.RESEND_AUDIENCE_ID;
      if (!audienceId) {
        return res
          .status(500)
          .json({ error: "Newsletter configuration error" });
      }

      const contactRes = await resend.contacts.create({
        email: sanitizedEmail,
        audienceId,
      });

      if (contactRes.error) {
        return res.status(400).json({ error: contactRes.error.message });
      }

      // send a welcome email
      const unsubscribeUrl = generateUnsubscribeUrl(sanitizedEmail);
      const sendMailRes = await resend.emails.send({
        from: "Jo <jo@contact.jomaendle.com>",
        to: sanitizedEmail,
        subject: "Welcome to Jo's Newsletter!",
        html: `
<h1> Hi there! </h1>
<p>Thanks for subscribing to my newsletter.</p>

<p>
If you want to unsubscribe, you can do so by clicking <a href="${escapeHtmlAttribute(unsubscribeUrl)}">here</a>.
</p>

<small>
You are receiving this email because you subscribed to the newsletter. If you didn't subscribe, please ignore this email.
</small>

<p>
Jo Mändle
</p>
`,
      });

      // notify owner
      const notificationEmail = process.env.NOTIFICATION_EMAIL;
      if (notificationEmail) {
        void resend.emails
          .send({
            from: "Jo <jo@contact.jomaendle.com>",
            to: notificationEmail,
            subject: "New Newsletter Subscriber",
            html: `
<p>New subscriber: ${escapeHtml(sanitizedEmail)}</p>
`,
          })
          .catch((err) => {
            console.error("Failed to send notification email:", err);
          });
      }

      if (sendMailRes.error) {
        return res.status(500).json({ error: sendMailRes.error.message });
      }

      res.status(200).json({ message: "Subscription successful" });
    } catch {
      res.status(500).json({ error: "Subscription failed" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

const middleware = composeMiddleware(
  withCsrfProtection,
  (h) => withRateLimit(h, {
    maxRequests: 3,
    windowMs: 10 * 60 * 1000, // 10 minutes
    message: "Too many subscription attempts, please try again later",
  })
);

export default middleware(handler);
