"use client";

import { type MotionValue, m } from "framer-motion";
import type { LibraryPhoto, PhotoExif } from "@/lib/state/photos";
import { PHOTOS_ADDED } from "@/lib/state/photos";
import styles from "../iphone.module.css";

// ---- Formatting -------------------------------------------------------------

let fullDate: Intl.DateTimeFormat | undefined;
let dayMonth: Intl.DateTimeFormat | undefined;
let longDate: Intl.DateTimeFormat | undefined;
let weekday: Intl.DateTimeFormat | undefined;
let clock: Intl.DateTimeFormat | undefined;

const DAY = 86_400_000;

/** When the photo was taken, or, without a capture date, when it was added. */
export const photoDate = (photo: LibraryPhoto | undefined) =>
  new Date(photo?.exif?.taken ?? PHOTOS_ADDED);

/** The viewer's title, Photos' way: Today, Yesterday, a weekday this week,
 * then the date, with the year only when it isn't this year's. */
export function relativeDay(date: Date, now = new Date()) {
  const midnight = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((midnight(now) - midnight(date)) / DAY);
  if (days === 0) {
    return "Today";
  }
  if (days === 1) {
    return "Yesterday";
  }
  if (days > 1 && days < 7) {
    weekday ??= new Intl.DateTimeFormat(undefined, { weekday: "long" });
    return weekday.format(date);
  }
  if (date.getFullYear() === now.getFullYear()) {
    dayMonth ??= new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "long",
    });
    return dayMonth.format(date);
  }
  longDate ??= new Intl.DateTimeFormat(undefined, { dateStyle: "long" });
  return longDate.format(date);
}

export function timeOf(date: Date) {
  clock ??= new Intl.DateTimeFormat(undefined, { timeStyle: "short" });
  return clock.format(date);
}

/** "12 MP", or one decimal under ten: "1.9 MP". */
const megapixels = (w: number, h: number) => {
  const mp = (w * h) / 1e6;
  return `${mp >= 10 ? Math.round(mp) : Number(mp.toFixed(1))} MP`;
};

/** Decimal units, as Photos counts them: "354 KB", "1.2 MB". */
const fileSize = (bytes: number) =>
  bytes >= 1e6
    ? `${(bytes / 1e6).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1e3))} KB`;

const EXTENSION = /\.([^.]+)$/;
const baseName = (file: string) => file.replace(EXTENSION, "");
const format = (file: string) =>
  (file.match(EXTENSION)?.[1] ?? "").toUpperCase();

/** The exposure row's cells, for the fields the photo has. */
const exposure = (exif: PhotoExif | undefined) =>
  exif
    ? [
        exif.iso === undefined ? null : `ISO ${exif.iso}`,
        exif.focalLength === undefined ? null : `${exif.focalLength} mm`,
        exif.exposureBias === undefined ? null : `${exif.exposureBias} ev`,
        exif.aperture === undefined ? null : `ƒ${exif.aperture}`,
        exif.shutter === undefined ? null : `${exif.shutter} s`,
      ].filter((cell): cell is string => cell !== null)
    : [];

// ---- The panel --------------------------------------------------------------

interface PhotoInfoProps {
  photo: LibraryPhoto;
  bytes: number;
  caption: string;
  onCaption: (caption: string) => void;
  open: boolean;
  /** 0 hidden, 1 fully up. */
  progress: MotionValue<number>;
  y: MotionValue<string>;
  /** The share of the viewer it covers when up. */
  height: string;
  panelRef: React.RefObject<HTMLDivElement | null>;
  id: string;
}

/**
 * The info Photos shows under a photo swiped up: a caption, when it was
 * taken and its file name, then the camera card. The prints here carry no
 * camera metadata, so the card says so, as Photos does for a saved image,
 * and keeps to what the file itself tells: format, pixels and size. Whatever
 * `exif` a photo is given (camera, lens, exposure, place) fills in the rest.
 */
export function PhotoInfo({
  photo,
  bytes,
  caption,
  onCaption,
  open,
  progress,
  y,
  height,
  panelRef,
  id,
}: PhotoInfoProps) {
  const { image, file, exif } = photo;
  const date = photoDate(photo);
  fullDate ??= new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  });
  const cells = exposure(exif);
  const specs = [
    megapixels(image.width, image.height),
    `${image.width} × ${image.height}`,
    bytes ? fileSize(bytes) : null,
  ].filter(Boolean);

  return (
    <m.div
      ref={panelRef}
      id={id}
      className={styles.photoInfo}
      style={{ y, opacity: progress, height }}
      inert={!open}
      role="region"
      aria-label="Info"
    >
      <label className={styles.photoCaption}>
        <span className="sr-only">Caption</span>
        <input
          type="text"
          placeholder="Add a Caption"
          value={caption}
          onChange={(event) => onCaption(event.target.value)}
          autoComplete="off"
          enterKeyHint="done"
        />
      </label>

      <div className={styles.photoInfoWhen}>
        <p className={styles.photoInfoDate}>{fullDate.format(date)}</p>
        <p className={styles.photoInfoFile}>{baseName(file)}</p>
      </div>

      <section className={styles.cameraCard} aria-label="Camera">
        <div className={styles.cameraHead}>
          <span>{exif?.camera ?? "No Camera Information"}</span>
          <span className={styles.cameraBadge}>{format(file)}</span>
        </div>
        <div className={styles.cameraBody}>
          {exif?.lens ? <p className={styles.cameraLens}>{exif.lens}</p> : null}
          <p>{specs.join(" • ")}</p>
        </div>
        {cells.length ? (
          <ul className={styles.cameraExposure}>
            {cells.map((cell) => (
              <li key={cell}>{cell}</li>
            ))}
          </ul>
        ) : null}
      </section>

      {exif?.place ? (
        <p className={styles.photoInfoPlace}>{exif.place}</p>
      ) : null}
    </m.div>
  );
}
