"use client";

import { useCallback, useEffect, useState } from "react";

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

  const setAndPersist = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Storage full or blocked — state still updates for this session.
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, setAndPersist];
}
