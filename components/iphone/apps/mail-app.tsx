"use client";

import { useRef, useState } from "react";
import { SITE } from "@/lib/config/site";
import { IPHONE_COPY, MAIL_ALERTS } from "@/lib/state/iphone-copy";
import { cn } from "@/lib/utils";
import type { AppProps } from "../apps";
import { ArrowUp, Compose } from "../glyphs";
import styles from "../iphone.module.css";
import { IosAlert } from "./alert";

/** Loose on purpose: the endpoint does the real check. */
const EMAIL = /^\S+@\S+\.\S+$/;
/** The endpoint's own minimums, so a message that passes here is accepted. */
const MIN_NAME = 2;
const MIN_MESSAGE = 10;

type Field = "name" | "email" | "subject" | "body";
type Phase = "composing" | "sending" | "sent";

interface Alert {
  title: string;
  message: string;
  focus?: Field;
}

interface SentMessage {
  id: number;
  subject: string;
  body: string;
}

/**
 * Apple Mail's compose flow, wired to the same `/api/contact` endpoint as the
 * contact form (CSRF check, rate limit, sanitising), so this really writes to
 * me.
 *
 * As in Mail, Send is always live: tapping it with something missing raises
 * an alert that says what, then puts the cursor there. Sending slides the
 * sheet down into the Sent mailbox, where the toolbar reports progress and
 * the message lands in the list. If it fails, the sheet comes back up with
 * the draft intact.
 */
