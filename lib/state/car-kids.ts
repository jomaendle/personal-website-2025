/**
 * Car Kids, the author's band. The full catalogue and its player live at
 * radio.jomaendle.com (repo `jomaendle/ck-player`), backed by a Postgres
 * database this site has no access to.
 *
 * So the handful of tracks the Tonearm craft plays are pinned here rather than
 * fetched. Three reasons: the homepage is `force-static` and should not wait on
 * another service to render; a craft that breaks when an unrelated app is down
 * is worse than one that lists five songs; and the files themselves are public
 * immutable blobs, so a URL that works today keeps working.
 *
 * The audio is served from Vercel Blob with `accept-ranges: bytes` and
 * `access-control-allow-origin: *`, which is what lets the craft seek by
 * setting `currentTime` without downloading a 5MB file first.
 *
 * To add a track: open radio.jomaendle.com, find its `url` and `cover_art`,
 * and paste the filenames below.
 */

const BLOB = "https://07jxyxihso69c0vd.public.blob.vercel-storage.com";

export interface CarKidsTrack {
  title: string;
  release: string;
  /** Full URL to the mp3. */
  url: string;
  /** Full URL to the cover, used as the record label. */
  cover: string;
}

/**
 * A side, in running order. Kept short on purpose: this is a craft, not the
 * band's discography, and every extra track is another label image to fetch.
 */
export const CAR_KIDS_SIDE_A: CarKidsTrack[] = [
  // First on the side, so it is the one on the platter when the page loads.
  {
    title: "Into The Dark",
    release: "Into The Dark",
    url: `${BLOB}/songs/1746514903962-town.mp3`,
    cover: `${BLOB}/covers/1746514934229-ab67616d0000b2733afef23c6b94a0c9144994a9.jpeg`,
  },
  {
    title: "Home",
    release: "Visions EP",
    url: `${BLOB}/songs/1746348285112-01_Home.mp3`,
    cover: `${BLOB}/covers/1746348303017-artworks-000140796152-l0o204-t1080x1080.jpg`,
  },
  {
    title: "Believe",
    release: "Visions EP",
    url: `${BLOB}/songs/1746348345942-02_Believe.mp3`,
    cover: `${BLOB}/covers/1746348351272-artworks-000140796152-l0o204-t1080x1080.jpg`,
  },
  {
    title: "Intimacy",
    release: "Ghosts EP",
    url: `${BLOB}/songs/1746353641809-01_Intimacy__1_.mp3`,
    cover: `${BLOB}/covers/1746353658437-artworks-000108098309-94h4x6-t1080x1080.jpg`,
  },
  {
    title: "Drive Pt. I",
    release: "Drive (Demo EP)",
    url: `${BLOB}/songs/1746351700391-Drive.mp3`,
    cover: `${BLOB}/covers/1746351702352-artworks-000143485027-28e2i2-t1080x1080.jpg`,
  },
];

/** Where the whole catalogue lives. */
export const CAR_KIDS_PLAYER = "https://radio.jomaendle.com";
