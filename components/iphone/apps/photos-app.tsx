"use client";

import { m, useMotionValue, useReducedMotion } from "framer-motion";
import Image, { getImageProps } from "next/image";
import {
  startTransition,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { PHOTO_LIBRARY, PHOTOS } from "@/lib/state/photos";
import { cn } from "@/lib/utils";
import type { AppProps } from "../apps";
import { halt, motionNow, springTo, useDrive } from "../compositor-spring";
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
} from "../glyphs";
import styles from "../iphone.module.css";
import {
  bezierProgress,
  clamp,
  FADE,
  FPS,
  lerp,
  SPRING_PUSH,
  springEasing,
  springProgress,
  useVelocityTracker,
} from "../motion";
import { useLatest } from "../use-latest";
import { useShare } from "../use-share";
import { PhotoInfo, photoDate, relativeDay, timeOf } from "./photo-info";

/** Grid thumbnails ask for this; the viewer asks for the same, underneath the
 * full image, so it shows the cached thumbnail at once instead of a blur. */
const THUMB_SIZES = "(min-width: 640px) and (min-height: 640px) 134px, 34vw";
const FULL_SIZES = "(min-width: 640px) and (min-height: 640px) 402px, 100vw";

/** The library's first screen of thumbnails, fetched and decoded at the
 * size the grid will ask for (the same srcset and sizes), while the phone
 * is idle. */
export function warmLibrary() {
  for (const photo of PHOTOS.slice(0, 12)) {
    const { props } = getImageProps({
      src: photo,
      alt: "",
      sizes: THUMB_SIZES,
      fill: true,
    });
    const img = new window.Image();
    img.sizes = props.sizes ?? "";
    img.srcset = props.srcSet ?? "";
    img.src = props.src;
    img.decode().catch(() => undefined);
  }
}
/** iOS's photo zoom: quick out of the gate, long soft landing. */
const ZOOM = { duration: 420, easing: "cubic-bezier(0.2, 0.9, 0.25, 1)" };
/** Where the library was scrolled to, kept while the page is open so the
 * app reopens in place. */
let libraryScroll = 0;

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
/** Taller for a photo with a description and a map to show. */
const sheetFor = (index: number) =>
  PHOTO_LIBRARY[index]?.about ? 0.64 : SHEET;

/**
 * Where the photo is: moved by `tx`, `ty` and scaled by `u`, showing a
 * `rx` × `ry` window of the viewer's pixels around its centre. At rest
 * that window is the whole viewer (a contained photo's letterbox is
 * transparent, so it needs no clip); on a thumbnail, the square it crops.
 */
type Shot = { tx: number; ty: number; u: number; rx: number; ry: number };

const REST_TRANSFORM = "translate(0px, 0px) scale(1)";
const ZOOM_CURVE: [number, number, number, number] = [0.2, 0.9, 0.25, 1];

/**
 * A move from one shot to another as Web Animation keyframes, one per
 * `progress` sample. The frame is squashed to the window's shape, which
 * clips the photo, and the photo inside is stretched back by as much, so
 * it only ever scales evenly: transforms the compositor runs alone, where
 * an animated clip-path is redrawn on the main thread every frame.
 */
function shotKeyframes(
  from: Shot,
  to: Shot,
  progress: number[],
  [W, H]: [number, number],
) {
  const outer: Keyframe[] = [];
  const inner: Keyframe[] = [];
  for (const e of progress) {
    const s = {
      tx: lerp(from.tx, to.tx, e),
      ty: lerp(from.ty, to.ty, e),
      u: lerp(from.u, to.u, e),
      rx: Math.max(1, lerp(from.rx, to.rx, e)),
      ry: Math.max(1, lerp(from.ry, to.ry, e)),
    };
    outer.push({
      transform: `translate(${s.tx}px, ${s.ty}px) scale(${(s.rx * s.u) / W}, ${(s.ry * s.u) / H})`,
    });
    inner.push({ transform: `scale(${W / s.rx}, ${H / s.ry})` });
  }
  return { outer, inner };
}

