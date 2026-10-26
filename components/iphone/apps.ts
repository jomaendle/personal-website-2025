import { type ComponentType, lazy } from "react";
import { SOCIAL_LINKS } from "@/lib/config/navigation";
import { SITE } from "@/lib/config/site";
import type { IphoneAppId } from "@/lib/state/iphone-copy";
import type { IconArt } from "./app-icons";

/** Where an app should open to, when something deeper than its icon
 * launched it: a widget row or a notification. */
export interface AppLaunch {
  /** Notes: the article to open straight into. */
  note?: string;
  /** Music: open on Now Playing (from the lock screen or Spotlight). */
  nowPlaying?: boolean;
  /** Photos: open on this photo (its index in the library). */
  photo?: number;
  /** Settings: open on this page. */
  settings?: "wallpaper";
}

export interface AppProps {
  /** Send the app home, as the home indicator would. */
  close: () => void;
  launch?: AppLaunch;
  /** Go to another app, as a link to it does on iOS: this one goes and the
   * other opens out of its icon. */
  openApp: (id: IphoneAppId, launch?: AppLaunch) => void;
}

interface AppEntry {
  name: string;
  art: IconArt;
  load: () => Promise<{ default: ComponentType<AppProps> }>;
}

/**
 * Each app is its own chunk. The lock screen and home screen ship without
 * them; they are fetched on idle once the phone is unlocked, or on the
 * pointerdown that precedes a tap, so by the time an app has zoomed open its
 * code is normally there. When it is not, the app's empty background shows
 * for a moment, which is exactly what an iOS launch screen looks like.
 */
export const APPS: Record<IphoneAppId, AppEntry> = {
  notes: {
    name: "Notes",
    art: "notes",
    load: () => import("./apps/notes-app"),
  },
  photos: {
    name: "Photos",
    art: "photos",
    load: () => import("./apps/photos-app"),
  },
  safari: {
    name: "Safari",
    art: "safari",
    load: () => import("./apps/safari-app"),
  },
  mail: {
    name: "Mail",
    art: "mail",
    load: () => import("./apps/mail-app"),
  },
  calendar: {
    name: "Calendar",
    art: "calendar",
    load: () => import("./apps/calendar-app"),
  },
  contacts: {
    name: "Contacts",
    art: "contacts",
    load: () => import("./apps/contacts-app"),
  },
  settings: {
    name: "Settings",
    art: "settings",
    load: () => import("./apps/settings-app"),
  },
  music: {
    name: "Music",
    art: "music",
    load: () => import("./apps/music-app"),
  },
};

export const LAZY_APPS = {} as Record<IphoneAppId, ComponentType<AppProps>>;
for (const id of Object.keys(APPS) as IphoneAppId[]) {
  LAZY_APPS[id] = lazy(APPS[id].load);
}

/**
 * Warm every app's code, one app per idle moment rather than all at once:
 * each chunk's evaluation is a task of its own, and spread out none of them
 * lands under a tap on the lock screen. The dock's apps go first, then the
 * library's first screen of thumbnails, fetched and decoded ahead so a
 * launch's first frames aren't waiting on images.
 */
export function preloadAllApps() {
  const order: IphoneAppId[] = [
    "notes",
    "photos",
    "safari",
    "mail",
    "calendar",
    "music",
    "contacts",
    "settings",
  ];
  const idle = (work: () => void) => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(work, { timeout: 2000 });
    } else {
      setTimeout(work, 250);
    }
  };
  const next = (i: number) => {
    const id = order[i];
    if (!id) {
      import("./apps/photos-app").then((photos) => photos.warmLibrary());
      return;
    }
    APPS[id].load().then(() => idle(() => next(i + 1)));
  };
  next(0);
}

/** Home screen bookmarks that leave the phone for another site. */
export const WEB_CLIPS: { name: string; art: IconArt; href: string }[] = [
  {
    name: "GitHub",
    art: "github",
    href:
      SOCIAL_LINKS.find((link) => link.label === "GitHub")?.href ??
      "https://github.com/jomaendle",
  },
  { name: "LinkedIn", art: "linkedin", href: SITE.social.linkedin },
];
