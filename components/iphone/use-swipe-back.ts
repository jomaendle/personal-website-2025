import { animate, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { clamp, SPRING_PUSH } from "./motion";

/**
 * The interactive back swipe of a navigation stack. iOS 26 takes it from
 * anywhere in the content, not just the left edge, and the pushed level
 * follows the finger; released past a third, or flicked, it goes back.
 *
 * Spread the returned handlers on the pushed level's scroller and give it
 * `touch-action: pan-y`: the browser keeps vertical scrolling and hands
 * horizontal drags here. A mouse selects text instead, and controls (links,
 * buttons, media, sliders) keep their own drags.
 *
 * `nav` is the stack position: 1 shows the pushed level, 0 the one below.
 */
type Sample = { x: number; t: number };

interface Swipe {
  id: number;
  x: number;
  y: number;
  width: number;
  active: boolean;
  samples: Sample[];
}

/** Controls keep their own drags, and a mouse selects text instead. */
const swipeable = (event: React.PointerEvent<HTMLElement>) =>
  event.pointerType !== "mouse" &&
  !(event.target as HTMLElement).closest("video, a, button, input");

/** Rightward release speed in px/ms over the last few samples. */
function releaseVelocity(samples: Sample[]) {
  const first = samples[0];
  const last = samples.at(-1);
  return first && last && last.t > first.t
    ? (last.x - first.x) / (last.t - first.t)
    : 0;
}

/** Before a drag commits: keep waiting inside the slop, give it up to the
 * scroller if it turns out vertical or leftward, or start the back swipe. */
function intent(dx: number, dy: number): "wait" | "cancel" | "start" {
  if (Math.hypot(dx, dy) < 10) {
    return "wait";
  }
  return dx <= 0 || Math.abs(dy) > Math.abs(dx) ? "cancel" : "start";
}

/** One pointer move: commit or abandon the swipe, then follow the finger.
 * Returns the swipe to keep tracking, or null once it is given up. */
function follow(
  s: Swipe,
  event: React.PointerEvent<HTMLElement>,
  nav: MotionValue<number>,
): Swipe | null {
  const dx = event.clientX - s.x;
  if (!s.active) {
    const next = intent(dx, event.clientY - s.y);
    if (next !== "start") {
      return next === "cancel" ? null : s;
    }
    s.active = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  s.samples = [
    ...s.samples.slice(-3),
    { x: event.clientX, t: event.timeStamp },
  ];
  nav.set(clamp(1 - dx / s.width, 0, 1));
  return s;
}

export function useSwipeBack(
  nav: MotionValue<number>,
  onBack: (velocity: number) => void,
) {
  const swipe = useRef<Swipe | null>(null);

  const onPointerEnd = (event: React.PointerEvent<HTMLElement>) => {
    const s = swipe.current;
    if (s?.id !== event.pointerId) {
      return;
    }
    swipe.current = null;
    if (!s.active) {
      return;
    }
    const vx = releaseVelocity(s.samples);
    if (nav.get() < 0.65 || vx > 0.5) {
      // px/ms rightwards to stack units per second.
      onBack((-vx * 1000) / s.width);
    } else {
      animate(nav, 1, SPRING_PUSH);
    }
  };

  return {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      if (swipe.current || !swipeable(event)) {
        return;
      }
      nav.stop();
      swipe.current = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        width: event.currentTarget.offsetWidth,
        active: false,
        samples: [{ x: event.clientX, t: event.timeStamp }],
      };
    },
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
      const s = swipe.current;
      if (s && s.id === event.pointerId) {
        swipe.current = follow(s, event, nav);
      }
    },
    onPointerUp: onPointerEnd,
    onPointerCancel: onPointerEnd,
  };
}
