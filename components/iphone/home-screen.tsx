"use client";

import { type MotionValue, m } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { IPHONE_COPY, type IphoneAppId } from "@/lib/state/iphone-copy";
import { FEATURED_PHOTO } from "@/lib/state/photos";
import { cn } from "@/lib/utils";
import { AppIcon, type CalendarFace } from "./app-icons";
import { APPS, type AppLaunch, WEB_CLIPS } from "./apps";
import { Magnifier } from "./glyphs";
import styles from "./iphone.module.css";

const GRID_APPS: IphoneAppId[] = ["calendar", "contacts", "settings", "music"];
const DOCK_APPS: IphoneAppId[] = ["notes", "safari", "photos", "mail"];

interface HomeScreenProps {
  inert: boolean;
  calendar: CalendarFace | null;
  notes: { title: string; date: string; slug: string }[];
  homeRef: React.RefObject<HTMLDivElement | null>;
  registerIcon: (id: IphoneAppId, el: HTMLElement | null) => void;
  onOpen: (
    id: IphoneAppId,
    options?: { from?: HTMLElement; launch?: AppLaunch },
  ) => void;
  scale: MotionValue<number>;
  gridOpacity: MotionValue<number>;
  bottomY: MotionValue<number>;
  bottomOpacity: MotionValue<number>;
  searchRef: React.RefObject<HTMLButtonElement | null>;
  /** Open Spotlight; `focus` raises the keyboard (a tap can, a swipe can't). */
  onSearch: (focus: boolean) => void;
}

export function HomeScreen({
  inert,
  calendar,
  notes,
  homeRef,
  registerIcon,
  onOpen,
  scale,
  gridOpacity,
  bottomY,
  bottomOpacity,
  searchRef,
  onSearch,
}: HomeScreenProps) {
  // A swipe down anywhere on the home screen opens Spotlight, as on iOS,
  // even when it starts on an icon: that icon's tap is then swallowed.
  const pull = useRef<{ id: number; x: number; y: number } | null>(null);
  const swallowClick = useRef(false);
  const onPointerDown = (event: React.PointerEvent) => {
    swallowClick.current = false;
    if (event.button === 0) {
      pull.current = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      };
    }
  };
  const onPointerMove = (event: React.PointerEvent) => {
    const start = pull.current;
    if (!start || start.id !== event.pointerId) {
      return;
    }
    const dy = event.clientY - start.y;
    if (dy > 24 && dy > Math.abs(event.clientX - start.x) * 1.5) {
      pull.current = null;
      swallowClick.current = true;
      onSearch(false);
    }
  };
  const notesWidget = useRef<HTMLDivElement>(null);
  const openNotes = (note?: string) =>
    onOpen("notes", {
      from: notesWidget.current ?? undefined,
      launch: note ? { note } : undefined,
    });

  const appButton = (id: IphoneAppId, labelled: boolean) => (
    <button
      key={id}
      type="button"
      className={styles.cell}
      onClick={(event) =>
        onOpen(id, {
          from: event.currentTarget.firstElementChild as HTMLElement,
        })
      }
      onPointerDown={() => APPS[id].load()}
      aria-label={labelled ? undefined : APPS[id].name}
    >
      <AppIcon
        art={APPS[id].art}
        calendar={id === "calendar" ? calendar : undefined}
        ref={(el) => registerIcon(id, el)}
      />
      {labelled ? (
        <span className={styles.cellLabel}>{APPS[id].name}</span>
      ) : null}
    </button>
  );

  return (
    // The zoom is on the grid, not here: scaling the dock would make it
    // re-blur its backdrop on every frame of every unlock and app launch.
    // Nor any opacity here, which would cut the dock's blur off from the
    // wallpaper behind it.
    <m.div
      ref={homeRef}
      className={styles.home}
      inert={inert}
      tabIndex={-1}
      aria-label="Home Screen"
      role="region"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={() => {
        pull.current = null;
      }}
      onPointerCancel={() => {
        pull.current = null;
      }}
      onClickCapture={(event) => {
        if (swallowClick.current) {
          swallowClick.current = false;
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      <m.nav
        className={styles.homeGrid}
        style={{ opacity: gridOpacity, scale }}
        aria-label="Apps"
      >
        <button
          type="button"
          className={cn(styles.cell, styles.widgetCell)}
          onClick={(event) =>
            onOpen("photos", {
              from: event.currentTarget.firstElementChild as HTMLElement,
            })
          }
          onPointerDown={() => APPS.photos.load()}
        >
          <span className={styles.widget}>
            <Image
              src={FEATURED_PHOTO}
              alt=""
              fill
              sizes="180px"
              placeholder="blur"
              className={styles.widgetPhoto}
            />
            <span className={styles.widgetCaption}>Featured</span>
          </span>
          <span className={styles.cellLabel}>Photos</span>
        </button>

        {/* Like the real Notes widget, each note is its own tap target and
            opens straight into that note; the header opens the list. All of
            them zoom the app out of the widget. */}
        <div
          className={cn(styles.cell, styles.widgetCell)}
          onPointerDown={() => APPS.notes.load()}
        >
          <div
            ref={notesWidget}
            className={cn(styles.widget, styles.widgetNotes)}
          >
            <button
              type="button"
              className={styles.widgetNotesHead}
              onClick={() => openNotes()}
            >
              Writing
              <span aria-hidden>›</span>
            </button>
            {notes.map((note) => (
              <button
                key={note.slug}
                type="button"
                className={styles.widgetNote}
                onClick={() => openNotes(note.slug)}
              >
                <span className={styles.widgetNoteTitle}>{note.title}</span>
                <span className={styles.widgetNoteDate}>{note.date}</span>
              </button>
            ))}
          </div>
          {/* The label opens Notes too, as the Photos widget's does. The
              header is the keyboard's and screen reader's way in, so this
              stays out of both. */}
          <button
            type="button"
            className={cn(styles.cellLabel, styles.cellLabelButton)}
            onClick={() => openNotes()}
            tabIndex={-1}
            aria-hidden
          >
            Notes
          </button>
        </div>

        {GRID_APPS.map((id) => appButton(id, true))}

        {WEB_CLIPS.map((clip) => (
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
      </m.nav>

      <m.div
        className={styles.homeBottom}
        style={{ y: bottomY, opacity: bottomOpacity }}
      >
        <button
          ref={searchRef}
          type="button"
          className={styles.search}
          onClick={() => onSearch(true)}
        >
          <Magnifier width={12} height={12} />
          {IPHONE_COPY.searchLabel}
        </button>
        <nav className={styles.dock} aria-label="Dock">
          {DOCK_APPS.map((id) => appButton(id, false))}
        </nav>
      </m.div>
    </m.div>
  );
}
