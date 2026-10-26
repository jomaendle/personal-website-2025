"use client";

import { useEffect, useRef, useState } from "react";
import type { IphoneAppId } from "@/lib/state/iphone-copy";
import { cn } from "@/lib/utils";
import { AppIcon } from "./app-icons";
import { APPS } from "./apps";
import styles from "./iphone.module.css";

interface Banner {
  id: number;
  app: IphoneAppId;
  title: string;
  body: string;
}

const listeners = new Set<(banner: Banner) => void>();

/** Drop a notification banner in from the top of the screen, as iOS does
 * for an app that finishes something while it isn't open (Mail sending a
 * message after it was closed). */
export function showBanner(banner: Omit<Banner, "id">) {
  const next = { ...banner, id: Date.now() };
  for (const listener of listeners) {
    listener(next);
  }
}

/** How long a banner stays before it slides away, in ms. */
const SHOWN = 4000;

/**
 * Where banners appear. One at a time; a new one replaces the current. A
 * tap opens its app (when `onOpen` allows), a swipe up or the timer puts
 * it away.
 */
export function BannerHost({
  onOpen,
}: {
  /** Open the banner's app; returns whether it could. */
  onOpen: (app: IphoneAppId, from: HTMLElement) => boolean;
}) {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [leaving, setLeaving] = useState(false);
  const swipe = useRef<{ id: number; y: number } | null>(null);

  useEffect(() => {
    const listener = (next: Banner) => {
      setLeaving(false);
      setBanner(next);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (!banner || leaving) {
      return;
    }
    const timer = setTimeout(() => setLeaving(true), SHOWN);
    return () => clearTimeout(timer);
  }, [banner, leaving]);

  if (!banner) {
    return null;
  }
  return (
    <div className={styles.bannerHost} role="status">
      <button
        key={banner.id}
        type="button"
        className={cn(
          styles.notification,
          styles.banner,
          leaving && styles.bannerLeaving,
        )}
        onClick={(event) => {
          if (onOpen(banner.app, event.currentTarget)) {
            setBanner(null);
          } else {
            setLeaving(true);
          }
        }}
        onPointerDown={(event) => {
          swipe.current = { id: event.pointerId, y: event.clientY };
        }}
        onPointerMove={(event) => {
          const start = swipe.current;
          if (start?.id === event.pointerId && start.y - event.clientY > 12) {
            swipe.current = null;
            setLeaving(true);
          }
        }}
        onAnimationEnd={(event) => {
          if (leaving && event.target === event.currentTarget) {
            setBanner(null);
            setLeaving(false);
          }
        }}
      >
        <AppIcon
          art={APPS[banner.app].art}
          className={styles.notificationIcon}
        />
        <span className={styles.notificationTitle}>{banner.title}</span>
        <span className={styles.notificationTime}>now</span>
        <span className={styles.notificationBody}>{banner.body}</span>
      </button>
    </div>
  );
}
