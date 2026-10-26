/**
 * How the phone writes the time, a date and "how long ago", in one place for
 * both the page and the script that fills them in before first paint
 * (components/iphone/now-script.ts). That script inlines these functions'
 * source, so each one stays self-contained: no imports, no reference to
 * anything outside its own body, plain JavaScript once the types are gone.
 * Two copies that drifted apart would flip the text on hydration.
 */

/** "8:42" or "20:42", by the reader's locale. iOS never shows AM/PM on the
 * lock screen or in the status bar. */
export function clockText(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })
    .formatToParts(date)
    .filter((part) => part.type !== "dayPeriod")
    .map((part) => part.value)
    .join("")
    .trim();
}

/** "Sunday, October 25", by the reader's locale. */
export function lockDateText(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

/** "Sun", by the reader's locale. */
export function weekdayText(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
}

/** How long ago, the way a lock-screen notification says it: "now", "5m
 * ago", "2h ago", then "Yesterday", the weekday within a week, then the
 * date. Empty for a date that doesn't parse. */
export function ageText(date: string, now: Date): string {
  const then = new Date(date);
  if (Number.isNaN(then.getTime())) {
    return "";
  }
  const minutes = Math.round((now.getTime() - then.getTime()) / 60_000);
  if (minutes < 1) {
    return "now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  if (minutes < 24 * 60 && now.getDate() === then.getDate()) {
    return `${Math.floor(minutes / 60)}h ago`;
  }
  const days = Math.round(
    (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
      new Date(then.getFullYear(), then.getMonth(), then.getDate()).getTime()) /
      86_400_000,
  );
  if (days === 1) {
    return "Yesterday";
  }
  if (days < 7) {
    return new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(then);
  }
  return new Intl.DateTimeFormat(
    undefined,
    then.getFullYear() === now.getFullYear()
      ? { day: "numeric", month: "short" }
      : { day: "numeric", month: "short", year: "numeric" },
  ).format(then);
}

/** Whether a post still counts as new: published in the last two weeks. */
export function isRecent(date: string, now: Date): boolean {
  return now.getTime() - new Date(date).getTime() <= 14 * 86_400_000;
}
