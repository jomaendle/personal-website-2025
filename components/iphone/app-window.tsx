"use client";

import { type MotionValue, m } from "framer-motion";
import { Suspense, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { IPHONE_COPY, type IphoneAppId } from "@/lib/state/iphone-copy";
import { AppIcon, type CalendarFace } from "./app-icons";
import { APPS, type AppLaunch, LAZY_APPS } from "./apps";
import styles from "./iphone.module.css";
import { clamp, VelocityTracker } from "./motion";

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
  /** Close; a card flick passes its upward speed, unscaled px per ms. */
  onClose: (velocity?: number) => void;
  onCancelDrag: (velocity: number) => void;
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
  const velocity = useRef(new VelocityTracker());

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
    velocity.current.reset();
    velocity.current.add(event.clientY / scale, event.timeStamp);
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
    velocity.current.add(event.clientY / current.scale, event.timeStamp);
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
    const v = velocity.current.velocity();
    if ((pull.get() > 0.16 || v > 0.35) && v > -0.2) {
      onClose(v);
    } else {
      onCancelDrag(v);
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
        <Suspense fallback={null}>
          <App close={() => onClose()} launch={launch} />
        </Suspense>
        <m.div
          className={styles.appIconOverlay}
          style={{ opacity: iconOpacity, scale: iconScale }}
        >
          <AppIcon art={APPS[id].art} calendar={calendar} />
        </m.div>
      </m.div>
      {screen ? createPortal(indicator, screen) : null}
    </>
  );
}
