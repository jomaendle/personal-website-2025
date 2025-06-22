import resend from "@/lib/resend";
import { NextApiRequest, NextApiResponse } from "next";

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeInput(input: string): string {
  return input.trim().slice(0, 1000); // Limit length and trim whitespace
}

export default async function handler(
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
<p><strong>Name:</strong> ${sanitizedName}</p>
<p><strong>Email:</strong> ${sanitizedEmail}</p>
<p><strong>Message:</strong> ${sanitizedTopic}</p>
`,
        replyTo: sanitizedEmail,
      });

      if (sendMailRes.error) {
        return res.status(500).json({ error: sendMailRes.error.message });
      }

      res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
