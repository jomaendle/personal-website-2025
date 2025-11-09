import resend from "@/lib/resend";
import { NextApiRequest, NextApiResponse } from "next";
import { withRateLimit } from "@/lib/rate-limit";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { email } = req.query;

    // Validation
    if (!email || typeof email !== "string") {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invalid Request</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                max-width: 600px;
                margin: 80px auto;
                padding: 0 20px;
                text-align: center;
              }
              h1 { color: #ff6b6b; margin-bottom: 16px; }
              p { color: #666; line-height: 1.6; margin-bottom: 24px; }
              a { color: #2997ff; text-decoration: none; }
              a:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <h1>Invalid Request</h1>
            <p>No email address was provided. Please use the unsubscribe link from your email.</p>
            <p><a href="https://jomaendle.com">Return to homepage</a></p>
          </body>
        </html>
      `);
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invalid Email</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                max-width: 600px;
                margin: 80px auto;
                padding: 0 20px;
                text-align: center;
              }
              h1 { color: #ff6b6b; margin-bottom: 16px; }
              p { color: #666; line-height: 1.6; margin-bottom: 24px; }
              a { color: #2997ff; text-decoration: none; }
              a:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <h1>Invalid Email Address</h1>
            <p>The email address provided is not valid.</p>
            <p><a href="https://jomaendle.com">Return to homepage</a></p>
          </body>
        </html>
      `);
    }

    try {
      const audienceId = process.env.RESEND_AUDIENCE_ID;
      if (!audienceId) {
        return res.status(500).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Configuration Error</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                  max-width: 600px;
                  margin: 80px auto;
                  padding: 0 20px;
                  text-align: center;
                }
                h1 { color: #ff6b6b; margin-bottom: 16px; }
                p { color: #666; line-height: 1.6; margin-bottom: 24px; }
                a { color: #2997ff; text-decoration: none; }
                a:hover { text-decoration: underline; }
              </style>
            </head>
            <body>
              <h1>Configuration Error</h1>
              <p>Newsletter system is not properly configured. Please contact support.</p>
              <p><a href="https://jomaendle.com">Return to homepage</a></p>
            </body>
          </html>
        `);
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
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Successfully Unsubscribed</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                max-width: 600px;
                margin: 80px auto;
                padding: 0 20px;
                text-align: center;
              }
              h1 { color: #57ab5a; margin-bottom: 16px; }
              p { color: #666; line-height: 1.6; margin-bottom: 24px; }
              a {
                color: #2997ff;
                text-decoration: none;
                display: inline-block;
                margin-top: 16px;
              }
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
            <h1>Successfully Unsubscribed</h1>
            <p>You have been unsubscribed from Jo's newsletter.</p>
            <p class="email">${sanitizedEmail}</p>
            <p>You will no longer receive email updates. We're sorry to see you go!</p>
            <p>
              <a href="https://jomaendle.com">Return to homepage</a>
            </p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Unsubscribe error:", error);
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Unsubscribe Failed</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                max-width: 600px;
                margin: 80px auto;
                padding: 0 20px;
                text-align: center;
              }
              h1 { color: #ff6b6b; margin-bottom: 16px; }
              p { color: #666; line-height: 1.6; margin-bottom: 24px; }
              a { color: #2997ff; text-decoration: none; }
              a:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <h1>Unsubscribe Failed</h1>
            <p>An error occurred while processing your request. Please try again later or contact support.</p>
            <p><a href="https://jomaendle.com">Return to homepage</a></p>
          </body>
        </html>
      `);
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
