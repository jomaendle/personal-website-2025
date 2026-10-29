---
title: "The /ios Phone Was Slow on Desktop: Compositor Cost and a Card That Left the Cursor"
date: "2026-10-28"
category: "docs/solutions/frontend-animation/"
module: "personal-website-2025/components/iphone/launch-scene.ts"
problem_type: performance
component: frontend
severity: high
applies_when:
  - "An animation is smooth on a phone but sluggish in desktop Chrome"
  - "A rounded overflow clip wraps layers that move"
  - "backdrop-filter sits over or under something that animates"
  - "A pointer drags an element that also scales"
tags:
  - animation
  - compositor
  - backdrop-filter
  - border-radius
  - pointer-events
  - desktop
---

# The /ios phone was slow on desktop

The phone felt smooth on an iPhone and sluggish in desktop Chrome,
worst when dragging an app closed. The main thread wasn't the problem:
about 2.6ms a frame during the drag on both. The time went to the
compositor, drawing each frame: 12 to 17ms on a 1512 × 945 window at 2x,
against 9ms on a phone-sized one. A 120Hz MacBook has 8.3ms.

## How it was measured

Playwright's Chromium with a trace per scenario (idle, open, drag,
release), reading `DisplayScheduler::DrawAndSwap` durations on the viz
thread, then the same run with one CSS override injected at a time. The
headless compositor draws in software, so frame timing barely moves;
the draw cost and the A/B difference are what to read. Removing every
`backdrop-filter` took the drag from 12.9 to 7.2ms; the screen's rounded
clip alone was another 2ms.

## What cost what

1. **Backdrop blurs under moving things.** The dock and search pill blur
   the wallpaper. Anything changing over or under a backdrop blur makes
   the browser blur it again, every frame. During a drag the home grid
   scales and the dim fades over them. They now drop the blur while the
   scene moves, as the window's own glass already did, for an opaque fill.
   The fill is the colour the glass shows at rest over that wallpaper,
   measured once per wallpaper on the desktop phone and on a phone screen
   (`glass` in `WALLPAPERS`), so nothing jumps as the blur goes and comes
   back. A guess (the wallpaper's bottom edge lifted with white) was up to
   76 levels off per channel: a visible pop on every animation. The flag
   that swaps it sits on the home screen (`.home[data-moving]`), not the
   whole screen, so switching it doesn't restyle an open app.
2. **A rounded clip around moving layers.** On desktop `.screen` had
   `border-radius: 55px` with `overflow: hidden`, and the open window kept
   a 55px radius of its own. A rounded clip over composited layers (and
   over backdrop blurs) is a masked pass per frame. The screen now clips
   square and `.screenCorners` draws the round corners over everything as
   bezel (a transparent box with a 40px bezel-coloured spread shadow). The
   window's radius is 0 when it is open and still. `measure()` reads the
   radius from `--screen-radius`.
3. **The dim's opacity, set inline on every move,** now has its own layer
   (`will-change: opacity`).

## Why it felt worse than it measured

On a phone the finger hides where the card is. On desktop the cursor is
drawn on top, with no lag, so every mismatch shows.

- The card shrinks about its centre. Holding it by the home indicator's
  middle kept its bottom edge under the finger, but off centre it slid
  away sideways, and past halfway up it fell behind. The drag now keeps
  the point it took hold of under the pointer: with `s` the card's scale
  and `(lx, ly)` the grabbed point in the card's own pixels,
  `dx = gx + Δx − w/2 − (lx − w/2)·s`, and the same for `dy`. Taken
  mid-launch the card is still part icon, so the drag reads its centre
  and scale from the scene's own frame (`scene.frame`), and the offset is
  scaled up by how little of it the half-launched card draws. That factor
  is held at a half or more: below it, the stored offset and the launch
  spring home together on release and their product swings out past the
  pointer.
- A mouse flick is several times faster than a finger. The close spring
  carried it past the card's smallest size, where the pose is clamped, so
  the card hung there before turning home. The flick's speed is capped
  at 3px/ms, and a throw from the card's smallest size (or full size, to
  cancel) puts no speed on the pull at all.
- Letting go set state that re-renders the whole phone in the same task
  as the close's start. The animations were already timed from that
  moment, so their first frames were skipped and the card jumped. The
  state now lands two frames later, and the window turns away a new grab
  from the moment a close starts.
- The moving flag flipped every time a wiggling drag crossed `p = 0`,
  restyling the app's glass each time. During a drag it now only turns
  on; the settle turns it off.
- A release the page never hears (the button let go outside the window)
  left the card mid-air. `lostpointercapture` now ends the drag too; a
  cancelled gesture (the browser taking it) puts the card back, open.

## Guardrails

- Don't put a rounded `overflow: hidden` around layers that move. Clip
  square and draw the corners on top.
- Every `backdrop-filter` near an animation needs a still stand-in while
  it moves, and the stand-in's colour should be measured from the real
  blur, not guessed.
- Put a flag that restyles on the smallest element that holds what it
  styles.
- When something under a pointer scales, solve for the grabbed point,
  not for an edge.
- Test drags with a mouse on desktop, not only with touch emulation.
