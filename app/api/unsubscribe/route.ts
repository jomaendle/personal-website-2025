import { NextRequest } from "next/server";
import resend from "@/lib/resend";
import { checkRateLimit } from "@/lib/route-helpers";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";
import { isValidEmail, sanitizeEmail } from "@/lib/email-validation";
import { escapeHtml } from "@/lib/html-utils";

function renderHtmlPage(
  title: string,
  headingColor: string,
  heading: string,
  content: string,
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

function htmlResponse(html: string, status: number) {
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

const ERROR_COLOR = "#ff6b6b";
const SUCCESS_COLOR = "#57ab5a";

export async function GET(req: NextRequest) {
  const rateLimited = checkRateLimit(req, {
    maxRequests: 5,
    windowMs: 10 * 60 * 1000,
    message: "Too many unsubscribe attempts, please try again later",
  });
  if (rateLimited) return rateLimited;

  const token = req.nextUrl.searchParams.get("token");
  const email = req.nextUrl.searchParams.get("email");

  let sanitizedEmail: string;

  if (token) {
    const result = verifyUnsubscribeToken(token);
    if (!result.valid || !result.email) {
      return htmlResponse(
        renderHtmlPage(
          "Invalid or Expired Link",
          ERROR_COLOR,
          "Invalid or Expired Link",
          `<p>${escapeHtml(result.error || "This unsubscribe link is invalid or has expired.")}</p>
           <p>Please use a recent unsubscribe link from your email, or contact support.</p>`,
        ),
        400,
      );
    }
    sanitizedEmail = result.email;
  } else if (email) {
    if (!isValidEmail(email)) {
      return htmlResponse(
        renderHtmlPage(
          "Invalid Email",
          ERROR_COLOR,
          "Invalid Email Address",
          "<p>The email address provided is not valid.</p>",
        ),
        400,
      );
    }
    sanitizedEmail = sanitizeEmail(email);
  } else {
    return htmlResponse(
      renderHtmlPage(
        "Invalid Request",
        ERROR_COLOR,
        "Invalid Request",
        "<p>No valid unsubscribe link was provided. Please use the unsubscribe link from your email.</p>",
      ),
      400,
    );
  }

  try {
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (!audienceId) {
      return htmlResponse(
        renderHtmlPage(
          "Configuration Error",
          ERROR_COLOR,
          "Configuration Error",
          "<p>Newsletter system is not properly configured. Please contact support.</p>",
        ),
        500,
      );
    }

    const updateRes = await resend.contacts.update({
      email: sanitizedEmail,
      audienceId,
      unsubscribed: true,
    });

    if (updateRes.error) {
      console.error("Unsubscribe error:", updateRes.error.message);
      if (!updateRes.error.message.includes("not found")) {
        throw new Error(updateRes.error.message);
      }
    }

    return htmlResponse(
      renderHtmlPage(
        "Successfully Unsubscribed",
        SUCCESS_COLOR,
        "Successfully Unsubscribed",
        `<p>You have been unsubscribed from Jo's newsletter.</p>
         <p class="email">${escapeHtml(sanitizedEmail)}</p>
         <p>You will no longer receive email updates. We're sorry to see you go!</p>`,
      ),
      200,
    );
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return htmlResponse(
      renderHtmlPage(
        "Unsubscribe Failed",
        ERROR_COLOR,
        "Unsubscribe Failed",
        "<p>An error occurred while processing your request. Please try again later or contact support.</p>",
      ),
      500,
    );
  }
}
