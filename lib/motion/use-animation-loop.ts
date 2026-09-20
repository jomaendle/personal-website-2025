"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { subSteps } from "./spring";

export type AnimationLoopOptions = {
  /**
   * Advance the simulation by `dt` seconds. Return whether anything is still
   * moving. Called once per frame, or several times with a smaller `dt` when
   * the frame ran long — see `maxStep`.
   */
  step: (dt: number, now: number) => boolean;
  /** Write to the DOM. Once per frame, after all of that frame's sub-steps. */
  paint: (now: number) => void;
  /**
   * The longest real frame honoured, in seconds. A tab that was backgrounded
   * for a minute must not hand the simulation a sixty-second step. Default
   * 0.032 — two frames at 60 Hz.
   */
  maxFrame?: number;
  /**
   * The longest single integration step, in seconds. Longer frames are split
   * into several equal sub-steps. Defaults to `maxFrame`, i.e. no sub-stepping.
   *
   * Set this whenever a spring is stiff enough that a real frame could exceed
   * its stability bound — see `maxStableStep` in ./spring. Springs do not
   * degrade gracefully past that point; they diverge.
   */
  maxStep?: number;
  /**
   * Once, on the frame the loop stops. Where a caller snaps its springs exactly
   * onto their targets and paints one last, exact frame, so the resting pose is
   * never a hair off.
   */
  onSettle?: () => void;
};

export type AnimationLoop = {
  /** Schedule a frame if none is scheduled. Referentially stable. */
  wake: () => void;
  /** Cancel the scheduled frame, leaving simulation state where it stands. */
  stop: () => void;
  /** Whether a frame is scheduled right now. */
  running: () => boolean;
};

/**
 * One requestAnimationFrame loop that stops when nothing is moving.
 *
 * The bookkeeping here is small and easy to get subtly wrong, which is the
 * reason it lives in one place. Three things in particular:
 *
 * - `options` is held in a ref and re-read every frame, so callers can pass
 *   fresh closures on every render without restarting the loop and without
 *   threading `useCallback` through half the component.
 * - `wake` and `stop` both reset `last`, so the next frame's `dt` is zero
 *   rather than the gap since the loop last ran. Forget this and a loop that
 *   was idle for two seconds resumes by teleporting everything one frame.
 * - The loop self-terminates. Nothing here runs while the craft is at rest,
 *   which is most of the time.
 *
 * Deliberately absent: an `enabled` flag. Whether a craft should be animating
 * at all — on screen, tab visible, hovered — is policy, and it belongs at the
 * call site with the rest of that craft's rules.
 */
export function useAnimationLoop(options: AnimationLoopOptions): AnimationLoop {
  const opts = useRef(options);
  opts.current = options;

  const state = useRef({ frame: 0, last: 0 });

  const tick = useCallback((now: number) => {
    const s = state.current;
    const o = opts.current;

    // The handle we were called for is spent the moment we are called. Leaving
    // it set means a throw below would strand a stale, already-fired id in
    // `frame`, and `wake` begins by returning early when `frame` is set — so
    // every later pointer, key and resize would be a silent no-op and the
    // craft would be frozen for good. Clearing it first makes the loop
    // restartable whatever happens next.
    s.frame = 0;

    const maxFrame = o.maxFrame ?? 0.032;
    const maxStep = o.maxStep ?? maxFrame;

    const elapsed = Math.min(maxFrame, (now - (s.last || now)) / 1000);
    s.last = now;

    // Split a long frame into equal sub-steps, so no single integration step
    // exceeds what the caller's stiffest spring can survive.
    const count = subSteps(elapsed, maxStep);
    const dt = elapsed / count;
    // Any sub-step that still moved keeps the loop alive. Taking only the last
    // one's answer would stop a frame early whenever a spring settles mid-frame
    // while another is still travelling.
    let moving = false;
    try {
      for (let i = 0; i < count; i++) moving = o.step(dt, now) || moving;

      // Once per frame, never per sub-step: the DOM does not care about the
      // intermediate poses, and writing them would cost as much as the physics.
      o.paint(now);
    } catch (error) {
      // Stop deliberately and loudly rather than rescheduling into a thrower
      // sixty times a second. The craft stays where it is and stays wakeable.
      s.last = 0;
      console.error("[motion] animation loop stopped", error);
      return;
    }

    // `frame` was cleared on entry, so a `wake` triggered from inside step or
    // paint — a setState there can reach an effect that wakes us — will have
    // scheduled one already. Honour it rather than queueing a second loop and
    // running the simulation twice per frame.
    if (moving) {
      if (!s.frame) s.frame = requestAnimationFrame(tick);
    } else if (!s.frame) {
      s.last = 0;
      o.onSettle?.();
    }
  }, []);

  const wake = useCallback(() => {
    const s = state.current;
    if (s.frame) return;
    s.last = 0;
    s.frame = requestAnimationFrame(tick);
  }, [tick]);

  const stop = useCallback(() => {
    const s = state.current;
    if (s.frame) cancelAnimationFrame(s.frame);
    s.frame = 0;
    s.last = 0;
  }, []);

  const running = useCallback(() => state.current.frame !== 0, []);

  useEffect(() => stop, [stop]);

  return useMemo(() => ({ wake, stop, running }), [wake, stop, running]);
}
