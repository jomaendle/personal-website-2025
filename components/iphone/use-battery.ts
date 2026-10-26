"use client";

import { useEffect, useState } from "react";

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
}

/**
 * The visitor's own battery, where the browser shares it (Chromium does;
 * Safari and Firefox don't), so the status bar shows their real charge.
 * Null where it isn't available: the status bar then draws a full-ish one.
 */
export function useBattery() {
  const [battery, setBattery] = useState<{
    level: number;
    charging: boolean;
  } | null>(null);

  useEffect(() => {
    const nav = navigator as Navigator & {
      getBattery?: () => Promise<BatteryManager>;
    };
    if (!nav.getBattery) {
      return;
    }
    let manager: BatteryManager | null = null;
    let live = true;
    const update = () => {
      if (manager) {
        setBattery({ level: manager.level, charging: manager.charging });
      }
    };
    nav
      .getBattery()
      .then((m) => {
        if (!live) {
          return;
        }
        manager = m;
        update();
        m.addEventListener("levelchange", update);
        m.addEventListener("chargingchange", update);
      })
      .catch(() => undefined);
    return () => {
      live = false;
      manager?.removeEventListener("levelchange", update);
      manager?.removeEventListener("chargingchange", update);
    };
  }, []);

  return battery;
}
