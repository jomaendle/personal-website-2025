"use client";

import { type MotionValue, m } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SITE, SITE_INITIALS } from "@/lib/config/site";
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
import { PHOTO_LIBRARY } from "@/lib/state/photos";
import { PROJECTS } from "@/lib/state/projects";
import { cn } from "@/lib/utils";
import { AppIcon, type CalendarFace } from "./app-icons";
import { APPS, type AppLaunch, WEB_CLIPS } from "./apps";
import { bindTo } from "./compositor-spring";
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
  /** That pull's spring has landed. */
  pullLanded: boolean;
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

/** Settings pages Spotlight finds, by what someone might type for them. */
const SETTINGS = [
  {
    title: "Wallpaper",
    detail: "Settings",
    terms: ["wallpaper", "background", "lock screen"],
    launch: { settings: "wallpaper" } as AppLaunch,
  },
  {
    title: "iPhone Version",
    detail: "Settings · Back to the website",
    terms: ["iphone", "website", "web version", "normal", "classic", "exit"],
    launch: undefined,
  },
];

/** What finds the one contact: the name, the role, and the ways to reach
 * me, as Spotlight matches any field of a contact card. */
const CONTACT_TERMS = [
  SITE.name,
  "Johannes Mändle",
  "Maendle",
  SITE.role,
  SITE.contact.email,
  "email",
  "call",
  "phone",
  "contact",
  "linkedin",
  "hire",
];

/** Everything on the phone that matches `q`. Nothing typed is not a match
 * for everything: the empty state shows suggestions instead. */
function search(q: string, notes: NoteSummary[]) {
  if (!q) {
    return {
      apps: [],
      clips: [],
      noteHits: [],
      photoHits: [],
      projectHits: [],
      settingHits: [],
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
  // Photos by what they show and where: "san diego", "blossom".
  const photoHits = PHOTO_LIBRARY.flatMap((photo, index) =>
    photo.about && matches(`${photo.about.title} ${photo.about.place}`, q)
      ? [{ index, photo, about: photo.about }]
      : [],
  ).slice(0, 6);
  // By name, what it is and its domain; not the scheme, which every link
  // shares ("http" isn't a search for all of them).
  const projectHits = PROJECTS.filter((project) =>
    matches(
      `${project.title} ${project.description} ${new URL(project.link).hostname}`,
      q,
    ),
  ).slice(0, 4);
  const settingHits = SETTINGS.filter((setting) =>
    [setting.title, ...setting.terms].some((term) => matches(term, q)),
  );
  // The band's name finds its songs, as an artist search does.
  const songHits = TRACKS.filter((track) =>
    matches(`${track.title} ${CAR_KIDS.name}`, q),
  ).slice(0, 5);
  const contactHit = CONTACT_TERMS.some((s) => matches(s, q));
  const nothing = !(
    apps.length ||
    clips.length ||
    noteHits.length ||
    photoHits.length ||
    projectHits.length ||
    settingHits.length ||
    songHits.length ||
    contactHit
  );
  return {
    apps,
    clips,
    noteHits,
    photoHits,
    projectHits,
    settingHits,
    songHits,
    contactHit,
    nothing,
  };
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
  pullLanded,
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
  /** When it opened: a second tap on the Search pill, under which the
   * dismiss layer now lies, isn't a tap on the blur. */
  const [openedAt] = useState(() => performance.now());

  // Opened by a swipe, nothing has focus (the home screen went inert under
  // it): take it on the dialog itself, without raising the keyboard, once
  // the pull has let go.
  // A frame later: focusing in the commit itself forces the dialog's first
  // layout before its animation can start.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const root = rootRef.current;
      if (root && !pulling && !root.contains(document.activeElement)) {
        root.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [pulling]);

  const {
    apps,
    clips,
    noteHits,
    photoHits,
    projectHits,
    settingHits,
    songHits,
    contactHit,
    nothing,
  } = search(q, notes);

  // The frosting goes on once Spotlight is at rest: blurring the backdrop
  // under a changing opacity redraws the whole blur every frame. In motion
  // it's a darker tint instead, which reads the same at a glance.
  const [entered, setEntered] = useState(false);
  const settled = pull ? pullLanded && !pulling : entered;
  // Brought in by a pull, the pull's spring fades it in on the compositor.
  useEffect(() => {
    if (pull) {
      bindTo(pull, () => [
        { el: rootRef.current, style: (v) => ({ opacity: v }) },
      ]);
    }
  }, [pull]);

  const onAnimationEnd = (event: React.AnimationEvent<HTMLElement>) => {
    if (event.target === event.currentTarget) {
      if (leaving) {
        onLeft();
      }
      return;
    }
    // The frosting goes on once the last thing has stopped moving: the
    // results, which arrive a little after the dialog itself. Blurring
    // under motion would redraw the whole blur every frame.
    if (event.target === resultsRef.current && !leaving) {
      setEntered(true);
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
      // Not aria-modal, like an app window (app-window.tsx).
      role="dialog"
      aria-label="Search"
      inert={leaving || pulling}
      aria-hidden={leaving || pulling || undefined}
      onAnimationEnd={onAnimationEnd}
    >
      {/* Tapping the blur outside the results dismisses, as on iOS. */}
      <button
        type="button"
        className={styles.spotlightDismiss}
        onClick={() => {
          if (performance.now() - openedAt > 400) {
            onClose();
          }
        }}
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

        {photoHits.length ? (
          <>
            <h2 className={styles.spotlightHeader}>Photos</h2>
            <div className={styles.spotlightCard}>
              {photoHits.map(({ index, photo, about }) => (
                <button
                  key={photo.file}
                  type="button"
                  className={styles.spotlightRow}
                  onPointerDown={() => APPS.photos.load()}
                  onClick={launchFrom("photos", { photo: index })}
                >
                  <span data-icon className={styles.spotlightSongCover}>
                    <Image src={photo.image} alt="" fill sizes="72px" />
                  </span>
                  <span className={styles.rowMain}>
                    <span className={styles.rowTitle}>{about.title}</span>
                    <span className={styles.rowDetail}>
                      Photos · {about.place}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : null}

        {projectHits.length ? (
          <>
            <h2 className={styles.spotlightHeader}>Safari</h2>
            <div className={styles.spotlightCard}>
              {projectHits.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className={styles.spotlightRow}
                  onPointerDown={() => APPS.safari.load()}
                  onClick={launchFrom("safari", { project: project.id })}
                >
                  <AppIcon art="safari" className={styles.spotlightRowIcon} />
                  <span className={styles.rowMain}>
                    <span className={styles.rowTitle}>{project.title}</span>
                    <span className={styles.rowDetail}>
                      {project.link.replace(/^https?:\/\/|\/$/g, "")}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : null}

        {settingHits.length ? (
          <>
            <h2 className={styles.spotlightHeader}>Settings</h2>
            <div className={styles.spotlightCard}>
              {settingHits.map((setting) => (
                <button
                  key={setting.title}
                  type="button"
                  className={styles.spotlightRow}
                  onPointerDown={() => APPS.settings.load()}
                  onClick={launchFrom("settings", setting.launch)}
                >
                  <AppIcon art="settings" className={styles.spotlightRowIcon} />
                  <span className={styles.rowMain}>
                    <span className={styles.rowTitle}>{setting.title}</span>
                    <span className={styles.rowDetail}>{setting.detail}</span>
                  </span>
                </button>
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
                  {SITE_INITIALS}
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
        className={cn(styles.floatingBar, styles.keyboardLift)}
        style={{ "--keyboard": `${keyboard}px` } as React.CSSProperties}
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
