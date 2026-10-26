"use client";

import { type MotionValue, m } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  IPHONE_COPY,
  type IphoneAppId,
  type LockNotification,
} from "@/lib/state/iphone-copy";
import { cn } from "@/lib/utils";
import { AppIcon } from "./app-icons";
import { APPS, type AppLaunch } from "./apps";
import { halt, motionNow } from "./compositor-spring";
import { Camera, Flashlight, Padlock } from "./glyphs";
import styles from "./iphone.module.css";
import { rubberband, useVelocityTracker } from "./motion";
import { LockNowPlaying } from "./music/system-ui";
import { formatClock, formatLockDate, formatWeekday } from "./use-clock";
import { useWallpaper } from "./wallpapers";

interface LockScreenProps {
  locked: boolean;
  now: Date | null;
  notifications: LockNotification[];
  /** 0 locked, 1 unlocked. The lock screen follows it 1:1 with the finger. */
  unlock: MotionValue<number>;
  /** The unlock's styles for the sheet (sliding up, or under reduced motion
   * fading whole) and for its clock and date (useDrive). */
  rootStyle?: React.CSSProperties;
  faceStyle?: React.CSSProperties;
  /** Screen height in screen pixels, and how much the frame is scaled. */
  measure: () => { h: number; scale: number };
  onSettle: (to: 0 | 1, velocity?: number) => void;
  /** Open an app out of `from`: the banner, card or button tapped. */
  onOpenApp: (
    id: IphoneAppId,
    launch?: AppLaunch,
    from?: HTMLElement,
    /** Opened from its notification, which then counts as read. */
    notification?: boolean,
  ) => void;
  unlockButtonRef: React.RefObject<HTMLButtonElement | null>;
  /** The sliding layer and its clock, which the unlock's spring moves on
   * the compositor (compositor-spring). */
  rootRef: React.RefObject<HTMLDivElement | null>;
  faceRef: React.RefObject<HTMLDivElement | null>;
}

/** Past this much travel a press is a swipe, and no longer a tap. */
const SLOP = 8;

