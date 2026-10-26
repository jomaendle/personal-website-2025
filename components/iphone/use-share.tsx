"use client";

import { useEffect, useState } from "react";
import styles from "./iphone.module.css";

/**
 * Share a link the way the phone would: the real share sheet where there is
 * one, else the link copied with a HUD saying so. Each share gets a fresh
 * HUD, so sharing twice in a row shows it twice.
 */
export function useShare() {
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = setTimeout(() => setToast(null), 1400);
    return () => clearTimeout(timer);
  }, [toast]);

  const say = (text: string) =>
    setToast((last) => ({ text, id: (last?.id ?? 0) + 1 }));

  const share = async (url: string, title?: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Dismissed: nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      say("Link Copied");
    } catch {
      say("Couldn’t Copy Link");
    }
  };

  const hud = toast ? (
    <div key={toast.id} className={styles.hud} role="status">
      {toast.text}
    </div>
  ) : null;

  return { share, hud };
}