export default function MailApp({ close }: AppProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [phase, setPhase] = useState<Phase>("composing");
  const [alert, setAlert] = useState<Alert | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [sent, setSent] = useState<SentMessage[]>([]);

  const fields = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    subject: useRef<HTMLInputElement>(null),
    body: useRef<HTMLTextAreaElement>(null),
  };
  const focus = (field: Field) =>
    fields[field].current?.focus({ preventScroll: true });

  const emailInvalid =
    emailTouched && email.trim() !== "" && !EMAIL.test(email.trim());
  const topic = subject.trim()
    ? `${subject.trim()}\n\n${body.trim()}`
    : body.trim();

  /** The first thing stopping the send, in the order of the form. */
  const problem = (): Alert | null => {
    if (name.trim().length < MIN_NAME) {
      return { ...MAIL_ALERTS.noName, focus: "name" };
    }
    if (!email.trim()) {
      return { ...MAIL_ALERTS.noEmail, focus: "email" };
    }
    if (!EMAIL.test(email.trim())) {
      return {
        title: MAIL_ALERTS.badEmail.title,
        message: MAIL_ALERTS.badEmail.message(email.trim()),
        focus: "email",
      };
    }
    if (topic.length < MIN_MESSAGE) {
      return { ...MAIL_ALERTS.shortMessage, focus: "body" };
    }
    return null;
  };

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (phase !== "composing") {
      return;
    }
    const blocker = problem();
    if (blocker) {
      setAlert(blocker);
      return;
    }
    (document.activeElement as HTMLElement | null)?.blur();
    setPhase("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), topic }),
      });
      if (res.ok) {
        setSent((list) => [
          { id: Date.now(), subject: subject.trim(), body: body.trim() },
          ...list,
        ]);
        setSubject("");
        setBody("");
        setPhase("sent");
        return;
      }
      const data = await res.json().catch(() => ({}));
      setPhase("composing");
      setAlert({
        title: MAIL_ALERTS.failed.title,
        message: data.details || MAIL_ALERTS.failed.fallback,
      });
    } catch {
      setPhase("composing");
      setAlert({
        title: MAIL_ALERTS.failed.title,
        message: MAIL_ALERTS.failed.offline,
      });
    }
  };

  /** Return in a single-line field moves on, as in Mail. */
  const next = (field: Field) => (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      focus(field);
    }
  };

  const composing = phase === "composing";

  return (
    <div className={styles.mail}>
      {/* The mailbox behind the sheet. It shrinks back while a message is
          being written, the way iOS presents a sheet over its parent. */}
      <div
        className={cn(styles.mailbox, composing && styles.mailboxBehind)}
        inert={composing}
      >
        <div className={styles.scroll}>
          <div style={{ height: "calc(var(--top-inset) + 44px)" }} />
          <h1 className={styles.largeTitle}>Sent</h1>
          {sent.length === 0 && phase !== "sending" ? (
            <p className={styles.empty}>No Mail</p>
          ) : (
            <ul className={styles.mailList}>
              {phase === "sending" ? (
                <MailRow
                  subject={subject.trim()}
                  body={body.trim()}
                  time="Sending"
                  pending
                />
              ) : null}
              {sent.map((message) => (
                <MailRow
                  key={message.id}
                  subject={message.subject}
                  body={message.body}
                  time="Now"
                />
              ))}
            </ul>
          )}
          {phase === "sent" ? (
            <p className={styles.groupFooter} style={{ paddingLeft: 16 }}>
              {IPHONE_COPY.mailReplyNote}
            </p>
          ) : null}
        </div>

        <div className={styles.toolbar}>
          <span className={styles.mailStatus} role="status">
            {phase === "sending" ? (
              <>
                Sending…
                <span className={styles.sendProgress} />
              </>
            ) : null}
            {phase === "sent" ? "Sent Just Now" : null}
          </span>
          <button
            type="button"
            className={cn(styles.toolbarTrailing, styles.toolbarButton)}
            onClick={() => {
              setPhase("composing");
              requestAnimationFrame(() => focus("subject"));
            }}
            aria-label="New Message"
            disabled={phase === "sending"}
          >
            <Compose />
          </button>
        </div>
      </div>

      <form
        className={cn(styles.sheet, !composing && styles.sheetAway)}
        onSubmit={send}
        noValidate
        inert={!composing}
      >
        <div className={styles.sheetHead}>
          <button type="button" className={styles.textButton} onClick={close}>
            Cancel
          </button>
          <h1 className={styles.sheetTitle}>
            {subject.trim() || "New Message"}
          </h1>
          <button type="submit" className={styles.sendButton} aria-label="Send">
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
            ref={fields.name}
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={next("email")}
            autoComplete="name"
            autoCapitalize="words"
            enterKeyHint="next"
            required
          />
        </label>
        <label className={styles.field}>
          <span>From:</span>
          <input
            ref={fields.email}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setEmailTouched(true)}
            onKeyDown={next("subject")}
            className={cn(emailInvalid && styles.fieldInvalid)}
            aria-invalid={emailInvalid}
            autoComplete="email"
            inputMode="email"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="next"
            required
          />
        </label>
        <label className={styles.field}>
          <span>Subject:</span>
          <input
            ref={fields.subject}
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            onKeyDown={next("body")}
            autoCapitalize="sentences"
            enterKeyHint="next"
          />
        </label>
        <label className="contents">
          <span className="sr-only">Message</span>
          <textarea
            ref={fields.body}
            className={styles.body}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={IPHONE_COPY.mailBodyPlaceholder}
            autoCapitalize="sentences"
            required
          />
        </label>
      </form>

      {alert ? (
        <IosAlert
          title={alert.title}
          message={alert.message}
          onDismiss={() => {
            const target = alert.focus;
            setAlert(null);
            if (target) {
              requestAnimationFrame(() => focus(target));
            }
          }}
        />
      ) : null}
    </div>
  );
}

function MailRow({
  subject,
  body,
  time,
  pending,
}: {
  subject: string;
  body: string;
  time: string;
  pending?: boolean;
}) {
  return (
    <li className={cn(styles.mailRow, pending && styles.mailRowPending)}>
      <div className={styles.mailRowHead}>
        <span className={styles.mailRowFrom}>{SITE.name}</span>
        <span className={styles.mailRowTime}>{time}</span>
      </div>
      <div
        className={cn(styles.mailRowSubject, !subject && styles.mailRowMuted)}
      >
        {subject || "No Subject"}
      </div>
      <div className={styles.mailRowPreview}>{body}</div>
    </li>
  );
}
