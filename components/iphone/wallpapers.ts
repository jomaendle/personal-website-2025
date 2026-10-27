import { useSyncExternalStore } from "react";
import { WALLPAPERS, type WallpaperChoice } from "@/lib/state/photos";
import { WALLPAPER_KEY } from "./persist";

/**
 * The wallpaper the reader chose in Settings, shared by the lock screen,
 * the home screen and the desktop glow. The choice lives in localStorage;
 * the server, and the first client render, show the default.
 *
 * To keep a return visit from flashing the default first, the pre-paint
 * script (persist.ts) marks the document while a choice is stored and the
 * stylesheet hides the wallpaper until `useWallpaper` has rendered it.
 */

export const DEFAULT_WALLPAPER = WALLPAPERS[0] as WallpaperChoice;

const listeners = new Set<() => void>();

function stored(): string {
  try {
    return localStorage.getItem(WALLPAPER_KEY) ?? "";
  } catch {
    return "";
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Another tab's choice applies here too.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function wallpaperOf(key: string): WallpaperChoice {
  return WALLPAPERS.find((w) => w.key === key) ?? DEFAULT_WALLPAPER;
}

export function setWallpaper(key: string) {
  try {
    if (key === DEFAULT_WALLPAPER.key) {
      localStorage.removeItem(WALLPAPER_KEY);
    } else {
      localStorage.setItem(WALLPAPER_KEY, key);
    }
  } catch {
    // Blocked storage: the choice still applies until the page is left.
    fallback = key;
  }
  for (const listener of listeners) {
    listener();
  }
}

/** Where storage is blocked, the choice for this page view. */
let fallback = "";

export function useWallpaper(): WallpaperChoice {
  const key = useSyncExternalStore(
    subscribe,
    () => stored() || fallback,
    () => "",
  );
  return wallpaperOf(key);
}

/** Lets the wallpaper show once the chosen one is on screen (see above):
 * called with the key just rendered, which during hydration is still the
 * default's. */
export function wallpaperShown(rendered: string) {
  if (wallpaperOf(stored() || fallback).key === rendered) {
    delete document.documentElement.dataset.wallpaperPending;
  }
}
