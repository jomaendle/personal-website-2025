import resend from "@/lib/resend";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    const { email } = req.query;

    const audienceId = process.env.RESEND_AUDIENCE_ID;

    if (!audienceId) {
      return res
        .status(500)
        .json({ error: "Server configuration error: Missing audience ID" });
    }

    try {
      await resend.contacts.update({
        email: email as string,
        audienceId,
        unsubscribed: true,
      });

      res.status(200).json({ message: "Unsubscription successful" });
    } catch {
      res.status(500).json({ error: "Unsubscription failed" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
