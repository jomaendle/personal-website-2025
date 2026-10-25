"use client";

import { SITE } from "@/lib/config/site";
import { IPHONE_COPY } from "@/lib/state/iphone-copy";
import { cn } from "@/lib/utils";
import type { AppProps } from "../apps";
import { BackChevron } from "../glyphs";
import styles from "../iphone.module.css";
import { formatWeekday, useMinute } from "../use-clock";

const monthFormat = new Intl.DateTimeFormat(undefined, { month: "long" });
const dayFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** This week, today circled, and the one event worth having: an intro call,
 * which opens my booking page. */
export default function CalendarApp(_: AppProps) {
  const now = useMinute() ?? new Date();
  const week = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now);
    day.setDate(now.getDate() - now.getDay() + i);
    return day;
  });

  return (
    <div className={cn(styles.scroll, styles.calendar)}>
      <div className={styles.navBar} style={{ animation: "none" }}>
        <div className={styles.navLeading} aria-hidden>
          <BackChevron width={10} height={17} />
          {monthFormat.format(now)}
        </div>
      </div>
      <h1 className="sr-only">Calendar</h1>
      <div className={styles.week}>
        {week.map((day) => (
          <div key={day.toDateString()}>
            <div className={styles.weekday}>{formatWeekday(day).charAt(0)}</div>
            <div
              className={cn(
                styles.weekDate,
                day.toDateString() === now.toDateString() &&
                  styles.weekDateToday,
              )}
            >
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>
      <h2 className={styles.dayTitle}>{dayFormat.format(now)}</h2>
      <a
        href={SITE.contact.booking}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.event}
      >
        <span className={cn(styles.eventTitle, "block")}>
          {IPHONE_COPY.calendarEvent}
        </span>
        <span className={cn(styles.eventDetail, "block")}>
          {IPHONE_COPY.calendarEventDetail}
        </span>
      </a>
      <p className={styles.groupFooter} style={{ paddingLeft: 16 }}>
        {IPHONE_COPY.calendarHint}
      </p>
    </div>
  );
}
