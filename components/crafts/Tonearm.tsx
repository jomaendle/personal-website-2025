"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  assertStable,
  useAnimationLoop,
  useOnScreen,
  useReducedMotion,
} from "@/lib/motion";
import { CAR_KIDS_SIDE_A } from "@/lib/state/car-kids";
import styles from "./tonearm.module.css";

/** Arm angle, in degrees, at the rest post and at the run-out groove. The
 * whole track lives between these two, so the arm's position *is* the
 * playhead: there is no separate scrubber, because a real one does not have
 * one either. */
const ARM_REST = -17;
const ARM_LEAD_IN = 8;
const ARM_RUN_OUT = 33;
/** Past this the stylus is on the record and the track plays. */
const ARM_DOWN = ARM_LEAD_IN - 2;

/** Spring carrying the arm. Slow and heavy on purpose: a tonearm is a
 * counterweighted lever, and the lag is most of what says so. */
const ARM_STIFFNESS = 260;
const ARM_DAMPING = 32;
/** Spring returning it to the post when released past the run-out. */
const LIFT_STIFFNESS = 120;
const LIFT_DAMPING = 22;

/** Revolutions per minute, and how fast the platter gets there. A record
 * does not reach speed instantly, and the run-up is free character. */
const RPM = 33.333;
const SPIN_UP = 1.7;

/** A drag shorter and briefer than this is a click. Repo convention. */
const CLICK_SLOP = 6;
const CLICK_TIME = 500;

/** How far, in seconds of audio, the arm must move before a new seek is
 * issued. Small enough to feel continuous, large enough that a drag does not
 * queue a seek per frame. */
const SEEK_EPSILON = 0.25;

/** Arm geometry, mirroring `tonearm.module.css`. These exist because the
 * pivot has to be derived from the deck, which never rotates; see `angleAt`.
 * `ARM_RIGHT` is how far the arm overhangs the deck's right edge. */
const ARM_RIGHT = 46;
const ARM_WIDTH_PX = 210;
const PIVOT_X = 168;
const ARM_TOP = 12;
const ARM_HEIGHT_PX = 14;

const MAX_STEP = 0.008;
assertStable("tonearm arm", ARM_STIFFNESS, ARM_DAMPING, MAX_STEP);
assertStable("tonearm lift", LIFT_STIFFNESS, LIFT_DAMPING, MAX_STEP);

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/** Arm angle to a fraction of the track, and back. */
const angleToProgress = (deg: number) =>
  clamp((deg - ARM_LEAD_IN) / (ARM_RUN_OUT - ARM_LEAD_IN), 0, 1);
const progressToAngle = (p: number) =>
  ARM_LEAD_IN + p * (ARM_RUN_OUT - ARM_LEAD_IN);

const mmss = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * A record deck that plays the author's band.
 *
 * The arm is the playhead. Drag it inward and the track seeks with it; let go
 * over the record and it plays from there; drag it past the run-out and it
 * lifts, returns to the post and the next track drops. That mapping is the
 * whole idea, and it is why this is a record rather than a play button with a
 * disc behind it.
 *
 * Audio is an `<audio>` element seeked by `currentTime`, not WebAudio. The
 * files are 5MB each and sit on a blob host that serves range requests, so the
 * browser streams and seeks without ever downloading a whole track. Nothing is
 * fetched until the stylus first comes down: `preload="none"` until then.
 *
 * Playback never starts on its own. Browsers would block it, and a homepage
 * that makes noise at a visitor deserves to be blocked. Sound only ever
 * follows a gesture.
 */
