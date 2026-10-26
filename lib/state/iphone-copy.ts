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
  | "settings"
  | "music";

export interface LockNotification {
  app: IphoneAppId;
  /** A note to open straight into, for the article notification. */
  note?: string;
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
    rateLimited:
      "You’ve sent a few already. Try again in a minute; your message is still here.",
  },
} as const;

/** Notifications waiting on the lock screen. Tapping one opens its app. */
/** How long ago, the way a lock-screen notification says it: "now", "5m
 * ago", "2h ago", then "Yesterday", the weekday within a week, then the
 * date. Empty before the visitor's clock is known (on the server). */
export function notificationAge(date: string, now: Date | null): string {
  if (!now) {
    return "";
  }
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
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    ...(then.getFullYear() === now.getFullYear() ? {} : { year: "numeric" }),
  }).format(then);
}

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
              now &&
              now.getTime() - new Date(latestPost.date).getTime() >
                14 * 86_400_000
                ? "Latest article"
                : "New article",
            body: latestPost.title,
            time: notificationAge(latestPost.date, now),
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
