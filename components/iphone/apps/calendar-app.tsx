"use client";

import {
  type CSSProperties,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SITE } from "@/lib/config/site";
import { IPHONE_COPY } from "@/lib/state/iphone-copy";
import { cn } from "@/lib/utils";
import type { AppProps } from "../apps";
import { BackChevron, PlusGlyph } from "../glyphs";
import styles from "../iphone.module.css";
import { useMinute } from "../use-clock";
import { useLatest } from "../use-latest";

// ---- Dates ----------------------------------------------------------------------

type View = "year" | "month" | "day";

const DAY = 86_400_000;

const atMidnight = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const monthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

/** The reader's first day of the week (1 Monday … 7 Sunday), from their
 * locale, as Calendar follows the region. */
function firstWeekday(): number {
  try {
    const locale = new Intl.Locale(navigator.language) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    return locale.getWeekInfo?.().firstDay ?? locale.weekInfo?.firstDay ?? 1;
  } catch {
    return 1;
  }
}

/** ISO 8601 week number, as Calendar shows down the left of the month. */
function isoWeek(date: Date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const weekday = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - weekday);
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart) / DAY + 1) / 7);
}

/** The month as rows of seven, the days before the 1st left empty. */
function monthWeeks(year: number, month: number, start: number) {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() - (start % 7) + 7) % 7;
  const length = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length }, (_, i) => new Date(year, month, i + 1)),
  ];
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  const last = weeks.at(-1);
  while (last && last.length < 7) {
    last.push(null);
  }
  return weeks;
}

/** The seven days of the week `date` falls in. */
const weekOf = (date: Date, start: number) => {
  const back = (date.getDay() - (start % 7) + 7) % 7;
  return Array.from({ length: 7 }, (_, i) => addDays(date, i - back));
};

const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

/** Days I take intro calls: weekdays from today on. The booking page holds
 * the actual free slots. */
const bookable = (date: Date, today: Date) =>
  !isWeekend(date) && atMidnight(date) >= atMidnight(today);

const formats = {
  month: new Intl.DateTimeFormat(undefined, { month: "long" }),
  monthYear: new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }),
  monthShort: new Intl.DateTimeFormat(undefined, { month: "short" }),
  weekdayNarrow: new Intl.DateTimeFormat(undefined, { weekday: "narrow" }),
  day: new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }),
  full: new Intl.DateTimeFormat(undefined, { dateStyle: "full" }),
};

// ---- The app --------------------------------------------------------------------

/**
 * Calendar, as iOS lays it out: a scrolling month view with week numbers,
 * a year of mini months behind it, and a day view in front. Each level zooms
 * out of the month or day it was opened from, as Calendar's do. The one
 * event is an intro call, on any weekday from today, which opens my booking
 * page; "+" books one too, and Today brings the view back to today.
 */
