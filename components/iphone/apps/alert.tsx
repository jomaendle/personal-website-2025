"use client";

import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";
import styles from "../iphone.module.css";

/**
 * UIAlertController's alert: a small frosted card over a dimmed screen, a
 * bold title, one line of explanation and a single OK. Escape and OK both
 * dismiss it; Escape stops there instead of also closing the app.
 */
export function IosAlert({
  title,
  message,
  onDismiss,
  leaving = false,
}: {
  title: string;
  message: string;
  onDismiss: () => void;
  /** Already dismissed: an inert copy fading out, which calls onDismiss
   * once it's gone. */
  leaving?: boolean;
}) {
  const id = useId();
  const okRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!leaving) {
      okRef.current?.focus({ preventScroll: true });
    }
  }, [leaving]);

  return (
    <div
      className={cn(styles.alertBackdrop, leaving && styles.alertLeaving)}
      inert={leaving}
      aria-hidden={leaving || undefined}
      onAnimationEnd={(event) => {
        if (leaving && event.target === event.currentTarget) {
          onDismiss();
        }
      }}
    >
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Escape dismissing an alert is the dialog keyboard contract */}
      <div
        className={styles.alert}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${id}t`}
        aria-describedby={`${id}m`}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            onDismiss();
          }
        }}
      >
        <div className={styles.alertBody}>
          <h2 id={`${id}t`} className={styles.alertTitle}>
            {title}
          </h2>
          <p id={`${id}m`} className={styles.alertMessage}>
            {message}
          </p>
        </div>
        <button
          ref={okRef}
          type="button"
          className={styles.alertButton}
          onClick={onDismiss}
        >
          OK
        </button>
      </div>
    </div>
  );
}