export function Tonearm() {
  const rootRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLButtonElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const recordRef = useRef<HTMLDivElement>(null);
  const armRef = useRef<HTMLDivElement>(null);
  const elapsedRef = useRef<HTMLSpanElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  const sim = useRef({
    /** Arm angle, its velocity, and where it is headed. */
    arm: ARM_REST,
    armV: 0,
    armTarget: ARM_REST,
    /** Platter rotation in degrees, and the 0..1 speed it is spinning at. */
    spin: 0,
    speed: 0,
    /** Set while the stylus is down and the track should be running. */
    down: false,
    drag: null as null | {
      pointerId: number;
      originX: number;
      originY: number;
      grabAngle: number;
      at: number;
      moved: boolean;
    },
    /** The last position asked for, so a drag does not re-seek every frame. */
    seekedTo: -1,
    /** Set once the source has proved unplayable, so the stylus stays up. */
    failed: false,
    /** Set while the arm has been asked to return to the post, so the
     *  auto-track line cannot drag it back onto the record. */
    homing: false,
    /** Mirrors of React state so the loop never reads from a render. */
    shownPlaying: false,
    index: 0,
    reduced: false,
    visible: true,
    /** Set once the first gesture has happened, so audio is only ever
     *  touched after a real interaction. */
    armedByGesture: false,
  });

  const track = CAR_KIDS_SIDE_A[index] ?? CAR_KIDS_SIDE_A[0];

  /**
   * The arm's angle for a pointer, measured about its pivot.
   *
   * The pivot is derived from the **deck**, not from the arm's own rect. The
   * arm is rotated, so its bounding box is the box of the rotated shape and
   * its corners are not its corners. The deck never rotates, so it is the only
   * honest frame of reference. The offsets below mirror the stylesheet.
   */
  const angleAt = useCallback((clientX: number, clientY: number) => {
    const deck = deckRef.current;
    if (!deck) return ARM_REST;
    const box = deck.getBoundingClientRect();
    const px = box.left + box.width + ARM_RIGHT - ARM_WIDTH_PX + PIVOT_X;
    const py = box.top + ARM_TOP + ARM_HEIGHT_PX / 2;
    return (Math.atan2(clientY - py, px - clientX) * 180) / Math.PI;
  }, []);

  const paint = useCallback(() => {
    const s = sim.current;
    const record = recordRef.current;
    if (record) record.style.transform = `rotate(${s.spin.toFixed(2)}deg)`;
    const arm = armRef.current;
    if (arm) arm.style.transform = `rotate(${s.arm.toFixed(2)}deg)`;

    const elapsed = elapsedRef.current;
    const audio = audioRef.current;
    if (elapsed && audio) {
      const total = Number.isFinite(audio.duration) ? audio.duration : 0;
      elapsed.textContent = total
        ? `${mmss(audio.currentTime)} / ${mmss(total)}`
        : "--:--";
    }
  }, []);

  const step = useCallback((dt: number) => {
    const s = sim.current;

    // The arm. While dragged it chases the pointer; released past the run-out
    // it lifts home on a slacker spring.
    const stiffness = s.drag ? ARM_STIFFNESS : LIFT_STIFFNESS;
    const damping = s.drag ? ARM_DAMPING : LIFT_DAMPING;
    if (s.reduced) {
      s.arm = s.armTarget;
      s.armV = 0;
    } else {
      s.armV += (stiffness * (s.armTarget - s.arm) - damping * s.armV) * dt;
      s.arm += s.armV * dt;
    }

    const wasDown = s.down;
    // A failed source keeps the stylus up. Otherwise `down` would stay true
    // over a track that cannot play, the settle test would never pass, and the
    // loop would run at 60Hz for as long as the craft is on screen.
    s.down = !s.failed && s.arm >= ARM_DOWN && s.arm < ARM_RUN_OUT + 1;

    // The platter runs up and down rather than snapping, which is most of the
    // character of a deck starting.
    const wantSpeed = s.down ? 1 : 0;
    s.speed += (wantSpeed - s.speed) * (1 - Math.exp(-dt * SPIN_UP));
    if (s.speed < 0.002 && wantSpeed === 0) s.speed = 0;
    s.spin = (s.spin + s.speed * RPM * 6 * dt) % 360;

    // Seeking follows the arm while it is dragged, but not on every frame.
    // Each write to currentTime starts a seek, and issuing sixty a second
    // leaves the element permanently seeking: it never settles, reports a
    // time near zero, and the scrub appears to do nothing. Only ask for a new
    // position once the arm has actually moved a perceptible distance.
    const audio = audioRef.current;
    if (audio && s.drag && s.armedByGesture) {
      const total = Number.isFinite(audio.duration) ? audio.duration : 0;
      if (total) {
        const want = angleToProgress(s.arm) * total;
        if (Math.abs(want - s.seekedTo) > SEEK_EPSILON) {
          s.seekedTo = want;
          // fastSeek skips to the nearest keyframe rather than decoding to an
          // exact sample, which is what makes a scrub feel like a scrub.
          if (typeof audio.fastSeek === "function") audio.fastSeek(want);
          else audio.currentTime = want;
        }
      }
    }

    // While playing, the arm tracks the playhead inward on its own — unless it
    // has been asked to go home.
    //
    // `down` is derived from the arm's position, so it is still true on the
    // frame after something sets armTarget to the post: the arm has not
    // physically moved yet. Without the `homing` guard this line would rewrite
    // that target back to the playhead on the very next step, and Escape, the
    // next-track lift and the off-screen stop would all silently do nothing.
    if (audio && !s.drag && s.down && s.armedByGesture && !s.homing) {
      const total = Number.isFinite(audio.duration) ? audio.duration : 0;
      if (total) s.armTarget = progressToAngle(audio.currentTime / total);
    }
    // Homing ends when the arm has actually arrived, not when it was asked.
    if (s.homing && s.arm <= ARM_DOWN) s.homing = false;

    if (s.down !== wasDown && s.shownPlaying !== s.down) {
      s.shownPlaying = s.down;
      setPlaying(s.down);
    }

    const settled =
      !(s.drag || s.down) &&
      s.speed === 0 &&
      Math.abs(s.armV) < 0.02 &&
      Math.abs(s.armTarget - s.arm) < 0.02;
    return !settled;
  }, []);

  const loop = useAnimationLoop({
    step,
    paint,
    maxFrame: 0.032,
    maxStep: MAX_STEP,
    onSettle: () => {
      const s = sim.current;
      s.arm = s.armTarget;
      s.armV = 0;
      paint();
    },
  });

  const wake = useCallback(() => {
    if (sim.current.visible) loop.wake();
  }, [loop]);

  /**
   * The source will not play: blocked, missing, or an unsupported codec.
   *
   * This exists because a silent failure here is invisible twice over. The
   * deck looks alive, so nobody reports it. And with `duration` stuck at NaN
   * the arm never advances, so `down` stays true, so the loop's settle test
   * never passes and it runs at 60Hz forever over a track that is not
   * playing. Lifting the arm both says so and lets the loop stop.
   */
  const onAudioFailed = useCallback(() => {
    const s = sim.current;
    s.failed = true;
    s.armTarget = ARM_REST;
    s.homing = true;
    setFailed(true);
    wake();
  }, [wake]);

  /** Lift the arm home and drop the next track on the platter. */
  const nextTrack = useCallback(() => {
    const s = sim.current;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    s.index = (s.index + 1) % CAR_KIDS_SIDE_A.length;
    s.armTarget = ARM_REST;
    s.homing = true;
    // A new source deserves its own chance: one unplayable file should not
    // condemn the rest of the side.
    s.failed = false;
    s.seekedTo = -1;
    setIndex(s.index);
    setFailed(false);
    wake();
  }, [wake]);

  const onPointerDown = useCallback(
    (event: PointerEvent) => {
      const s = sim.current;
      if (s.drag) return; // A second finger never steals the gesture.
      const hit = hitRef.current;
      if (!hit) return;
      try {
        hit.setPointerCapture(event.pointerId);
      } catch {
        // Synthetic or already-released pointer; the drag still works.
      }
      s.armedByGesture = true;
      s.homing = false;
      s.drag = {
        pointerId: event.pointerId,
        originX: event.clientX,
        originY: event.clientY,
        grabAngle: s.arm,
        at: performance.now(),
        moved: false,
      };
      wake();
    },
    [wake],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      const s = sim.current;
      const drag = s.drag;
      if (!drag || drag.pointerId !== event.pointerId) return;
      if (
        Math.hypot(event.clientX - drag.originX, event.clientY - drag.originY) >
        CLICK_SLOP
      ) {
        drag.moved = true;
      }
      s.armTarget = clamp(
        angleAt(event.clientX, event.clientY),
        ARM_REST,
        ARM_RUN_OUT + 3,
      );
      wake();
    },
    [angleAt, wake],
  );

  /** A cancelled gesture is the browser taking over to scroll, not a tap. It
   *  must not drop or lift the stylus; the arm just stops being dragged. */
  const cancelDrag = useCallback(
    (event: PointerEvent) => {
      const s = sim.current;
      if (!s.drag || s.drag.pointerId !== event.pointerId) return;
      s.drag = null;
      s.armTarget = s.arm;
      wake();
    },
    [wake],
  );

  const endDrag = useCallback(
    (event: PointerEvent) => {
      const s = sim.current;
      const drag = s.drag;
      if (!drag || drag.pointerId !== event.pointerId) return;
      s.drag = null;

      const quick = performance.now() - drag.at < CLICK_TIME;
      if (!drag.moved && quick) {
        // A tap drops the stylus at the lead-in, or lifts it if it is down.
        s.armTarget = s.arm >= ARM_DOWN ? ARM_REST : ARM_LEAD_IN;
      } else if (s.arm >= ARM_RUN_OUT) {
        nextTrack();
        return;
      } else if (s.arm < ARM_DOWN) {
        s.armTarget = ARM_REST;
      } else {
        s.armTarget = s.arm;
      }
      wake();
    },
    [nextTrack, wake],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const s = sim.current;
      const audio = audioRef.current;
      s.armedByGesture = true;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const lifting = s.arm >= ARM_DOWN;
        s.homing = lifting;
        s.armTarget = lifting ? ARM_REST : ARM_LEAD_IN;
      } else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        s.homing = false;
        const dir = event.key === "ArrowRight" ? 1 : -1;
        if (audio && Number.isFinite(audio.duration)) {
          audio.currentTime = clamp(
            audio.currentTime + dir * 5,
            0,
            audio.duration,
          );
          s.armTarget = progressToAngle(audio.currentTime / audio.duration);
        }
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        nextTrack();
      } else if (event.key === "Escape") {
        event.preventDefault();
        s.homing = true;
        s.armTarget = ARM_REST;
      } else {
        return;
      }
      wake();
    },
    [nextTrack, wake],
  );

  useEffect(() => {
    const hit = hitRef.current;
    if (!hit) return;
    hit.addEventListener("pointerdown", onPointerDown);
    hit.addEventListener("pointermove", onPointerMove);
    hit.addEventListener("pointerup", endDrag);
    hit.addEventListener("pointercancel", cancelDrag);
    hit.addEventListener("keydown", onKeyDown);
    return () => {
      hit.removeEventListener("pointerdown", onPointerDown);
      hit.removeEventListener("pointermove", onPointerMove);
      hit.removeEventListener("pointerup", endDrag);
      hit.removeEventListener("pointercancel", cancelDrag);
      hit.removeEventListener("keydown", onKeyDown);
    };
  }, [onPointerDown, onPointerMove, endDrag, cancelDrag, onKeyDown]);

  // Play and pause follow the stylus, and only after a real gesture.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing && sim.current.armedByGesture) {
      audio.play().catch((error: DOMException) => {
        // A refused autoplay and an unplayable file are different problems and
        // must not be swallowed together. Refusal is expected and harmless:
        // the gesture simply was not enough for this browser, and the next one
        // will be. Anything else means the deck cannot play, and saying so is
        // better than a platter that spins in silence.
        if (error?.name === "NotAllowedError" || error?.name === "AbortError") {
          return;
        }
        console.error("[tonearm] playback failed", error);
        onAudioFailed();
      });
    } else {
      audio.pause();
    }
  }, [playing, onAudioFailed]);

  useReducedMotion((reduced) => {
    sim.current.reduced = reduced;
    wake();
  });

  useOnScreen(
    rootRef,
    (onScreen) => {
      const s = sim.current;
      s.visible = onScreen;
      const root = rootRef.current;
      if (root) root.classList.toggle(styles.armed ?? "armed", onScreen);
      if (onScreen) {
        wake();
      } else {
        // Scrolling away stops the music as well as the loop. A deck playing
        // to nobody, three screens up, is not a feature.
        //
        // `playing` is retired through React rather than by pausing the
        // element directly. `loop.stop()` freezes the simulation before `down`
        // can flip, so if the state were left set the play/pause effect would
        // never re-run and the deck would come back spinning, labelled
        // playing, and permanently silent.
        s.armTarget = ARM_REST;
        s.homing = true;
        s.down = false;
        s.shownPlaying = false;
        setPlaying(false);
        loop.stop();
      }
    },
    { pauseWhenTabHidden: true },
  );

  if (!track) return null;

  return (
    <div ref={rootRef} className={styles.craft}>
      <div ref={deckRef} className={styles.deck}>
        <div className={styles.platter} />
        <div ref={recordRef} className={styles.record}>
          <div className={styles.grooveBase} />
          <div className={styles.sheen} />
          <div className={styles.grooveLit} />
          <div className={styles.reflection} />
          <div className={styles.leadIn} />
          <div className={styles.label}>
            {/* Plain <img>: a remote blob host, and the label is decorative
                chrome rather than content worth an optimizer round trip. */}
            {/** biome-ignore lint/performance/noImgElement: remote blob art */}
            <img
              className={styles.labelArt}
              src={track.cover}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
            />
            <div className={styles.labelPaper} />
          </div>
          <div className={styles.spindle} />
        </div>

        <div ref={armRef} className={styles.arm}>
          <div className={styles.armShadow} aria-hidden="true" />
          <div className={styles.armCore} aria-hidden="true" />
          <div className={styles.tube} />
          <div className={styles.headshell}>
            <div className={styles.cartridge} />
          </div>
          <div className={styles.pivot} />
          <div className={styles.weight} />
        </div>
      </div>

      <p className={styles.readout} aria-hidden="true">
        <b>{track.title}</b>
        <span>{failed ? "Will not play" : track.release}</span>
        <span ref={elapsedRef} className={styles.elapsed}>
          --:--
        </span>
      </p>
      {/* Announced, not just drawn: a reader who cannot see the readout still
          needs to know the deck is not going to play. */}
      <p role="status" className="sr-only">
        {failed
          ? `${track.title} will not play. Press the down arrow for the next track.`
          : ""}
      </p>

      {/* Nothing is fetched until the stylus first comes down. `onError` is
          not optional: a source blocked by CSP, or a stream that dies
          mid-track, fires `error` without ever rejecting `play()`, so the
          promise's catch never sees those at all. */}
      {/* biome-ignore lint/a11y/useMediaCaption: instrumental band recordings */}
      <audio
        ref={audioRef}
        src={track.url}
        preload="none"
        onEnded={nextTrack}
        onError={onAudioFailed}
      />

      <button
        ref={hitRef}
        type="button"
        className={styles.hit}
        aria-label={`Record deck playing ${track.title} by Car Kids, from ${track.release}. Drag the tonearm across the record to seek, or press Enter to drop and lift the stylus. Left and right arrows seek five seconds, down arrow plays the next track.`}
      />
    </div>
  );
}
