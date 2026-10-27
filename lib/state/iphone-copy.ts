import { ageText, isRecent } from "./now-format";
/**
 * Copy for the /ios page: an iOS-style way into the site. Everything the
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
  | "settings"
  | "music";

export interface LockNotification {
  app: IphoneAppId;
  /** A note to open straight into, for the article notification. */
  note?: string;
  title: string;
  body: string;
  time: string;
  /** When it happened, for the ones whose age (and, for the article, title)
   * follow the reader's clock. */
  since?: string;
}

/** The article notification's title: "New" only while it is. */
export const ARTICLE_TITLES = {
  new: "New article",
  latest: "Latest article",
} as const;

/** Where the iOS mode lives. /iphone redirects here (next.config.mjs). */
export const IOS_PATH = "/ios";

export const IPHONE_COPY = {
  metaTitle: "iOS",
  metaDescription:
    "My site in iOS. Articles in Notes, photographs in Photos, projects in Safari.",
  deviceName: "Jo’s iPhone",
  unlockHint: "Swipe up to open",
  /** With a mouse or trackpad, where a click, a scroll or a drag opens it. */
  unlockHintPointer: "Click or scroll up to open",
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
    rateLimited:
      "You’ve sent a few already. Try again in a minute; your message is still here.",
  },
} as const;

/** How long ago, the way a lock-screen notification says it (see
 * `ageText`). Empty before the visitor's clock is known (on the server). */
export function notificationAge(date: string, now: Date | null): string {
  return now ? ageText(date, now) : "";
}

/** Notifications waiting on the lock screen. Tapping one opens its app. */
export function lockNotifications(
  latestPost: { title: string; slug: string; date: string } | undefined,
  photoCount: number,
  now: Date | null = null,
): LockNotification[] {
  return [
    ...(latestPost
      ? [
          {
            app: "notes" as const,
            note: latestPost.slug,
            // "New" only while it is: an older post is the latest one.
            title:
              now && !isRecent(latestPost.date, now)
                ? ARTICLE_TITLES.latest
                : ARTICLE_TITLES.new,
            body: latestPost.title,
            time: notificationAge(latestPost.date, now),
            since: latestPost.date,
          },
        ]
      : []),
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
