"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<null | "success" | "error">(
    null,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, topic }),
      });

      if (res.ok) {
        setSubmitStatus("success");
        setName("");
        setEmail("");
        setTopic("");
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.log("Error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="my-8 rounded-lg border border-neutral-800 bg-neutral-950 px-6 pb-6">
      <h2 className="my-4 text-xl font-semibold text-white">Get in touch</h2>

      {submitStatus === "success" ? (
        <div className="rounded-md bg-green-900/20 p-4 text-sm text-green-400">
          Thank you! Your message has been sent.
        </div>
      ) : submitStatus === "error" ? (
        <div className="rounded-md bg-red-900/20 p-4 text-sm text-red-400">
          Something went wrong. Please try again later.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm text-white/80">
              Name
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              placeholder="Your Name"
              onChange={(e) => setName(e.target.value)}
              className="bg-neutral-900"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-white/80">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-neutral-900"
              required
            />
          </div>

          <div>
            <label htmlFor="topic" className="mb-2 block text-sm text-white/80">
              Message
            </label>
            <Textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={4}
              placeholder="I'm interested in a new software product and would like to know more about your services."
              className="w-full bg-neutral-900"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
