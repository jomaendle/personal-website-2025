import resend from "@/lib/resend";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    const { email } = req.query;
    try {
      await resend.contacts.update({
        email: email as string,
        audienceId: "fc715dff-d469-4c22-ba40-87a4b427ec0f",
        unsubscribed: true,
      });

      res.status(200).json({ message: "Unsubscription successful" });
    } catch (error) {
      res.status(500).json({ error: "Unsubscription failed" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
