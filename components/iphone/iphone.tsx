"use client";

import { m, useMotionValue, useReducedMotion } from "framer-motion";
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
import { PHOTOS } from "@/lib/state/photos";
import { AppWindow } from "./app-window";
import { APPS, type AppLaunch, preloadAllApps } from "./apps";
import { BannerHost } from "./banner";
import { type Binding, halt, springTo, useDrive } from "./compositor-spring";
import { IphoneDataProvider } from "./data";
import { Battery, Signal, Wifi } from "./glyphs";
import { HomeScreen } from "./home-screen";
import styles from "./iphone.module.css";
import { type Geometry, LaunchScene, originAt } from "./launch-scene";
import { LockScreen } from "./lock-screen";
import {
  clamp,
  FADE,
  rectWithin,
  SPRING_CLOSE,
  SPRING_OPEN,
  SPRING_UNLOCK,
} from "./motion";
import { MusicProvider } from "./music/player";
import { DynamicIsland } from "./music/system-ui";
import { APP_KEY, SEEN_KEY, store, UNLOCKED_KEY } from "./persist";
import { Spotlight } from "./spotlight";
import { useBattery } from "./use-battery";
import { formatClock, formatWeekday, useMinute } from "./use-clock";
import { useLatest } from "./use-latest";
import { useWallpaper, wallpaperShown } from "./wallpapers";

/** An app icon (on the home screen, or a Spotlight app result), as opposed
 * to a widget, a song's cover or a contact's monogram, which cross-fade. */
