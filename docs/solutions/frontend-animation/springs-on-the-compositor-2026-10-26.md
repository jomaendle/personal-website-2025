---
title: "Running Spring Animations on the Compositor, for Safari"
date: "2026-10-26"
category: "docs/solutions/frontend-animation/"
module: "personal-website-2025/components/iphone/launch-scene.ts"
problem_type: performance
component: frontend
severity: high
applies_when:
  - "A spring (framer-motion animate, a motion value, an rAF loop) moves large elements"
  - "An animation stutters on an iPhone but looks smooth in desktop Chrome"
  - "A transition starts while React is mounting or images are decoding"
  - "Animating clip-path, or any shape change, on a phone"
tags:
  - animation
  - compositor
  - web-animations
  - springs
  - ios-safari
  - clip-path
---

# Running spring animations on the compositor, for Safari

The /iphone page's app launch looked smooth in desktop Chrome and ran at
about 25fps on an iPhone, stalling for its first three frames. A screen
recording settled it: during the zoom the phone only recorded a new frame
every 30 to 65ms. Static stretches recorded at 60.

## The cause

Every frame of the zoom was computed in script. framer-motion's motion
values ran on `requestAnimationFrame`, `useTransform` wrote `transform` and
`clip-path` inline, and a launch starts exactly when the main thread is
busiest: React mounting the app, images decoding. A busy frame is a dropped
frame.

`clip-path` made it worse. Safari can't composite it, so even a Web
Animation of `clip-path` is redrawn on the main thread every frame.

## The fix

Work the motion out up front and hand it to the browser:

1. Simulate the spring once (framer-motion's own mapping: stiffness
   `(2π / (visualDuration × 1.2))²`, damping `2 × (1 − bounce) × √stiffness`).
2. Sample every element's pose from it at 60 frames a second.
3. Give each element one `element.animate(keyframes, { easing: "linear" })`
   of `transform` and `opacity` only. Core Animation runs these off the main
   thread, so a blocked main thread no longer stops the motion.
4. Write the final pose as the element's own style underneath, so dropping
   the animation at the end shows nothing new.
5. On interruption, read where the spring is at that instant, position and
   speed, from the samples, and start the next spring from there.

A finger still moves things frame by frame, writing styles directly. Only
the let-go is precomputed.

`launch-scene.ts` does this for the app launch, close and card drag.
`compositor-spring.ts` does it for a single motion value (the unlock,
navigation pushes, the photo info sheet, the Spotlight pull): the value
jumps to its target at once, so its framer bindings write the final style
once, hidden under the animation, and `halt()` commits the animated style
when a finger catches it.

## Clipping without clip-path

To shape a full-screen window into an icon, squash it: an outer box with
`overflow: hidden`, scaled non-uniformly to the icon's width and height.
Then stretch the content inside back by the inverse of that squash, so it
only ever scales evenly. Corners need elliptical radii in the outer box's
own units, `r / (r / squash)`, to come out round on screen.

A contained image needs even less. Its letterbox is transparent, so at
rest the frame needs no clip at all, only on its way into a thumbnail.

Interpolating the outer and inner transforms independently would distort
the content mid-way, because the product of two lerps isn't a lerp. Sample
both per frame from the same progress instead.

## A cold start needs a launch screen

On a first open the app's code is still downloading when the zoom's
hand-over from icon art to app comes due. Holding the art over the window
instead fills the screen with a giant icon; letting it fade shows a black
window. iOS shows the app's launch image: the scene keeps a cover value,
`c`, and under the art a launch screen (the app's background with a small
centred icon) is visible while `c` holds. A marker inside the window's
Suspense boundary reports the app's first commit, and `c` tweens to 0;
when the code was already there, the cover drops in the same commit and
nothing shows. Test it by holding every non-initial chunk until the tap
(e2e/cover.cjs): the idle warming otherwise makes the cold case rare.

## Guardrails

- Never drive a large element's motion frame by frame from script unless a
  finger is moving it. Precompute the spring and animate transform and
  opacity.
- Don't animate `clip-path`, `border-radius` sizes, or layout properties
  through a transition on a phone. Use nested transforms.
- Settle on the animation's `finished` promise, not a timer, so a
  throttled tab or a slowed timeline can't settle early.
- When a motion value jumps to its target at the start, anything that
  reads it mid-flight sees the target. Use `motionNow()` for the real
  position, and wait for the spring's promise before treating it as landed.
- Keep transform and opacity in an animation of their own. One property
  the compositor can't run in the same animation takes the whole animation
  off it: the window's `border-radius` sat beside its transform, and
  Chrome's trace reported the launch as not composited ("unsupported CSS
  property"). `split()` in launch-scene.ts separates them.
- Never transition or animate a property that has an `!important`
  declaration. The animation can't override it, so the browser won't
  composite it ("affects important property"). Move the effect to an
  element that has no inline style to beat.
- Fade a tint by opacity on its own layer instead of transitioning
  `background-color` on a full-screen element, which repaints every frame.
- Sample precomputed motion at 120 frames a second (`FPS` in motion.ts).
  The compositor draws straight lines between keyframes, so at 60 every
  other ProMotion frame is an interpolation.
- Give the few layers that move on every interaction (`.app`,
  `.homeZoom`, `.navLayer`) their own layer up front with `will-change`.
  Not everything: each full-screen layer costs GPU memory on a phone.
- Check, don't assume. Trace a transition with the `devtools.timeline`
  category and read each `Animation` event's `compositeFailed` and
  `unsupportedProperties` (e2e/composite.cjs in the session scratchpad did
  this for every transition).
- Prove it with a blocked main thread: run a 400ms busy loop just after the
  animation starts and count the frames a CDP screencast delivers (24 for
  the launch after the change, none before).
