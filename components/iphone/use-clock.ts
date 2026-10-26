import { useSyncExternalStore } from "react";
import { clockText, lockDateText, weekdayText } from "@/lib/state/now-format";

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

/** "8:42" or "20:42", by the reader's locale; Apple's 9:41 before the
 * reader's clock is known. */
export function formatClock(date: Date | null): string {
  return date ? clockText(date) : "9:41";
}

/** "Sunday, October 25", by the reader's locale. */
export function formatLockDate(date: Date | null): string {
  return date ? lockDateText(date) : "";
}

export function formatWeekday(date: Date): string {
  return weekdayText(date);
}
