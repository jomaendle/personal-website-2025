"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { PHOTOS } from "@/lib/state/photos";
import { cn } from "@/lib/utils";
import type { AppProps } from "../apps";
import { BackChevron, Magnifier } from "../glyphs";
import styles from "../iphone.module.css";

/**
 * My photographs as a library grid. A tap opens a full-screen viewer that is
 * a native scroll-snap strip: swiping between photos is the browser's own
 * scroller, with its own momentum, and arrow keys work once it has focus.
 */
export default function PhotosApp(_: AppProps) {
  const [viewing, setViewing] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);
  const stripRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const strip = stripRef.current;
    if (viewing === null || !strip) {
      return;
    }
    strip.scrollLeft = viewing * strip.clientWidth;
    strip.focus({ preventScroll: true });
  }, [viewing]);

  const open = (index: number) => {
    setCurrent(index);
    setViewing(index);
  };

  return (
    <>
      <div className={styles.scroll}>
        <header className={cn(styles.photosHeader, styles.photosHeaderInner)}>
          <div>
            <h1 className={styles.photosTitle}>Library</h1>
            <p className={styles.photosCount}>{PHOTOS.length} Items</p>
          </div>
          <div className={styles.photosButtons} aria-hidden>
            <span className={styles.pill}>Select</span>
            <span className={styles.pill}>
              <Magnifier />
            </span>
          </div>
        </header>

        <ul className={styles.photoGrid} aria-label="Photos">
          {PHOTOS.map((photo, index) => (
            <li key={photo.src}>
              <button
                type="button"
                className={styles.photoTile}
                style={{ width: "100%", display: "block" }}
                onClick={() => open(index)}
                aria-label={`Photo ${index + 1} of ${PHOTOS.length}`}
              >
                <Image
                  src={photo}
                  alt=""
                  fill
                  sizes="(min-width: 640px) and (min-height: 640px) 134px, 34vw"
                  placeholder="blur"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {viewing !== null && (
        // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Escape closing a dialog is the dialog keyboard contract
        <div
          className={styles.viewer}
          role="dialog"
          aria-label="Photo viewer"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              // Close the viewer, not the app.
              event.preventDefault();
              event.stopPropagation();
              setViewing(null);
            }
          }}
        >
          <div className={styles.viewerBar}>
            <button
              type="button"
              className={styles.circleButton}
              onClick={() => setViewing(null)}
              aria-label="Back to library"
            >
              <BackChevron width={10} height={16} />
            </button>
            <span aria-live="polite">
              {current + 1} of {PHOTOS.length}
            </span>
          </div>
          <section
            ref={stripRef}
            className={styles.viewerStrip}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region has to take focus for the arrow keys to scroll it
            tabIndex={0}
            aria-label="Photos. Use the arrow keys to move between them."
            onScroll={(event) => {
              const strip = event.currentTarget;
              setCurrent(Math.round(strip.scrollLeft / strip.clientWidth));
            }}
          >
            {PHOTOS.map((photo, index) => (
              <div key={photo.src} className={styles.viewerSlide}>
                <Image
                  src={photo}
                  alt={`Photograph ${index + 1}`}
                  fill
                  sizes="(min-width: 640px) and (min-height: 640px) 402px, 100vw"
                  placeholder="blur"
                  loading={Math.abs(index - viewing) <= 1 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </section>
        </div>
      )}
    </>
  );
}
