---
title: "Nine Ways a Spring-Driven Photo Pile Breaks on a Phone"
date: "2026-09-13"
category: "docs/solutions/frontend-animation/"
module: "personal-website-2025/components/image-stack.tsx"
problem_type: bug
component: frontend
severity: high
applies_when:
  - "Hand-rolling spring physics in a requestAnimationFrame loop"
  - "Animating transforms on elements that contain separately-clipped children"
  - "Using will-change to manage compositor layers on mobile"
  - "Debugging a visual defect that only appears on a real device"
tags:
  - animation
  - compositor
  - will-change
  - springs
  - ios-safari
  - layout-shift
  - next-image
---

# Nine ways a spring-driven photo pile breaks on a phone

Everything here was measured on the About-section photo pile, most of it
after shipping a fix for the wrong cause first. Each rule below cost at
least one wrong turn.

## 1. Promoting a compositor layer moves it

`will-change: transform` snaps an element to whole device pixels. Elements
sitting on fractional positions therefore jump at the instant of promotion.

I gated `will-change` behind a pointer event to save GPU memory, which put
that jump directly under the reader's finger on every tap. Adding the class
alone, with nothing else changing, moved 45,557 pixels by more than 2%.

**Guardrail:** never add or remove `will-change` in response to a pointer
event. Promote on an IntersectionObserver when the element scrolls into
view, where the page is already moving, and release when it leaves. An
off-screen component still costs nothing.

## 2. A separately rasterised child snaps independently of its parent

A child that clips and rounds its own corners gets its own layer, and that
layer is snapped to device pixels on its own. Put a border on the parent and
the hole on the child and the two round apart. A scale multiplies the error:
a 2px border authored uniformly measured 12 device pixels above the
photograph and 4 below at 1.85x on a 3x phone.

**Guardrail:** when a frame and the hole it frames must stay concentric under
a transform, they belong to the same element. Border plus `box-sizing:
border-box` on the clipping box, not an inset child.

## 3. A child's box-shadow paints over its parent's border

`inset: 0` on an absolutely positioned child of a bordered box resolves to
the padding box, which is inside the border. Any `box-shadow` that child
casts therefore lands on the border itself. The paper read 252 at the top and
187 at the bottom, where the shadow is offset, though every side was the same
11 device pixels wide.

**Guardrail:** an elevation layer that lives inside a bordered element must be
pulled out by the border width, `inset: calc(var(--frame) * -1)`.

## 4. Custom properties do not inherit sideways

Moving an element out of a subtree silently breaks every `var()` it relied
on. Colour functions with an undefined custom property are invalid at
computed-value time, and the browser drops the whole declaration. The pool of
shadow stopped painting entirely in all three engines, while the frame loop
went on animating its opacity and position for nothing.

**Guardrail:** declare shared tokens on the common ancestor, not on whichever
box happened to need them first. After moving an element, check
`getComputedStyle(el).backgroundImage !== 'none'`.

## 5. Semi-implicit Euler has a stability bound

For `k` and `c` the integrator is stable only while `k·h² + 2·c·h < 4`. At
k=1600 and c=80 that is h < 20.7ms, but the frame clock allowed 32ms.
Anything under about 48fps sent the spring to infinity rather than to rest:
transforms became invalid and were silently dropped, and the loop, never
seeing it settle, ran for ever.

**Guardrail:** advance springs in fixed sub-steps of at most 8ms rather than
one jump per frame. Verified: 20ms settles, 22.2ms diverges.

## 6. Measure the trigger before fixing the cause

Three fixes went to the wrong cause. "The page moves when opening an image"
was read as a document reflow, then as an image-load shift, and was neither.
Both engines report a cumulative layout shift of exactly 0 across the whole
interaction. It was the compositor promotion in rule 1.

**Guardrail:** get the trigger from the user in their words ("it happens on
tap", "it does not matter if the image is cached") before choosing a
mechanism. Reproduce and quantify, then fix.

## 7. Dev-only overlays pollute layout-shift measurements

The one layout shift I could reproduce belonged to `NEXTJS-PORTAL`, the dev
overlay badge, which production never serves.

**Guardrail:** measure Core Web Vitals against a production build. Resolve the
shifting node with `e.sources[].node` before believing the number.

## 8. Reduced motion means gentler, not absent

Snapping every spring to its target replaces the animation with exactly the
single-frame cut the preference exists to prevent. On touch it is also the
only feedback a tap receives.

**Guardrail:** keep opacity and size on their springs, drop the movement.
Under `prefers-reduced-motion`, shorten a cross-fade rather than setting
`transition: none`.

## 9. Before-and-after measurement cannot tell smooth from jumpy

I removed a designed behaviour because a before-and-after snapshot showed 42
pixels of movement. Sampling per frame showed the same movement spread over
30 frames with no step larger than 7 pixels. Removing it then caused a
one-frame flicker elsewhere, because that slide was what hid a z-index swap.

**Guardrail:** sample every animation frame, not the endpoints. Report the
largest single-frame delta, not the total.

## Verification harness that earned its keep

- Frame timing percentiles under `Emulation.setCPUThrottlingRate` at 1x, 4x, 6x, 10x.
- A MutationObserver counting style writes, to prove the loop stops at rest.
- Pixel sampling with ImageMagick against an isolated element on a flat ground,
  which is the only way to measure a rendered border rather than an authored one.
- The same interaction driven in Chromium, WebKit and Firefox. Firefox found
  nothing; WebKit and Chromium each found a defect the other did not.
