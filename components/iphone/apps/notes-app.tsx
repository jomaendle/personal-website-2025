"use client";

import {
  animate,
  m,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { NoteSummary } from "@/lib/iphone-notes";
import { cn } from "@/lib/utils";
import type { AppProps } from "../apps";
import { useIphoneData } from "../data";
import { Compose, Magnifier } from "../glyphs";
import styles from "../iphone.module.css";
import { FADE, SPRING_PUSH } from "../motion";
import { store } from "../persist";
import { useKeyboardInset } from "../use-keyboard-inset";
import { useLatest } from "../use-latest";
import { NoteView, prefetchNote } from "./note-view";
import { Group, NavBar } from "./ui";

/** The note open in Notes, so a reload or a return from Safari lands back
 * in it, the way Notes reopens the last note. */
const NOTE_KEY = "iphone:note";

const year = (date: string) => new Date(date).getFullYear();

let listDate: Intl.DateTimeFormat | undefined;
/** Notes' list dates: short and numeric, by the reader's locale. */
const shortDate = (date: string) => {
  listDate ??= new Intl.DateTimeFormat(undefined, { dateStyle: "short" });
  return listDate.format(new Date(date));
};

/**
 * Notes, with my articles as the notes in a "Writing" folder. A note opens
 * inside the app with UIKit's push transition (the list slides a third of
 * the way left under a dim while the note slides in over it), and goes back
 * by the back button, Escape, or a swipe to the right from anywhere in the
 * note, which follows the finger.
 */
export default function NotesApp({ launch }: AppProps) {
  const { notes } = useIphoneData();
  const reduced = useReducedMotion() ?? false;
  const [open, setOpen] = useState<string | null>(
    () => launch?.note ?? store.get(NOTE_KEY),
  );
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query.trim().toLowerCase());
  const rows = useRef(new Map<string, HTMLButtonElement>());
  const keyboard = useKeyboardInset();
  const popping = useRef(false);
  /** Going back: the list takes taps again before the slide fully settles. */
  const [leaving, setLeaving] = useState(false);

  /** 0 shows the list, 1 the note. */
  const nav = useMotionValue(open ? 1 : 0);
  const listX = useTransform(nav, (n) => (reduced ? "0%" : `${-30 * n}%`));
  const listDim = useTransform(nav, [0, 1], [0, 0.35]);
  const noteX = useTransform(nav, (n) =>
    reduced ? "0%" : `${(1 - n) * 100}%`,
  );
  const noteOpacity = useTransform(nav, (n) => (reduced ? n : 1));

  useEffect(() => {
    // The first note is the likeliest tap: have it ready.
    const first = notes[0];
    if (first) {
      prefetchNote(first.slug);
    }
  }, [notes]);

  const push = (slug: string) => {
    popping.current = false;
    setLeaving(false);
    store.set(NOTE_KEY, slug);
    setOpen(slug);
    // On the next frame, once the note has mounted: started here, the
    // spring's clock would run through the mount, and the first frame drawn
    // would already be well into the slide.
    requestAnimationFrame(() => {
      if (!popping.current) {
        animate(nav, 1, reduced ? FADE : SPRING_PUSH);
      }
    });
  };

  /** Back to the list, from wherever a swipe left the note. */
  const pop = (velocity = 0) => {
    const slug = open;
    if (!slug || popping.current) {
      return;
    }
    popping.current = true;
    setLeaving(true);
    store.set(NOTE_KEY, null);
    animate(nav, 0, reduced ? FADE : { ...SPRING_PUSH, velocity }).then(() => {
      if (!popping.current) {
        return;
      }
      popping.current = false;
      // Flushed, so the list has stopped being inert before focus returns
      // to the row the note was opened from.
      flushSync(() => {
        setOpen(null);
        setLeaving(false);
      });
      rows.current.get(slug)?.focus({ preventScroll: true });
    });
  };

  /** The latest pop, for the Escape listener below. */
  const popRef = useLatest(() => pop());

  // Escape steps back out of a note first, as the back button does; the next
  // Escape closes the app. A capture listener on the window, so it runs
  // wherever focus is (even on the body after a tap on text) and before the
  // phone's own Escape handler, which skips events already handled.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && store.get(NOTE_KEY)) {
        event.preventDefault();
        event.stopPropagation();
        popRef.current();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  // Opened straight into a note from the widget or a notification: remember
  // it like any other open note, so a reload comes back to it.
  useEffect(() => {
    if (launch?.note) {
      store.set(NOTE_KEY, launch.note);
    }
  }, [launch?.note]);

  const visible = deferred
    ? notes.filter((note) =>
        `${note.title} ${note.excerpt}`.toLowerCase().includes(deferred),
      )
    : notes;
  const years = [...new Set(visible.map((note) => year(note.date)))];
  const summary = notes.find((note) => note.slug === open);

  return (
    <div className={styles.notes}>
      <m.div
        className={styles.navLayer}
        style={{ x: listX }}
        inert={open !== null && !leaving}
      >
        <div className={cn(styles.scroll, styles.scrollWithBar)}>
          <NavBar title="Writing" />
          <p className={styles.subtitle}>
            {visible.length} {visible.length === 1 ? "Note" : "Notes"}
          </p>
          {years.map((y) => (
            <Group key={y} header={String(y)} large>
              {visible
                .filter((note) => year(note.date) === y)
                .map((note) => (
                  <NoteRow
                    key={note.slug}
                    note={note}
                    onOpen={() => push(note.slug)}
                    rowRef={(el) => {
                      if (el) {
                        rows.current.set(note.slug, el);
                      }
                    }}
                  />
                ))}
            </Group>
          ))}
          {visible.length === 0 ? (
            <p className={styles.empty}>No Results for “{query.trim()}”</p>
          ) : null}
        </div>

        {/* iOS 26 moved search to the bottom, in a floating glass field. */}
        <div
          className={styles.floatingBar}
          style={keyboard ? { bottom: keyboard + 8 } : undefined}
        >
          <label className={styles.glassField}>
            <Magnifier />
            <span className="sr-only">Search notes</span>
            <input
              type="search"
              placeholder="Search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                // Escape cancels the search, as on iOS, instead of closing
                // the app (the phone skips an Escape already handled).
                if (event.key === "Escape" && query) {
                  event.preventDefault();
                  setQuery("");
                  event.currentTarget.blur();
                }
              }}
              autoComplete="off"
              enterKeyHint="search"
            />
          </label>
          {/* My notes are the articles: there's nothing for a visitor to
              write, so New Note is drawn dimmed, as iOS shows an action
              that isn't available. */}
          <button
            type="button"
            className={cn(
              styles.glassButton,
              styles.glassButtonLarge,
              styles.tinted,
            )}
            disabled
            aria-label="New Note (not available)"
          >
            <Compose />
          </button>
        </div>
        <m.div
          className={styles.navDim}
          style={{ opacity: listDim }}
          aria-hidden
        />
      </m.div>

      {open ? (
        <m.div
          className={cn(styles.navLayer, styles.navTop)}
          style={{ x: noteX, opacity: noteOpacity }}
        >
          <NoteView
            key={open}
            slug={open}
            title={summary?.title ?? ""}
            date={summary?.date ?? ""}
            nav={nav}
            onBack={pop}
            onOpenNote={push}
          />
        </m.div>
      ) : null}
    </div>
  );
}

function NoteRow({
  note,
  onOpen,
  rowRef,
}: {
  note: NoteSummary;
  onOpen: () => void;
  rowRef: (el: HTMLButtonElement | null) => void;
}) {
  return (
    <button
      ref={rowRef}
      type="button"
      className={styles.row}
      onClick={onOpen}
      onPointerDown={() => prefetchNote(note.slug)}
      onFocus={() => prefetchNote(note.slug)}
    >
      <span className={styles.rowMain}>
        <span className={cn(styles.rowTitle, styles.rowTitleBold)}>
          {note.title}
        </span>
        <span className={styles.rowDetail}>
          <span className={styles.noteRowDate}>{shortDate(note.date)}</span>
          {note.excerpt}
        </span>
      </span>
    </button>
  );
}
