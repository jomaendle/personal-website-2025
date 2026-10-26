import { useEffect, useState } from "react";

/**
 * How much of the screen the on-screen keyboard covers. The phone is
 * position: fixed, so iOS Safari slides the keyboard over it rather than
 * resizing anything; lifting a sheet or a floating bar by this keeps it
 * above the keys. Used by Mail's sheet, Notes' search and Spotlight.
 */
export function useKeyboardInset() {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) {
      return;
    }
    const update = () =>
      setInset(
        Math.max(
          0,
          Math.round(window.innerHeight - viewport.height - viewport.offsetTop),
        ),
      );
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);
  return inset;
}
