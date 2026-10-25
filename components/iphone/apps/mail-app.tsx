"use client";

import { useState } from "react";
import { SITE } from "@/lib/config/site";
import { IPHONE_COPY } from "@/lib/state/iphone-copy";
import { cn } from "@/lib/utils";
import type { AppProps } from "../apps";
import { ArrowUp } from "../glyphs";
import styles from "../iphone.module.css";

/** Loose on purpose: the endpoint does the real check. */
const EMAIL = /\S+@\S+\.\S+/;

type Status =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "sent" }
  | { state: "error"; message: string };

/**
 * A compose sheet addressed to me. It posts to the same `/api/contact`
 * endpoint as the contact form, with its CSRF check, rate limit and
 * sanitising, so this is a real way to write to me, not a mock-up.
 */
export default function MailApp({ close }: AppProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });

  // The endpoint's own minimums, checked here so Send only lights up for a
  // message that will be accepted.
  const ready =
    name.trim().length >= 2 &&
    EMAIL.test(email) &&
    topic.trim().length >= 10 &&
    status.state !== "sending";

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ready) {
      return;
    }
    setStatus({ state: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, topic }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus({ state: "sent" });
        setTopic("");
      } else {
        setStatus({
          state: "error",
          message: data.details || data.error || "Couldn’t send the message.",
        });
      }
    } catch {
      setStatus({
        state: "error",
        message: "You seem to be offline. Try again in a moment.",
      });
    }
  };

  return (
    <div className={styles.mail}>
      <form className={styles.sheet} onSubmit={send} noValidate>
        <div className={styles.sheetHead}>
          <button type="button" className={styles.textButton} onClick={close}>
            Cancel
          </button>
          <h1 className={styles.sheetTitle}>New Message</h1>
          <button
            type="submit"
            className={styles.sendButton}
            disabled={!ready}
            aria-label="Send"
          >
            <ArrowUp />
          </button>
        </div>

        <div className={styles.field}>
          <span>To:</span>
          <span className={styles.token}>{SITE.name}</span>
        </div>
        <label className={styles.field}>
          <span>Name:</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
            minLength={2}
          />
        </label>
        <label className={styles.field}>
          <span>From:</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            inputMode="email"
            required
          />
        </label>
        <label className="contents">
          <span className="sr-only">Message</span>
          <textarea
            className={styles.body}
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder={IPHONE_COPY.mailSubjectPlaceholder}
            required
            minLength={10}
          />
        </label>

        <p
          className={cn(
            styles.formStatus,
            status.state === "error" && styles.formError,
            status.state === "sent" && styles.formSuccess,
          )}
          role="status"
        >
          {status.state === "sent" && IPHONE_COPY.mailSent}
          {status.state === "error" && status.message}
          {status.state === "sending" && "Sending…"}
        </p>
      </form>
    </div>
  );
}
