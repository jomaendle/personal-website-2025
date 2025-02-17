"use client";
import { ComponentPreview } from "@/components/component-preview";
import { useEffect, useRef } from "react";
import styles from "./Styles.module.css";

export const FocusZoomAtProperty = () => {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const toggleSpotlight = (toggle: boolean) => {
    requestAnimationFrame(() => {
      spotlightRef.current?.style.setProperty(
        "--focal-size",
        toggle ? "7vmax" : "100%",
      );
    });
  };

  useEffect(() => {
    const preview = previewRef.current;
    const isMobile = window.matchMedia("(pointer: coarse)").matches;

    if (!preview) {
      return;
    }

    const { x, y } = preview.getBoundingClientRect();

    window.addEventListener("pointermove", (e) => {
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
        spotlightRef.current?.style.setProperty("--mouse-x", newX + "px");
        spotlightRef.current?.style.setProperty("--mouse-y", newY + "px");
      });
    });

    window.addEventListener("keydown", (e) => toggleSpotlight(e.altKey));
    window.addEventListener("keyup", (e) => toggleSpotlight(e.altKey));
    window.addEventListener("touchstart", () => toggleSpotlight(true));
    window.addEventListener("touchend", () => toggleSpotlight(false));
  }, [previewRef]);

  return (
    <ComponentPreview ref={previewRef} classList={styles.gradient}>
      <div className="text-white">
        Press <kbd>Opt/Alt</kbd> to see the spotlight effect
      </div>

      <div ref={spotlightRef} className={styles.focusZoom}></div>
    </ComponentPreview>
  );
};
