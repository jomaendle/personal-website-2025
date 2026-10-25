"use client";

import { useEffect, useId, useRef } from "react";
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
}: {
  title: string;
  message: string;
  onDismiss: () => void;
}) {
  const id = useId();
  const okRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    okRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className={styles.alertBackdrop}>
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
