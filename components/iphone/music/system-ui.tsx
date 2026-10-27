"use client";

import Image from "next/image";
import { CAR_KIDS } from "@/lib/state/car-kids";
import { cn } from "@/lib/utils";
import { BackwardGlyph, ForwardGlyph, PlayPauseGlyph } from "../glyphs";
import styles from "../iphone.module.css";
import { useMusic, useMusicControls, useMusicTime } from "./player";

/**
 * The lock screen's Now Playing card, there whenever a song is loaded:
 * artwork, title, progress, and controls that work without unlocking. The
 * card itself opens Now Playing in Music.
 */
export function LockNowPlaying({
  onOpen,
}: {
  /** Opens Music out of the card's cover. */
  onOpen: (from: HTMLElement) => void;
}) {
  const { track, playing, queue, index } = useMusic();
  const { toggle, next, previous } = useMusicControls();
  if (!track) {
    return null;
  }
  return (
    <section className={styles.lockPlayer} aria-label="Now Playing">
      <button
        type="button"
        className={styles.lockPlayerOpen}
        onClick={(event) =>
          onOpen(
            event.currentTarget.querySelector<HTMLElement>(
              `.${styles.lockPlayerCover}`,
            ) ?? event.currentTarget,
          )
        }
      >
        <span className={styles.lockPlayerCover}>
          <Image src={track.cover} alt="" fill sizes="96px" />
        </span>
        <span className={styles.rowMain}>
          <span className={styles.lockPlayerTitle}>{track.title}</span>
          <span className={styles.lockPlayerArtist}>{CAR_KIDS.name}</span>
        </span>
        <span className="sr-only">. Open in Music</span>
      </button>
      <LockProgress />
      <div className={styles.lockPlayerControls}>
        <button type="button" onClick={previous} aria-label="Previous song">
          <BackwardGlyph width={30} height={22} />
        </button>
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
        >
          <PlayPauseGlyph playing={playing} size={30} />
        </button>
        <button
          type="button"
          onClick={next}
          disabled={index + 1 >= queue.length}
          aria-label="Next song"
        >
          <ForwardGlyph width={30} height={22} />
        </button>
      </div>
    </section>
  );
}

function LockProgress() {
  const { time, duration } = useMusicTime();
  const { track } = useMusic();
  return (
    <span className={styles.lockPlayerTrack} aria-hidden>
      {/* A new song gets a new bar, so it starts empty rather than sweeping
          back from where the last one ended. */}
      <span
        key={track?.id}
        style={{ transform: `scaleX(${duration ? time / duration : 0})` }}
      />
    </span>
  );
}

/**
 * The Dynamic Island. While a song plays it widens into Music's compact
 * live activity: the artwork on the left, a moving waveform on the right.
 * Only drawn in the desktop frame; on a phone the real island is above.
 */
export function DynamicIsland({
  onOpen,
}: {
  /** Opens Now Playing out of the island, while a song plays. */
  onOpen: (from: HTMLElement) => void;
}) {
  const { track, playing } = useMusic();
  const live = Boolean(track && playing);
  return (
    // A pointer shortcut: the Music app and the lock screen card are the
    // accessible way in.
    <div
      className={cn(styles.island, live && styles.islandLive)}
      aria-hidden
      onClick={(event) => {
        if (live) {
          onOpen(event.currentTarget);
        }
      }}
    >
      {track ? (
        <>
          <span className={styles.islandCover}>
            <Image src={track.cover} alt="" fill sizes="48px" />
          </span>
          <span className={styles.islandWave}>
            <span />
            <span />
            <span />
            <span />
          </span>
        </>
      ) : null}
    </div>
  );
}
