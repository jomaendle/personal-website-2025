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
}

export interface AppProps {
  /** Send the app home, as the home indicator would. */
  close: () => void;
  launch?: AppLaunch;
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

export function preloadAllApps() {
  for (const app of Object.values(APPS)) {
    app.load();
  }
  // The library's first screen of thumbnails too, fetched and decoded
  // ahead, so the launch's first frames aren't waiting on images.
  import("./apps/photos-app").then((photos) => photos.warmLibrary());
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
