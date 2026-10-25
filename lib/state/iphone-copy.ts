/**
 * Copy for the /iphone page: an iOS-style way into the site. Everything the
 * apps list (articles, projects, photos, roles) is read from the same
 * `lib/state` modules the homepage uses; only the system chrome lives here.
 */

export type IphoneAppId =
  | "notes"
  | "photos"
  | "safari"
  | "mail"
  | "calendar"
  | "contacts"
  | "settings";

export interface LockNotification {
  app: IphoneAppId;
  title: string;
  body: string;
  time: string;
}

export const IPHONE_COPY = {
  metaTitle: "iPhone",
  metaDescription:
    "My site as an iPhone. Articles in Notes, photographs in Photos, projects in Safari.",
  deviceName: "Jo’s iPhone",
  unlockHint: "Swipe up to open",
  lockLabel: "Lock iPhone",
  closeAppLabel: "Close app",
  exitLabel: "jomaendle.com",
  searchLabel: "Search",
  calendarEvent: "Intro call with Jo",
  calendarEventDetail: "30 min · Google Meet",
  calendarHint: "Pick any free slot. It lands in my calendar directly.",
  mailSubjectPlaceholder: "What are you working on?",
  mailSent: "Sent. I usually reply within a day or two.",
} as const;

/** Notifications waiting on the lock screen. Tapping one opens its app. */
export function lockNotifications(
  latestPostTitle: string,
  photoCount: number,
): LockNotification[] {
  return [
    {
      app: "notes",
      title: "New article",
      body: latestPostTitle,
      time: "now",
    },
    {
      app: "photos",
      title: "Featured photos",
      body: `${photoCount} photographs from wherever I’ve been.`,
      time: "1h ago",
    },
    {
      app: "calendar",
      title: "Free this week",
      body: "Book a 30 minute intro call.",
      time: "2h ago",
    },
  ];
}
