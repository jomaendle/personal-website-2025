"use client";

import {
  animate,
  m,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import type { NoteSummary } from "@/lib/iphone-notes";
import {
  IPHONE_COPY,
  type IphoneAppId,
  lockNotifications,
} from "@/lib/state/iphone-copy";
import { PHOTOS, WALLPAPER } from "@/lib/state/photos";
import { AppWindow } from "./app-window";
import { APPS, type AppLaunch, preloadAllApps } from "./apps";
import { IphoneDataProvider } from "./data";
import { Battery, Signal, Wifi } from "./glyphs";
import { HomeScreen } from "./home-screen";
import styles from "./iphone.module.css";
import { LockScreen } from "./lock-screen";
import {
  clamp,
  FADE,
  lerp,
  type Rect,
  rectWithin,
  SPRING_CLOSE,
  SPRING_OPEN,
  SPRING_UNLOCK,
} from "./motion";
import { MusicProvider } from "./music/player";
import { DynamicIsland } from "./music/system-ui";
import { APP_KEY, SEEN_KEY, store, UNLOCKED_KEY } from "./persist";
import { Spotlight } from "./spotlight";
import { formatClock, formatWeekday, useMinute } from "./use-clock";

/** An app icon (on the home screen, or a Spotlight app result), as opposed
 * to a widget, a song's cover or a contact's monogram, which cross-fade. */
const isAppIcon = (el: HTMLElement) => el.classList.contains(styles.icon ?? "");

interface Geometry {
  w: number;
  h: number;
  scale: number;
  /** The screen's corner radius: 55 in the device frame, 0 full-screen. */
  radius: number;
  /** The icon (or widget) the current app came out of, or is going home
   * to. */
  origin: Rect;
  /** Where it was headed before a retarget, blended into `origin` by the
   * `homing` motion value so a changed destination doesn't jump. */
  previous: Rect;
  /** Whether that was an app icon, whose art covers the window early on. A
   * widget instead cross-fades straight into the app. */
  fromIcon: boolean;
}

/** The destination now: the origin, or partway to it from a previous one
 * while a retargeted close blends over (`t` from 0 to 1). */
function originAt(g: Geometry, t: number): Rect {
  const { origin, previous } = g;
  const k = clamp(t, 0, 1);
  if (k === 1) {
    return origin;
  }
  return {
    x: lerp(previous.x, origin.x, k),
    y: lerp(previous.y, origin.y, k),
    size: lerp(previous.size, origin.size, k),
    height: lerp(previous.height, origin.height, k),
    radius: lerp(previous.radius, origin.radius, k),
  };
}

interface IphoneProps {
  /** The articles as Notes, newest first, parsed on the server. */
  notes: NoteSummary[];
  /** Each library photo's file size, read from disk at build. */
  photoBytes: number[];
}

interface OpenOptions {
  /** The icon or widget it opens out of; the app's own icon by default. */
  from?: HTMLElement;
  /** Open without the zoom, as when restoring a return visit. */
  instant?: boolean;
  /** Where inside the app to land (a note, for the Notes widget). */
  launch?: AppLaunch;
}

export function Iphone({ notes, photoBytes }: IphoneProps) {
  const screenRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLDivElement>(null);
  const unlockButtonRef = useRef<HTMLButtonElement>(null);
  const icons = useRef(new Map<IphoneAppId, HTMLElement>());
  const geometry = useRef<Geometry>({
    w: 402,
    h: 874,
    scale: 1,
    radius: 0,
    origin: { x: 170, y: 406, size: 62, height: 62, radius: 14 },
    previous: { x: 170, y: 406, size: 62, height: 62, radius: 14 },
    fromIcon: true,
  });
  const closing = useRef(false);
  /** What opened the current app (an icon, a widget), to focus on close. */
  const opener = useRef<HTMLElement | null>(null);
  /** What the app zoomed out of (an icon, a widget), to zoom back into. */
  const originEl = useRef<HTMLElement | null>(null);
  /** The icon the app came out of, hidden while the app is its stand-in. */
  const source = useRef<HTMLElement | null>(null);

  const reduced = useReducedMotion() ?? false;
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  const [locked, setLocked] = useState(true);
  const lockedRef = useRef(locked);
  lockedRef.current = locked;
  const [app, setApp] = useState<IphoneAppId | null>(null);
  /** The app is on its way home: the home screen already takes taps. */
  const [closingApp, setClosingApp] = useState(false);
  const [launch, setLaunch] = useState<AppLaunch | undefined>(undefined);
  const [spotlight, setSpotlight] = useState(false);
  /** Spotlight fading out: still drawn, no longer taking input. */
  const [spotlightLeaving, setSpotlightLeaving] = useState(false);
  /** The swipe down into Spotlight: drawn while the finger pulls it in,
   * its opacity following the pull, before it's committed. */
  const [searchPulling, setSearchPulling] = useState(false);
  /** Whether this Spotlight came in by a pull (its opacity is the pull's
   * motion value, not the CSS entrance). */
  const [pulled, setPulled] = useState(false);
  const spotlightLeavingRef = useRef(spotlightLeaving);
  spotlightLeavingRef.current = spotlightLeaving;
  /** The side button: the display goes dark for a moment while the phone
   * locks under it, as iOS turns the screen off rather than sliding. */
  const [screenOff, setScreenOff] = useState(false);
  /** A fresh Spotlight each time, even reopened mid-fade: a new query and
   * its own focus, not the fading one's. */
  const [spotlightKey, setSpotlightKey] = useState(0);
  const spotlightRef = useRef(spotlight);
  spotlightRef.current = spotlight;
  const spotlightInput = useRef<HTMLInputElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  /** Notifications already opened this visit, which the lock screen drops. */
  const [seen, setSeen] = useState<IphoneAppId[]>([]);
  const appRef = useRef(app);
  appRef.current = app;

  // Stable, so a clock tick doesn't re-render every app reading it.
  const data = useMemo(() => ({ notes, photoBytes }), [notes, photoBytes]);
  const now = useMinute();
  const calendar = now
    ? { weekday: formatWeekday(now), day: now.getDate() }
    : null;

  // ---- The motion graph ------------------------------------------------
  // Gestures write these directly; nothing below re-renders React while a
  // finger is down. Everything they drive is transform, opacity or clip-path.

  /** 0 locked → 1 home screen. */
  const unlock = useMotionValue(0);
  /** 0 at the icon → 1 full screen. */
  const open = useMotionValue(0);
  /** The home-indicator drag: how far pulled into a card, and its offset. */
  const pull = useMotionValue(0);
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  /** 0 at the old destination of a retargeted close, 1 at the new one. */
  const homing = useMotionValue(1);

  const lockY = useTransform(unlock, (u) =>
    reducedRef.current ? 0 : -u * geometry.current.h,
  );
  const lockFade = useTransform(unlock, (u) =>
    reducedRef.current ? 1 - u : clamp(1 - u * 1.6, 0, 1),
  );
  const lockOpacity = useTransform(unlock, (u) =>
    reducedRef.current ? clamp(1 - u, 0, 1) : 1,
  );
  const statusTimeOpacity = useTransform(unlock, [0.4, 1], [0, 1]);
  const wallpaperDim = useTransform(unlock, [0, 1], [0, 0.14]);
  // Home zooms in from slightly large as the lock screen lifts, and leans
  // toward the reader while an app opens over it.
  // Pulling the app into a card settles the home screen back as it goes.
  const homeScale = useTransform(
    [unlock, open, pull],
    ([u = 0, a = 0, p = 0]: number[]) =>
      reducedRef.current
        ? 1
        : (1 + 0.16 * (1 - u)) * (1 + 0.08 * clamp(a, 0, 1) * (1 - p)),
  );
  const gridOpacity = useTransform(unlock, (u) => clamp(u * 1.4 - 0.2, 0, 1));
  // The dock and Search pill come in with the icons, rising a little as
  // the grid settles from its zoom, not sliding up from below the screen.
  const bottomY = useTransform(unlock, (u) =>
    reducedRef.current ? 0 : (1 - u) * 60,
  );
  const bottomOpacity = useTransform(unlock, (u) =>
    reducedRef.current ? u : clamp(u * 1.4 - 0.2, 0, 1),
  );
  const appDim = useTransform(
    [open, pull],
    ([a = 0, p = 0]: number[]) => 0.5 * clamp(a, 0, 1) * (1 - p),
  );

  /**
   * The zoom out of the icon. At 0 the app is scaled to the icon's width,
   * centred on it, and clipped to a square with the icon's corner radius;
   * at 1 it fills the screen. The card drag shrinks it on top of that and
   * rounds its corners. One uniform scale throughout, so text never
   * stretches.
   */
  const appTransform = useTransform(
    [open, pull, dragX, dragY, homing],
    ([a = 0, p = 0, dx = 0, dy = 0]: number[]) => {
      if (reducedRef.current) {
        return "none";
      }
      const { w, h } = geometry.current;
      const origin = originAt(geometry.current, homing.get());
      const s0 = origin.size / w;
      const scale = lerp(s0, 1, a) * (1 - 0.45 * p);
      const cx = lerp(origin.x + origin.size / 2, w / 2, a) + dx;
      const cy = lerp(origin.y + origin.height / 2, h / 2, a) + dy;
      return `translate3d(${cx - w / 2}px, ${cy - h / 2}px, 0) scale(${scale})`;
    },
  );
  const appClip = useTransform(
    [open, pull, homing],
    ([a = 0, p = 0]: number[]) => {
      if (reducedRef.current) {
        return "none";
      }
      const { w, radius } = geometry.current;
      const origin = originAt(geometry.current, homing.get());
      const s0 = origin.size / w;
      const scale = lerp(s0, 1, a) * (1 - 0.45 * p);
      // The spring's bounce past the icon squishes the scale only: clamped,
      // the clip keeps the icon's shape instead of flattening at the end.
      const ac = clamp(a, 0, 1);
      const inset = startInset() * (1 - ac);
      // Radii are in the app's own pixels, so divide out the scale to land on
      // the icon's radius at 0 and a card's ~40pt while dragging.
      const r = Math.max(
        lerp(origin.radius / s0, radius, ac),
        (Math.min(1, p * 5) * 40) / scale,
      );
      return `inset(${inset}px 0px round ${r}px)`;
    },
  );
  const appOpacity = useTransform(open, (a) => {
    if (reducedRef.current) {
      return a;
    }
    // Out of a widget the app fades in over the widget as it grows, and
    // back out onto it on the way home.
    return geometry.current.fromIcon ? 1 : clamp(a / 0.3, 0, 1);
  });
  /** The icon art covers the window as it grows, as iOS scales the icon's
   * snapshot with the window, rather than sitting as a square in its middle. */
  const iconScale = useTransform([open, homing], ([a = 0]: number[]) => {
    const { w, h } = geometry.current;
    const start = h - 2 * startInset();
    return (start + (h - start) * a) / w;
  });
  /** True while the app window zooms or is dragged as a card. */
  const appMoving = useTransform(
    [open, pull],
    ([a = 0, p = 0]: number[]) => a < 0.999 || p > 0.001,
  );
  // The icon hands over to the app early, eased so it doesn't dip linearly.
  const iconOpacity = useTransform(open, (a) => {
    if (reducedRef.current || !geometry.current.fromIcon) {
      return 0;
    }
    const t = clamp((a - 0.04) / 0.26, 0, 1);
    return 1 - t * t * (3 - 2 * t);
  });

  // ---- Geometry ----------------------------------------------------------

  /** How far the clip is inset top and bottom at the start of the zoom, in
   * the app's own pixels: what makes the full-screen window icon-shaped. */
  function startInset() {
    const { w, h } = geometry.current;
    const origin = originAt(geometry.current, homing.get());
    const s0 = origin.size / w;
    return Math.max(0, (h - origin.height / s0) / 2);
  }

  const measure = useCallback(() => {
    const screen = screenRef.current;
    const g = geometry.current;
    if (screen) {
      g.w = screen.clientWidth;
      g.h = screen.clientHeight;
      g.scale = screen.getBoundingClientRect().height / g.h || 1;
      g.radius =
        Number.parseFloat(getComputedStyle(screen).borderTopLeftRadius) || 0;
    }
    return g;
  }, []);

  const registerIcon = useCallback(
    (id: IphoneAppId, el: HTMLElement | null) => {
      if (el) {
        icons.current.set(id, el);
      } else {
        icons.current.delete(id);
      }
    },
    [],
  );

  // ---- Lock and unlock --------------------------------------------------

  const settleLock = useCallback(
    (to: 0 | 1, velocity = 0, fromKeyboard = false) => {
      const root = document.documentElement;
      if (to === 1) {
        store.set(UNLOCKED_KEY, "1");
        const focusWasOnLock =
          lockedRef.current &&
          document.activeElement instanceof HTMLElement &&
          document.activeElement !== document.body;
        setLocked(false);
        if (focusWasOnLock) {
          // The lock screen just went inert under the focused button.
          requestAnimationFrame(() =>
            homeRef.current?.focus({ preventScroll: true }),
          );
        }
      } else {
        store.set(UNLOCKED_KEY, null);
        // Not removed: without the attribute the page would replay its
        // wake-up animation over the lock screen sliding down.
        root.dataset.iphone = "locked";
        setLocked(true);
        // Focus lands on the unlock button either way; its ring only shows
        // when the lock came from the keyboard, not from a click.
        requestAnimationFrame(() =>
          unlockButtonRef.current?.focus({
            preventScroll: true,
            focusVisible: fromKeyboard,
          }),
        );
      }
      animate(
        unlock,
        to,
        reducedRef.current ? FADE : { ...SPRING_UNLOCK, velocity },
      ).then(() => {
        if (to === 1 && !lockedRef.current) {
          root.dataset.iphone = "home";
        }
      });
    },
    [unlock],
  );

  // ---- Apps --------------------------------------------------------------

  /** iOS lifts the icon off the home screen into the app: hide the one the
   * app came out of until it lands back in it. Icons only; a widget stays. */
  const hideSource = useCallback((icon: HTMLElement | null) => {
    if (source.current) {
      source.current.style.visibility = "";
    }
    source.current =
      icon?.classList.contains(styles.icon ?? "") &&
      !icon.closest("[role=dialog]")
        ? icon
        : null;
    if (source.current) {
      source.current.style.visibility = "hidden";
    }
  }, []);

  /**
   * Close into something that is on screen. The app came out of a Spotlight
   * result, or a lock-screen card, that is gone by now: go home into the
   * app's own icon instead, as iOS does, blending the destination over so
   * an interrupted launch doesn't jump.
   */
  const retarget = useCallback(
    (id: IphoneAppId) => {
      const screen = screenRef.current;
      // Not the opener: a widget's opener is one of its rows, or none.
      const from = originEl.current;
      const home = homeRef.current;
      // Still locked (closed mid-launch from a banner): back into it.
      if (
        !screen ||
        lockedRef.current ||
        (from?.isConnected && home?.contains(from))
      ) {
        return;
      }
      const icon = icons.current.get(id);
      if (!icon) {
        return;
      }
      // Blend from where it was headed, over the close, rather than jump:
      // the transform weights the destination by how closed the app is.
      geometry.current.previous = originAt(geometry.current, homing.get());
      geometry.current.origin = rectWithin(icon, screen);
      geometry.current.fromIcon = isAppIcon(icon);
      originEl.current = icon;
      opener.current = icon.closest("button");
      hideSource(icon);
      homing.jump(0);
      animate(homing, 1, reducedRef.current ? FADE : SPRING_CLOSE);
    },
    [hideSource, homing],
  );

  const openApp = useCallback(
    (id: IphoneAppId, { from, instant = false, launch }: OpenOptions = {}) => {
      const screen = screenRef.current;
      const icon = from ?? icons.current.get(id);
      // A closing app can be interrupted by the next launch, as on iOS.
      if (!(screen && icon) || (appRef.current && !closing.current)) {
        return;
      }
      APPS[id].load();
      measure();
      geometry.current.origin = rectWithin(icon, screen);
      geometry.current.previous = geometry.current.origin;
      homing.jump(1);
      geometry.current.fromIcon = isAppIcon(icon);
      originEl.current = icon;
      opener.current = icon.closest("button");
      hideSource(icon);
      // jump(), not set(): it also stops a spring still running from the
      // last app, which set() would leave fighting this one.
      pull.jump(0);
      dragX.jump(0);
      dragY.jump(0);
      open.jump(instant ? 1 : 0);
      closing.current = false;
      setClosingApp(false);
      store.set(APP_KEY, id);
      setLaunch(launch);
      setApp(id);
      if (!instant) {
        // Start on the next frame, after React has mounted the app: started
        // now, the spring's clock would run through the mount, and on a slow
        // phone the first frame drawn would already be a third of the way open.
        requestAnimationFrame(() => {
          if (appRef.current === id && !closing.current) {
            animate(open, 1, reducedRef.current ? FADE : SPRING_OPEN);
          }
        });
      }
    },
    [measure, open, pull, dragX, dragY, hideSource, homing],
  );

  /** Home. `velocity` is a card flick's upward speed (unscaled px per ms),
   * which the springs carry on from; anything else (a click event, from a
   * button using this as its handler) counts as none. */
  const closeApp = useCallback(
    (velocity?: unknown) => {
      const v = typeof velocity === "number" ? Math.max(0, velocity) : 0;
      const id = appRef.current;
      if (!id || closing.current) {
        return;
      }
      closing.current = true;
      setClosingApp(true);
      store.set(APP_KEY, null);
      retarget(id);
      const reduced = reducedRef.current;
      const transition = reduced ? FADE : SPRING_CLOSE;
      const { h } = geometry.current;
      // The flick's speed goes on what the finger was driving: the pull into a
      // card and its rise. Put on `open`, it would also swing the card toward
      // the icon, and the card would turn back down the moment it's let go.
      animate(
        pull,
        0,
        reduced ? FADE : { ...SPRING_CLOSE, velocity: (v * 1000) / (h * 0.5) },
      );
      animate(dragX, 0, transition);
      // The card keeps rising a touch with the flick, then goes home.
      animate(
        dragY,
        0,
        reduced ? FADE : { ...SPRING_CLOSE, velocity: -v * 1000 * 0.55 },
      );
      animate(open, 0, transition).then(() => {
        if (!closing.current) {
          return;
        }
        closing.current = false;
        setClosingApp(false);
        setApp(null);
        hideSource(null);
        requestAnimationFrame(() => {
          // Back to whatever opened it: the widget, the icon, or for an app
          // opened from the lock screen, its icon on the home screen.
          const target =
            opener.current?.isConnected &&
            homeRef.current?.contains(opener.current)
              ? opener.current
              : (icons.current.get(id)?.closest("button") ?? homeRef.current);
          target?.focus({ preventScroll: true });
        });
      });
    },
    [open, pull, dragX, dragY, retarget, hideSource],
  );

  /** Back to full screen, carrying the release speed (down is negative). */
  const cancelDrag = useCallback(
    (velocity = 0) => {
      const { h } = geometry.current;
      animate(pull, 0, {
        ...SPRING_OPEN,
        velocity: (velocity * 1000) / (h * 0.5),
      });
      animate(dragX, 0, SPRING_OPEN);
      animate(dragY, 0, { ...SPRING_OPEN, velocity: -velocity * 1000 * 0.55 });
      // A drag that caught a launch mid-way finishes the launch.
      animate(open, 1, SPRING_OPEN);
    },
    [pull, dragX, dragY, open],
  );

  /**
   * Open an app from the lock screen, as iOS does: it grows out of the
   * banner (or card, or button) that was tapped, over the lock screen, and
   * the phone unlocks underneath once the app covers it. Opening a
   * notification clears it, then too, so the banner doesn't vanish from
   * under the app as it starts to grow.
   */
  const openFromLock = useCallback(
    (id: IphoneAppId, launch?: AppLaunch, from?: HTMLElement) => {
      openApp(id, { launch, from });
      const done = open.on("change", (a) => {
        if (a < 0.999) {
          return;
        }
        done();
        if (appRef.current !== id || closing.current) {
          return;
        }
        store.set(UNLOCKED_KEY, "1");
        unlock.jump(1);
        setLocked(false);
        document.documentElement.dataset.iphone = "home";
        setSeen((list) => {
          const next = list.includes(id) ? list : [...list, id];
          store.set(SEEN_KEY, JSON.stringify(next));
          return next;
        });
      });
      // Closed before it got there: it goes back into the lock screen.
      setTimeout(done, 2000);
    },
    [openApp, open, unlock],
  );

  // ---- Spotlight ------------------------------------------------------------

  const openSpotlight = useCallback((focus: boolean) => {
    // Flushed and focused inside the tap, or iOS won't raise the keyboard.
    flushSync(() => {
      // Reopened while still fading out: carry on from where it is rather
      // than start a fresh one from nothing.
      if (!spotlightLeavingRef.current) {
        setSpotlightKey((key) => key + 1);
        setPulled(false);
      }
      setSpotlightLeaving(false);
      setSpotlight(true);
    });
    if (focus) {
      spotlightInput.current?.focus({ preventScroll: true });
    }
  }, []);

  const searchPull = useMotionValue(0);
  const onSearchPull = useCallback(
    (phase: "start" | "end", velocity = 0) => {
      if (phase === "start") {
        searchPull.jump(0);
        setSpotlightKey((key) => key + 1);
        setSpotlightLeaving(false);
        setPulled(true);
        setSearchPulling(true);
        return;
      }
      // Far enough, or flicked down: it comes in; otherwise back out.
      const commit = searchPull.get() > 0.35 || velocity > 0.3;
      const spring = {
        type: "spring" as const,
        visualDuration: 0.35,
        bounce: 0,
        velocity: (velocity * 1000) / 140,
      };
      if (commit) {
        setSearchPulling(false);
        setSpotlight(true);
        animate(searchPull, 1, reducedRef.current ? FADE : spring);
      } else {
        animate(searchPull, 0, reducedRef.current ? FADE : spring).then(() => {
          setSearchPulling(false);
        });
      }
    },
    [searchPull],
  );

  const closeSpotlight = useCallback(() => {
    flushSync(() => {
      setSpotlight(false);
      setSpotlightLeaving(true);
    });
    searchButton.current?.focus({ preventScroll: true });
  }, []);

  const launchFromSpotlight = useCallback(
    (id: IphoneAppId, options: { from: HTMLElement; launch?: AppLaunch }) => {
      // Measure the result's icon before Spotlight goes away with it.
      openApp(id, options);
      setSpotlight(false);
      // It fades out under the app as the app zooms over it.
      setSpotlightLeaving(true);
    },
    [openApp],
  );

  // ---- Effects ------------------------------------------------------------

  // Restore a return visit before paint: home screen, and the app that was
  // open when the reader followed a link out of it.
  useLayoutEffect(() => {
    if (!store.get(UNLOCKED_KEY)) {
      return;
    }
    // The lock screen's resting offset is the screen's height.
    measure();
    unlock.set(1);
    setLocked(false);
    document.documentElement.dataset.iphone = "home";
    try {
      const seenBefore = JSON.parse(store.get(SEEN_KEY) ?? "[]");
      if (Array.isArray(seenBefore)) {
        setSeen(seenBefore);
      }
    } catch {
      // A malformed value: show every notification again.
    }
    const lastApp = store.get(APP_KEY) as IphoneAppId | null;
    if (lastApp && lastApp in APPS) {
      openApp(lastApp, { instant: true });
    }
    // The motion components hydrate with the server's locked styles and
    // subscribe only after this effect, so they miss the values just set
    // (the grid stayed zoomed, the clock hidden). Once they're listening,
    // nudge each value so every transform derived from it re-applies.
    const frame = requestAnimationFrame(() => {
      for (const value of [unlock, open]) {
        const settled = value.get();
        value.jump(settled - 0.001);
        value.jump(settled);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [unlock, open, openApp, measure]);

  useEffect(
    () => () => document.documentElement.removeAttribute("data-iphone"),
    [],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) {
        return;
      }
      if (spotlightRef.current) {
        closeSpotlight();
      } else {
        closeApp();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeApp, closeSpotlight]);

  // Warm every app's chunk once the phone is unlocked and the main thread
  // has nothing better to do.
  useEffect(() => {
    if (locked) {
      return;
    }
    if ("requestIdleCallback" in window) {
      const handle = requestIdleCallback(preloadAllApps, { timeout: 3000 });
      return () => cancelIdleCallback(handle);
    }
    const handle = setTimeout(preloadAllApps, 1500);
    return () => clearTimeout(handle);
  }, [locked]);

  return (
    <IphoneDataProvider value={data}>
      <MusicProvider>
        <div className={styles.root}>
          <div
            className={styles.ambient}
            style={{ backgroundImage: `url(${WALLPAPER.blurDataURL})` }}
            aria-hidden
          />
          <Link href="/" className={styles.exit}>
            ← {IPHONE_COPY.exitLabel}
          </Link>

          <div className={styles.device}>
            <button
              type="button"
              className={styles.sideButton}
              aria-label={IPHONE_COPY.lockLabel}
              onClick={(event) => {
                const fromKeyboard = event.detail === 0;
                setScreenOff(true);
                // Under the black: put everything away and lock, then let
                // the lock screen come up.
                setTimeout(
                  () => {
                    if (appRef.current) {
                      closing.current = false;
                      // jump() stops an opening spring; set() would let it finish,
                      // leaving the dim layer over the lock screen.
                      open.jump(0);
                      pull.jump(0);
                      dragX.jump(0);
                      dragY.jump(0);
                      setApp(null);
                      setClosingApp(false);
                      hideSource(null);
                      store.set(APP_KEY, null);
                    }
                    // Locking dismisses Spotlight, as on iOS.
                    setSpotlight(false);
                    setSpotlightLeaving(false);
                    // detail is 0 for Enter or Space, the clicks a keyboard makes.
                    settleLock(0, 0, fromKeyboard);
                    unlock.jump(0);
                    setScreenOff(false);
                  },
                  reducedRef.current ? 0 : 140,
                );
              }}
            />

            <main
              ref={screenRef}
              id="main-content"
              tabIndex={-1}
              className={styles.screen}
              aria-label={IPHONE_COPY.deviceName}
              data-spotlight={
                spotlight ? "open" : spotlightLeaving ? "leaving" : undefined
              }
            >
              <div
                className={styles.screenOff}
                data-on={screenOff || undefined}
                aria-hidden
              />
              <Image
                src={WALLPAPER}
                alt=""
                fill
                preload
                placeholder="blur"
                sizes="(min-width: 640px) and (min-height: 640px) 402px, 100vw"
                className={styles.wallpaper}
              />
              <m.div
                className={styles.dim}
                style={{ opacity: wallpaperDim }}
                aria-hidden
              />

              <HomeScreen
                inert={locked || (app !== null && !closingApp) || spotlight}
                searchRef={searchButton}
                onSearch={openSpotlight}
                searchPull={searchPull}
                onSearchPull={onSearchPull}
                calendar={calendar}
                notes={notes.slice(0, 2)}
                homeRef={homeRef}
                registerIcon={registerIcon}
                onOpen={openApp}
                scale={homeScale}
                gridOpacity={gridOpacity}
                bottomY={bottomY}
                bottomOpacity={bottomOpacity}
              />

              {spotlight || spotlightLeaving || searchPulling ? (
                <Spotlight
                  key={spotlightKey}
                  leaving={!(spotlight || searchPulling)}
                  pulling={searchPulling}
                  pull={pulled ? searchPull : undefined}
                  onLeft={() => setSpotlightLeaving(false)}
                  calendar={calendar}
                  inputRef={spotlightInput}
                  onClose={closeSpotlight}
                  onLaunch={launchFromSpotlight}
                />
              ) : null}

              <LockScreen
                locked={locked}
                now={now}
                notifications={lockNotifications(
                  notes[0],
                  PHOTOS.length,
                ).filter((notification) => !seen.includes(notification.app))}
                unlock={unlock}
                lockY={lockY}
                lockFade={lockFade}
                lockOpacity={lockOpacity}
                measure={measure}
                onSettle={settleLock}
                onOpenApp={openFromLock}
                unlockButtonRef={unlockButtonRef}
              />

              <m.div
                className={styles.dim}
                style={{ opacity: appDim, zIndex: 25 }}
                aria-hidden
              />

              {app === null ? null : (
                <AppWindow
                  key={app}
                  leaving={closingApp}
                  launch={launch}
                  id={app}
                  calendar={calendar}
                  transform={appTransform}
                  clipPath={appClip}
                  opacity={appOpacity}
                  moving={appMoving}
                  iconOpacity={iconOpacity}
                  iconScale={iconScale}
                  pull={pull}
                  dragX={dragX}
                  dragY={dragY}
                  measure={measure}
                  screen={screenRef.current}
                  onDragStart={() => open.stop()}
                  onClose={closeApp}
                  onCancelDrag={cancelDrag}
                />
              )}

              <div className={styles.statusBar} aria-hidden>
                <m.span
                  className={styles.statusTime}
                  style={{ opacity: statusTimeOpacity }}
                >
                  {formatClock(now)}
                </m.span>
                <span className={styles.statusIcons}>
                  <Signal />
                  <Wifi />
                  <Battery />
                </span>
              </div>
              <DynamicIsland
                onOpen={(from) => {
                  if (!(appRef.current || lockedRef.current)) {
                    openApp("music", { from, launch: { nowPlaying: true } });
                  }
                }}
              />
            </main>
          </div>
        </div>
      </MusicProvider>
    </IphoneDataProvider>
  );
}
