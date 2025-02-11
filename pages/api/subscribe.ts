import resend from "@/lib/resend";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { email } = req.body;
    try {
      const contactRes = await resend.contacts.create({
        email,
        audienceId: "fc715dff-d469-4c22-ba40-87a4b427ec0f",
      });

      if (contactRes.error) {
        return res.status(400).json({ error: contactRes.error.message });
      }

      // send a welcome email
      const sendMailRes = await resend.emails.send({
        from: "Jo <jo@contact.jomaendle.com>",
        to: email,
        subject: "Welcome to the newsletter!",
        html: `
<h1> Hi there! </h1>
<p>Thanks for subscribing to my newsletter.</p>

<p>
If you want to unsubscribe, you can do so by clicking <a href="https://jomaendle.com/api/unsubscribe?email=${email}">here</a>.
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
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Subscription failed" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
