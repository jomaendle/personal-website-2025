/**
 * Car Kids, my band, for the /ios Music app: a snapshot of the catalogue
 * the radio site serves (radio.jomaendle.com). Songs stream and covers load
 * straight from that site's Blob store, so the phone plays the same files.
 *
 * A snapshot rather than a fetch: the site exposes no public API, and the
 * catalogue changes rarely. A new release means adding it here too.
 */

/** The radio site's Vercel Blob store. Also allowed in next.config.mjs, as
 * a remote image pattern (covers) and in the CSP's media-src (songs). */
const BLOB = "https://07jxyxihso69c0vd.public.blob.vercel-storage.com";

export interface Track {
  id: number;
  title: string;
  /** Streamed as-is: an MP3 served with byte ranges, so seeking works. */
  src: string;
  cover: string;
  /** The release it belongs to; singles have none. */
  album?: number;
}

export interface Album {
  id: number;
  title: string;
  year: number;
  cover: string;
  /** Track ids in running order. */
  tracks: number[];
}

const song = (path: string) => `${BLOB}/songs/${path}`;
const cover = (path: string) => `${BLOB}/covers/${path}`;

export const TRACKS: Track[] = [
  {
    id: 18,
    title: "Into The Dark",
    src: song("1746514903962-town.mp3"),
    cover: cover("1746514934229-ab67616d0000b2733afef23c6b94a0c9144994a9.jpeg"),
    album: 7,
  },
  {
    id: 5,
    title: "Home",
    src: song("1746348285112-01_Home.mp3"),
    cover: cover("1746348303017-artworks-000140796152-l0o204-t1080x1080.jpg"),
    album: 4,
  },
  {
    id: 6,
    title: "Believe",
    src: song("1746348345942-02_Believe.mp3"),
    cover: cover("1746348351272-artworks-000140796152-l0o204-t1080x1080.jpg"),
    album: 4,
  },
  {
    id: 7,
    title: "Pressure",
    src: song("1746348406550-03_Pressure.mp3"),
    cover: cover("1746348408760-artworks-000140796152-l0o204-t1080x1080.jpg"),
    album: 4,
  },
  {
    id: 8,
    title: "Together",
    src: song("1746348418647-04_Together.mp3"),
    cover: cover("1746348425092-artworks-000140796152-l0o204-t1080x1080.jpg"),
    album: 4,
  },
  {
    id: 9,
    title: "Outside",
    src: song("1746348434948-05_Outside.mp3"),
    cover: cover("1746348440276-artworks-000140796152-l0o204-t1080x1080.jpg"),
    album: 4,
  },
  {
    id: 10,
    title: "Down",
    src: song("1746348449881-06_Down.mp3"),
    cover: cover("1746348457527-artworks-000140796152-l0o204-t1080x1080.jpg"),
    album: 4,
  },
  {
    id: 11,
    title: "Me",
    src: song("1746348466951-07_Me.mp3"),
    cover: cover("1746348472166-artworks-000140796152-l0o204-t1080x1080.jpg"),
    album: 4,
  },
  {
    id: 12,
    title: "Drive Pt. I",
    src: song("1746351700391-Drive.mp3"),
    cover: cover("1746351702352-artworks-000143485027-28e2i2-t1080x1080.jpg"),
    album: 5,
  },
  {
    id: 13,
    title: "Drive Pt. II",
    src: song("1746351716371-_5.mp3"),
    cover: cover("1746351723502-artworks-000143485027-28e2i2-t1080x1080.jpg"),
    album: 5,
  },
  {
    id: 14,
    title: "Drive Pt. III",
    src: song("1746351735402-_11.mp3"),
    cover: cover("1746351738247-artworks-000143485027-28e2i2-t1080x1080.jpg"),
    album: 5,
  },
  {
    id: 15,
    title: "Intimacy",
    src: song("1746353641809-01_Intimacy__1_.mp3"),
    cover: cover("1746353658437-artworks-000108098309-94h4x6-t1080x1080.jpg"),
    album: 6,
  },
  {
    id: 16,
    title: "Diary",
    src: song("1746353667056-02_Diary__1_.mp3"),
    cover: cover("1746353673304-artworks-000108098309-94h4x6-t1080x1080.jpg"),
    album: 6,
  },
  {
    id: 17,
    title: "Hallucinations",
    src: song("1746353681410-03_Hallucinations__1_.mp3"),
    cover: cover("1746353688990-artworks-000108098309-94h4x6-t1080x1080.jpg"),
    album: 6,
  },
  {
    id: 22,
    title: "No It Isn't",
    src: song("1788720037598-no.mp3"),
    cover: cover("1788720075570-artworks-000109866746-h2o49y-t1080x1080.jpg"),
  },
  {
    id: 19,
    title: "Tonight",
    src: song("tonight.mp3"),
    cover: cover("tonight.jpg"),
  },
  {
    id: 21,
    title: "Abroad",
    src: song("abroad.mp3"),
    cover: cover("abroad.jpg"),
  },
  {
    id: 20,
    title: "The End Pt II (Demo #3)",
    src: song("the-end-pt-ii-demo-3.mp3"),
    cover: cover("the-end-pt-ii-demo-3.jpg"),
  },
];

/** Releases, newest first, as the radio site lists them. */
export const ALBUMS: Album[] = [
  {
    id: 7,
    title: "Into The Dark",
    year: 2024,
    cover: cover("1746514813847-ab67616d0000b2733afef23c6b94a0c9144994a9.jpeg"),
    tracks: [18],
  },
  {
    id: 4,
    title: "Visions EP",
    year: 2016,
    cover: cover("1746348254160-artworks-000140796152-l0o204-t1080x1080.jpg"),
    tracks: [5, 6, 7, 8, 9, 10, 11],
  },
  {
    id: 5,
    title: "Drive (Demo EP)",
    year: 2015,
    cover: cover("1746351654610-artworks-000143485027-28e2i2-t1080x1080.jpg"),
    tracks: [12, 13, 14],
  },
  {
    id: 6,
    title: "Ghosts EP",
    year: 2015,
    cover: cover("1746352873076-artworks-000108098309-94h4x6-t1080x1080.jpg"),
    tracks: [15, 16, 17],
  },
];

export const SINGLES: Track[] = TRACKS.filter((track) => !track.album);

export const trackById = (id: number) =>
  TRACKS.find((track) => track.id === id);

export const tracksOf = (album: Album): Track[] =>
  album.tracks.flatMap((id) => {
    const track = trackById(id);
    return track ? [track] : [];
  });

export const CAR_KIDS = {
  name: "Car Kids",
  site: "https://radio.jomaendle.com",
  spotify: "https://open.spotify.com/artist/7aIhDp0wHxSAuf7PtQ1J6x",
  soundcloud: "https://soundcloud.com/carkidsofficial",
} as const;