export default function CalendarApp(_: AppProps) {
  const today = useMinute() ?? new Date();
  const start = useMemo(firstWeekday, []);
  const [view, setView] = useState<View>("month");
  const [selected, setSelected] = useState(() => atMidnight(new Date()));
  /** The month the month view opens at. */
  const [focus, setFocus] = useState(() => atMidnight(new Date()));
  /** Where the next level zooms from, in the app's pixels, and which way. */
  const [zoom, setZoom] = useState<{
    x: number;
    y: number;
    out: boolean;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const viewRef = useLatest(view);

  const go = (next: View, from: HTMLElement | null, out: boolean) => {
    const root = rootRef.current;
    if (root && from) {
      const r = from.getBoundingClientRect();
      const box = root.getBoundingClientRect();
      const k = box.width / (root.offsetWidth || 1) || 1;
      setZoom({
        x: (r.left + r.width / 2 - box.left) / k,
        y: (r.top + r.height / 2 - box.top) / k,
        out,
      });
    } else {
      setZoom(null);
    }
    setView(next);
  };

  // Escape climbs back from a day to its month before the phone's own
  // handler closes the app.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || viewRef.current !== "day") {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setZoom(null);
      setView("month");
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  const zoomStyle = zoom
    ? ({
        "--zoom-x": `${zoom.x}px`,
        "--zoom-y": `${zoom.y}px`,
      } as CSSProperties)
    : undefined;
  const zoomClass = zoom
    ? zoom.out
      ? styles.calZoomOut
      : styles.calZoomIn
    : styles.calFade;

  return (
    <div ref={rootRef} className={styles.calendar}>
      {/* A fresh element per level, so its entrance runs each time. */}
      <div
        key={view}
        className={cn(styles.calView, zoomClass)}
        style={zoomStyle}
      >
        {view === "year" ? (
          <YearView
            today={today}
            start={start}
            onMonth={(month, el) => {
              setFocus(month);
              go("month", el, false);
            }}
          />
        ) : null}
        {view === "month" ? (
          <MonthView
            today={today}
            start={start}
            focus={focus}
            onYear={(el) => go("year", el, true)}
            onDay={(day, el) => {
              setSelected(day);
              go("day", el, false);
            }}
          />
        ) : null}
        {view === "day" ? (
          <DayView
            today={today}
            start={start}
            selected={selected}
            onSelect={setSelected}
            onMonth={(el) => {
              setFocus(selected);
              go("month", el, true);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

// ---- Shared chrome --------------------------------------------------------------

function BookButton() {
  return (
    <a
      href={SITE.contact.booking}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(styles.glassButton, styles.calAdd)}
      aria-label={`${IPHONE_COPY.calendarEvent} (opens booking page)`}
    >
      <PlusGlyph />
    </a>
  );
}

function TodayButton({ onToday }: { onToday: () => void }) {
  return (
    <div className={cn(styles.floatingBar, styles.calToolbar)}>
      <button
        type="button"
        className={cn(styles.pill, styles.calToday)}
        onClick={onToday}
      >
        Today
      </button>
    </div>
  );
}

function Weekdays({ start }: { start: number }) {
  // Any week will do for the names: 4 January 2026 was a Sunday.
  const names = Array.from({ length: 7 }, (_, i) =>
    formats.weekdayNarrow.format(new Date(2026, 0, 4 + (start % 7) + i)),
  );
  return (
    <div className={styles.calWeekdays} aria-hidden>
      {names.map((name, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: narrow names repeat (S, S)
        <span key={i}>{name}</span>
      ))}
    </div>
  );
}

// ---- Month view -----------------------------------------------------------------

/** Months shown either side of today. */
const MONTHS_BEFORE = 6;
const MONTHS_AFTER = 12;

function MonthView({
  today,
  start,
  focus,
  onYear,
  onDay,
}: {
  today: Date;
  start: number;
  focus: Date;
  onYear: (from: HTMLElement) => void;
  onDay: (day: Date, from: HTMLElement) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const sections = useRef(new Map<string, HTMLElement>());
  const [title, setTitle] = useState(focus);
  // Six months back to a year on from today, widened to take in the month
  // it opens at (any month of the year view, or a day swiped far away).
  const year = today.getFullYear();
  const month = today.getMonth();
  const focusIndex =
    (focus.getFullYear() - year) * 12 + focus.getMonth() - month;
  const from = Math.min(-MONTHS_BEFORE, focusIndex - 1);
  const to = Math.max(MONTHS_AFTER, focusIndex + 2);
  const months = useMemo(
    () =>
      Array.from(
        { length: to - from + 1 },
        (_, i) => new Date(year, month + from + i, 1),
      ),
    [year, month, from, to],
  );

  const scrollTo = (date: Date, smooth: boolean) => {
    const el = sections.current.get(monthKey(date));
    const box = scroller.current;
    if (el && box) {
      box.scrollTo({
        top: el.offsetTop,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  // Open at the focused month.
  // biome-ignore lint/correctness/useExhaustiveDependencies: only on open
  useLayoutEffect(() => {
    scrollTo(focus, false);
  }, []);

  /** The large title follows the month at the top of the list. */
  const onScroll = () => {
    const box = scroller.current;
    if (!box) {
      return;
    }
    const line = box.scrollTop + 60;
    let current = months[0];
    for (const m of months) {
      const el = sections.current.get(monthKey(m));
      if (el && el.offsetTop <= line) {
        current = m;
      }
    }
    if (current && monthKey(current) !== monthKey(title)) {
      setTitle(current);
    }
  };

  return (
    <>
      <div className={styles.calBar}>
        <button
          type="button"
          className={cn(styles.pill, styles.calendarBack)}
          onClick={(event) => onYear(event.currentTarget)}
        >
          <BackChevron width={10} height={17} />
          {title.getFullYear()}
        </button>
        <BookButton />
      </div>
      <h1 className={styles.calTitle} aria-live="polite">
        {formats.month.format(title)}
      </h1>
      <Weekdays start={start} />
      <div ref={scroller} className={styles.calMonths} onScroll={onScroll}>
        {months.map((m) => (
          <MonthGrid
            key={monthKey(m)}
            month={m}
            today={today}
            start={start}
            sectionRef={(el) => {
              if (el) {
                sections.current.set(monthKey(m), el);
              }
            }}
            onDay={onDay}
          />
        ))}
      </div>
      <TodayButton
        onToday={() => {
          setTitle(today);
          scrollTo(today, true);
        }}
      />
    </>
  );
}

/** The month view's row heights, as `.calMonthName` and `.calDay` draw
 * them. */
const MONTH_HEAD = 48;
const WEEK_ROW = 64;

function MonthGrid({
  month,
  today,
  start,
  sectionRef,
  onDay,
}: {
  month: Date;
  today: Date;
  start: number;
  sectionRef: (el: HTMLElement | null) => void;
  onDay: (day: Date, from: HTMLElement) => void;
}) {
  const weeks = monthWeeks(month.getFullYear(), month.getMonth(), start);
  const firstColumn = Math.max(0, weeks[0]?.findIndex(Boolean) ?? 0);
  const current =
    month.getFullYear() === today.getFullYear() &&
    month.getMonth() === today.getMonth();
  return (
    <section
      ref={sectionRef}
      className={styles.calMonth}
      // Its exact height, so months off screen can skip layout without the
      // list's scroll positions moving: the name row, then each week.
      style={{
        containIntrinsicSize: `auto ${MONTH_HEAD + weeks.length * WEEK_ROW}px`,
      }}
      aria-label={formats.monthYear.format(month)}
    >
      {/* The month's name sits over its first day, as in Calendar. */}
      <div className={styles.calWeek} aria-hidden>
        <span />
        <span
          className={cn(styles.calMonthName, current && styles.calMonthNow)}
          style={{ gridColumnStart: firstColumn + 2 }}
        >
          {formats.monthShort.format(month)}
        </span>
      </div>
      {weeks.map((week) => {
        const first = week.find(Boolean) as Date;
        // The ISO week is the one its Thursday is in, which holds for
        // Sunday-first rows too.
        const thursday = week.find((d) => d?.getDay() === 4) ?? first;
        return (
          <div key={first.getTime()} className={styles.calWeek}>
            <span className={styles.calWeekNumber} aria-hidden>
              {isoWeek(thursday)}
            </span>
            {week.map((day, i) =>
              day ? (
                <DayCell
                  key={day.getTime()}
                  day={day}
                  today={today}
                  onDay={onDay}
                />
              ) : (
                // biome-ignore lint/suspicious/noArrayIndexKey: empty cells before the 1st and after the last
                <span key={i} />
              ),
            )}
          </div>
        );
      })}
    </section>
  );
}

function DayCell({
  day,
  today,
  onDay,
}: {
  day: Date;
  today: Date;
  onDay: (day: Date, from: HTMLElement) => void;
}) {
  const isToday = sameDay(day, today);
  const open = bookable(day, today);
  return (
    <button
      type="button"
      className={cn(
        styles.calDay,
        isWeekend(day) && styles.calDayWeekend,
        isToday && styles.calDayToday,
      )}
      onClick={(event) => onDay(day, event.currentTarget)}
      aria-label={`${formats.full.format(day)}${open ? `, ${IPHONE_COPY.calendarEvent}` : ""}`}
      aria-current={isToday ? "date" : undefined}
    >
      <span className={styles.calDayNumber}>{day.getDate()}</span>
      {open ? <span className={styles.calDot} aria-hidden /> : null}
    </button>
  );
}

// ---- Year view ------------------------------------------------------------------

function YearView({
  today,
  start,
  onMonth,
}: {
  today: Date;
  start: number;
  onMonth: (month: Date, from: HTMLElement) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const years = [today.getFullYear(), today.getFullYear() + 1];

  // This month in view: the year list's own scroll, not the page's.
  useLayoutEffect(() => {
    const box = ref.current;
    const now = box?.querySelector<HTMLElement>(`.${styles.calMiniNow}`);
    if (box && now) {
      box.scrollTop =
        now.offsetTop - box.offsetTop - box.clientHeight / 2 + now.offsetHeight;
    }
  }, []);

  return (
    <div ref={ref} className={styles.calYears}>
      {years.map((year) => (
        <section key={year} aria-label={String(year)}>
          <h1
            className={cn(
              styles.calYearTitle,
              year === today.getFullYear() && styles.calYearNow,
            )}
          >
            {year}
          </h1>
          <div className={styles.calMinis}>
            {Array.from({ length: 12 }, (_, m) => new Date(year, m, 1)).map(
              (month) => (
                <MiniMonth
                  key={month.getTime()}
                  month={month}
                  today={today}
                  start={start}
                  onMonth={onMonth}
                />
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

function MiniMonth({
  month,
  today,
  start,
  onMonth,
}: {
  month: Date;
  today: Date;
  start: number;
  onMonth: (month: Date, from: HTMLElement) => void;
}) {
  const current =
    month.getFullYear() === today.getFullYear() &&
    month.getMonth() === today.getMonth();
  return (
    <button
      type="button"
      className={cn(styles.calMini, current && styles.calMiniNow)}
      onClick={(event) => onMonth(month, event.currentTarget)}
      aria-label={formats.monthYear.format(month)}
    >
      <span className={styles.calMiniName}>
        {formats.monthShort.format(month)}
      </span>
      <span className={styles.calMiniGrid} aria-hidden>
        {monthWeeks(month.getFullYear(), month.getMonth(), start)
          .flat()
          .map((day, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: a fixed grid of cells
              key={i}
              className={cn(day && sameDay(day, today) && styles.calMiniToday)}
            >
              {day ? day.getDate() : ""}
            </span>
          ))}
      </span>
    </button>
  );
}

// ---- Day view -------------------------------------------------------------------

function DayView({
  today,
  start,
  selected,
  onSelect,
  onMonth,
}: {
  today: Date;
  start: number;
  selected: Date;
  onSelect: (day: Date) => void;
  onMonth: (from: HTMLElement) => void;
}) {
  const [slide, setSlide] = useState<"next" | "prev" | null>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const week = weekOf(selected, start);

  const pick = (day: Date) => {
    // In whole days, so a daylight-saving week still counts as seven.
    const moved = Math.round((day.getTime() - (week[0]?.getTime() ?? 0)) / DAY);
    setSlide(moved < 0 ? "prev" : moved >= 7 ? "next" : null);
    onSelect(day);
  };

  return (
    <>
      <div className={styles.calBar}>
        <button
          type="button"
          className={cn(styles.pill, styles.calendarBack)}
          onClick={(event) => onMonth(event.currentTarget)}
        >
          <BackChevron width={10} height={17} />
          {formats.month.format(selected)}
        </button>
        <BookButton />
      </div>
      <Weekdays start={start} />
      {/* Swipe the week sideways for the next or last one, as in Calendar. */}
      <div
        key={`week-${week[0]?.getTime()}`}
        className={cn(
          styles.calStrip,
          slide === "next" && styles.calStripNext,
          slide === "prev" && styles.calStripPrev,
        )}
        onPointerDown={(event) => {
          swipe.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerUp={(event) => {
          const s = swipe.current;
          swipe.current = null;
          const dx = s ? event.clientX - s.x : 0;
          const dy = s ? event.clientY - s.y : 0;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
            pick(addDays(selected, dx < 0 ? 7 : -7));
          }
        }}
      >
        {week.map((day) => (
          <button
            key={day.getTime()}
            type="button"
            className={cn(
              styles.calStripDay,
              isWeekend(day) && styles.calDayWeekend,
              sameDay(day, today) && styles.calStripToday,
              sameDay(day, selected) && styles.calStripSelected,
            )}
            onClick={() => pick(day)}
            aria-label={formats.full.format(day)}
            aria-pressed={sameDay(day, selected)}
          >
            {day.getDate()}
          </button>
        ))}
      </div>
      <div key={`day-${selected.getTime()}`} className={styles.calDayBody}>
        <h2 className={styles.dayTitle}>{formats.day.format(selected)}</h2>
        <DayEvents day={selected} today={today} />
      </div>
      <TodayButton onToday={() => pick(atMidnight(today))} />
    </>
  );
}

function DayEvents({ day, today }: { day: Date; today: Date }) {
  if (!bookable(day, today)) {
    return <p className={styles.calEmpty}>No Events</p>;
  }
  return (
    <>
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
    </>
  );
}
