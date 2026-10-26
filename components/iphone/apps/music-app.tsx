"use client";

import {
  animate,
  type MotionValue,
  m,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  ALBUMS,
  type Album,
  CAR_KIDS,
  SINGLES,
  TRACKS,
  tracksOf,
} from "@/lib/state/car-kids";
import { cn } from "@/lib/utils";
import type { AppProps } from "../apps";
import {
  BackChevron,
  BackwardGlyph,
  ForwardGlyph,
  PlayGlyph,
  PlayPauseGlyph,
  ShuffleGlyph,
  SpeakerGlyph,
} from "../glyphs";
import styles from "../iphone.module.css";
import { FADE, rubberband, SPRING_PUSH, VelocityTracker } from "../motion";
import { useMusic, useMusicControls, useMusicTime } from "../music/player";
import { useSwipeBack } from "../use-swipe-back";

const YEARS = ALBUMS.map((album) => album.year);
const FIRST_YEAR = Math.min(...YEARS);
const LAST_YEAR = Math.max(...YEARS);
const LATEST = ALBUMS[0];

/** "EP", "Single" or "Album", the way Apple Music labels a release. */
const kind = (album: Album) =>
  album.title.includes("EP")
    ? "EP"
    : album.tracks.length === 1
      ? "Single"
      : "Album";

const shuffled = <T,>(list: T[]) => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
};

const clock = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const COVER_SIZES = {
  hero: "(min-width: 640px) and (min-height: 640px) 402px, 100vw",
  large: "(min-width: 640px) and (min-height: 640px) 340px, 86vw",
  tile: "160px",
  row: "64px",
};

/**
 * Music, holding my band. An artist page (latest release, EPs, singles,
 * where else to listen), album pages pushed onto it, a mini player floating
 * above everything while a song plays, and the Now Playing screen as a
 * sheet over the app. The audio itself lives in the phone, not here, so it
 * keeps playing after the app goes home.
 */
