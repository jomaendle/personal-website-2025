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
  mailBodyPlaceholder: "Hi Jo, I’m working on…",
  mailReplyNote: "I usually reply within a day or two.",
} as const;

/**
 * What the Mail app says when Send can't go yet, in the shape of an iOS
 * alert: a short title, one sentence, and the field to put the cursor in.
 */
export const MAIL_ALERTS = {
  noName: {
    title: "Add Your Name",
    message: "So I know who I’m replying to.",
  },
  noEmail: {
    title: "Add Your Email Address",
    message: "I need it to write back.",
  },
  badEmail: {
    title: "Check Your Email Address",
    message: (email: string) =>
      `“${email}” doesn’t look like an email address.`,
  },
  shortMessage: {
    title: "Add a Few More Words",
    message: "A sentence or two about what you have in mind is plenty.",
  },
  failed: {
    title: "Cannot Send Mail",
    offline: "You seem to be offline. Your message is still here.",
    fallback: "Something went wrong on my end. Your message is still here.",
  },
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
