import { NextRequest, NextResponse } from "next/server";
import resend from "@/lib/resend";
import { checkRateLimit, checkCsrf } from "@/lib/route-helpers";
import { generateUnsubscribeUrl } from "@/lib/unsubscribe-token";
import { isValidEmail, sanitizeEmail } from "@/lib/email-validation";
import { escapeHtml, escapeHtmlAttribute } from "@/lib/html-utils";

export async function POST(req: NextRequest) {
  const rateLimited = checkRateLimit(req, {
    maxRequests: 3,
    windowMs: 10 * 60 * 1000,
    message: "Too many subscription attempts, please try again later",
  });
  if (rateLimited) return rateLimited;

  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  const body = await req.json();
  const { email } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      {
        error: "Email is required",
        details: "Please enter your email address",
      },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      {
        error: "Invalid email format",
        details: "Please enter a valid email address",
      },
      { status: 400 },
    );
  }

  const sanitizedEmail = sanitizeEmail(email);

  try {
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (!audienceId) {
      return NextResponse.json(
        { error: "Newsletter configuration error" },
        { status: 500 },
      );
    }

    const contactRes = await resend.contacts.create({
      email: sanitizedEmail,
      audienceId,
    });

    if (contactRes.error) {
      return NextResponse.json(
        { error: contactRes.error.message },
        { status: 400 },
      );
    }

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
      return NextResponse.json(
        { error: sendMailRes.error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Subscription successful" });
  } catch {
    return NextResponse.json(
      { error: "Subscription failed" },
      { status: 500 },
    );
  }
}
