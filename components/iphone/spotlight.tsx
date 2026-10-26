"use client";

import { type MotionValue, m } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/config/site";
import type { NoteSummary } from "@/lib/iphone-notes";
import {
  ALBUMS,
  CAR_KIDS,
  SINGLES,
  TRACKS,
  type Track,
  tracksOf,
} from "@/lib/state/car-kids";
import type { IphoneAppId } from "@/lib/state/iphone-copy";
import { cn } from "@/lib/utils";
import { AppIcon, type CalendarFace } from "./app-icons";
import { APPS, type AppLaunch, WEB_CLIPS } from "./apps";
import { useIphoneData } from "./data";
import { Close, Magnifier } from "./glyphs";
import styles from "./iphone.module.css";
import { useMusicControls } from "./music/player";
import { useKeyboardInset } from "./use-keyboard-inset";

/** A song's release, to queue the rest of it after the song. */
const releaseOf = (track: Track): Track[] => {
  const album = ALBUMS.find((a) => a.id === track.album);
  return album ? tracksOf(album) : SINGLES;
};

/** Apps offered before anything is typed, like Siri Suggestions. */
const SUGGESTED: IphoneAppId[] = ["notes", "photos", "mail", "safari"];

interface SpotlightProps {
  /** Fading out: drawn, but inert. */
  leaving: boolean;
  /** Being pulled in by a swipe still under the finger: drawn, not yet
   * taking input. */
  pulling: boolean;
  /** For a Spotlight brought in by a pull: its opacity, following the
   * finger, in place of the CSS entrance. */
  pull?: MotionValue<number>;
  /** The fade-out finished. */
  onLeft: () => void;
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

/** Everything on the phone that matches `q`. Nothing typed is not a match
 * for everything: the empty state shows suggestions instead. */
function search(q: string, notes: NoteSummary[]) {
  if (!q) {
    return {
      apps: [],
      clips: [],
      noteHits: [],
      songHits: [],
      contactHit: false,
      nothing: false,
    };
  }
  const apps = (Object.keys(APPS) as IphoneAppId[]).filter((id) =>
    matches(APPS[id].name, q),
  );
  const clips = WEB_CLIPS.filter((clip) => matches(clip.name, q));
  const noteHits = notes
    .filter((note) => matches(`${note.title} ${note.excerpt}`, q))
    .slice(0, 6);
  const songHits = TRACKS.filter((track) => matches(track.title, q)).slice(
    0,
    5,
  );
  const contactHit = [SITE.name, "Johannes Mändle", "Maendle", SITE.role].some(
    (s) => matches(s, q),
  );
  const nothing = !(
    apps.length ||
    clips.length ||
    noteHits.length ||
    songHits.length ||
    contactHit
  );
  return { apps, clips, noteHits, songHits, contactHit, nothing };
}

/**
 * Spotlight, from the home screen's Search pill or a swipe down. It searches
 * what the phone holds: apps and bookmarks, the articles in Notes, and the
 * one contact. A result opens its app out of the result's own icon.
 */
export function Spotlight({
  leaving,
  pulling,
  pull,
  onLeft,
  calendar,
  inputRef,
  onClose,
  onLaunch,
}: SpotlightProps) {
  const { notes } = useIphoneData();
  const [query, setQuery] = useState("");
  // Not deferred: the search is small, and Return must act on what's typed.
  const q = query.trim().toLowerCase();
  const keyboard = useKeyboardInset();
  const controls = useMusicControls();
  const rootRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Opened by a swipe, nothing has focus (the home screen went inert under
  // it): take it on the dialog itself, without raising the keyboard, once
  // the pull has let go.
  useEffect(() => {
    const root = rootRef.current;
    if (root && !pulling && !root.contains(document.activeElement)) {
      root.focus({ preventScroll: true });
    }
  }, [pulling]);

  const { apps, clips, noteHits, songHits, contactHit, nothing } = search(
    q,
    notes,
  );

  // The frosting goes on once Spotlight is at rest: blurring the backdrop
  // under a changing opacity redraws the whole blur every frame. In motion
  // it's a darker tint instead, which reads the same at a glance.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!pull || pulling) {
      return;
    }
    const settle = (v: number) => {
      if (v >= 0.999) {
        setSettled(true);
      }
    };
    settle(pull.get());
    return pull.on("change", settle);
  }, [pull, pulling]);

  const onAnimationEnd = (event: React.AnimationEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }
    if (leaving) {
      onLeft();
    } else {
      setSettled(true);
    }
  };

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
    <m.div
      ref={rootRef}
      tabIndex={-1}
      className={cn(
        styles.spotlight,
        pull && styles.spotlightPulled,
        leaving && styles.spotlightLeaving,
        settled && !leaving && !pulling && styles.spotlightSettled,
      )}
      style={pull ? { opacity: pull } : undefined}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      inert={leaving || pulling}
      aria-hidden={leaving || pulling || undefined}
      onAnimationEnd={onAnimationEnd}
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
        ref={resultsRef}
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

        {songHits.length ? (
          <>
            <h2 className={styles.spotlightHeader}>Songs</h2>
            <div className={styles.spotlightCard}>
              {songHits.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  className={styles.spotlightRow}
                  onPointerDown={() => APPS.music.load()}
                  onClick={(event) => {
                    // Play inside the tap (browsers only start audio in a
                    // gesture), queued with the rest of its release.
                    const queue = releaseOf(track);
                    controls.play(queue, queue.indexOf(track));
                    launchFrom("music", { nowPlaying: true })(event);
                  }}
                >
                  <span data-icon className={styles.spotlightSongCover}>
                    <Image src={track.cover} alt="" fill sizes="72px" />
                  </span>
                  <span className={styles.rowMain}>
                    <span className={styles.rowTitle}>{track.title}</span>
                    <span className={styles.rowDetail}>
                      Song · {CAR_KIDS.name}
                    </span>
                  </span>
                </button>
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
            onKeyDown={(event) => {
              // Return opens the top hit, as in Spotlight.
              if (event.key === "Enter" && q) {
                event.preventDefault();
                resultsRef.current
                  ?.querySelector<HTMLElement>("button, a[href]")
                  ?.click();
              }
            }}
            autoComplete="off"
            enterKeyHint="go"
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
    </m.div>
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
