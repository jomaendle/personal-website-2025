"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ALBUMS, CAR_KIDS, type Track, trackById } from "@/lib/state/car-kids";
import { store } from "../persist";

/** What was playing, so a reload comes back to it paused, as iOS does. */
const PLAYER_KEY = "iphone:music";

interface PlayerState {
  track: Track | null;
  queue: Track[];
  index: number;
  playing: boolean;
  /** Buffering after play was pressed. */
  waiting: boolean;
  /** The song couldn't be loaded (offline, or the file is gone). */
  failed: boolean;
}

interface PlayerControls {
  /** Play `queue` from `index`. Call it from the tap itself: browsers only
   * start audio inside a user gesture. */
  play: (queue: Track[], index: number) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  volume: () => number;
  setVolume: (volume: number) => void;
}

interface PlayerTime {
  time: number;
  duration: number;
}

const EMPTY: PlayerState = {
  track: null,
  queue: [],
  index: 0,
  playing: false,
  waiting: false,
  failed: false,
};

const StateContext = createContext<PlayerState>(EMPTY);
const ControlsContext = createContext<PlayerControls | null>(null);
const TimeContext = createContext<PlayerTime>({ time: 0, duration: 0 });

/** Which track is playing, and whether. Changes on track and play/pause. */
export const useMusic = () => useContext(StateContext);

/** Stable for the life of the phone; never re-renders its readers. */
export function useMusicControls() {
  const controls = useContext(ControlsContext);
  if (!controls) {
    throw new Error("useMusicControls outside MusicProvider");
  }
  return controls;
}

/** Playback position, about four times a second. Only progress bars read
 * it, so the rest of the phone doesn't re-render with the clock. */
export const useMusicTime = () => useContext(TimeContext);

const albumOf = (track: Track) =>
  ALBUMS.find((album) => album.id === track.album)?.title ?? "Single";

/**
 * The phone's audio: one <audio> element in the shell, not in the Music
 * app, so a song keeps playing on the home screen and the lock screen, the
 * way it does on iOS. It also tells the real device what is playing (Media
 * Session), so a phone's own lock screen and Control Center show the song
 * and its controls.
 */
