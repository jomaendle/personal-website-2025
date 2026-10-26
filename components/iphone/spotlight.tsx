"use client";

import { useDeferredValue, useState } from "react";
import { SITE } from "@/lib/config/site";
import type { IphoneAppId } from "@/lib/state/iphone-copy";
import { cn } from "@/lib/utils";
import { AppIcon, type CalendarFace } from "./app-icons";
import { APPS, type AppLaunch, WEB_CLIPS } from "./apps";
import { useIphoneData } from "./data";
import { Close, Magnifier } from "./glyphs";
import styles from "./iphone.module.css";
import { useKeyboardInset } from "./use-keyboard-inset";

/** Apps offered before anything is typed, like Siri Suggestions. */
const SUGGESTED: IphoneAppId[] = ["notes", "photos", "mail", "safari"];

interface SpotlightProps {
  calendar: CalendarFace | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  /** Open an app out of the result's icon, as Spotlight does. */
  onLaunch: (
    id: IphoneAppId,
    options: { from: HTMLElement; launch?: AppLaunch },
  ) => void;
}

const matches = (haystack: string, query: string) =>
  haystack.toLowerCase().includes(query);

/**
 * Spotlight, from the home screen's Search pill or a swipe down. It searches
 * what the phone holds: apps and bookmarks, the articles in Notes, and the
 * one contact. A result opens its app out of the result's own icon.
 */
export function Spotlight({
  calendar,
  inputRef,
  onClose,
  onLaunch,
}: SpotlightProps) {
  const { notes } = useIphoneData();
  const [query, setQuery] = useState("");
  const q = useDeferredValue(query.trim().toLowerCase());
  const keyboard = useKeyboardInset();

  // Nothing typed is not a match for everything: the empty state shows
  // suggestions instead.
  const apps = q
    ? (Object.keys(APPS) as IphoneAppId[]).filter((id) =>
        matches(APPS[id].name, q),
      )
    : [];
  const clips = q ? WEB_CLIPS.filter((clip) => matches(clip.name, q)) : [];
  const noteHits = q
    ? notes
        .filter((note) => matches(`${note.title} ${note.excerpt}`, q))
        .slice(0, 6)
    : [];
  const contactHit = q
    ? [SITE.name, "Johannes Mändle", "Maendle", SITE.role].some((s) =>
        matches(s, q),
      )
    : false;
  const nothing =
    q && !apps.length && !clips.length && !noteHits.length && !contactHit;

  const launchFrom =
    (id: IphoneAppId, launch?: AppLaunch) =>
    (event: React.MouseEvent<HTMLElement>) => {
      // The icon itself, so the zoom starts from its squircle.
      const icon =
        event.currentTarget.querySelector<HTMLElement>(
          `.${styles.icon}, [data-icon]`,
        ) ?? event.currentTarget;
      onLaunch(id, { from: icon, launch });
    };

  const appTile = (id: IphoneAppId) => (
    <button
      key={id}
      type="button"
      className={styles.cell}
      onClick={launchFrom(id)}
      onPointerDown={() => APPS[id].load()}
    >
      <AppIcon
        art={APPS[id].art}
        calendar={id === "calendar" ? calendar : undefined}
      />
      <span className={styles.cellLabel}>{APPS[id].name}</span>
    </button>
  );

  return (
    <div
      className={styles.spotlight}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      {/* Tapping the blur outside the results dismisses, as on iOS. */}
      <button
        type="button"
        className={styles.spotlightDismiss}
        onClick={onClose}
        aria-label="Close search"
        tabIndex={-1}
      />

      <div
        className={styles.spotlightResults}
        style={keyboard ? { paddingBottom: keyboard + 90 } : undefined}
      >
        {q ? null : (
          <>
            <h2 className={styles.spotlightHeader}>Siri Suggestions</h2>
            <div className={cn(styles.spotlightCard, styles.spotlightApps)}>
              {SUGGESTED.map(appTile)}
            </div>
            <h2 className={styles.spotlightHeader}>Recent Notes</h2>
            <div className={styles.spotlightCard}>
              {notes.slice(0, 3).map((note) => (
                <NoteResult
                  key={note.slug}
                  title={note.title}
                  date={note.date}
                  onClick={launchFrom("notes", { note: note.slug })}
                />
              ))}
            </div>
          </>
        )}

        {apps.length || clips.length ? (
          <>
            <h2 className={styles.spotlightHeader}>Apps</h2>
            <div className={cn(styles.spotlightCard, styles.spotlightApps)}>
              {apps.map(appTile)}
              {clips.map((clip) => (
                <a
                  key={clip.name}
                  href={clip.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cell}
                >
                  <AppIcon art={clip.art} />
                  <span className={styles.cellLabel}>{clip.name}</span>
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              ))}
            </div>
          </>
        ) : null}

        {noteHits.length ? (
          <>
            <h2 className={styles.spotlightHeader}>Notes</h2>
            <div className={styles.spotlightCard}>
              {noteHits.map((note) => (
                <NoteResult
                  key={note.slug}
                  title={note.title}
                  date={note.date}
                  onClick={launchFrom("notes", { note: note.slug })}
                />
              ))}
            </div>
          </>
        ) : null}

        {contactHit ? (
          <>
            <h2 className={styles.spotlightHeader}>Contacts</h2>
            <div className={styles.spotlightCard}>
              <button
                type="button"
                className={styles.spotlightRow}
                onClick={launchFrom("contacts")}
              >
                <span
                  data-icon
                  className={styles.spotlightMonogram}
                  aria-hidden
                >
                  {SITE.name
                    .split(" ")
                    .map((part) => part.charAt(0))
                    .join("")}
                </span>
                <span className={styles.rowMain}>
                  <span className={styles.rowTitle}>{SITE.name}</span>
                  <span className={styles.rowDetail}>{SITE.shortRole}</span>
                </span>
              </button>
            </div>
          </>
        ) : null}

        {nothing ? (
          <p className={styles.spotlightEmpty}>
            No Results for “{query.trim()}”
          </p>
        ) : null}
      </div>

      <div
        className={styles.floatingBar}
        style={keyboard ? { bottom: keyboard + 8 } : undefined}
      >
        <label className={styles.glassField}>
          <Magnifier />
          <span className="sr-only">Search</span>
          <input
            ref={inputRef}
            type="search"
            placeholder="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            enterKeyHint="search"
          />
        </label>
        <button
          type="button"
          className={cn(styles.glassButton, styles.glassButtonLarge)}
          onClick={onClose}
          aria-label="Close search"
        >
          <Close />
        </button>
      </div>
    </div>
  );
}

function NoteResult({
  title,
  date,
  onClick,
}: {
  title: string;
  date: string;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}) {
  return (
    <button
      type="button"
      className={styles.spotlightRow}
      onClick={onClick}
      onPointerDown={() => APPS.notes.load()}
    >
      <AppIcon art="notes" className={styles.spotlightRowIcon} />
      <span className={styles.rowMain}>
        <span className={styles.rowTitle}>{title}</span>
        <span className={styles.rowDetail}>Notes · {date}</span>
      </span>
    </button>
  );
}
