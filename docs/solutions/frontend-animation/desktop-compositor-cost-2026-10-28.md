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
against 9ms on a phone-sized one. A 120Hz MacBook has 8.3ms. After the
fix a drag draws in 7.5 to 8ms there.

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
   scales and the dim fades over them. On the desktop phone they now drop
   the blur while the scene moves, as the window's own glass already did,
   for a stand-in: the plate as it looks at rest over that wallpaper,
   measured into a 32 × 8 (pill: 24 × 6) image and stretched smoothly
   over it (`lib/state/glass-plates.ts`). A frosted plate is all low
   detail, so that matches it to about 1.5 levels on average (the pill, a
   lighter blur, to 2–6), and the swap needs no fade either way. Two
   tries before it didn't hold: one flat colour per plate was up to 70
   levels off, because the photo changes across the plate, and even a
   left-to-right gradient missed its changes top to bottom. Phones keep
   the blur: a phone's own screen crops the photo by its shape, so one
   measured image can't fit them all, and the framed desktop phone is
   always the same 402 × 874. The flag that swaps it sits on the home
   screen (`.home[data-moving]`), not the whole screen, so switching it
   doesn't restyle an open app.
2. **Two rounded clips around moving layers.** On desktop `.screen`
   clips to a 55px radius, and the open window kept a 55px radius of its
   own inside it. A rounded clip over composited layers is a masked pass
   per frame. The window's radius is now 0 when it's open and still, so
   only the screen's mask is left. (Clipping the screen square too, with
   the corners drawn on top as bezel, saved another millisecond a frame,
   but the frame's corners aren't concentric with the screen's: the
   square corners stuck out past them.) `measure()` reads the radius
   from `--screen-radius`.
3. **The dim's opacity, set inline on every move,** gets its own layer
   while the scene moves (`will-change: opacity` under the home screen's
   flag), not at rest, where it would hold a screen-sized layer for
   nothing.

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

- Keep rounded clips around moving layers to one, and check any overlay
  that fakes a shape against the edges around it at full zoom.
- Every `backdrop-filter` near an animation needs a still stand-in while
  it moves, measured from the real blur, not guessed, and compared
  pixel for pixel against it at rest.
- Put a flag that restyles on the smallest element that holds what it
  styles.
- When something under a pointer scales, solve for the grabbed point,
  not for an edge.
- Test drags with a mouse on desktop, not only with touch emulation.
