import { useLayoutEffect, useRef } from "react";

/**
 * A ref that always holds the latest `value`, for callbacks that outlive
 * the render (springs, listeners, timers) and must see current state.
 * Written after commit, before paint, rather than during render, which
 * React may replay or throw away.
 */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
