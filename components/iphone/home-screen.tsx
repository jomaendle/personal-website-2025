"use client";

import { type MotionValue, m } from "framer-motion";
import Image from "next/image";
import { IPHONE_COPY, type IphoneAppId } from "@/lib/state/iphone-copy";
import { FEATURED_PHOTO } from "@/lib/state/photos";
import { cn } from "@/lib/utils";
import { AppIcon, type CalendarFace } from "./app-icons";
import { APPS, WEB_CLIPS } from "./apps";
import { Magnifier } from "./glyphs";
import styles from "./iphone.module.css";

const GRID_APPS: IphoneAppId[] = ["calendar", "contacts", "settings"];
const DOCK_APPS: IphoneAppId[] = ["notes", "safari", "photos", "mail"];

interface HomeScreenProps {
  inert: boolean;
  calendar: CalendarFace | null;
  latestPosts: { title: string; date: string; slug: string }[];
  homeRef: React.RefObject<HTMLDivElement | null>;
  registerIcon: (id: IphoneAppId, el: HTMLElement | null) => void;
  onOpen: (id: IphoneAppId, from?: HTMLElement) => void;
  scale: MotionValue<number>;
  gridOpacity: MotionValue<number>;
  bottomY: MotionValue<number>;
  bottomOpacity: MotionValue<number>;
}

export function HomeScreen({
  inert,
  calendar,
  latestPosts,
  homeRef,
  registerIcon,
  onOpen,
  scale,
  gridOpacity,
  bottomY,
  bottomOpacity,
}: HomeScreenProps) {
  const appButton = (id: IphoneAppId, labelled: boolean) => (
    <button
      key={id}
      type="button"
      className={styles.cell}
      onClick={(event) =>
        onOpen(id, event.currentTarget.firstElementChild as HTMLElement)
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
    // Only `transform` here: an opacity below 1 on an ancestor would cut the
    // dock's backdrop blur off from the wallpaper behind it.
    <m.div
      ref={homeRef}
      className={styles.home}
      style={{ scale }}
      inert={inert}
      tabIndex={-1}
      aria-label="Home Screen"
      role="region"
    >
      <m.nav
        className={styles.homeGrid}
        style={{ opacity: gridOpacity }}
        aria-label="Apps"
      >
        <button
          type="button"
          className={cn(styles.cell, styles.widgetCell)}
          onClick={(event) =>
            onOpen(
              "photos",
              event.currentTarget.firstElementChild as HTMLElement,
            )
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

        <button
          type="button"
          className={cn(styles.cell, styles.widgetCell)}
          onClick={(event) =>
            onOpen(
              "notes",
              event.currentTarget.firstElementChild as HTMLElement,
            )
          }
          onPointerDown={() => APPS.notes.load()}
        >
          <span className={cn(styles.widget, styles.widgetNotes)}>
            <span className={styles.widgetNotesHead}>
              Writing
              <span aria-hidden>›</span>
            </span>
            {latestPosts.map((post) => (
              <span key={post.slug} className={styles.widgetNote}>
                <span className={styles.widgetNoteTitle}>{post.title}</span>
                <span className={styles.widgetNoteDate}>{post.date}</span>
              </span>
            ))}
          </span>
          <span className={styles.cellLabel}>Notes</span>
        </button>

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
        <span className={styles.search} aria-hidden>
          <Magnifier width={12} height={12} />
          {IPHONE_COPY.searchLabel}
        </span>
        <nav className={styles.dock} aria-label="Dock">
          {DOCK_APPS.map((id) => appButton(id, false))}
        </nav>
      </m.div>
    </m.div>
  );
}