export function MusicProvider({ children }: { children: ReactNode }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [state, setState] = useState<PlayerState>(EMPTY);
  const [time, setTime] = useState<PlayerTime>({ time: 0, duration: 0 });
  const stateRef = useRef(state);
  stateRef.current = state;

  const controls = useMemo<PlayerControls>(() => {
    const load = (queue: Track[], index: number, autoplay: boolean) => {
      const el = audio.current;
      const track = queue[index];
      if (!(el && track)) {
        return;
      }
      if (el.src !== track.src) {
        el.src = track.src;
        setTime({ time: 0, duration: 0 });
      }
      setState({
        track,
        queue,
        index,
        playing: autoplay,
        waiting: autoplay,
        failed: false,
      });
      store.set(
        PLAYER_KEY,
        JSON.stringify({ queue: queue.map((t) => t.id), index }),
      );
      if (autoplay) {
        el.play().catch(() => {
          setState((s) => ({ ...s, playing: false, waiting: false }));
        });
      }
    };
    return {
      play: (queue, index) => load(queue, index, true),
      toggle: () => {
        const el = audio.current;
        if (!(el && stateRef.current.track)) {
          return;
        }
        if (el.paused) {
          // After a failed load, try the file again.
          if (stateRef.current.failed) {
            el.load();
            setState((s) => ({ ...s, failed: false }));
          }
          el.play().catch(() => undefined);
        } else {
          el.pause();
        }
      },
      next: () => {
        const { queue, index } = stateRef.current;
        if (index + 1 < queue.length) {
          load(queue, index + 1, true);
        }
      },
      previous: () => {
        const el = audio.current;
        const { queue, index } = stateRef.current;
        // Like iOS: a few seconds in, back restarts the song.
        if (el && (el.currentTime > 3 || index === 0)) {
          el.currentTime = 0;
        } else {
          load(queue, index - 1, true);
        }
      },
      volume: () => audio.current?.volume ?? 1,
      setVolume: (volume) => {
        if (audio.current) {
          audio.current.volume = volume;
        }
      },
      seek: (seconds) => {
        const el = audio.current;
        if (el && Number.isFinite(seconds)) {
          el.currentTime = seconds;
          setTime((t) => ({ ...t, time: seconds }));
        }
      },
    };
  }, []);

  // Back to what was playing before a reload, paused.
  useEffect(() => {
    try {
      const saved = JSON.parse(store.get(PLAYER_KEY) ?? "null");
      if (!saved) {
        return;
      }
      const queue = (saved.queue as number[]).flatMap((id) => {
        const track = trackById(id);
        return track ? [track] : [];
      });
      const index = Math.min(saved.index ?? 0, queue.length - 1);
      const track = queue[index];
      if (track && audio.current) {
        audio.current.src = track.src;
        setState({
          track,
          queue,
          index,
          playing: false,
          waiting: false,
          failed: false,
        });
      }
    } catch {
      // Unreadable: start with nothing playing.
    }
  }, []);

  // The real device's Now Playing: metadata and its hardware controls.
  useEffect(() => {
    const session =
      typeof navigator === "undefined" ? undefined : navigator.mediaSession;
    const track = state.track;
    if (!(session && track)) {
      return;
    }
    session.metadata = new MediaMetadata({
      title: track.title,
      artist: CAR_KIDS.name,
      album: albumOf(track),
      artwork: [{ src: track.cover, sizes: "1080x1080", type: "image/jpeg" }],
    });
    session.setActionHandler("play", controls.toggle);
    session.setActionHandler("pause", controls.toggle);
    session.setActionHandler("nexttrack", controls.next);
    session.setActionHandler("previoustrack", controls.previous);
    session.setActionHandler("seekto", (details) => {
      if (details.seekTime !== undefined) {
        controls.seek(details.seekTime);
      }
    });
  }, [state.track, controls]);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.mediaSession) {
      navigator.mediaSession.playbackState = state.track
        ? state.playing
          ? "playing"
          : "paused"
        : "none";
    }
  }, [state.track, state.playing]);

  return (
    <ControlsContext.Provider value={controls}>
      <StateContext.Provider value={state}>
        <TimeContext.Provider value={time}>
          {children}
          {/* biome-ignore lint/a11y/useMediaCaption: music; the Now Playing screen carries the title and artist */}
          <audio
            ref={audio}
            preload="metadata"
            onPlay={() => setState((s) => ({ ...s, playing: true }))}
            onPlaying={() =>
              setState((s) => ({ ...s, waiting: false, failed: false }))
            }
            onError={() =>
              setState((s) => ({
                ...s,
                playing: false,
                waiting: false,
                failed: true,
              }))
            }
            onWaiting={() => setState((s) => ({ ...s, waiting: true }))}
            onPause={() =>
              setState((s) => ({ ...s, playing: false, waiting: false }))
            }
            // Values are read from the element before setState: an updater
            // runs later, when React has already cleared currentTarget.
            onTimeUpdate={(event) => {
              const time = event.currentTarget.currentTime;
              setTime((t) => ({ ...t, time }));
            }}
            onLoadedMetadata={(event) => {
              const duration = event.currentTarget.duration;
              setTime((t) => ({ ...t, duration }));
            }}
            onDurationChange={(event) => {
              const duration = event.currentTarget.duration;
              setTime((t) => ({ ...t, duration }));
            }}
            onEnded={() => {
              const { queue, index } = stateRef.current;
              if (index + 1 < queue.length) {
                controls.next();
              } else {
                setState((s) => ({ ...s, playing: false }));
              }
            }}
          />
        </TimeContext.Provider>
      </StateContext.Provider>
    </ControlsContext.Provider>
  );
}