/** The zoom out of a thumbnail each frame is running, so an interruption
 * (Escape, a finger) can carry on from where the photo is on screen: its
 * animations hold no fill, and its inline style says nothing of it. */
const zooms = new WeakMap<
  HTMLElement,
  {
    from: Shot;
    to: Shot;
    progress: number[];
    t0: number;
    photo: HTMLElement | null | undefined;
  }
>();

/** Stop a zoom in flight and say where it had got to; null if it had
 * already landed, or there was none. */
function catchZoom(frame: HTMLElement): Shot | null {
  const zoom = zooms.get(frame);
  zooms.delete(frame);
  if (!zoom) {
    return null;
  }
  const i = ((performance.now() - zoom.t0) / 1000) * FPS;
  const last = zoom.progress.length - 1;
  for (const animation of [
    ...frame.getAnimations(),
    ...(zoom.photo?.getAnimations() ?? []),
  ]) {
    animation.cancel();
  }
  if (i >= last) {
    return null;
  }
  const lo = Math.max(0, Math.floor(i));
  const e = lerp(zoom.progress[lo] ?? 0, zoom.progress[lo + 1] ?? 1, i - lo);
  const { from, to } = zoom;
  return {
    tx: lerp(from.tx, to.tx, e),
    ty: lerp(from.ty, to.ty, e),
    u: lerp(from.u, to.u, e),
    rx: lerp(from.rx, to.rx, e),
    ry: lerp(from.ry, to.ry, e),
  };
}

/** Run a move on the frame and the photo inside it; `done` once it ends. */
function playShot(
  els: { frame: HTMLElement; photo: HTMLElement | null | undefined },
  move: { from: Shot; to: Shot; progress: number[]; size: [number, number] },
  done?: () => void,
) {
  const { outer, inner } = shotKeyframes(
    move.from,
    move.to,
    move.progress,
    move.size,
  );
  const timing: KeyframeAnimationOptions = {
    duration: ((move.progress.length - 1) * 1000) / FPS,
    easing: "linear",
    fill: done ? "forwards" : "none",
  };
  els.photo?.animate(inner, timing);
  const animation = els.frame.animate(outer, timing);
  if (done) {
    zooms.delete(els.frame);
    animation.onfinish = done;
  } else {
    zooms.set(els.frame, { ...move, t0: performance.now(), photo: els.photo });
  }
}

const DRAGGED = /translate\((-?[\d.]+)px, (-?[\d.]+)px\) scale\((-?[\d.]+)\)/;

/** The shot a finger (or the info sheet) left the frame in: its inline
 * translate and scale, the whole viewer showing. */
function shotOf(frame: HTMLElement, W: number, H: number): Shot {
  const m = frame.style.transform.match(DRAGGED);
  return {
    tx: Number(m?.[1] ?? 0),
    ty: Number(m?.[2] ?? 0),
    u: Number(m?.[3] ?? 1),
    rx: W,
    ry: H,
  };
}

/** Animate the photo back from a finger-dragged transform to rest, on a
 * spring that starts at the finger's speed (`velocity`, progress per
 * second toward rest), so a release mid-swipe doesn't stop dead first. */
function settle(frame: HTMLElement, velocity: number) {
  const from = frame.style.transform;
  frame.style.transform = "";
  frame.animate(
    [{ transform: from }, { transform: REST_TRANSFORM }],
    springEasing(velocity, { stiffness: 320, damping: 0.85 }),
  );
}

/** Fly the photo to `to` (its thumbnail), or fade it if there is none.
 * After a flick it leaves at the flick's speed (`velocity`, progress per
 * second), rather than braking into a fixed curve. */
function putBack(
  els: { frame: HTMLElement; photo: HTMLElement | null | undefined },
  {
    to,
    velocity,
    size: [W, H],
  }: { to: Shot | null; velocity: number; size: [number, number] },
  done: () => void,
) {
  const { frame } = els;
  if (to) {
    playShot(
      els,
      {
        from: catchZoom(frame) ?? shotOf(frame, W, H),
        to,
        progress:
          velocity > 0
            ? springProgress(velocity, { stiffness: 260 })
            : bezierProgress(ZOOM_CURVE, ZOOM.duration),
        size: [W, H],
      },
      done,
    );
  } else {
    frame.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 200,
      fill: "forwards",
    }).onfinish = done;
  }
}

