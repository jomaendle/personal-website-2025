"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { SITE } from "@/lib/config/site";
import { IPHONE_COPY, MAIL_ALERTS } from "@/lib/state/iphone-copy";
import { clockText } from "@/lib/state/now-format";
import { cn } from "@/lib/utils";
import type { AppProps } from "../apps";
import { showBanner } from "../banner";
import { ArrowUp, Close, Compose } from "../glyphs";
import styles from "../iphone.module.css";
import { store } from "../persist";
import { useKeyboardInset } from "../use-keyboard-inset";
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

/** The first thing stopping the send, in the order of the form. */
function findProblem(name: string, email: string, topic: string): Alert | null {
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
const DRAFT_KEY = "iphone:mail";
const SENT_KEY = "iphone:mail-sent";

const readDraft = () => {
  const empty = { name: "", email: "", subject: "", body: "" };
  try {
    return { ...empty, ...JSON.parse(store.get(DRAFT_KEY) ?? "{}") };
  } catch {
    return empty;
  }
};

/** The Sent mailbox, kept for the visit like the draft. */
const readSent = (): SentMessage[] => {
  try {
    const list = JSON.parse(store.get(SENT_KEY) ?? "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

type Outcome = { ok: true } | { ok: false; message: string };

/** The message on its way, if one is. Module state, not the component's:
 * Mail can be closed (and opened again) while it sends, and the send
 * carries on and finishes either way. */
let inFlight: (SentMessage & { done: Promise<Outcome> }) | null = null;
/** How many Mail windows are open, to know whether anyone saw the result. */
let openWindows = 0;

async function post(payload: {
  name: string;
  email: string;
  topic: string;
}): Promise<Outcome> {
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return { ok: true };
    }
    const data = await res.json().catch(() => ({}));
    return {
      ok: false,
      message:
        res.status === 429
          ? MAIL_ALERTS.failed.rateLimited
          : data.details || MAIL_ALERTS.failed.fallback,
    };
  } catch {
    return { ok: false, message: MAIL_ALERTS.failed.offline };
  }
}

/**
 * Send, and record the result where it outlives the window: a sent message
 * goes into Sent and out of the draft; a failed one stays the draft. With
 * Mail closed by the time it's done, a banner says how it went.
 */
function deliver(
  message: SentMessage,
  payload: { name: string; email: string; topic: string },
) {
  const done = post(payload).then((outcome) => {
    inFlight = null;
    if (outcome.ok) {
      store.set(
        DRAFT_KEY,
        JSON.stringify({
          name: payload.name,
          email: payload.email,
          subject: "",
          body: "",
        }),
      );
      store.set(SENT_KEY, JSON.stringify([message, ...readSent()]));
    }
    if (openWindows === 0) {
      showBanner(
        outcome.ok
          ? {
              app: "mail",
              title: "Message Sent",
              body: message.subject || message.body,
            }
          : {
              app: "mail",
              title: MAIL_ALERTS.failed.title,
              body: "Your message is still in Mail. Tap to try again.",
            },
      );
    }
    return outcome;
  });
  inFlight = { ...message, done };
  return done;
}

export default function MailApp({ close }: AppProps) {
  // The draft outlives the app, as Mail keeps an unsent message: closed
  // mid-way (or by accident), it's all still here when Mail opens again.
  const [draft] = useState(readDraft);
  const [name, setName] = useState(draft.name);
  const [email, setEmail] = useState(draft.email);
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState(draft.body);
  /** The message being sent: its row keeps this id when it lands in Sent,
   * so it is one row that finishes sending, not one swapped for another. */
  // Opened again while a message is still sending: it's still sending.
  const [outgoingId, setOutgoingId] = useState(() => inFlight?.id ?? 0);
  const [phase, setPhase] = useState<Phase>(() =>
    inFlight ? "sending" : "composing",
  );
  const [alert, setAlert] = useState<Alert | null>(null);
  /** The alert just dismissed, fading out. */
  const [fading, setFading] = useState<Alert | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [sent, setSent] = useState<SentMessage[]>(readSent);
  const mounted = useRef(false);

  useEffect(() => {
    store.set(DRAFT_KEY, JSON.stringify({ name, email, subject, body }));
  }, [name, email, subject, body]);

  /** A send finished: show it here, if this window is still open. */
  const settle = (outcome: Outcome) => {
    if (!mounted.current) {
      return;
    }
    if (outcome.ok) {
      setSent(readSent());
      setSubject("");
      setBody("");
      setPhase("sent");
    } else {
      setPhase("composing");
      setAlert({ title: MAIL_ALERTS.failed.title, message: outcome.message });
    }
  };
  const onSettled = useEffectEvent(settle);

  useEffect(() => {
    mounted.current = true;
    openWindows += 1;
    // Picks up a send started by a window closed since.
    inFlight?.done.then(onSettled);
    return () => {
      mounted.current = false;
      openWindows -= 1;
    };
  }, []);

  const sendRef = useRef<HTMLButtonElement>(null);
  const keyboard = useKeyboardInset();
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

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (phase !== "composing") {
      return;
    }
    const blocker = findProblem(name, email, topic);
    if (blocker) {
      setAlert(blocker);
      return;
    }
    (document.activeElement as HTMLElement | null)?.blur();
    const id = Date.now();
    setOutgoingId(id);
    setPhase("sending");
    settle(
      await deliver(
        { id, subject: subject.trim(), body: body.trim() },
        { name: name.trim(), email: email.trim(), topic },
      ),
    );
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
      <SentMailbox
        phase={phase}
        sent={sent}
        outgoing={{
          id: outgoingId,
          subject: subject.trim(),
          body: body.trim(),
        }}
        onCompose={() => {
          // Focus inside the tap, or iOS won't raise the keyboard; flush
          // first so the sheet is no longer inert.
          flushSync(() => setPhase("composing"));
          focus("subject");
        }}
      />

      <form
        className={cn(styles.sheet, !composing && styles.sheetAway)}
        style={keyboard ? { bottom: keyboard } : undefined}
        onSubmit={send}
        noValidate
        // Behind an alert the sheet is inert too, so focus stays in the alert.
        inert={!composing || alert !== null}
      >
        <div className={styles.sheetHead}>
          <button
            type="button"
            className={styles.glassButton}
            onClick={close}
            aria-label="Cancel"
          >
            <Close />
          </button>
          <h1 className={styles.sheetTitle}>
            {subject.trim() || "New Message"}
          </h1>
          <button
            ref={sendRef}
            type="submit"
            className={styles.sendButton}
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
            // Synchronously, inside the tap on OK, so iOS raises the keyboard
            // for the field; flushed so the sheet has stopped being inert.
            flushSync(() => {
              setAlert(null);
              setFading(alert);
            });
            if (target) {
              focus(target);
            } else {
              sendRef.current?.focus({ preventScroll: true });
            }
          }}
        />
      ) : null}
      {/* What was just dismissed fades out over the form: the real alert is
          already gone, so the tap could put the cursor in a field. */}
      {fading && !alert ? (
        <IosAlert
          leaving
          title={fading.title}
          message={fading.message}
          onDismiss={() => setFading(null)}
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

/** Mail's Sent mailbox: the outgoing message while it sends, everything
 * sent this visit, and the toolbar's progress and compose button. */
function SentMailbox({
  phase,
  sent,
  outgoing,
  onCompose,
}: {
  phase: Phase;
  sent: SentMessage[];
  outgoing: SentMessage;
  onCompose: () => void;
}) {
  return (
    <div
      className={cn(
        styles.mailbox,
        phase === "composing" && styles.mailboxBehind,
      )}
      inert={phase === "composing"}
    >
      <div className={styles.scroll}>
        <div style={{ height: "calc(var(--top-inset) + 44px)" }} />
        <h1 className={styles.largeTitle}>Sent</h1>
        {sent.length === 0 && phase !== "sending" ? (
          <p className={styles.empty}>No Mail</p>
        ) : (
          <ul className={styles.mailList}>
            {/* One list, so the sending row and the sent one it becomes are
                the same element (same key), fading up rather than swapped. */}
            {[
              ...(phase === "sending" ? [{ ...outgoing, pending: true }] : []),
              ...sent.map((message) => ({ ...message, pending: false })),
            ].map((message) => (
              <MailRow
                key={message.id}
                subject={message.subject}
                body={message.body}
                // The time it went, as Mail lists today's messages.
                time={
                  message.pending ? "Sending" : clockText(new Date(message.id))
                }
                pending={message.pending}
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

      <div className={styles.floatingBar}>
        <span
          className={cn(styles.glassField, styles.mailStatusPill)}
          role="status"
        >
          {phase === "sending" ? (
            <>
              Sending…
              <span className={styles.sendProgress} />
            </>
          ) : null}
          {phase === "sent" ? "Sent Just Now" : null}
          {phase === "composing" ? "Updated Just Now" : null}
        </span>
        <button
          type="button"
          className={cn(
            styles.glassButton,
            styles.glassButtonLarge,
            styles.tinted,
          )}
          onClick={onCompose}
          aria-label="New Message"
          disabled={phase === "sending"}
        >
          <Compose />
        </button>
      </div>
    </div>
  );
}
