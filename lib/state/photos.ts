import type { StaticImageData } from "next/image";
import dsc00465 from "@/public/assets/DSC00465.webp";
import dsc00483 from "@/public/assets/DSC00483-web.webp";
import dsc00535 from "@/public/assets/DSC00535.webp";
import dsc00645 from "@/public/assets/DSC00645.webp";
import dsc00911 from "@/public/assets/DSC00911.webp";
import dsc00929 from "@/public/assets/DSC00929.webp";
import dsc04499 from "@/public/assets/DSC04499.webp";
import dsc04861 from "@/public/assets/DSC04861.webp";
import dsc04938 from "@/public/assets/DSC04938.webp";
import dsc05383 from "@/public/assets/DSC05383.webp";
import dsc05480 from "@/public/assets/DSC05480.webp";
import dsc09908 from "@/public/assets/DSC09908.webp";
import photo6554107 from "@/public/assets/Photo_6554107.webp";

/** What a photo's metadata can say about how it was taken. Every field is
 * optional: a value goes in only when it comes from the photo itself, and the
 * Photos app shows what is there and leaves the rest out. */
export interface PhotoExif {
  /** "Sony ILCE-6000" */
  camera?: string;
  /** "E 35mm F1.8 OSS" */
  lens?: string;
  iso?: number;
  /** Millimetres. */
  focalLength?: number;
  /** "+0.3" */
  exposureBias?: string;
  aperture?: number;
  /** "1/250" */
  shutter?: string;
  /** ISO 8601, with the offset where it was taken. */
  taken?: string;
  place?: string;
}

export interface LibraryPhoto {
  image: StaticImageData;
  /** The file under public/assets. */
  file: string;
  exif?: PhotoExif;
}

/**
 * My photographs, in the order the homepage pile lays them out. Static
 * imports carry each print's dimensions (for orientation) and a build-time
 * blur placeholder (for lazy prints). The prints were exported for the web
 * without their camera metadata, so none have `exif` yet.
 */
export const PHOTO_LIBRARY: LibraryPhoto[] = [
  { image: dsc00483, file: "DSC00483-web.webp" },
  { image: dsc00465, file: "DSC00465.webp" },
  { image: dsc00645, file: "DSC00645.webp" },
  { image: dsc00929, file: "DSC00929.webp" },
  { image: dsc00535, file: "DSC00535.webp" },
  { image: dsc04861, file: "DSC04861.webp" },
  { image: dsc04938, file: "DSC04938.webp" },
  { image: dsc00911, file: "DSC00911.webp" },
  { image: dsc05383, file: "DSC05383.webp" },
  { image: dsc05480, file: "DSC05480.webp" },
  { image: dsc04499, file: "DSC04499.webp" },
  { image: dsc09908, file: "DSC09908.webp" },
  { image: photo6554107, file: "Photo_6554107.webp" },
];

/** The prints alone. Read by the homepage image stack and by the /iphone
 * page's Photos app. */
export const PHOTOS: StaticImageData[] = PHOTO_LIBRARY.map((p) => p.image);

/** When the prints were added to the site (the commit that brought them in):
 * the date Photos shows for a photo that has no capture date of its own. */
export const PHOTOS_ADDED = "2026-09-13T10:22:02+02:00";

/** The /iphone Photos widget: a surfer against the sunset. */
export const FEATURED_PHOTO = dsc00535;

/** The /iphone wallpaper. Portrait, with open sky where the clock sits. */
export const WALLPAPER = dsc04499;