let labelDate: Intl.DateTimeFormat | undefined;

/** What a screen reader hears for a photo: what it shows, where and when,
 * from the library; a print with nothing written about it is numbered. */
function photoLabel(index: number) {
  const photo = PHOTO_LIBRARY[index];
  const about = photo?.about;
  if (!(photo && about)) {
    return `Photo ${index + 1} of ${PHOTOS.length}`;
  }
  labelDate ??= new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
  return `${about.title}, ${about.place.split(",")[0]}, ${labelDate.format(photoDate(photo))}`;
}

/**
 * My photographs as Photos' library grid, under a progressive blur. A photo
 * zooms out of its thumbnail into a viewer and back into it on the way out,
 * the iOS hero transition, run as a Web Animation on transforms alone
 * so it stays on the compositor. In the viewer: swipe sideways between photos
 * (a native scroll-snap strip), swipe down to put one back, tap to hide the
 * chrome, or scrub the thumbnail strip along the bottom. Swipe up (or
 * scroll down, or press the info button) and the photo slides up over its
 * info, the way Photos shows a photo's details.
 */
export default function PhotosApp({ launch }: AppProps) {
  const reduced = useReducedMotion() ?? false;
  // Opened on a photo (a Spotlight result), it starts in the viewer.
  const [viewing, setViewing] = useState<number | null>(launch?.photo ?? null);
  const [current, setCurrent] = useState(launch?.photo ?? 0);
  /** That first viewing has no thumbnail on screen to grow out of: the app
   * itself is still opening. */
  const launchedOnPhoto = useRef(launch?.photo !== undefined);
  /** The strip's width, measured on its first scroll of a viewing. */
  const stripWidth = useRef(0);
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
  /** The filter button: the library narrowed to the hearted photos. */
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const { share: shareLink, hud } = useShare();
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  /** 0 is the photo alone, 1 the photo slid up over its info. */
  const progress = useMotionValue(0);
  /** How far the photo slides up to sit on the panel, in pixels. */
  const shift = useRef(0);

  const gridRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLElement>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);
  const reducedRef = useLatest(reduced);
  // The photo slides up by `shift`; the opaque panel slides in under it,
  // fading only in its first stretch to soften the edge, or entirely in
  // place of the slide with reduced motion. One style each for a finger and
  // for the compositor's spring (useDrive).
  const [stripStyle, panelStyle] = useDrive(progress, () => {
    const still = reducedRef.current;
    return [
      {
        el: stripRef.current,
        style: (p) => ({ transform: `translateY(${-p * shift.current}px)` }),
      },
      {
        el: panelRef.current,
        style: (p) => ({
          transform: `translateY(${still ? 0 : (1 - p) * 100}%)`,
          opacity: still ? p : clamp(p / 0.25, 0, 1),
        }),
      },
    ];
  });
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
    /** Where the photo was when a dismiss drag caught its zoom in flight,
     * as a uniform shot the drag moves on from. */
    from?: { tx: number; ty: number; u: number };
  } | null>(null);
  const tracker = useVelocityTracker();
  /** The viewer is closing from a fast downward flick. */
  /** The flick that closed the viewer, as progress per second toward the
   * thumbnail; 0 for a close by button or a slow drag. */
  const flicked = useRef(0);
  /** Each slide's photo, inside its frame: stretched back while the frame
   * is squashed to a thumbnail's shape. */
  const photos = useRef<(HTMLDivElement | null)[]>([]);

  /**
   * The photo's pose sitting on its thumbnail, in the viewer's unscaled
   * pixels: the contained image scaled until its short side matches the
   * square thumbnail, moved onto it, and clipped to that square.
   */
  const thumbPose = (index: number): Shot | null => {
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
    // Only a thumbnail at least half in the clear: not one hidden under the
    // header's blur or the floating tab bar, which the photo would fly into
    // and vanish behind.
    const grid = gridRef.current;
    if (grid) {
      const box = grid.getBoundingClientRect();
      const css = getComputedStyle(grid);
      const top = box.top + (Number.parseFloat(css.scrollPaddingTop) || 0) * k;
      const bottom =
        box.bottom - (Number.parseFloat(css.scrollPaddingBottom) || 0) * k;
      const shown = Math.min(t.bottom, bottom) - Math.max(t.top, top);
      if (shown < t.height / 2) {
        return null;
      }
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
    return { tx, ty, u: s, rx: crop, ry: crop };
  };

  /** The viewer's size, unscaled. */
  const viewerBox = (): [number, number] => [
    viewerRef.current?.offsetWidth ?? 0,
    viewerRef.current?.offsetHeight ?? 0,
  ];

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
    const fromLaunch = launchedOnPhoto.current;
    launchedOnPhoto.current = false;
    const from = reduced || fromLaunch ? null : thumbPose(viewing);
    backdropRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: from ? ZOOM.duration * 0.7 : 200,
      easing: "ease-out",
    });
    if (frame && from) {
      const [W, H] = viewerBox();
      playShot(
        { frame, photo: photos.current[viewing] },
        {
          from,
          to: { tx: 0, ty: 0, u: 1, rx: W, ry: H },
          progress: bezierProgress(ZOOM_CURVE, ZOOM.duration),
          size: [W, H],
        },
      );
    } else if (frame) {
      // No thumbnail to come out of: settle in from a touch small, rather
      // than appear at full size in one frame.
      frame.animate(
        [
          { opacity: 0, transform: reduced ? REST_TRANSFORM : "scale(0.96)" },
          { opacity: 1, transform: REST_TRANSFORM },
        ],
        { duration: 220, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
      );
    }
  }, [viewing]);

  // Reopened, the library is where it was left, as Photos keeps it; the
  // first time, it starts at the top.
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (grid) {
      grid.scrollTop = libraryScroll;
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

  const open = (index: number) => {
    setCurrent(index);
    setChrome(true);
    halt(progress);
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
    return Math.max(0, (H + dh) / 2 - (1 - sheetFor(index)) * H);
  };

  /** Bring the panel on screen, measured for the photo, before it moves. */
  const preparePanel = () => {
    if (motionNow(progress).value === 0) {
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
    const run = () =>
      springTo(progress, {
        to: show ? 1 : 0,
        transition: reduced ? FADE : SPRING_PUSH,
        velocity: (velocity * 1000) / (h * sheetFor(current) * k),
      }).then((completed) => {
        if (completed && progress.get() === 0) {
          setPanel(false);
        }
      });
    // A panel just asked for is drawn next frame: slide it from there.
    if (show && !panelRef.current) {
      requestAnimationFrame(run);
    } else {
      run();
    }
  };

  const share = () => {
    const photo = PHOTOS[current];
    if (photo) {
      shareLink(new URL(photo.src, window.location.href).href);
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
    const lifted = -halt(progress) * shift.current;
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
    const flick = flicked.current;
    flicked.current = 0;
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
      stripWidth.current = 0;
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
        { frame, photo: photos.current[current] },
        { to, velocity: flick, size: viewerBox() },
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
    tracker.reset();
    tracker.add(event.clientY, event.timeStamp);
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
      tracker.add(event.clientY, event.timeStamp);
      followFinger(d.dx, d.dy, d.from);
    }
    if (d.mode === "info") {
      tracker.add(event.clientY, event.timeStamp);
      const { h, k } = viewerSize();
      progress.set(clamp(d.base - d.dy / k / (h * sheetFor(current)), 0, 1));
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
      // Caught on its way out of the thumbnail: the finger takes it from
      // there, not from full size. The drag scales evenly, so the frame's
      // squash becomes an even scale of the same width.
      const frame = frames.current[current];
      const live = frame && catchZoom(frame);
      if (live) {
        const [W] = viewerBox();
        d.from = { tx: live.tx, ty: live.ty, u: (live.rx * live.u) / W };
      }
    }
    if (d.mode === "info") {
      d.base = halt(progress);
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
  const followFinger = (
    dx: number,
    dy: number,
    from = { tx: 0, ty: 0, u: 1 },
  ) => {
    const frame = frames.current[current];
    const pulled = clamp(dy / (viewerRef.current?.offsetHeight ?? 800), 0, 1);
    if (frame) {
      frame.style.transform = `translate(${from.tx + dx}px, ${from.ty + Math.max(0, dy)}px) scale(${from.u * (1 - pulled * 0.4)})`;
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
    const v = tracker.velocity();
    showInfo(v > 0.3 || (v > -0.3 && progress.get() > 0.5), v);
  };

  /** A dismiss let go: far or fast enough puts the photo back, anything
   * less settles it where it was. */
  const endDismiss = (dy: number) => {
    // Downward flick speed: the tracker reports upward as positive.
    const v = -tracker.velocity();
    // Far enough, or a flick downwards: a light one will do.
    if (dy > 90 || (v > 0.15 && dy > 24)) {
      // The flick's speed as progress toward the thumbnail, about half the
      // viewer away; capped so a hard flick doesn't snap there.
      const h = viewerRef.current?.offsetHeight ?? 800;
      flicked.current = clamp((v * 1000) / (h * 0.5), 0, 6);
      close();
    } else {
      // Moving down is moving away from rest: a negative start.
      settleBack(dy > 1 ? clamp((-v * 1000) / dy, -8, 8) : 0);
    }
  };

  /** Back to rest, chrome and all, from the finger's speed (progress per
   * second toward rest). */
  const settleBack = (velocity = 0) => {
    const frame = frames.current[current];
    if (frame) {
      settle(frame, velocity);
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
  // The capsule names the town, as Photos does: "Sagres", not the region.
  const place = library?.about?.place.split(",")[0];
  const favorite = favorites.has(current);

  return (
    <>
      <div
        ref={gridRef}
        className={cn(styles.scroll, styles.photos)}
        onScroll={(event) => {
          libraryScroll = event.currentTarget.scrollTop;
        }}
      >
        <header className={styles.photosHeader}>
          <div>
            <h1 className={styles.photosTitle}>Library</h1>
            <p className={styles.photosCount}>
              {onlyFavorites
                ? `${favorites.size} ${favorites.size === 1 ? "Favorite" : "Favorites"}`
                : `${PHOTOS.length} Items`}
            </p>
          </div>
          <div className={styles.photosButtons}>
            <button
              type="button"
              className={cn(styles.pill, onlyFavorites && styles.pillOn)}
              onClick={() => setOnlyFavorites((on) => !on)}
              aria-label="Show Favorites only"
              aria-pressed={onlyFavorites}
            >
              <FilterGlyph />
            </button>
          </div>
        </header>

        {onlyFavorites && favorites.size === 0 ? (
          <p className={styles.photosEmpty}>
            No Favorites Yet
            <span>Tap ♥ on a photo to add it here.</span>
          </p>
        ) : null}

        <ul className={styles.photoGrid} aria-label="Photos">
          {PHOTOS.map((photo, index) => (
            <li key={photo.src} hidden={onlyFavorites && !favorites.has(index)}>
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
                aria-label={photoLabel(index)}
              >
                {/* No blur placeholder: three dozen of them, each a filtered
                    image to decode, were most of the launch's first frame.
                    The tile's own grey stands in for the moment it takes. */}
                <Image src={photo} alt="" fill sizes={THUMB_SIZES} />
              </button>
            </li>
          ))}
        </ul>
        {onlyFavorites ? null : (
          <p className={styles.photosFooter}>{PHOTOS.length} Photos</p>
        )}
      </div>

      {/* iOS 26 Photos: a floating glass tab bar, Library and Collections,
          with search in its own circle beside it. Library is the only tab
          here: Collections and search are drawn dimmed, unavailable. */}
      <div className={cn(styles.floatingBar, styles.photosTabs)} aria-hidden>
        <div className={styles.tabBar}>
          <span className={styles.tabActive}>
            <LibraryGlyph />
            Library
          </span>
          <span className={styles.unavailable}>
            <CollectionsGlyph />
            Collections
          </span>
        </div>
        <span
          className={cn(
            styles.glassButton,
            styles.tabSearch,
            styles.unavailable,
          )}
        >
          <Magnifier />
        </span>
      </div>

      {viewing !== null && (
        // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Escape closing a dialog is the dialog keyboard contract
        <div
          ref={viewerRef}
          className={styles.viewer}
          data-closing={closing || undefined}
          role="dialog"
          aria-modal="true"
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
            style={stripStyle}
            // A scrollable region has to take focus for the arrow keys to
            // scroll it.
            tabIndex={0}
            aria-label="Photos. Use the arrow keys to move between them."
            onScroll={(event) => {
              const strip = event.currentTarget;
              // Measured once per viewing: reading clientWidth on every
              // scroll event would force a layout each time.
              if (!stripWidth.current) {
                stripWidth.current = strip.clientWidth;
              }
              const index = clamp(
                Math.round(strip.scrollLeft / stripWidth.current),
                0,
                PHOTOS.length - 1,
              );
              if (index === current) {
                return;
              }
              // Mounting the next slides and thumbnails can wait a frame:
              // the strip is scrolling, and that stays smooth.
              startTransition(() => setCurrent(index));
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
                  <div
                    ref={(el) => {
                      photos.current[index] = el;
                    }}
                    className={styles.viewerPhoto}
                  >
                    {/* Only the photos a swipe can reach next: building all of
                      them made the tap that opens the viewer a long task.
                      The thumbnail, already in the cache from the grid, is
                      sharp enough to zoom with and covers the full image's
                      load. */}
                    {Math.abs(index - current) <= 2 ? (
                      <>
                        <Image src={photo} alt="" fill sizes={THUMB_SIZES} />
                        <Image
                          src={photo}
                          alt={
                            PHOTO_LIBRARY[index]?.about?.description ??
                            `Photograph ${index + 1}`
                          }
                          fill
                          sizes={FULL_SIZES}
                          loading="eager"
                        />
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </m.section>

          {panel && library ? (
            <PhotoInfo
              photo={library}
              bytes={photoBytes[current] ?? 0}
              caption={captions[current] ?? library.about?.title ?? ""}
              onCaption={(caption) =>
                setCaptions((all) => ({ ...all, [current]: caption }))
              }
              open={info}
              panelStyle={panelStyle}
              height={`${sheetFor(current) * 100}%`}
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
                aria-label={`Show ${photoLabel(index)}`}
                aria-current={index === current}
                // One stop in the tab order, not 32: the arrow keys move
                // between photos already.
                tabIndex={index === current ? 0 : -1}
              >
                {/* The thumbnails near the current photo; the rest are plain
                    slots until they come near, as a strip of three dozen
                    images is most of the tap that opens the viewer. */}
                {Math.abs(index - current) <= 10 ? (
                  <Image src={photo} alt="" fill sizes="64px" />
                ) : null}
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

          {hud}
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
      <span
        className={cn(
          styles.glassButton,
          styles.viewerMore,
          styles.unavailable,
        )}
        aria-hidden
      >
        <Ellipsis />
      </span>
      <span className="sr-only" aria-live="polite">
        {position}
      </span>
    </div>
  );
}

/** iOS 26's photo toolbar: Share, then Favorite and Info in one glass
 * capsule. Edit and Delete belong to the library's owner, not a visitor, so
 * they are left out rather than shown and dead. */
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
          onClick={(event) => {
            // Made a favourite, the heart gives a little bounce, as the
            // symbol does on iOS; taking it away just empties it.
            if (!favorite) {
              const heart = event.currentTarget.querySelector("svg");
              for (const running of heart?.getAnimations() ?? []) {
                running.cancel();
              }
              heart?.animate([{ scale: 1 }, { scale: 1.25 }, { scale: 1 }], {
                duration: 320,
                easing: "cubic-bezier(0.23, 1, 0.32, 1)",
              });
            }
            onFavorite();
          }}
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
      </div>
    </div>
  );
}
