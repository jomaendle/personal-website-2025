import resend from "@/lib/resend";
import { NextApiRequest, NextApiResponse } from "next";
import { withRateLimit } from "@/lib/rate-limit";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { email } = req.body;

    // Enhanced validation
    if (!email) {
      return res.status(400).json({ 
        error: "Email is required",
        details: "Please enter your email address"
      });
    }

    if (typeof email !== 'string') {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ 
        error: "Invalid email format",
        details: "Please enter a valid email address"
      });
    }

    try {
      const audienceId = process.env.RESEND_AUDIENCE_ID;
      if (!audienceId) {
        return res.status(500).json({ error: "Newsletter configuration error" });
      }

      const contactRes = await resend.contacts.create({
        email: sanitizedEmail,
        audienceId,
      });

      if (contactRes.error) {
        return res.status(400).json({ error: contactRes.error.message });
      }

      // send a welcome email
      const sendMailRes = await resend.emails.send({
        from: "Jo <jo@contact.jomaendle.com>",
        to: sanitizedEmail,
        subject: "Welcome to the newsletter!",
        html: `
<h1> Hi there! </h1>
<p>Thanks for subscribing to my newsletter.</p>

<p>
If you want to unsubscribe, you can do so by clicking <a href="https://jomaendle.com/api/unsubscribe?email=${sanitizedEmail}">here</a>.
</p>

<small>
You are receiving this email because you subscribed to the newsletter. If you didn't subscribe, please ignore this email.
</small>

<p>
Jo Mändle
</p>
`,
      });

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

export default withRateLimit(handler, {
  maxRequests: 3,
  windowMs: 10 * 60 * 1000, // 10 minutes
  message: "Too many subscription attempts, please try again later"
});