export default function MusicApp({ launch }: AppProps) {
  const reduced = useReducedMotion() ?? false;
  const { track } = useMusic();
  const [album, setAlbum] = useState<Album | null>(null);
  const [nowPlaying, setNowPlaying] = useState(Boolean(launch?.nowPlaying));
  const popping = useRef(false);
  const sheetRef = useRef({ nowPlaying, album });
  sheetRef.current = { nowPlaying, album };

  const nav = useMotionValue(0);
  const rootX = useTransform(nav, (n) => (reduced ? "0%" : `${-30 * n}%`));
  const rootDim = useTransform(nav, [0, 1], [0, 0.35]);
  const albumX = useTransform(nav, (n) =>
    reduced ? "0%" : `${(1 - n) * 100}%`,
  );
  const albumOpacity = useTransform(nav, (n) => (reduced ? n : 1));

  /** What opened the album and the sheet, for focus to return to. */
  const albumOpener = useRef<HTMLElement | null>(null);
  const sheetOpener = useRef<HTMLElement | null>(null);
  /** The mini player's open button: where focus goes from a sheet that was
   * open from the start (a song played from Spotlight). */
  const miniOpen = useRef<HTMLButtonElement>(null);
  const focusBack = (el: HTMLElement | null) =>
    requestAnimationFrame(() => {
      if (el?.isConnected) {
        el.focus({ preventScroll: true });
      }
    });

  const openSheet = () => {
    sheetOpener.current = document.activeElement as HTMLElement | null;
    setNowPlaying(true);
  };
  const closeSheet = () => {
    setNowPlaying(false);
    focusBack(sheetOpener.current ?? miniOpen.current);
  };

  const push = (next: Album) => {
    albumOpener.current = document.activeElement as HTMLElement | null;
    popping.current = false;
    setAlbum(next);
    animate(nav, 1, reduced ? FADE : SPRING_PUSH);
  };

  const pop = (velocity = 0) => {
    if (popping.current) {
      return;
    }
    popping.current = true;
    animate(nav, 0, reduced ? FADE : { ...SPRING_PUSH, velocity }).then(() => {
      if (popping.current) {
        popping.current = false;
        flushSync(() => setAlbum(null));
        focusBack(albumOpener.current);
      }
    });
  };
  const popRef = useRef(pop);
  popRef.current = pop;
  const closeSheetRef = useRef(closeSheet);
  closeSheetRef.current = closeSheet;

  // Escape closes Now Playing, then the album, then (the phone's own
  // handler) the app.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      const open = sheetRef.current;
      if (open.nowPlaying || open.album) {
        event.preventDefault();
        event.stopPropagation();
        if (open.nowPlaying) {
          closeSheetRef.current();
        } else {
          popRef.current();
        }
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  return (
    <div className={styles.music}>
      <m.div
        className={styles.navLayer}
        style={{ x: rootX }}
        inert={album !== null || nowPlaying}
      >
        <ArtistPage onOpenAlbum={push} />
        <m.div
          className={styles.navDim}
          style={{ opacity: rootDim }}
          aria-hidden
        />
      </m.div>

      {album ? (
        <m.div
          className={cn(styles.navLayer, styles.navTop)}
          style={{ x: albumX, opacity: albumOpacity }}
          inert={nowPlaying}
        >
          <AlbumPage album={album} nav={nav} onBack={pop} />
        </m.div>
      ) : null}

      {/* Stays mounted under the sheet, fading, so it doesn't vanish the
          moment the sheet starts to rise or pop back as it goes down. */}
      {/* Stays mounted under the sheet, fading, so it doesn't vanish the
          moment the sheet starts to rise or pop back as it goes down. */}
      {track ? (
        <MiniPlayer hidden={nowPlaying} onOpen={openSheet} openRef={miniOpen} />
      ) : null}

      {track ? <NowPlaying open={nowPlaying} onClose={closeSheet} /> : null}
    </div>
  );
}

// ---- Artist page --------------------------------------------------------------

function ArtistPage({ onOpenAlbum }: { onOpenAlbum: (album: Album) => void }) {
  const { play, toggle } = useMusicControls();
  const { track, playing } = useMusic();
  const eps = ALBUMS.filter((album) => album.tracks.length > 1);

  return (
    <div
      className={cn(
        styles.scroll,
        styles.musicScroll,
        track && styles.scrollWithBar,
      )}
    >
      <header className={styles.artistHero}>
        {LATEST ? (
          <Image
            src={LATEST.cover}
            alt=""
            fill
            sizes={COVER_SIZES.hero}
            className={styles.artistHeroImage}
            preload
          />
        ) : null}
        <div className={styles.artistHeroShade} />
        <h1 className={styles.artistName}>{CAR_KIDS.name}</h1>
        <button
          type="button"
          className={styles.artistPlay}
          // Everything here is the band's, so with a song going the button
          // pauses and resumes it, as Music's artist button does.
          onClick={() => (track ? toggle() : play(TRACKS, 0))}
          aria-label={
            playing ? `Pause ${CAR_KIDS.name}` : `Play ${CAR_KIDS.name}`
          }
        >
          <PlayPauseGlyph playing={playing} size={22} />
        </button>
      </header>

      {LATEST ? (
        <section>
          <h2 className={styles.musicSection}>Latest Release</h2>
          <button
            type="button"
            className={styles.latest}
            onClick={() => onOpenAlbum(LATEST)}
          >
            <Cover
              src={LATEST.cover}
              size="row"
              className={styles.latestCover}
            />
            <span className={styles.rowMain}>
              <span className={styles.latestMeta}>{LATEST.year}</span>
              <span className={styles.latestTitle}>{LATEST.title}</span>
              <span className={styles.latestMeta}>
                {kind(LATEST)} · {LATEST.tracks.length}{" "}
                {LATEST.tracks.length === 1 ? "song" : "songs"}
              </span>
            </span>
          </button>
        </section>
      ) : null}

      <section>
        <h2 className={styles.musicSection}>EPs</h2>
        <div className={styles.shelf}>
          {eps.map((ep) => (
            <button
              key={ep.id}
              type="button"
              className={styles.shelfItem}
              onClick={() => onOpenAlbum(ep)}
            >
              <Cover src={ep.cover} size="tile" className={styles.shelfCover} />
              <span className={styles.shelfTitle}>{ep.title}</span>
              <span className={styles.shelfMeta}>{ep.year}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className={styles.musicSection}>Singles</h2>
        <div className={styles.shelf}>
          {SINGLES.map((single, index) => (
            <button
              key={single.id}
              type="button"
              className={styles.shelfItem}
              onClick={() => play(SINGLES, index)}
            >
              <Cover
                src={single.cover}
                size="tile"
                className={styles.shelfCover}
              />
              <span className={styles.shelfTitle}>{single.title}</span>
              <span className={styles.shelfMeta}>Single</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className={styles.musicSection}>About</h2>
        <p className={styles.musicAbout}>
          My band. Songs we recorded between {FIRST_YEAR} and {LAST_YEAR}.
        </p>
      </section>

      <section className={styles.musicElsewhere}>
        <h2 className={styles.musicSection}>Listen Elsewhere</h2>
        <div className={styles.group}>
          {[
            { label: "radio.jomaendle.com", href: CAR_KIDS.site },
            { label: "Spotify", href: CAR_KIDS.spotify },
            { label: "SoundCloud", href: CAR_KIDS.soundcloud },
          ].map((link) => (
            <a
              key={link.href}
              className={styles.row}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={cn(styles.rowMain, styles.musicLink)}>
                {link.label}
              </span>
              <span aria-hidden className={styles.rowValue}>
                ↗
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

// ---- Album page ---------------------------------------------------------------

function AlbumPage({
  album,
  nav,
  onBack,
}: {
  album: Album;
  nav: MotionValue<number>;
  onBack: (velocity?: number) => void;
}) {
  const { play } = useMusicControls();
  const { track, playing } = useMusic();
  const tracks = tracksOf(album);
  const swipeBack = useSwipeBack(nav, onBack);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className={styles.noteView}>
      <div
        className={cn(
          styles.scroll,
          styles.noteScroll,
          styles.musicScroll,
          track && styles.scrollWithBar,
        )}
        {...swipeBack}
      >
        <div className={styles.albumHead}>
          <Cover src={album.cover} size="large" className={styles.albumCover} />
          <h1 ref={titleRef} className={styles.albumTitle} tabIndex={-1}>
            {album.title}
          </h1>
          {/* The artist's name goes back to the artist, as in Music. */}
          <button
            type="button"
            className={styles.albumArtist}
            onClick={() => onBack()}
          >
            {CAR_KIDS.name}
          </button>
          <p className={styles.albumMeta}>
            {kind(album)} · {album.year}
          </p>
          <div className={styles.albumActions}>
            <button
              type="button"
              className={styles.albumAction}
              onClick={() => play(tracks, 0)}
            >
              <PlayGlyph width={16} height={16} /> Play
            </button>
            <button
              type="button"
              className={styles.albumAction}
              onClick={() => play(shuffled(tracks), 0)}
            >
              <ShuffleGlyph width={16} height={16} /> Shuffle
            </button>
          </div>
        </div>

        <ol className={styles.trackList}>
          {tracks.map((item, index) => {
            const current = track?.id === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={cn(
                    styles.trackRow,
                    current && styles.trackRowCurrent,
                  )}
                  onClick={() => play(tracks, index)}
                  aria-current={current}
                >
                  <span className={styles.trackNumber}>
                    {current ? <PlayingBars paused={!playing} /> : index + 1}
                  </span>
                  <span className={styles.trackTitle}>{item.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className={styles.trackFooter}>
          {tracks.length} {tracks.length === 1 ? "song" : "songs"}
        </p>
      </div>

      <div className={styles.noteBar}>
        <button
          type="button"
          className={styles.glassButton}
          onClick={() => onBack()}
          aria-label="Back to Car Kids"
        >
          <BackChevron width={10} height={17} />
        </button>
      </div>
    </div>
  );
}

// ---- Mini player --------------------------------------------------------------

/** iOS 26's floating mini player: a glass capsule above the content. */
function MiniPlayer({
  hidden,
  onOpen,
  openRef,
}: {
  hidden: boolean;
  onOpen: () => void;
  openRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const { track, playing, queue, index } = useMusic();
  const { toggle, next } = useMusicControls();
  const { time, duration } = useMusicTime();
  if (!track) {
    return null;
  }
  return (
    <div
      className={cn(
        styles.floatingBar,
        styles.miniPlayerBar,
        hidden && styles.miniPlayerHidden,
      )}
      inert={hidden}
    >
      <div className={cn(styles.glassField, styles.miniPlayer)}>
        <button
          ref={openRef}
          type="button"
          className={styles.miniPlayerOpen}
          onClick={onOpen}
        >
          <Cover
            src={track.cover}
            size="row"
            className={styles.miniPlayerCover}
          />
          <span className={styles.miniPlayerTitle}>{track.title}</span>
          <span className="sr-only">. Open Now Playing</span>
        </button>
        <button
          type="button"
          className={styles.miniPlayerButton}
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
        >
          <PlayPauseGlyph playing={playing} size={20} />
        </button>
        <button
          type="button"
          className={styles.miniPlayerButton}
          onClick={next}
          disabled={index + 1 >= queue.length}
          aria-label="Next song"
        >
          <ForwardGlyph width={24} height={18} />
        </button>
        <span
          key={track.id}
          className={styles.miniPlayerProgress}
          style={{ transform: `scaleX(${duration ? time / duration : 0})` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

// ---- Now Playing ------------------------------------------------------------

/**
 * Now Playing as a sheet over the app, on the song's own artwork blurred
 * into the background. The artwork shrinks back when paused and springs
 * forward on play, as in Apple Music. Drag the sheet down, tap the
 * chevron or press Escape to close it.
 */
function NowPlaying({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { track, playing, waiting, failed, queue, index } = useMusic();
  const { toggle, next, previous } = useMusicControls();
  const sheet = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    id: number;
    y: number;
    dy: number;
    /** On-screen pixels per sheet pixel: the device frame may be scaled. */
    k: number;
    active: boolean;
  } | null>(null);
  const velocity = useRef(new VelocityTracker());

  useEffect(() => {
    if (open) {
      sheet.current?.focus({ preventScroll: true });
    }
  }, [open]);

  if (!track) {
    return null;
  }

  const release = () => {
    const d = drag.current;
    drag.current = null;
    const el = sheet.current;
    if (!(d && el)) {
      return;
    }
    el.style.transition = "";
    el.style.transform = "";
    // Far enough, or flicked down: the tracker reports upward as positive.
    if (d.active && (d.dy > 120 || -velocity.current.velocity() > 0.3)) {
      onClose();
    }
  };

  return (
    <div
      ref={sheet}
      className={cn(styles.nowPlaying, open && styles.nowPlayingOpen)}
      role="dialog"
      aria-label="Now Playing"
      aria-hidden={!open}
      inert={!open}
      tabIndex={-1}
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest("button, input, a")) {
          return;
        }
        const el = event.currentTarget;
        drag.current = {
          id: event.pointerId,
          y: event.clientY,
          dy: 0,
          k: el.getBoundingClientRect().height / (el.offsetHeight || 1) || 1,
          active: false,
        };
        velocity.current.reset();
        velocity.current.add(event.clientY / drag.current.k, event.timeStamp);
      }}
      onPointerMove={(event) => {
        const d = drag.current;
        const el = sheet.current;
        if (!(d && el) || d.id !== event.pointerId) {
          return;
        }
        const travel = (event.clientY - d.y) / d.k;
        if (!d.active) {
          if (Math.abs(travel) < 6) {
            return;
          }
          // Follow from here, without jumping by the slop.
          d.active = true;
          d.y = event.clientY;
          event.currentTarget.setPointerCapture(event.pointerId);
          el.style.transition = "none";
          return;
        }
        velocity.current.add(event.clientY / d.k, event.timeStamp);
        // Down follows the finger; up gives a little, as a rubber band.
        d.dy =
          travel >= 0 ? travel : -rubberband(-travel, el.offsetHeight || 800);
        el.style.transform = `translateY(${d.dy}px)`;
      }}
      onPointerUp={release}
      onPointerCancel={release}
    >
      <Image
        src={track.cover}
        alt=""
        fill
        sizes="64px"
        className={styles.nowPlayingBackdrop}
      />
      <div className={styles.nowPlayingInner}>
        <button
          type="button"
          className={styles.nowPlayingGrabber}
          onClick={onClose}
          aria-label="Close Now Playing"
        />

        <div
          className={cn(
            styles.nowPlayingArt,
            !playing && styles.nowPlayingArtPaused,
          )}
        >
          <Cover src={track.cover} size="large" className={styles.albumCover} />
        </div>

        <div className={styles.nowPlayingMeta}>
          <h2 className={styles.nowPlayingTitle}>{track.title}</h2>
          <p className={styles.nowPlayingArtist}>{CAR_KIDS.name}</p>
          {failed ? (
            <p className={styles.nowPlayingError} role="status">
              Couldn’t load this song. Press play to try again.
            </p>
          ) : null}
        </div>

        <Scrubber />

        <div className={styles.transport}>
          <button
            type="button"
            className={styles.transportButton}
            onClick={previous}
            aria-label="Previous song"
          >
            <BackwardGlyph width={38} height={28} />
          </button>
          <button
            type="button"
            className={cn(styles.transportButton, styles.transportPlay)}
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
            aria-busy={waiting}
          >
            <PlayPauseGlyph playing={playing} size={44} />
          </button>
          <button
            type="button"
            className={styles.transportButton}
            onClick={next}
            disabled={index + 1 >= queue.length}
            aria-label="Next song"
          >
            <ForwardGlyph width={38} height={28} />
          </button>
        </div>

        <Volume />

        <a
          className={styles.nowPlayingSource}
          href={CAR_KIDS.site}
          target="_blank"
          rel="noopener noreferrer"
        >
          Also on radio.jomaendle.com ↗
        </a>
      </div>
    </div>
  );
}

/** The progress slider: a hairline that thickens while held, as on iOS. */
function Scrubber() {
  const { time, duration } = useMusicTime();
  const { seek } = useMusicControls();
  const [scrub, setScrub] = useState<number | null>(null);
  const shown = scrub ?? time;
  const progress = duration ? (shown / duration) * 100 : 0;
  return (
    <div className={styles.seek}>
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={shown}
        onChange={(event) => setScrub(Number(event.target.value))}
        onPointerUp={() => {
          if (scrub !== null) {
            seek(scrub);
            setScrub(null);
          }
        }}
        onKeyUp={() => {
          if (scrub !== null) {
            seek(scrub);
            setScrub(null);
          }
        }}
        aria-label="Song position"
        aria-valuetext={`${clock(shown)} of ${clock(duration)}`}
        style={{ "--progress": `${progress}%` } as React.CSSProperties}
      />
      <div className={styles.seekTimes} aria-hidden>
        <span>{clock(shown)}</span>
        {/* Not known yet (loading, or failed): dashes, not a false 0:00. */}
        <span>{duration ? `-${clock(duration - shown)}` : "--:--"}</span>
      </div>
    </div>
  );
}

/** Can this browser set an audio element's volume? iOS keeps volume for the
 * hardware buttons and ignores the property, so there it would be a slider
 * that moves nothing. */
function volumeSettable() {
  try {
    const probe = new Audio();
    probe.volume = 0.5;
    return probe.volume === 0.5;
  } catch {
    return false;
  }
}

/** The volume slider under the transport, between the speaker glyphs. */
function Volume() {
  const controls = useMusicControls();
  const [volume, setVolume] = useState<number | null>(null);
  useEffect(() => {
    if (volumeSettable()) {
      setVolume(controls.volume());
    }
  }, [controls]);
  if (volume === null) {
    return null;
  }
  return (
    <div className={cn(styles.seek, styles.volume)}>
      <SpeakerGlyph />
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(event) => {
          const next = Number(event.target.value);
          setVolume(next);
          controls.setVolume(next);
        }}
        aria-label="Volume"
        aria-valuetext={`${Math.round(volume * 100)}%`}
        style={{ "--progress": `${volume * 100}%` } as React.CSSProperties}
      />
      <SpeakerGlyph loud />
    </div>
  );
}

// ---- Bits -----------------------------------------------------------------------

function Cover({
  src,
  size,
  className,
}: {
  src: string;
  size: keyof typeof COVER_SIZES;
  className?: string;
}) {
  return (
    <span className={cn(styles.cover, className)}>
      <Image src={src} alt="" fill sizes={COVER_SIZES[size]} />
    </span>
  );
}

/** The now-playing equaliser that replaces a track's number. */
function PlayingBars({ paused }: { paused: boolean }) {
  return (
    <span
      className={cn(styles.playingBars, paused && styles.playingBarsPaused)}
      aria-label={paused ? "Paused" : "Playing"}
      role="img"
    >
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}