export function LockScreen({
  locked,
  now,
  notifications,
  unlock,
  rootStyle,
  faceStyle,
  measure,
  onSettle,
  onOpenApp,
  unlockButtonRef,
  rootRef,
  faceRef,
}: LockScreenProps) {
  const wallpaper = useWallpaper();
  const [torch, setTorch] = useState(false);
  const drag = useRef<{
    id: number;
    startY: number;
    h: number;
    active: boolean;
    /** Where unlock stood when the finger landed, so a swipe that catches
     * a spring-back carries on from there instead of jumping. */
    base: number;
  } | null>(null);
  const tracker = useVelocityTracker();
  /** Set when a swipe ends on a button, so its click doesn't also fire. */
  const swallowClick = useRef(false);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // A swipe that ends past the slop gets no click on touch, so a flag left
    // over from it must not swallow the next real tap.
    swallowClick.current = false;
    // One finger at a time: a second one landing must not take the drag over.
    if (!locked || event.button !== 0 || drag.current) {
      return;
    }
    const { h, scale } = measure();
    // Catch a spring-back in flight, where it is on screen.
    const caught = halt(unlock);
    drag.current = {
      id: event.pointerId,
      startY: event.clientY,
      h: h * scale,
      active: false,
      base: Math.max(0, caught),
    };
    tracker.reset();
    tracker.add(event.clientY, event.timeStamp);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) {
      return;
    }
    const travel = current.startY - event.clientY;
    if (!current.active) {
      if (Math.abs(travel) < SLOP) {
        return;
      }
      current.active = true;
      // Capture only once it is a swipe: capturing on pointerdown would
      // retarget the click of a tap on a notification to this layer.
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    tracker.add(event.clientY, event.timeStamp);
    // Dragging down rubber-bands instead of moving freely, as on iOS.
    const progress =
      travel >= 0
        ? travel / current.h
        : -rubberband(-travel, current.h) / current.h;
    unlock.set(Math.min(1, current.base + progress));
  };

  const onPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (current?.id !== event.pointerId) {
      return;
    }
    drag.current = null;
    if (!current.active) {
      return;
    }
    swallowClick.current = true;
    const v = tracker.velocity();
    const open = (unlock.get() > 0.3 || v > 0.4) && v > -0.2;
    // px/ms of finger to unlock-progress per second.
    onSettle(open ? 1 : 0, (v * 1000) / current.h);
  };

  const onClickCapture = (event: React.MouseEvent) => {
    if (swallowClick.current) {
      swallowClick.current = false;
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const onWheel = (event: React.WheelEvent) => {
    // A trackpad or wheel scrolling "up the page" is the desktop swipe.
    if (locked && event.deltaY > 12 && motionNow(unlock).value === 0) {
      onSettle(1);
    }
  };

  return (
    // The whole lock screen is the swipe surface. Every action on it is also
    // a real button (unlock, each notification), so the gesture is never the
    // only way through.
    <m.div
      ref={rootRef}
      className={styles.lock}
      style={rootStyle}
      inert={!locked}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onClickCapture={onClickCapture}
      onWheel={onWheel}
    >
      <m.div
        ref={faceRef}
        style={faceStyle}
        className="flex flex-col items-center"
      >
        <Padlock className={styles.lockGlyph} open={!locked} />
        {/* Filled in before first paint by NOW_SCRIPT, which knows the
            reader's time; the server doesn't. */}
        <p className={styles.lockDate} data-now="date" suppressHydrationWarning>
          {formatLockDate(now)}
        </p>
        <p className={styles.lockTime}>
          <time
            dateTime={now?.toISOString()}
            data-now="clock"
            suppressHydrationWarning
          >
            {formatClock(now)}
          </time>
        </p>
      </m.div>

      <div className={styles.lockStack}>
        <LockNowPlaying
          onOpen={(from) => onOpenApp("music", { nowPlaying: true }, from)}
        />
        <ul className={styles.notifications} aria-label="Notifications">
          {notifications.map((notification, index) => (
            <li
              key={notification.app}
              // The wake animation staggers on this, in CSS: no script.
              style={{ "--i": index } as React.CSSProperties}
            >
              <button
                type="button"
                className={styles.notification}
                onClick={(event) =>
                  onOpenApp(
                    notification.app,
                    notification.note ? { note: notification.note } : undefined,
                    event.currentTarget,
                    true,
                  )
                }
                onPointerDown={() => APPS[notification.app].load()}
              >
                <AppIcon
                  art={APPS[notification.app].art}
                  className={styles.notificationIcon}
                  calendar={
                    now
                      ? { weekday: formatWeekday(now), day: now.getDate() }
                      : null
                  }
                />
                <span
                  className={styles.notificationTitle}
                  data-now={
                    notification.since && notification.app === "notes"
                      ? "article"
                      : undefined
                  }
                  data-since={notification.since}
                  suppressHydrationWarning
                >
                  {notification.title}
                </span>
                <span
                  className={styles.notificationTime}
                  data-now={notification.since ? "age" : undefined}
                  data-since={notification.since}
                  suppressHydrationWarning
                >
                  {notification.time}
                </span>
                <span className={styles.notificationBody}>
                  {notification.body}
                </span>
                <span className="sr-only">
                  , {APPS[notification.app].name}. Opens the app.
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.lockFooter}>
        <button
          type="button"
          className={styles.quickAction}
          aria-label="Flashlight"
          aria-pressed={torch}
          onClick={() => setTorch((on) => !on)}
        >
          <Flashlight />
        </button>
        <button
          ref={unlockButtonRef}
          type="button"
          className={styles.unlockHint}
          onClick={() => onSettle(1)}
        >
          <span className={styles.hintCoarse}>{IPHONE_COPY.unlockHint}</span>
          <span className={styles.hintFine}>
            {IPHONE_COPY.unlockHintPointer}
          </span>
        </button>
        <button
          type="button"
          className={styles.quickAction}
          aria-label="Open Photos"
          onClick={(event) =>
            onOpenApp("photos", undefined, event.currentTarget)
          }
          onPointerDown={() => APPS.photos.load()}
        >
          <Camera />
        </button>
      </div>
      <span className={styles.homeIndicator} />
      {/* The lock screen is a cover sheet with the wallpaper on it, opaque,
          lifting away over the home screen rather than sliding as a
          see-through layer of text over the icons. */}
      <Image
        src={wallpaper.image}
        alt=""
        fill
        placeholder="blur"
        sizes="(min-width: 640px) and (min-height: 640px) 402px, 100vw"
        className={cn(styles.wallpaper, styles.lockWallpaper)}
      />
      <span className={cn(styles.scrim, styles.lockScrim)} aria-hidden />
    </m.div>
  );
}
