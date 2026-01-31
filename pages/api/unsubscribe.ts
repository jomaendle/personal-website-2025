import resend from "@/lib/resend";
import { NextApiRequest, NextApiResponse } from "next";
import { withRateLimit } from "@/lib/rate-limit";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";
import { isValidEmail, sanitizeEmail } from "@/lib/email-validation";
import { escapeHtml } from "@/lib/html-utils";

/**
 * Renders a styled HTML page for unsubscribe responses.
 * Consolidates all HTML templates into one reusable function.
 */
function renderHtmlPage(
  title: string,
  headingColor: string,
  heading: string,
  content: string
): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        max-width: 600px;
        margin: 80px auto;
        padding: 0 20px;
        text-align: center;
      }
      h1 { color: ${headingColor}; margin-bottom: 16px; }
      p { color: #666; line-height: 1.6; margin-bottom: 24px; }
      a { color: #2997ff; text-decoration: none; }
      a:hover { text-decoration: underline; }
      .email {
        background: #f5f5f5;
        padding: 8px 12px;
        border-radius: 4px;
        color: #333;
        font-family: monospace;
      }
    </style>
  </head>
  <body>
    <h1>${heading}</h1>
    ${content}
    <p><a href="https://jomaendle.com">Return to homepage</a></p>
  </body>
</html>`;
}

const ERROR_COLOR = "#ff6b6b";
const SUCCESS_COLOR = "#57ab5a";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { token, email } = req.query;

    let sanitizedEmail: string;

    // Prefer token-based authentication (more secure)
    if (token && typeof token === "string") {
      const result = verifyUnsubscribeToken(token);
      if (!result.valid || !result.email) {
        return res.status(400).send(
          renderHtmlPage(
            "Invalid or Expired Link",
            ERROR_COLOR,
            "Invalid or Expired Link",
            `<p>${escapeHtml(result.error || "This unsubscribe link is invalid or has expired.")}</p>
             <p>Please use a recent unsubscribe link from your email, or contact support.</p>`
          )
        );
      }
      sanitizedEmail = result.email;
    }
    // Fallback to email parameter for backwards compatibility with older links
    else if (email && typeof email === "string") {
      if (!isValidEmail(email)) {
        return res.status(400).send(
          renderHtmlPage(
            "Invalid Email",
            ERROR_COLOR,
            "Invalid Email Address",
            "<p>The email address provided is not valid.</p>"
          )
        );
      }
      sanitizedEmail = sanitizeEmail(email);
    }
    // No valid parameter provided
    else {
      return res.status(400).send(
        renderHtmlPage(
          "Invalid Request",
          ERROR_COLOR,
          "Invalid Request",
          "<p>No valid unsubscribe link was provided. Please use the unsubscribe link from your email.</p>"
        )
      );
    }

    try {
      const audienceId = process.env.RESEND_AUDIENCE_ID;
      if (!audienceId) {
        return res.status(500).send(
          renderHtmlPage(
            "Configuration Error",
            ERROR_COLOR,
            "Configuration Error",
            "<p>Newsletter system is not properly configured. Please contact support.</p>"
          )
        );
      }

      // Update contact to mark as unsubscribed
      const updateRes = await resend.contacts.update({
        email: sanitizedEmail,
        audienceId,
        unsubscribed: true,
      });

      if (updateRes.error) {
        console.error("Unsubscribe error:", updateRes.error.message);
        // If contact doesn't exist, still show success (they're unsubscribed either way)
        if (!updateRes.error.message.includes("not found")) {
          throw new Error(updateRes.error.message);
        }
      }

      // Success page
      return res.status(200).send(
        renderHtmlPage(
          "Successfully Unsubscribed",
          SUCCESS_COLOR,
          "Successfully Unsubscribed",
          `<p>You have been unsubscribed from Jo's newsletter.</p>
           <p class="email">${escapeHtml(sanitizedEmail)}</p>
           <p>You will no longer receive email updates. We're sorry to see you go!</p>`
        )
      );
    } catch (error) {
      console.error("Unsubscribe error:", error);
      return res.status(500).send(
        renderHtmlPage(
          "Unsubscribe Failed",
          ERROR_COLOR,
          "Unsubscribe Failed",
          "<p>An error occurred while processing your request. Please try again later or contact support.</p>"
        )
      );
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withRateLimit(handler, {
  maxRequests: 5,
  windowMs: 10 * 60 * 1000, // 10 minutes
  message: "Too many unsubscribe attempts, please try again later",
});
