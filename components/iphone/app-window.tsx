"use client";

import { type MotionValue, m } from "framer-motion";
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { IPHONE_COPY, type IphoneAppId } from "@/lib/state/iphone-copy";
import { AppIcon, type CalendarFace } from "./app-icons";
import { APPS, type AppLaunch, LAZY_APPS } from "./apps";
import styles from "./iphone.module.css";
import { clamp, useVelocityTracker } from "./motion";

interface AppWindowProps {
  id: IphoneAppId;
  /** On its way home: no longer takes input, so taps reach the home screen
   * around it and nothing inside reacts as it shrinks. */
  leaving: boolean;
  launch?: AppLaunch;
  calendar: CalendarFace | null;
  transform: MotionValue<string>;
  clipPath: MotionValue<string>;
  opacity: MotionValue<number>;
  moving: MotionValue<boolean>;
  iconOpacity: MotionValue<number>;
  iconScale: MotionValue<number>;
  /** The home-screen widget it opened out of, if it did: a snapshot of it
   * grows with the window and fades into the app. */
  widget: HTMLElement | null;
  widgetOpacity: MotionValue<number>;
  widgetTransform: MotionValue<string>;
  /** 0 to 1 as the app is pulled up into a card. */
  pull: MotionValue<number>;
  dragX: MotionValue<number>;
  dragY: MotionValue<number>;
  measure: () => { h: number; scale: number };
  /** The phone's screen: the home indicator lives there, not in the
   * window, so it can be swiped from the first frame of a launch. */
  screen: HTMLElement | null;
  /** A card drag took hold: stop any launch still running. */
  onDragStart: () => void;
  /** Close; a card flick passes its upward and rightward speeds, unscaled
   * px per ms. */
  onClose: (velocity?: number, velocityX?: number) => void;
  onCancelDrag: (velocity: number, velocityX: number) => void;
}

/**
 * A running app. It zooms out of its icon (the icon art fading over the top
 * for the first third, as on iOS) and goes home by a swipe up from the home
 * indicator, shrinking into a card that follows the finger. A tap or Enter on
 * the indicator, or Escape anywhere, does the same.
 */
