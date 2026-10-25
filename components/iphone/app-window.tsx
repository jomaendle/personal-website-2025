"use client";

import { type MotionValue, m } from "framer-motion";
import { Suspense, useEffect, useRef } from "react";
import { IPHONE_COPY, type IphoneAppId } from "@/lib/state/iphone-copy";
import { AppIcon, type CalendarFace } from "./app-icons";
import { APPS, LAZY_APPS } from "./apps";
import styles from "./iphone.module.css";
import { clamp, VelocityTracker } from "./motion";

interface AppWindowProps {
  id: IphoneAppId;
  calendar: CalendarFace | null;
  transform: MotionValue<string>;
  clipPath: MotionValue<string>;
  opacity: MotionValue<number>;
  iconOpacity: MotionValue<number>;
  /** 0 to 1 as the app is pulled up into a card. */
  pull: MotionValue<number>;
  dragX: MotionValue<number>;
  dragY: MotionValue<number>;
  measure: () => { h: number; scale: number };
  onClose: () => void;
  onCancelDrag: () => void;
}

/**
 * A running app. It zooms out of its icon (the icon art fading over the top
 * for the first third, as on iOS) and goes home by a swipe up from the home
 * indicator, shrinking into a card that follows the finger. A tap or Enter on
 * the indicator, or Escape anywhere, does the same.
 */
export function AppWindow({
  id,
  calendar,
  transform,
  clipPath,
  opacity,
  iconOpacity,
  pull,
  dragX,
  dragY,
  measure,
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

  useEffect(() => {
    windowRef.current?.focus({ preventScroll: true });
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    // One finger at a time: a second one must not take the drag over.
    if (event.button !== 0 || drag.current) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    const { h, scale } = measure();
    // set() doesn't stop a running spring, so stop it to take hold.
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
    const dx = (event.clientX - current.x) / current.scale;
    const up = (current.y - event.clientY) / current.scale;
    if (!current.moved && Math.hypot(dx, up) < 6) {
      return;
    }
    current.moved = true;
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
      onClose();
    } else {
      onCancelDrag();
    }
  };

  return (
    <m.div
      ref={windowRef}
      className={styles.app}
      style={{ transform, clipPath, opacity }}
      role="dialog"
      aria-modal="true"
      aria-label={APPS[id].name}
      tabIndex={-1}
    >
      <Suspense fallback={null}>
        <App close={onClose} />
      </Suspense>
      <m.div className={styles.appIconOverlay} style={{ opacity: iconOpacity }}>
        <AppIcon art={APPS[id].art} calendar={calendar} />
      </m.div>
      <button
        type="button"
        className={styles.homeIndicatorHit}
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
    </m.div>
  );
}
