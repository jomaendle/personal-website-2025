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
  const [held, setHeld] = useState(false);
  const swipe = useRef<{
    id: number;
    y: number;
    dy: number;
    t: number;
    v: number;
    moved: boolean;
  } | null>(null);
  /** A drag just ended: the click it makes doesn't open the app. */
  const dragged = useRef(false);

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
    // Held under a finger, it stays.
    if (!banner || leaving || held) {
      return;
    }
    const timer = setTimeout(() => setLeaving(true), SHOWN);
    return () => clearTimeout(timer);
  }, [banner, leaving, held]);

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
          if (dragged.current) {
            dragged.current = false;
            return;
          }
          if (onOpen(banner.app, event.currentTarget)) {
            setBanner(null);
          } else {
            setLeaving(true);
          }
        }}
        // It follows the finger: up freely, down only a little, as on iOS.
        // Let go far enough up, or flicked up, it goes; otherwise it springs
        // back. `translate` stacks on the in and out keyframes' transform.
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.style.transition = "none";
          swipe.current = {
            id: event.pointerId,
            y: event.clientY,
            dy: 0,
            t: event.timeStamp,
            v: 0,
            moved: false,
          };
          dragged.current = false;
          setHeld(true);
        }}
        onPointerMove={(event) => {
          const s = swipe.current;
          if (s?.id !== event.pointerId) {
            return;
          }
          const raw = event.clientY - s.y;
          const dy = raw < 0 ? raw : raw * 0.2;
          const dt = event.timeStamp - s.t;
          if (dt > 0) {
            s.v = (dy - s.dy) / dt;
          }
          s.dy = dy;
          s.t = event.timeStamp;
          s.moved ||= Math.abs(raw) > 6;
          event.currentTarget.style.translate = `0 ${dy}px`;
        }}
        onPointerUp={(event) => {
          const s = swipe.current;
          if (s?.id !== event.pointerId) {
            return;
          }
          swipe.current = null;
          setHeld(false);
          dragged.current = s.moved;
          if (s.dy < -30 || s.v < -0.3) {
            setLeaving(true);
          } else {
            const el = event.currentTarget;
            el.style.transition =
              "translate 0.35s cubic-bezier(0.2, 1.1, 0.3, 1)";
            el.style.translate = "";
          }
        }}
        onPointerCancel={(event) => {
          swipe.current = null;
          setHeld(false);
          event.currentTarget.style.transition = "";
          event.currentTarget.style.translate = "";
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
