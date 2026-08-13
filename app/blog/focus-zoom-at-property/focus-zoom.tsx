"use client";
import { useEffect, useRef } from "react";
import { ComponentPreview } from "@/components/component-preview";
import styles from "./Styles.module.css";

export const FocusZoomAtProperty = () => {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const toggleSpotlight = (toggle: boolean) => {
      requestAnimationFrame(() => {
        spotlightRef.current?.style.setProperty(
          "--focal-size",
          toggle ? "7vmax" : "100%",
        );
      });
    };

    const preview = previewRef.current;
    const isMobile = window.matchMedia("(pointer: coarse)").matches;

    if (!preview) {
      return;
    }

    const { x, y } = preview.getBoundingClientRect();

    const onPointerMove = (e: PointerEvent) => {
      if (
        (e.clientX < x ||
          e.clientX > x + preview.clientWidth ||
          e.clientY < y ||
          e.clientY > y + preview.clientHeight) &&
        isMobile
      ) {
        return;
      }

      requestAnimationFrame(() => {
        // calculate the mouse position relative to the preview
        const newX = e.clientX - x;
        const newY = e.clientY - y;
        spotlightRef.current?.style.setProperty("--mouse-x", `${newX}px`);
        spotlightRef.current?.style.setProperty("--mouse-y", `${newY}px`);
      });
    };
    const onKey = (e: KeyboardEvent) => toggleSpotlight(e.altKey);
    const onTouchStart = () => toggleSpotlight(true);
    const onTouchEnd = () => toggleSpotlight(false);

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);

    // Without this cleanup every visit to the article stacked another five
    // window-level listeners for the rest of the SPA session.
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <ComponentPreview ref={previewRef} className={styles.gradient}>
      <div className="text-white">
        Press <kbd>Opt/Alt</kbd> to see the spotlight effect
      </div>

      <div ref={spotlightRef} className={styles.focusZoom}></div>
    </ComponentPreview>
  );
};