const isAppIcon = (el: HTMLElement) => el.classList.contains(styles.icon ?? "");
/** A home-screen widget, which lifts off and grows with the window. */
const isWidget = (el: HTMLElement) =>
  el.classList.contains(styles.widget ?? "");

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
  /** What focus goes back to on the way home, when that isn't a button
   * around `from`: a widget's row, say, when the zoom is the whole widget. */
  opener?: HTMLElement;
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
    fromWidget: false,
  });
  const closing = useRef(false);
  /** What opened the current app (an icon, a widget), to focus on close. */
  const opener = useRef<HTMLElement | null>(null);
  /** What the app zoomed out of (an icon, a widget), to zoom back into. */
  const originEl = useRef<HTMLElement | null>(null);
  /** The icon the app came out of, hidden while the app is its stand-in. */
  const source = useRef<HTMLElement | null>(null);

  const reduced = useReducedMotion() ?? false;
  const reducedRef = useLatest(reduced);

  const [locked, setLocked] = useState(true);
  const lockedRef = useLatest(locked);
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
  /** A pulled-in Spotlight has come to rest, and takes its frosting. */
  const [pullLanded, setPullLanded] = useState(false);
  const spotlightLeavingRef = useLatest(spotlightLeaving);
  /** The side button: the display goes dark for a moment while the phone
   * locks under it, as iOS turns the screen off rather than sliding. */
  const [screenOff, setScreenOff] = useState(false);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => () => clearTimeout(lockTimer.current), []);
  /** A fresh Spotlight each time, even reopened mid-fade: a new query and
   * its own focus, not the fading one's. */
  const [spotlightKey, setSpotlightKey] = useState(0);
  const spotlightRef = useLatest(spotlight);
  const spotlightInput = useRef<HTMLInputElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  /** Notifications already opened this visit, which the lock screen drops. */
  const [seen, setSeen] = useState<IphoneAppId[]>([]);
  // Kept for the visit; written here rather than in the updater, which
  // React may run twice.
  useEffect(() => {
    if (seen.length > 0) {
      store.set(SEEN_KEY, JSON.stringify(seen));
    }
  }, [seen]);
  const appRef = useLatest(app);

  // Stable, so a clock tick doesn't re-render every app reading it.
  const data = useMemo(() => ({ notes, photoBytes }), [notes, photoBytes]);
  const now = useMinute();
  const battery = useBattery();
  const calendar = now
    ? { weekday: formatWeekday(now), day: now.getDate() }
    : null;

  // ---- The motion graph ------------------------------------------------
  // The unlock follows the finger through motion values. The app launch,
  // close and card drag run in the scene, on the compositor (launch-scene).

  /** 0 locked → 1 home screen. */
  const unlock = useMotionValue(0);
  const [scene] = useState(
    () =>
      new LaunchScene(
        () => geometry.current,
        () => reducedRef.current,
      ),
  );

  // ---- Geometry ----------------------------------------------------------

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

  // What the unlock moves: one style per element, written as a finger drags
  // and handed to the compositor once it lets go (useDrive). Home zooms in
  // from slightly large as the lock screen lifts (its lean toward the reader
  // as an app opens is the scene's, on a wrapper); the dock and Search pill
  // come in with the icons, rising a little, not sliding up from below.
  const lockRoot = useRef<HTMLDivElement>(null);
  const lockFace = useRef<HTMLDivElement>(null);
  const homeGrid = useRef<HTMLElement>(null);
  const homeBottom = useRef<HTMLDivElement>(null);
  const statusTime = useRef<HTMLSpanElement>(null);
  const wallDim = useRef<HTMLDivElement>(null);
  const unlockBindings = useCallback((): Binding[] => {
    const reduced = reducedRef.current;
    const { h } = geometry.current;
    const rise = (u: number) => clamp(u * 1.4 - 0.2, 0, 1);
    return [
      {
        el: lockRoot.current,
        style: (u) => ({
          transform: `translateY(${reduced ? 0 : -u * h}px)`,
          opacity: reduced ? clamp(1 - u, 0, 1) : 1,
        }),
      },
      {
        el: lockFace.current,
        style: (u) => ({ opacity: reduced ? 1 - u : clamp(1 - u * 1.6, 0, 1) }),
      },
      {
        el: homeGrid.current,
        style: (u) => ({
          transform: `scale(${reduced ? 1 : 1 + 0.16 * (1 - u)})`,
          opacity: rise(u),
        }),
      },
      {
        el: homeBottom.current,
        style: (u) => ({
          transform: `translateY(${reduced ? 0 : (1 - u) * 60}px)`,
          opacity: reduced ? u : rise(u),
        }),
      },
      {
        el: statusTime.current,
        style: (u) => ({ opacity: clamp((u - 0.4) / 0.6, 0, 1) }),
      },
      {
        el: wallDim.current,
        style: (u) => ({ opacity: 0.14 * clamp(u, 0, 1) }),
      },
    ];
  }, []);
  const [
    lockStyle,
    lockFaceStyle,
    gridStyle,
    bottomStyle,
    statusTimeStyle,
    wallDimStyle,
  ] = useDrive(unlock, unlockBindings);

  const settleLock = useCallback(
    (to: 0 | 1, velocity = 0, fromKeyboard = false) => {
      const root = document.documentElement;
      if (to === 1) {
        store.set(UNLOCKED_KEY, "1");
        const focusWasOnLock =
          lockedRef.current &&
          document.activeElement instanceof HTMLElement &&
          document.activeElement !== document.body;
        // Committed now, not on the scheduler's next task: called from a
        // timer (the side button), the commit could land after the frame
        // that moves focus, onto a layer still inert.
        flushSync(() => setLocked(false));
        if (focusWasOnLock) {
          // The lock screen just went inert under the focused button.
          homeRef.current?.focus({ preventScroll: true });
        }
      } else {
        store.set(UNLOCKED_KEY, null);
        // Not removed: without the attribute the page would replay its
        // wake-up animation over the lock screen sliding down.
        root.dataset.iphone = "locked";
        flushSync(() => setLocked(true));
        // Focus lands on the unlock button either way; its ring only shows
        // when the lock came from the keyboard, not from a click.
        unlockButtonRef.current?.focus({
          preventScroll: true,
          focusVisible: fromKeyboard,
        });
      }
      springTo(unlock, {
        to,
        transition: reducedRef.current ? FADE : SPRING_UNLOCK,
        bindings: unlockBindings(),
        velocity,
      }).then((completed) => {
        if (completed && to === 1 && !lockedRef.current) {
          root.dataset.iphone = "home";
        }
      });
    },
    [unlock, unlockBindings],
  );

  // ---- Apps --------------------------------------------------------------

  /** iOS lifts the icon (or widget) off the home screen into the app: hide
   * the one the app came out of until it lands back in it. */
  const hideSource = useCallback((icon: HTMLElement | null) => {
    if (source.current) {
      source.current.style.visibility = "";
    }
    source.current =
      icon &&
      (isAppIcon(icon) || isWidget(icon)) &&
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
        return false;
      }
      const icon = icons.current.get(id);
      if (!icon) {
        return false;
      }
      // Blend from where it was headed, over the close, rather than jump:
      // the pose weights the destination by `k`, which the close moves.
      geometry.current.previous = originAt(geometry.current, scene.get().k);
      geometry.current.origin = rectWithin(icon, screen);
      geometry.current.fromIcon = isAppIcon(icon);
      geometry.current.fromWidget = false;
      originEl.current = icon;
      opener.current = icon.closest("button");
      hideSource(icon);
      return true;
    },
    [hideSource, scene],
  );

  const openApp = useCallback(
    (
      id: IphoneAppId,
      { from, instant = false, launch, opener: openedBy }: OpenOptions = {},
    ) => {
      // Tapped again on its way home: it turns round from where it is, at
      // the speed it's going, rather than start over from the icon. Asked
      // to land somewhere else (another note), it's a new launch instead.
      if (appRef.current === id && closing.current && !launch) {
        if (openedBy ?? from) {
          opener.current = openedBy ?? from?.closest("button") ?? null;
        }
        closing.current = false;
        setClosingApp(false);
        store.set(APP_KEY, id);
        scene.animate({
          a: { to: 1, transition: SPRING_OPEN },
          p: { to: 0, transition: SPRING_OPEN },
          dx: { to: 0, transition: SPRING_OPEN },
          dy: { to: 0, transition: SPRING_OPEN },
          k: { to: 1, transition: SPRING_OPEN },
        });
        return;
      }
      const screen = screenRef.current;
      const icon = from ?? icons.current.get(id);
      // A closing app can be interrupted by the next launch, as on iOS.
      if (!(screen && icon) || (appRef.current && !closing.current)) {
        return;
      }
      APPS[id].load();
      // Another app still on its way home: it fades out where it is rather
      // than disappear when this one takes the window.
      if (appRef.current && closing.current) {
        scene.ghost();
      }
      measure();
      geometry.current.origin = rectWithin(icon, screen);
      geometry.current.previous = geometry.current.origin;
      geometry.current.fromIcon = isAppIcon(icon);
      geometry.current.fromWidget = isWidget(icon);
      originEl.current = icon;
      opener.current = openedBy ?? icon.closest("button");
      hideSource(icon);
      // Also stops whatever was still running from the last app.
      // The cover stays up until the window reports its app rendered.
      scene.jump({ a: instant ? 1 : 0, p: 0, dx: 0, dy: 0, k: 1, c: 1 });
      closing.current = false;
      setClosingApp(false);
      store.set(APP_KEY, id);
      setLaunch(launch);
      setApp(id);
      // A fresh window for every launch, even of the app still closing.
      setWindowKey((key) => key + 1);
      // The window starts the launch from its mount commit (onMounted).
      pendingLaunch.current = instant ? null : id;
    },
    [measure, hideSource, scene],
  );

  /** Home. `velocity` is a card flick's upward speed (unscaled px per ms),
   * which the springs carry on from; anything else (a click event, from a
   * button using this as its handler) counts as none. */
  const closeApp = useCallback(
    (velocity?: unknown, velocityX?: number) => {
      const v = typeof velocity === "number" ? Math.max(0, velocity) : 0;
      const vx = typeof velocityX === "number" ? velocityX : 0;
      const id = appRef.current;
      if (!id || closing.current) {
        return;
      }
      closing.current = true;
      setClosingApp(true);
      store.set(APP_KEY, null);
      const retargeted = retarget(id);
      const { h } = geometry.current;
      // The flick's speed goes on what the finger was driving: the pull into a
      // card and its rise. Put on `a`, it would also swing the card toward
      // the icon, and the card would turn back down the moment it's let go.
      scene
        .animate({
          a: { to: 0, transition: SPRING_CLOSE },
          p: {
            to: 0,
            transition: SPRING_CLOSE,
            velocity: (v * 1000) / (h * 0.5),
          },
          // A sideways throw carries on into the way home.
          dx: { to: 0, transition: SPRING_CLOSE, velocity: vx * 1000 },
          // The card keeps rising a touch with the flick, then goes home.
          dy: { to: 0, transition: SPRING_CLOSE, velocity: -v * 1000 * 0.55 },
          ...(retargeted
            ? { k: { from: 0, to: 1, transition: SPRING_CLOSE } }
            : {}),
        })
        .then((completed) => {
          if (!(completed && closing.current)) {
            return;
          }
          closing.current = false;
          setClosingApp(false);
          setApp(null);
          hideSource(null);
          requestAnimationFrame(() => {
            // Still locked (closed mid-launch from the lock screen): the
            // lock screen's unlock button, not the inert home screen.
            if (lockedRef.current) {
              unlockButtonRef.current?.focus({ preventScroll: true });
              return;
            }
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
    [scene, retarget, hideSource],
  );

  /** The launch waiting for its window: started in the commit that mounts
   * it, with the window already in the scene, and handed to the compositor
   * at once, so it runs at full rate however busy the page is from there.
   * A frame sooner than waiting for the next animation frame to start it. */
  /** Changes with each launch, so a launch of an app still on its way
   * home gets a window of its own, which reports its first commit again. */
  const [windowKey, setWindowKey] = useState(0);
  const pendingLaunch = useRef<IphoneAppId | null>(null);
  const onWindowMounted = useCallback(
    (id: IphoneAppId) => {
      // Not appRef: the window's mount effect runs before this component's
      // own layout effects have caught it up with the app just set.
      if (pendingLaunch.current === id && !closing.current) {
        pendingLaunch.current = null;
        scene.animate({ a: { to: 1, transition: SPRING_OPEN } });
      }
    },
    [scene],
  );

  /** From one app straight into another, as following a link to it does:
   * the open one goes and the other comes out of its icon. A closing app
   * can be interrupted by a launch, so this is a close, then an open. */
  const switchApp = useCallback(
    (id: IphoneAppId, launch?: AppLaunch) => {
      if (appRef.current === id) {
        return;
      }
      closeApp();
      openApp(id, { launch });
    },
    [openApp, closeApp],
  );

  /** Back to full screen, carrying the release speed (down is negative;
   * `velocityX` rightward). */
  const cancelDrag = useCallback(
    (velocity = 0, velocityX = 0) => {
      const { h } = geometry.current;
      scene.animate({
        p: {
          to: 0,
          transition: SPRING_OPEN,
          velocity: (velocity * 1000) / (h * 0.5),
        },
        dx: { to: 0, transition: SPRING_OPEN, velocity: velocityX * 1000 },
        dy: {
          to: 0,
          transition: SPRING_OPEN,
          velocity: -velocity * 1000 * 0.55,
        },
        // A drag that caught a launch mid-way finishes the launch.
        a: { to: 1, transition: SPRING_OPEN },
      });
    },
    [scene],
  );

  /**
   * Open an app from the lock screen, as iOS does: it grows out of the
   * banner (or card, or button) that was tapped, over the lock screen, and
   * the phone unlocks underneath once the app covers it. Opening a
   * notification clears it, then too, so the banner doesn't vanish from
   * under the app as it starts to grow.
   */
  const openFromLock = useCallback(
    (
      id: IphoneAppId,
      launch?: AppLaunch,
      from?: HTMLElement,
      notification = false,
    ) => {
      openApp(id, { launch, from });
      // Until the app has landed, however long that takes (a drag can hold
      // a launch), or it has gone.
      const done = scene.onSettle((state) => {
        if (appRef.current !== id || closing.current) {
          done();
          return;
        }
        if (state.a < 0.999) {
          return;
        }
        done();
        store.set(UNLOCKED_KEY, "1");
        halt(unlock);
        unlock.jump(1);
        setLocked(false);
        document.documentElement.dataset.iphone = "home";
        // A notification that was opened is read; the camera or the music
        // controls opening the same app leave it on the lock screen.
        if (notification) {
          setSeen((list) => (list.includes(id) ? list : [...list, id]));
        }
      });
    },
    [openApp, scene, unlock],
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
        halt(searchPull);
        searchPull.jump(0);
        setPullLanded(false);
        setSpotlightKey((key) => key + 1);
        setSpotlightLeaving(false);
        setPulled(true);
        setSearchPulling(true);
        return;
      }
      // Far enough, or flicked down: it comes in; otherwise back out.
      const commit = searchPull.get() > 0.35 || velocity > 0.3;
      const transition = reducedRef.current
        ? FADE
        : { type: "spring" as const, visualDuration: 0.35, bounce: 0 };
      const speed = (velocity * 1000) / 140;
      if (commit) {
        setSearchPulling(false);
        setSpotlight(true);
        springTo(searchPull, { to: 1, transition, velocity: speed }).then(
          (completed) => setPullLanded(completed),
        );
      } else {
        springTo(searchPull, { to: 0, transition, velocity: speed }).then(
          () => {
            setSearchPulling(false);
          },
        );
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
      const settled = unlock.get();
      unlock.jump(settled - 0.001);
      unlock.jump(settled);
    });
    return () => cancelAnimationFrame(frame);
  }, [unlock, openApp, measure]);

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

  // Warm every app's chunk once the main thread has nothing better to do:
  // while the lock screen is up, when the network is otherwise idle, so a
  // first open after the unlock isn't waiting on a download.
  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const handle = requestIdleCallback(preloadAllApps, { timeout: 1500 });
      return () => cancelIdleCallback(handle);
    }
    const handle = setTimeout(preloadAllApps, 800);
    return () => clearTimeout(handle);
  }, []);

  const wallpaper = useWallpaper();
  // The stylesheet hides the wallpaper while a stored choice is pending
  // (persist.ts); once the chosen one has rendered, show it.
  useEffect(() => {
    wallpaperShown(wallpaper.key);
  }, [wallpaper]);

  return (
    <IphoneDataProvider value={data}>
      <MusicProvider>
        <div className={styles.root}>
          <div
            className={styles.ambient}
            style={{ backgroundImage: `url(${wallpaper.image.blurDataURL})` }}
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
                if (lockTimer.current) {
                  return;
                }
                const fromKeyboard = event.detail === 0;
                setScreenOff(true);
                // Under the black: put everything away and lock, then let
                // the lock screen come up.
                lockTimer.current = setTimeout(
                  () => {
                    lockTimer.current = undefined;
                    if (appRef.current) {
                      closing.current = false;
                      // Stops an opening spring, which would otherwise finish
                      // and leave the dim layer over the lock screen.
                      scene.jump({ a: 0, p: 0, dx: 0, dy: 0, k: 1, c: 0 });
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
                    // At once, under the black.
                    halt(unlock);
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
                src={wallpaper.image}
                alt=""
                fill
                preload
                placeholder="blur"
                sizes="(min-width: 640px) and (min-height: 640px) 402px, 100vw"
                className={styles.wallpaper}
              />
              <div className={styles.scrim} aria-hidden />
              <m.div
                ref={wallDim}
                className={styles.dim}
                style={wallDimStyle}
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
                zoomRef={(el) => scene.register("homeZoom", el)}
                gridRef={homeGrid}
                bottomRef={homeBottom}
                gridStyle={gridStyle}
                bottomStyle={bottomStyle}
              />

              {spotlight || spotlightLeaving || searchPulling ? (
                <Spotlight
                  key={spotlightKey}
                  leaving={!(spotlight || searchPulling)}
                  pulling={searchPulling}
                  pull={pulled ? searchPull : undefined}
                  pullLanded={pullLanded}
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
                  now,
                ).filter((notification) => !seen.includes(notification.app))}
                unlock={unlock}
                rootStyle={lockStyle}
                faceStyle={lockFaceStyle}
                measure={measure}
                onSettle={settleLock}
                onOpenApp={openFromLock}
                unlockButtonRef={unlockButtonRef}
                rootRef={lockRoot}
                faceRef={lockFace}
              />

              <div
                ref={(el) => scene.register("dim", el)}
                className={styles.dim}
                style={{ zIndex: 25 }}
                aria-hidden
              />

              {app === null ? null : (
                <AppWindow
                  key={`${app}-${windowKey}`}
                  leaving={closingApp}
                  launch={launch}
                  id={app}
                  calendar={calendar}
                  scene={scene}
                  widget={geometry.current.fromWidget ? originEl.current : null}
                  measure={measure}
                  screen={screenRef.current}
                  onClose={closeApp}
                  onCancelDrag={cancelDrag}
                  onSwitch={switchApp}
                  onMounted={onWindowMounted}
                />
              )}

              <BannerHost
                onOpen={(id, from) => {
                  // From the home screen it opens the app out of the
                  // banner; over an app or the lock screen it just goes.
                  if (lockedRef.current || appRef.current) {
                    return appRef.current === id;
                  }
                  openApp(id, {
                    from:
                      from.querySelector<HTMLElement>("[aria-hidden]") ?? from,
                  });
                  return true;
                }}
              />

              <div className={styles.statusBar} aria-hidden>
                <m.span
                  ref={statusTime}
                  className={styles.statusTime}
                  style={statusTimeStyle}
                >
                  <span data-now="clock" suppressHydrationWarning>
                    {formatClock(now)}
                  </span>
                </m.span>
                <span className={styles.statusIcons}>
                  <Signal />
                  <Wifi />
                  <Battery
                    level={battery?.level}
                    charging={battery?.charging}
                  />
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
