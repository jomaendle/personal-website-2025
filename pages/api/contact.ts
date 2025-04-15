import resend from "@/lib/resend";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { name, email, topic } = req.body;

    // Basic validation
    if (!name || !email || !topic) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const sendMailRes = await resend.emails.send({
        from: "Contact Form <jo@contact.jomaendle.com>",
        to: "johannes.maendle@outlook.de",
        subject: `New contact form message from ${name}`,
        html: `
<h1>New Contact Form Submission</h1>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Message:</strong> ${topic}</p>
`,
        replyTo: email,
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
