"use client";

import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PHOTOS } from "@/lib/state/photos";
import { cn } from "@/lib/utils";
import type { AppProps } from "../apps";
import { BackChevron, Magnifier } from "../glyphs";
import styles from "../iphone.module.css";
import { clamp, VelocityTracker } from "../motion";

/** Grid thumbnails ask for this; the viewer asks for the same, underneath the
 * full image, so it shows the cached thumbnail at once instead of a blur. */
const THUMB_SIZES = "(min-width: 640px) and (min-height: 640px) 134px, 34vw";
const FULL_SIZES = "(min-width: 640px) and (min-height: 640px) 402px, 100vw";
/** iOS's photo zoom: quick out of the gate, long soft landing. */
const ZOOM = { duration: 420, easing: "cubic-bezier(0.2, 0.9, 0.25, 1)" };

/** A type alias, not an interface, so it satisfies WAAPI's Keyframe. */
type Pose = {
  transform: string;
  clipPath: string;
};

const REST_TRANSFORM = "translate(0px, 0px) scale(1)";

/** Animate the photo back from a finger-dragged transform to rest. */
function settle(frame: HTMLElement) {
  const from = frame.style.transform;
  frame.style.transform = "";
  frame.animate([{ transform: from }, { transform: REST_TRANSFORM }], {
    duration: 300,
    easing: ZOOM.easing,
  });
}

/** Fly the photo to `to` (its thumbnail), or fade it if there is none. */
function putBack(
  frame: HTMLElement,
  rest: Pose,
  to: Pose | null,
  done: () => void,
) {
  if (to) {
    const from = {
      transform: frame.style.transform || rest.transform,
      clipPath: rest.clipPath,
    };
    frame.animate([from, to], { ...ZOOM, fill: "forwards" }).onfinish = done;
  } else {
    frame.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 200,
      fill: "forwards",
    }).onfinish = done;
  }
}

/**
 * My photographs as Photos' library grid, under a progressive blur. A photo
 * zooms out of its thumbnail into a viewer and back into it on the way out,
 * the iOS hero transition, run as a Web Animation on transform and clip-path
 * so it stays on the compositor. In the viewer: swipe sideways between photos
 * (a native scroll-snap strip), swipe down to put one back, tap to hide the
 * chrome, or scrub the thumbnail strip along the bottom.
 */
