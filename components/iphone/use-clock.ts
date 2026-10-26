import { useSyncExternalStore } from "react";

/**
 * The current minute, shared by every clock on the page (lock screen, status
 * bar, Calendar). One timer for all of them, fired on the minute boundary
 * rather than every second, and re-checked when the tab comes back, since
 * background tabs throttle timers.
 *
 * The server has no idea what time it is for the reader, so it renders
 * `null` and the clocks show Apple's 9:41. Before first paint NOW_SCRIPT
 * writes in the real time and leaves the minute it used, which hydration
 * starts from, so the page hydrates onto text that's already right; a
 * minute that has ticked over since is picked up straight after.
 */
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;

const notify = () => {
  for (const listener of listeners) {
    listener();
  }
};

const schedule = () => {
  clearTimeout(timer);
  timer = setTimeout(
    () => {
      notify();
      schedule();
    },
    60_000 - (Date.now() % 60_000) + 20,
  );
};

const onVisibility = () => {
  if (document.visibilityState === "visible") {
    notify();
    schedule();
  }
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    schedule();
    document.addEventListener("visibilitychange", onVisibility);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    }
  };
}

const getSnapshot = () => Math.floor(Date.now() / 60_000);
const getServerSnapshot = () =>
  typeof window === "undefined"
    ? null
    : ((window as { __iphoneMinute?: number }).__iphoneMinute ?? null);

export function useMinute(): Date | null {
  const minute = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return minute === null ? null : new Date(minute * 60_000);
}

let timeFormat: Intl.DateTimeFormat | undefined;
let dateFormat: Intl.DateTimeFormat | undefined;
let weekdayFormat: Intl.DateTimeFormat | undefined;

/** "8:42" or "20:42", by the reader's locale. iOS never shows AM/PM on the
 * lock screen or in the status bar. */
export function formatClock(date: Date | null): string {
  if (!date) {
    return "9:41";
  }
  timeFormat ??= new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return timeFormat
    .formatToParts(date)
    .filter((part) => part.type !== "dayPeriod")
    .map((part) => part.value)
    .join("")
    .trim();
}

/** "Sunday, October 25", by the reader's locale. */
export function formatLockDate(date: Date | null): string {
  if (!date) {
    return "";
  }
  dateFormat ??= new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return dateFormat.format(date);
}

export function formatWeekday(date: Date): string {
  weekdayFormat ??= new Intl.DateTimeFormat(undefined, { weekday: "short" });
  return weekdayFormat.format(date);
}
