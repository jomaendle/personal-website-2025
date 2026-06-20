import { NextRequest, NextResponse } from "next/server";
import resend from "@/lib/resend";
import { checkRateLimit, checkCsrf } from "@/lib/route-helpers";
import { isValidEmail } from "@/lib/email-validation";
import { escapeHtml } from "@/lib/html-utils";

function sanitizeInput(input: string): string {
  return input.trim().slice(0, 1000);
}

export async function POST(req: NextRequest) {
  const rateLimited = checkRateLimit(req, {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
    message: "Too many contact form submissions, please try again later",
  });
  if (rateLimited) return rateLimited;

  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  const body = await req.json();
  const { name, email, topic } = body;

  if (!name || !email || !topic) {
    return NextResponse.json(
      {
        error: "All fields are required",
        details: "Please fill in your name, email, and message",
      },
      { status: 400 },
    );
  }

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof topic !== "string"
  ) {
    return NextResponse.json(
      { error: "Invalid field types" },
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

  const sanitizedName = sanitizeInput(name);
  const sanitizedEmail = sanitizeInput(email);
  const sanitizedTopic = sanitizeInput(topic);

  if (sanitizedName.length < 2) {
    return NextResponse.json(
      {
        error: "Name too short",
        details: "Please enter at least 2 characters for your name",
      },
      { status: 400 },
    );
  }

  if (sanitizedTopic.length < 10) {
    return NextResponse.json(
      {
        error: "Message too short",
        details: "Please enter at least 10 characters for your message",
      },
      { status: 400 },
    );
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
      return NextResponse.json(
        { error: sendMailRes.error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Message sent successfully" });
  } catch {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
