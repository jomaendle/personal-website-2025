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
import { BannerHost } from "./banner";
import { type Binding, halt, springTo } from "./compositor-spring";
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
  // Home zooms in from slightly large as the lock screen lifts. (Its lean
  // toward the reader as an app opens is the scene's, on a wrapper.)
  const homeScale = useTransform(unlock, (u) =>
    reducedRef.current ? 1 : 1 + 0.16 * (1 - u),
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

  // What the unlock moves once a finger lets go, on the compositor: the
  // same styles the motion values above give each element, value by value.
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
      geometry.current.fromIcon = isAppIcon(icon);
      geometry.current.fromWidget = isWidget(icon);
      originEl.current = icon;
      opener.current = icon.closest("button");
      hideSource(icon);
      // Also stops whatever was still running from the last app.
      scene.jump({ a: instant ? 1 : 0, p: 0, dx: 0, dy: 0, k: 1 });
      closing.current = false;
      setClosingApp(false);
      store.set(APP_KEY, id);
      setLaunch(launch);
      setApp(id);
      if (!instant) {
        // Once React has mounted the app (its window is in the scene by
        // then): the whole launch is handed to the compositor at once, so
        // it runs at full rate however busy the page is from here on.
        requestAnimationFrame(() => {
          if (appRef.current === id && !closing.current) {
            scene.animate({ a: { to: 1, transition: SPRING_OPEN } });
          }
        });
      }
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
    (id: IphoneAppId, launch?: AppLaunch, from?: HTMLElement) => {
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
        setSeen((list) => (list.includes(id) ? list : [...list, id]));
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
                      scene.jump({ a: 0, p: 0, dx: 0, dy: 0, k: 1 });
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
                src={WALLPAPER}
                alt=""
                fill
                preload
                placeholder="blur"
                sizes="(min-width: 640px) and (min-height: 640px) 402px, 100vw"
                className={styles.wallpaper}
              />
              <m.div
                ref={wallDim}
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
                zoomRef={(el) => scene.register("homeZoom", el)}
                gridRef={homeGrid}
                bottomRef={homeBottom}
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
                  now,
                ).filter((notification) => !seen.includes(notification.app))}
                unlock={unlock}
                lockY={lockY}
                lockFade={lockFade}
                lockOpacity={lockOpacity}
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
                  key={app}
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
                  style={{ opacity: statusTimeOpacity }}
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
