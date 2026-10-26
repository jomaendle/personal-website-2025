"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useState persisted to localStorage. Replaces jotai's atomWithStorage — the
 * sidebar's three booleans were the library's only consumer, so this hook
 * keeps every page from shipping the jotai runtime.
 *
 * SSR-safe: the first client render returns `defaultValue` so hydration
 * matches the server; the stored value is applied in an effect afterwards.
 * State is not synchronized between components or tabs — each hook instance
 * owns its key, which is all the sidebar needs.
 */
export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(defaultValue);
  // Only persist values the caller set, so the default (or the value just
  // read back) is never written over what's stored.
  const dirty = useRef(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) {
        // Hydration-safety requires deferring the stored value to an effect,
        // same pattern as useIsMounted.
        setValue(JSON.parse(stored) as T);
      }
    } catch {
      // Unreadable storage (privacy mode, corrupted JSON) — keep the default.
    }
  }, [key]);

  // The write happens after commit, not inside a state updater: React may
  // run updaters more than once, and they should stay pure.
  useEffect(() => {
    if (!dirty.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or blocked — state still updates for this session.
    }
  }, [key, value]);

  const setAndPersist = useCallback((next: T | ((prev: T) => T)) => {
    dirty.current = true;
    setValue(next);
  }, []);

  return [value, setAndPersist];
}