export function AppWindow({
  id,
  leaving,
  launch,
  calendar,
  transform,
  clipPath,
  opacity,
  moving,
  iconOpacity,
  iconScale,
  widget,
  widgetOpacity,
  widgetTransform,
  pull,
  dragX,
  dragY,
  measure,
  screen,
  onDragStart,
  onClose,
  onCancelDrag,
}: AppWindowProps) {
  const App = LAZY_APPS[id];
  const windowRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    h: number;
    scale: number;
    moved: boolean;
    /** The card's pose when the finger landed, if it was still springing
     * back from an earlier drag: the new drag carries on from there. */
    baseRise: number;
    baseX: number;
  } | null>(null);
  const tracker = useVelocityTracker();
  const trackerX = useVelocityTracker();
  const snapshot = useRef<HTMLDivElement>(null);

  // The same element across the window's own re-renders (the close
  // starting, the clock ticking over in the shell): the app inside doesn't
  // render again for them, which in Calendar is nineteen months of days.
  const close = useCallback(() => onClose(), [onClose]);
  const content = useMemo(
    () => <App close={close} launch={launch} />,
    [App, close, launch],
  );

  // A copy of the widget as it is on screen, at its own size: the window
  // and the snapshot's stretch scale it up. Copied rather than rendered again, so it's whatever the
  // widget showed, with its images already loaded.
  useLayoutEffect(() => {
    const box = snapshot.current;
    if (!(box && widget)) {
      return;
    }
    const copy = widget.cloneNode(true) as HTMLElement;
    copy.style.width = `${widget.offsetWidth}px`;
    copy.style.height = `${widget.offsetHeight}px`;
    copy.style.visibility = "visible";
    copy.style.display = getComputedStyle(widget).display;
    for (const img of copy.querySelectorAll("img")) {
      img.loading = "eager";
      img.decoding = "sync";
    }
    box.replaceChildren(copy);
  }, [widget]);

  // After the first frames, not during the mount: focusing forces a style
  // recalculation of the whole app right as the zoom starts.
  // And only if the app hasn't put focus somewhere of its own by then (a
  // note's title, the Now Playing sheet, a Mail field).
  useEffect(() => {
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        const el = windowRef.current;
        if (el && !el.contains(document.activeElement)) {
          el.focus({ preventScroll: true });
        }
      });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // While the window zooms or follows a finger, every frosted bar inside it
  // would re-blur its backdrop each frame. Suspend the blur for the motion
  // (the tint still reads as glass at that size and speed) and restore it
  // at rest. The attribute flips twice per motion, not once per frame.
  useEffect(() => {
    const el = windowRef.current;
    el?.toggleAttribute("data-moving", moving.get());
    return moving.on("change", (value) => {
      windowRef.current?.toggleAttribute("data-moving", value);
    });
  }, [moving]);

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    // One finger at a time: a second one must not take the drag over.
    if (event.button !== 0 || drag.current) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    const { h, scale } = measure();
    // set() doesn't stop a running spring, so stop it to take hold.
    onDragStart();
    pull.stop();
    dragX.stop();
    dragY.stop();
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      h,
      scale,
      moved: false,
      baseRise: pull.get() * h * 0.5,
      baseX: dragX.get(),
    };
    tracker.reset();
    tracker.add(event.clientY / scale, event.timeStamp);
    trackerX.reset();
    trackerX.add(event.clientX / scale, event.timeStamp);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) {
      return;
    }
    if (!current.moved) {
      const far = Math.hypot(
        event.clientX - current.x,
        event.clientY - current.y,
      );
      if (far < 6 * current.scale) {
        return;
      }
      // The drag starts here, so the card doesn't jump by the slop.
      current.moved = true;
      current.x = event.clientX;
      current.y = event.clientY;
    }
    const dx = (event.clientX - current.x) / current.scale;
    const up = (current.y - event.clientY) / current.scale;
    tracker.add(event.clientY / current.scale, event.timeStamp);
    trackerX.add(event.clientX / current.scale, event.timeStamp);
    const rise = Math.max(0, current.baseRise + up);
    pull.set(clamp(rise / (current.h * 0.5), 0, 1));
    dragX.set(current.baseX + dx);
    // Rising a little slower than the finger keeps the card's bottom edge
    // under it while the card shrinks.
    dragY.set(-rise * 0.55);
  };

  const onPointerEnd = (event: React.PointerEvent<HTMLButtonElement>) => {
    const current = drag.current;
    if (current?.id !== event.pointerId) {
      return;
    }
    drag.current = null;
    if (!current.moved) {
      onClose();
      return;
    }
    const v = tracker.velocity();
    // The tracker reports toward smaller values as positive: leftward.
    const vx = -trackerX.velocity();
    if ((pull.get() > 0.16 || v > 0.35) && v > -0.2) {
      onClose(v, vx);
    } else {
      onCancelDrag(v, vx);
    }
  };

  // At screen level, above the window: it reaches the bottom edge from the
  // start of a launch, as iOS's home gesture does.
  const indicator = (
    <button
      type="button"
      className={styles.homeIndicatorHit}
      disabled={leaving}
      aria-label={IPHONE_COPY.closeAppLabel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      // Pointer input is handled above; this is Enter and Space.
      onClick={(event) => event.detail === 0 && onClose()}
    >
      <span className={styles.homeIndicator} />
    </button>
  );

  return (
    <>
      <m.div
        ref={windowRef}
        className={styles.app}
        style={{ transform, clipPath, opacity }}
        role="dialog"
        aria-modal="true"
        aria-label={APPS[id].name}
        tabIndex={-1}
        inert={leaving}
      >
        <Suspense fallback={null}>{content}</Suspense>
        <m.div
          className={styles.appIconOverlay}
          style={{ opacity: iconOpacity, scale: iconScale }}
        >
          <AppIcon art={APPS[id].art} calendar={calendar} />
        </m.div>
        {widget ? (
          <m.div
            ref={snapshot}
            className={styles.widgetSnapshot}
            style={{ opacity: widgetOpacity, transform: widgetTransform }}
            aria-hidden
            inert
          />
        ) : null}
      </m.div>
      {screen ? createPortal(indicator, screen) : null}
    </>
  );
}