export default function PhotosApp(_: AppProps) {
  const reduced = useReducedMotion() ?? false;
  const [viewing, setViewing] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);
  const [chrome, setChrome] = useState(true);
  const [closing, setClosing] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLElement>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const frames = useRef<(HTMLDivElement | null)[]>([]);
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    mode: "pending" | "dismiss" | "pan";
    dx: number;
    dy: number;
  } | null>(null);
  const velocity = useRef(new VelocityTracker());

  /**
   * The photo's pose sitting on its thumbnail, in the viewer's unscaled
   * pixels: the contained image scaled until its short side matches the
   * square thumbnail, moved onto it, and clipped to that square.
   */
  const thumbPose = (index: number): Pose | null => {
    const viewer = viewerRef.current;
    const thumb = thumbs.current[index];
    const photo = PHOTOS[index];
    if (!(viewer && thumb && photo)) {
      return null;
    }
    const v = viewer.getBoundingClientRect();
    const t = thumb.getBoundingClientRect();
    // The device frame may be scaled to fit the window.
    const k = v.width / viewer.offsetWidth || 1;
    const scroller = gridRef.current?.getBoundingClientRect();
    if (scroller && (t.bottom < scroller.top || t.top > scroller.bottom)) {
      return null;
    }
    const W = viewer.offsetWidth;
    const H = viewer.offsetHeight;
    const aspect = photo.width / photo.height;
    const [dw, dh] = aspect > W / H ? [W, W / aspect] : [H * aspect, H];
    const side = t.width / k;
    const crop = Math.min(dw, dh);
    const s = side / crop;
    const tx = (t.left - v.left) / k + side / 2 - W / 2;
    const ty = (t.top - v.top) / k + side / 2 - H / 2;
    return {
      transform: `translate(${tx}px, ${ty}px) scale(${s})`,
      clipPath: `inset(${(H - crop) / 2}px ${(W - crop) / 2}px round ${2 / s}px)`,
    };
  };

  /** The photo at rest in the viewer, clipped to exactly its own box. */
  const restPose = (index: number): Pose => {
    const viewer = viewerRef.current;
    const photo = PHOTOS[index];
    const W = viewer?.offsetWidth ?? 0;
    const H = viewer?.offsetHeight ?? 0;
    const aspect = photo ? photo.width / photo.height : 1;
    const [dw, dh] = aspect > W / H ? [W, W / aspect] : [H * aspect, H];
    return {
      transform: REST_TRANSFORM,
      clipPath: `inset(${(H - dh) / 2}px ${(W - dw) / 2}px round 0px)`,
    };
  };

  // Open: jump the strip to the photo, then zoom it out of its thumbnail.
  // Only on open; the pose helpers read refs, not state.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once per photo opened
  useLayoutEffect(() => {
    const strip = stripRef.current;
    if (viewing === null || !strip) {
      return;
    }
    strip.scrollLeft = viewing * strip.clientWidth;
    strip.focus({ preventScroll: true });
    const frame = frames.current[viewing];
    const from = reduced ? null : thumbPose(viewing);
    backdropRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: from ? ZOOM.duration * 0.7 : 200,
      easing: "ease-out",
    });
    if (frame && from) {
      frame.animate([from, restPose(viewing)], ZOOM);
    }
  }, [viewing]);

  // Keep the scrubber's current thumbnail centred.
  useEffect(() => {
    if (viewing === null) {
      return;
    }
    const scrubber = scrubberRef.current;
    const item = scrubber?.children[current] as HTMLElement | undefined;
    if (scrubber && item) {
      scrubber.scrollTo({
        left: item.offsetLeft - scrubber.clientWidth / 2 + item.offsetWidth / 2,
        behavior: reduced ? "auto" : "smooth",
      });
    }
  }, [current, viewing, reduced]);

  const open = (index: number) => {
    setCurrent(index);
    setChrome(true);
    setViewing(index);
  };

  /** Put the current photo back where it came from, from wherever the
   * finger left it. */
  const close = () => {
    if (viewing === null || closing) {
      return;
    }
    setClosing(true);
    const frame = frames.current[current];
    // Bring its thumbnail into view first, as Photos keeps the grid in step.
    thumbs.current[current]?.scrollIntoView({ block: "nearest" });
    const to = reduced ? null : thumbPose(current);
    const done = () => {
      setViewing(null);
      setClosing(false);
      requestAnimationFrame(() =>
        thumbs.current[current]?.focus({ preventScroll: true }),
      );
    };
    const backdrop = backdropRef.current;
    const fadeFrom = backdrop ? getComputedStyle(backdrop).opacity : "1";
    backdrop?.animate([{ opacity: fadeFrom }, { opacity: 0 }], {
      duration: to ? ZOOM.duration * 0.8 : 200,
      easing: "ease-out",
      fill: "forwards",
    });
    if (frame) {
      putBack(frame, restPose(current), to, done);
    } else {
      done();
    }
  };

  // ---- Swipe down to dismiss ------------------------------------------
  // The strip is `touch-action: pan-x`, so the browser scrolls sideways
  // itself and hands vertical drags to these handlers.

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (event.button !== 0 || closing) {
      return;
    }
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      mode: "pending",
      dx: 0,
      dy: 0,
    };
    velocity.current.reset();
    velocity.current.add(event.clientY, event.timeStamp);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) {
      return;
    }
    d.dx = event.clientX - d.x;
    d.dy = event.clientY - d.y;
    if (d.mode === "pending" && Math.hypot(d.dx, d.dy) >= 8) {
      // Past the slop it is a drag, not a tap: down is dismiss, else a pan.
      d.mode = d.dy > 0 && Math.abs(d.dy) > Math.abs(d.dx) ? "dismiss" : "pan";
      if (d.mode === "dismiss") {
        event.currentTarget.setPointerCapture(event.pointerId);
        setChrome(false);
      }
    }
    if (d.mode === "dismiss") {
      velocity.current.add(event.clientY, event.timeStamp);
      followFinger(d.dx, d.dy);
    }
  };

  /** The photo shrinks and follows the finger; the black thins behind it. */
  const followFinger = (dx: number, dy: number) => {
    const frame = frames.current[current];
    const progress = clamp(dy / (viewerRef.current?.offsetHeight ?? 800), 0, 1);
    if (frame) {
      frame.style.transform = `translate(${dx}px, ${Math.max(0, dy)}px) scale(${1 - progress * 0.4})`;
    }
    if (backdropRef.current) {
      backdropRef.current.style.opacity = String(
        1 - clamp(progress * 2.2, 0, 1),
      );
    }
  };

  const onPointerUp = (event: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== event.pointerId) {
      return;
    }
    if (d.mode === "pending") {
      // A tap shows or hides the chrome, as in Photos.
      setChrome((on) => !on);
      return;
    }
    if (d.mode !== "dismiss") {
      return;
    }
    // Downward flick speed: the tracker reports upward as positive.
    const v = -velocity.current.velocity();
    if (d.dy > 90 || v > 0.5) {
      close();
      return;
    }
    // Not far enough: settle back, chrome and all.
    const frame = frames.current[current];
    if (frame) {
      settle(frame);
    }
    if (backdropRef.current) {
      backdropRef.current.style.opacity = "";
    }
    setChrome(true);
  };

  /** The browser took the gesture (a sideways swipe on touch): not a tap,
   * and a half-done dismiss goes back. */
  const onPointerCancel = () => {
    const d = drag.current;
    drag.current = null;
    if (d?.mode !== "dismiss") {
      return;
    }
    const frame = frames.current[current];
    if (frame) {
      settle(frame);
    }
    if (backdropRef.current) {
      backdropRef.current.style.opacity = "";
    }
    setChrome(true);
  };

  return (
    <>
      <div ref={gridRef} className={cn(styles.scroll, styles.photos)}>
        <header className={styles.photosHeader}>
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
                ref={(el) => {
                  thumbs.current[index] = el;
                }}
                type="button"
                className={styles.photoTile}
                style={{
                  visibility:
                    viewing !== null && current === index
                      ? "hidden"
                      : undefined,
                }}
                onClick={() => open(index)}
                aria-label={`Photo ${index + 1} of ${PHOTOS.length}`}
              >
                <Image
                  src={photo}
                  alt=""
                  fill
                  sizes={THUMB_SIZES}
                  placeholder="blur"
                />
              </button>
            </li>
          ))}
        </ul>
        <p className={styles.photosFooter}>{PHOTOS.length} Photos</p>
      </div>

      {viewing !== null && (
        // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Escape closing a dialog is the dialog keyboard contract
        <div
          ref={viewerRef}
          className={styles.viewer}
          role="dialog"
          aria-label="Photo viewer"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              // Close the viewer, not the app.
              event.preventDefault();
              event.stopPropagation();
              close();
            }
          }}
        >
          <div ref={backdropRef} className={styles.viewerBackdrop} />

          <section
            ref={stripRef}
            className={styles.viewerStrip}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region has to take focus for the arrow keys to scroll it
            tabIndex={0}
            aria-label="Photos. Use the arrow keys to move between them."
            onScroll={(event) => {
              const strip = event.currentTarget;
              setCurrent(
                clamp(
                  Math.round(strip.scrollLeft / strip.clientWidth),
                  0,
                  PHOTOS.length - 1,
                ),
              );
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
          >
            {PHOTOS.map((photo, index) => (
              <div key={photo.src} className={styles.viewerSlide}>
                <div
                  ref={(el) => {
                    frames.current[index] = el;
                  }}
                  className={styles.viewerFrame}
                >
                  {/* Already in the cache from the grid: sharp enough to
                      zoom with, and it covers the full image's load. */}
                  <Image src={photo} alt="" fill sizes={THUMB_SIZES} />
                  <Image
                    src={photo}
                    alt={`Photograph ${index + 1}`}
                    fill
                    sizes={FULL_SIZES}
                    loading={Math.abs(index - viewing) <= 1 ? "eager" : "lazy"}
                  />
                </div>
              </div>
            ))}
          </section>

          <div className={cn(styles.viewerBar, !chrome && styles.chromeHidden)}>
            <button
              type="button"
              className={styles.glassButton}
              onClick={close}
              aria-label="Back to library"
            >
              <BackChevron width={10} height={16} />
            </button>
            <span className={styles.viewerTitle} aria-live="polite">
              {current + 1} of {PHOTOS.length}
            </span>
          </div>

          <div
            ref={scrubberRef}
            className={cn(styles.scrubber, !chrome && styles.chromeHidden)}
          >
            {PHOTOS.map((photo, index) => (
              <button
                key={photo.src}
                type="button"
                className={cn(
                  styles.scrubberThumb,
                  index === current && styles.scrubberThumbCurrent,
                )}
                style={
                  index === current
                    ? { width: 44 * Math.min(1.5, photo.width / photo.height) }
                    : undefined
                }
                onClick={() =>
                  stripRef.current?.scrollTo({
                    left: index * (stripRef.current?.clientWidth ?? 0),
                    behavior: reduced ? "auto" : "smooth",
                  })
                }
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === current}
              >
                <Image src={photo} alt="" fill sizes="64px" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
