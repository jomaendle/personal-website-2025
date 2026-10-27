/**
 * Server-only: the size on disk of each photo in the library, for the info
 * panel in the /ios Photos app. Read once when the static page is built.
 */

import { statSync } from "node:fs";
import path from "node:path";
import { PHOTO_LIBRARY } from "@/lib/state/photos";

// The comment keeps Turbopack from tracing all of public/ into the route.
const ASSETS_DIR = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "public",
  "assets",
);

/** Bytes per photo, in PHOTO_LIBRARY order; 0 where a file can't be read. */
export function getPhotoBytes(): number[] {
  return PHOTO_LIBRARY.map(({ file }) => {
    try {
      return statSync(path.join(ASSETS_DIR, file)).size;
    } catch {
      return 0;
    }
  });
}
