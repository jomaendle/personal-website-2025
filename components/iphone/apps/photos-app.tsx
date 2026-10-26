"use client";

import {
  animate,
  m,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { PHOTO_LIBRARY, PHOTOS } from "@/lib/state/photos";
import { cn } from "@/lib/utils";
import type { AppProps } from "../apps";
import { useIphoneData } from "../data";
import {
  BackChevron,
  CollectionsGlyph,
  Ellipsis,
  FilterGlyph,
  Heart,
  InfoGlyph,
  LibraryGlyph,
  Magnifier,
  Share,
  Sliders,
  Trash,
} from "../glyphs";
import styles from "../iphone.module.css";
import { clamp, FADE, SPRING_PUSH, VelocityTracker } from "../motion";
import { PhotoInfo, photoDate, relativeDay, timeOf } from "./photo-info";

/** Grid thumbnails ask for this; the viewer asks for the same, underneath the
 * full image, so it shows the cached thumbnail at once instead of a blur. */
const THUMB_SIZES = "(min-width: 640px) and (min-height: 640px) 134px, 34vw";
const FULL_SIZES = "(min-width: 640px) and (min-height: 640px) 402px, 100vw";
/** iOS's photo zoom: quick out of the gate, long soft landing. */
const ZOOM = { duration: 420, easing: "cubic-bezier(0.2, 0.9, 0.25, 1)" };
/** The scrubber's geometry, matching .scrubberThumb in the stylesheet. */
const SCRUB_THUMB = 28;
const SCRUB_GAP = 2;
const SCRUB_MARGIN = 4;
const SCRUB_HEIGHT = 44;
/** The current thumbnail widens to its photo's shape, up to 3:2. */
const currentThumbWidth = (photo: { width: number; height: number }) =>
  SCRUB_HEIGHT * Math.min(1.5, photo.width / photo.height);

/** How much of the viewer the info panel covers when it is all the way up. */
const SHEET = 0.46;

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
  { rest, to, duration }: { rest: Pose; to: Pose | null; duration: number },
  done: () => void,
) {
  if (to) {
    const from = {
      transform: frame.style.transform || rest.transform,
      clipPath: rest.clipPath,
    };
    frame.animate([from, to], {
      ...ZOOM,
      duration,
      fill: "forwards",
    }).onfinish = done;
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
 * chrome, or scrub the thumbnail strip along the bottom. Swipe up (or
 * scroll down, or press the info button) and the photo slides up over its
 * info, the way Photos shows a photo's details.
 */
export default function PhotosApp(_: AppProps) {
  const reduced = useReducedMotion() ?? false;
  const [viewing, setViewing] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);
  const [chrome, setChrome] = useState(true);
  const [closing, setClosing] = useState(false);
  const { photoBytes } = useIphoneData();
  /** The info panel: where it is headed, and whether it is on screen. */
  const [info, setInfo] = useState(false);
  const [panel, setPanel] = useState(false);
  const [favorites, setFavorites] = useState<ReadonlySet<number>>(
    () => new Set(),
  );
  const [captions, setCaptions] = useState<Record<number, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  /** 0 is the photo alone, 1 the photo slid up over its info. */
  const progress = useMotionValue(0);
  /** How far the photo slides up to sit on the panel, in pixels. */
  const shift = useRef(0);
  const stripY = useTransform(progress, (p) => -p * shift.current);
  // An opaque panel slides; it only fades in its first stretch, to soften
  // the edge, or entirely in place of the slide with reduced motion.
  const panelOpacity = useTransform(progress, (p) =>
    reduced ? p : clamp(p / 0.25, 0, 1),
  );
  const panelY = useTransform(progress, (p) =>
    reduced ? "0%" : `${(1 - p) * 100}%`,
  );

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
    mode: "pending" | "dismiss" | "pan" | "info";
    dx: number;
    dy: number;
    /** Where the info panel was when an info drag began. */
    base: number;
  } | null>(null);
  const velocity = useRef(new VelocityTracker());
  /** The viewer is closing from a fast downward flick. */
  const flicked = useRef(false);

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

  // Open at the newest photos, at the bottom of the library.
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (grid) {
      grid.scrollTop = grid.scrollHeight;
    }
  }, []);

  // Keep the scrubber's current thumbnail centred.
  useEffect(() => {
    if (viewing === null) {
      return;
    }
    const scrubber = scrubberRef.current;
    const photo = PHOTOS[current];
    if (scrubber && photo) {
      // From the layout it is about to have, not the one it has: the
      // thumbnail is still widening when this runs. Thumbnails before it
      // are SCRUB_THUMB wide with SCRUB_GAP between; it has SCRUB_MARGIN on
      // each side. The strip's 50% padding cancels the half-width offset.
      const width = currentThumbWidth(photo);
      scrubber.scrollTo({
        left: current * (SCRUB_THUMB + SCRUB_GAP) + SCRUB_MARGIN + width / 2,
        behavior: reduced ? "auto" : "smooth",
      });
    }
  }, [current, viewing, reduced]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = setTimeout(() => setToast(null), 1400);
    return () => clearTimeout(timer);
  }, [toast]);

  const open = (index: number) => {
    setCurrent(index);
    setChrome(true);
    progress.jump(0);
    setInfo(false);
    setPanel(false);
    setViewing(index);
  };

  /** The viewer's height, and how much bigger it is on screen (the device
   * frame may be scaled to fit the window). */
  const viewerSize = () => {
    const viewer = viewerRef.current;
    const h = viewer?.offsetHeight || 800;
    const k = (viewer?.getBoundingClientRect().height ?? h) / h || 1;
    return { h, k };
  };

  /** How far the photo has to slide up for its bottom edge to meet the top
   * of the panel. */
  const measureShift = (index: number) => {
    const viewer = viewerRef.current;
    const photo = PHOTOS[index];
    if (!(viewer && photo)) {
      return 0;
    }
    const W = viewer.offsetWidth;
    const H = viewer.offsetHeight;
    const aspect = photo.width / photo.height;
    const dh = aspect > W / H ? W / aspect : H;
    return Math.max(0, (H + dh) / 2 - (1 - SHEET) * H);
  };

  /** Bring the panel on screen, measured for the photo, before it moves. */
  const preparePanel = () => {
    if (progress.get() === 0) {
      shift.current = measureShift(current);
    }
    setPanel(true);
    setChrome(true);
  };

  /** Slide the info up or away; `velocity` in screen pixels per ms, upward. */
  const showInfo = (show: boolean, velocity = 0) => {
    if (show) {
      preparePanel();
    }
    setInfo(show);
    const { h, k } = viewerSize();
    animate(
      progress,
      show ? 1 : 0,
      reduced
        ? FADE
        : { ...SPRING_PUSH, velocity: (velocity * 1000) / (h * SHEET * k) },
    ).then(() => {
      if (progress.get() === 0) {
        setPanel(false);
      }
    });
  };

  const share = async () => {
    const photo = PHOTOS[current];
    if (!photo) {
      return;
    }
    const url = new URL(photo.src, window.location.href).href;
    if (navigator.share) {
      try {
        await navigator.share({ url });
      } catch {
        // Dismissed: nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast("Link Copied");
    } catch {
      setToast("Couldn’t Copy Link");
    }
  };

  const toggleFavorite = () =>
    setFavorites((before) => {
      const after = new Set(before);
      if (!after.delete(current)) {
        after.add(current);
      }
      return after;
    });

  /** Out of the info: drop the panel and carry the slid-up offset over onto
   * the photo itself, so it flies home from where it is. */
  const lowerOnto = (frame: HTMLElement | null | undefined) => {
    const lifted = stripY.get();
    if (!lifted) {
      return;
    }
    progress.jump(0);
    setInfo(false);
    setPanel(false);
    if (frame) {
      frame.style.transform = `translate(0px, ${lifted}px) scale(1)`;
    }
  };

  /** Put the current photo back where it came from, from wherever the
   * finger left it. */
  const close = () => {
    if (viewing === null || closing) {
      return;
    }
    setClosing(true);
    const fast = flicked.current;
    flicked.current = false;
    // The bars go first, so they don't sit over the grid as the photo flies.
    setChrome(false);
    const frame = frames.current[current];
    lowerOnto(frame);
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
      putBack(
        frame,
        {
          rest: restPose(current),
          to,
          // Shorter after a fast flick, so it doesn't brake into the curve.
          duration: fast ? ZOOM.duration * 0.8 : ZOOM.duration,
        },
        done,
      );
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
      base: 0,
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
      beginDrag(d, event);
    }
    if (d.mode === "dismiss") {
      velocity.current.add(event.clientY, event.timeStamp);
      followFinger(d.dx, d.dy);
    }
    if (d.mode === "info") {
      velocity.current.add(event.clientY, event.timeStamp);
      const { h, k } = viewerSize();
      progress.set(clamp(d.base - d.dy / k / (h * SHEET), 0, 1));
    }
  };

  /** Past the slop it is a drag, not a tap: down dismisses, up brings the
   * info, and with the info up, down takes it away again. */
  const beginDrag = (
    d: NonNullable<typeof drag.current>,
    event: React.PointerEvent<HTMLElement>,
  ) => {
    d.mode = classify(d.dx, d.dy);
    if (d.mode !== "pan") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (d.mode === "dismiss") {
      setChrome(false);
    }
    if (d.mode === "info") {
      progress.stop();
      d.base = progress.get();
      preparePanel();
    }
  };

  const classify = (dx: number, dy: number) => {
    if (Math.abs(dy) <= Math.abs(dx)) {
      return "pan";
    }
    if (info) {
      return dy > 0 ? "info" : "pan";
    }
    return dy > 0 ? "dismiss" : "info";
  };

  /** The photo shrinks and follows the finger; the black thins behind it. */
  const followFinger = (dx: number, dy: number) => {
    const frame = frames.current[current];
    const pulled = clamp(dy / (viewerRef.current?.offsetHeight ?? 800), 0, 1);
    if (frame) {
      frame.style.transform = `translate(${dx}px, ${Math.max(0, dy)}px) scale(${1 - pulled * 0.4})`;
    }
    if (backdropRef.current) {
      backdropRef.current.style.opacity = String(1 - clamp(pulled * 2.2, 0, 1));
    }
  };

  /** A tap shows or hides the chrome, as in Photos; with the info up, it
   * puts the info away. */
  const tap = () => {
    if (info) {
      showInfo(false);
    } else {
      setChrome((on) => !on);
    }
  };

  /** Upward flick speed decides, or failing a flick, whichever half the
   * panel is in. */
  const endInfoDrag = () => {
    const v = velocity.current.velocity();
    showInfo(v > 0.3 || (v > -0.3 && progress.get() > 0.5), v);
  };

  /** A dismiss let go: far or fast enough puts the photo back, anything
   * less settles it where it was. */
  const endDismiss = (dy: number) => {
    // Downward flick speed: the tracker reports upward as positive.
    const v = -velocity.current.velocity();
    if (dy > 90 || v > 0.5) {
      flicked.current = v > 0.5;
      close();
    } else {
      settleBack();
    }
  };

  /** Back to rest, chrome and all. */
  const settleBack = () => {
    const frame = frames.current[current];
    if (frame) {
      settle(frame);
    }
    // The black comes back with the photo, not in one frame.
    const backdrop = backdropRef.current;
    if (backdrop) {
      const from = backdrop.style.opacity || "1";
      backdrop.style.opacity = "";
      backdrop.animate([{ opacity: from }, { opacity: 1 }], {
        duration: 300,
        easing: ZOOM.easing,
      });
    }
    setChrome(true);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== event.pointerId) {
      return;
    }
    if (d.mode === "pending") {
      tap();
    } else if (d.mode === "info") {
      endInfoDrag();
    } else if (d.mode === "dismiss") {
      endDismiss(d.dy);
    }
  };

  /** The browser took the gesture (a sideways swipe on touch): not a tap,
   * and a half-done drag goes back. */
  const onPointerCancel = () => {
    const d = drag.current;
    drag.current = null;
    if (d?.mode === "info") {
      showInfo(progress.get() > 0.5);
    } else if (d?.mode === "dismiss") {
      settleBack();
    }
  };

  /** Scrolling down over the photo brings its info, as a swipe up does;
   * scrolling back up past the top of the info puts it away. */
  const onWheel = (event: React.WheelEvent<HTMLElement>) => {
    if (
      closing ||
      Math.abs(event.deltaY) < 4 ||
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
    ) {
      return;
    }
    const sheet = panelRef.current;
    // Inside the panel, scrolling is the panel's own until it is at its top.
    const sheetScrolled =
      Boolean(sheet?.contains(event.target as Node)) &&
      (sheet?.scrollTop ?? 0) > 0;
    if (event.deltaY > 0 ? !info : info && !sheetScrolled) {
      showInfo(!info);
    }
  };

  const library = PHOTO_LIBRARY[current];
  const date = photoDate(library);
  const place = library?.exif?.place;
  const favorite = favorites.has(current);

  return (
    <>
      <div ref={gridRef} className={cn(styles.scroll, styles.photos)}>
        <header className={styles.photosHeader}>
          <div>
            <h1 className={styles.photosTitle}>Library</h1>
            <p className={styles.photosCount}>{PHOTOS.length} Items</p>
          </div>
          <div className={styles.photosButtons} aria-hidden>
            <span className={styles.pill}>
              <FilterGlyph />
            </span>
            <span className={styles.pill}>Select</span>
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

      {/* iOS 26 Photos: a floating glass tab bar, Library and Collections,
          with search in its own circle beside it. Library is the only tab
          here, so the bar is drawn, not driven. */}
      <div className={cn(styles.floatingBar, styles.photosTabs)} aria-hidden>
        <div className={styles.tabBar}>
          <span className={styles.tabActive}>
            <LibraryGlyph />
            Library
          </span>
          <span>
            <CollectionsGlyph />
            Collections
          </span>
        </div>
        <span className={cn(styles.glassButton, styles.tabSearch)}>
          <Magnifier />
        </span>
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
              // Put the info away, then close the viewer, never the app.
              event.preventDefault();
              event.stopPropagation();
              if (info) {
                showInfo(false);
              } else {
                close();
              }
            }
          }}
          onWheel={onWheel}
        >
          <div ref={backdropRef} className={styles.viewerBackdrop} />

          <m.section
            ref={stripRef}
            className={cn(
              styles.viewerStrip,
              panel && styles.viewerStripLocked,
            )}
            style={{ y: stripY }}
            // A scrollable region has to take focus for the arrow keys to
            // scroll it.
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
          </m.section>

          {panel && library ? (
            <PhotoInfo
              photo={library}
              bytes={photoBytes[current] ?? 0}
              caption={captions[current] ?? ""}
              onCaption={(caption) =>
                setCaptions((all) => ({ ...all, [current]: caption }))
              }
              open={info}
              progress={panelOpacity}
              y={panelY}
              height={`${SHEET * 100}%`}
              panelRef={panelRef}
              id={panelId}
            />
          ) : null}

          <ViewerBar
            hidden={!chrome}
            date={date}
            place={place}
            position={`Photo ${current + 1} of ${PHOTOS.length}`}
            onBack={close}
          />

          <div
            ref={scrubberRef}
            className={cn(
              styles.scrubber,
              (panel || !chrome) && styles.chromeHidden,
            )}
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
                    ? { width: currentThumbWidth(photo) }
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

          <ViewerTools
            hidden={!chrome}
            favorite={favorite}
            info={info}
            panelId={panel ? panelId : undefined}
            onShare={share}
            onFavorite={toggleFavorite}
            onInfo={() => showInfo(!info)}
          />

          {toast ? (
            <div className={styles.hud} role="status">
              {toast}
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}

/** The viewer's top bar: back, the day and time in a glass capsule (the
 * place over them, when the photo has one), and the More button. */
function ViewerBar({
  hidden,
  date,
  place,
  position,
  onBack,
}: {
  hidden: boolean;
  date: Date;
  place: string | undefined;
  position: string;
  onBack: () => void;
}) {
  const day = relativeDay(date);
  return (
    <div className={cn(styles.viewerBar, hidden && styles.chromeHidden)}>
      <button
        type="button"
        className={styles.glassButton}
        onClick={onBack}
        aria-label="Back to library"
      >
        <BackChevron width={10} height={16} />
      </button>
      <div className={styles.viewerCapsule}>
        <span className={styles.viewerCapsuleTitle}>{place ?? day}</span>
        <span className={styles.viewerCapsuleDetail}>
          {place ? `${day} ${timeOf(date)}` : timeOf(date)}
        </span>
      </div>
      <span className={cn(styles.glassButton, styles.viewerMore)} aria-hidden>
        <Ellipsis />
      </span>
      <span className="sr-only" aria-live="polite">
        {position}
      </span>
    </div>
  );
}

/** iOS 26's photo toolbar: Share, then Favorite, Info and Edit in one glass
 * capsule, then Delete. Edit and Delete belong to the library's owner, not a
 * visitor, so they are drawn and do nothing. */
function ViewerTools({
  hidden,
  favorite,
  info,
  panelId,
  onShare,
  onFavorite,
  onInfo,
}: {
  hidden: boolean;
  favorite: boolean;
  info: boolean;
  panelId: string | undefined;
  onShare: () => void;
  onFavorite: () => void;
  onInfo: () => void;
}) {
  return (
    <div className={cn(styles.viewerTools, hidden && styles.chromeHidden)}>
      <button
        type="button"
        className={cn(styles.glassButton, styles.glassButtonLarge)}
        onClick={onShare}
        aria-label="Share"
      >
        <Share />
      </button>
      <div className={styles.toolCapsule}>
        <button
          type="button"
          className={cn(favorite && styles.toolFavorite)}
          onClick={onFavorite}
          aria-label="Favorite"
          aria-pressed={favorite}
        >
          <Heart filled={favorite} />
        </button>
        <button
          type="button"
          onClick={onInfo}
          aria-label="Info"
          aria-expanded={info}
          aria-controls={panelId}
        >
          <InfoGlyph filled={info} />
        </button>
        <span aria-hidden>
          <Sliders />
        </span>
      </div>
      <span
        className={cn(styles.glassButton, styles.glassButtonLarge)}
        aria-hidden
      >
        <Trash />
      </span>
    </div>
  );
}
