---
title: "Making a CSS Object Read as Photographed Rather Than Diagrammed"
date: "2026-09-20"
category: "docs/solutions/frontend-design/"
module: "personal-website-2025/components/crafts"
problem_type: design_pattern
component: crafts
severity: medium
applies_when:
  - "Building a skeuomorphic object in CSS that has to look like a real thing"
  - "A render technically matches its spec but reads as flat, thin or fake"
  - "Simulating a physical process (development, inking, wear) with blend modes"
  - "Choosing a magnification or distortion technique for a lens"
tags:
  - css
  - crafts
  - skeuomorphism
  - blend-modes
  - svg-filters
  - canvas
  - webkit
---

# Making a CSS Object Read as Photographed Rather Than Diagrammed

## Context

Five parallel builds of physical objects (an instant print, a photographer's
loupe, a rubber date stamp, a turntable) plus a renderer spike, all against the
same material brief. The brief was followed in every case. Several results
still read as diagrams, and the reasons were consistent enough to write down.

The first version of the crafts work was rejected outright with "looks useless
and shitty". The objects were not wrong; the rendering was. What follows is
what actually moved the needle, and what turned out to be a red herring.

## The single biggest lesson: uniform detail reads as diagrammed

This came out of the turntable and it generalises to everything else.

The vinyl's groove pattern was drawn twice: once faintly underneath everything
at alpha 0.17, and once on top in `mix-blend-mode: overlay` with its mask
`mask-composite: intersect`-ed against a conic gradient matching the light
direction. Grooves cut the highlight into fine concentric lines **only where
light falls**, and vanish in the unlit quadrants.

The first attempt applied the same pass unmasked. It was strictly worse: an
evenly ridged disc that read as a gear.

Real surfaces show their texture where light rakes across them and hide it
elsewhere. Detail applied evenly is the signature of a diagram. **Mask every
texture pass by the light.**

Corollary from the stamp: two `repeating-linear-gradient`s used as wood grain
always beat into a visible rib. It passed at 1x and was unmistakable corduroy
at 2x. `feTurbulence baseFrequency="0.72 0.012"` — narrow in x, long in y —
gives streaks along the turning axis that never repeat. This was the single
biggest fix in that build.

## Simulating a physical process: raise a ceiling, do not fade a layer

The instant print needs the image to arrive shadows-first. The obvious
implementation, and the one shipped first, is to fade a darkening layer in.

**That is wrong in a way that is worth understanding.** Development is not a
photograph becoming visible; it is density accumulating on paper, and density
has a *ceiling* that starts low and rises. So the correct construction is a
`mix-blend-mode: darken` layer whose **colour** is the lightest value the print
has so far reached, and development moves that colour:

```
#8f9789  (early: nothing can be lighter than this grey-green)
   ↓
#b3b5ad  (mid)
   ↓
gone     (finished: no ceiling)
```

The cap stays **near-opaque throughout** (α 0.97). Running it at partial
opacity averages a blown highlight back toward white, and the whole effect
collapses into a sepia filter.

Second trap, once that works: `darken` is per-channel, so a warm highlight
clamps its red channel hardest and fringes cyan. Fix by dropping the photograph
to `saturate(0.12)` **before** the clamp and neutralising the cap colour.

The shipped `Polaroid.tsx` currently uses a two-pass opacity ramp (a multiplied
shadow layer, then the plain photograph) which is measurably shadows-first and
looks acceptable. The ceiling construction above is the more correct one and is
the direction to take it if it gets revisited.

## Ink squeeze: the obvious filter chain produces outlined type

For a letterpress or rubber-stamp impression, the characteristic artefact is
ink pooling darker at the *perimeter* of a stroke than at its centre. The
natural chain is:

```
feMorphology dilate 0.28  ──┐
feMorphology erode   0.45  ─┴─ composite "out" → the rim
rim α 1.0 over body α 0.82
```

On its own **this produces outlined type**, which is the exact failure it was
meant to avoid. Two additions fix it:

1. A **0.30px blur on the rim**, with alpha pushed back via
   `feComponentTransfer slope 1.45`, so the rim bleeds *inward* instead of
   sitting on the edge as a line.
2. A turbulence → `feColorMatrix type="luminanceToAlpha"` → gamma mask,
   composited `in` to the body, so coverage is patchy rather than even. Getting
   the gamma right matters: `exponent 0.4 offset 0.46` clamped to 1 everywhere
   and did nothing; inverting to `exponent 1.6 offset 0.55` gave a usable
   0.66–1.0 range.

Size floor: below roughly **44px** the whole artefact is sub-pixel and reads as
faux-bold. Set stamped or printed type at 48–60px.

## Lens magnification: canvas LUT, and a silent WebKit failure

Three approaches were measured for an optically real loupe.

| Tier | Mechanism | Verdict |
|---|---|---|
| 1 | Canvas lookup-table remap | **Ship this** |
| 2 | SVG `feDisplacementMap` | Do not use |
| 3 | `clip-path: circle()` + `scale()` | SSR pose and reduced-motion only |

**Tier 2 fails WebKit silently and dangerously.** In WebKit 26.6,
`filter: url(#loupe)` does not degrade the distortion — it **erases the
element**, with no console error in any engine. Removing the filter at runtime
makes the layer reappear, which is what pins it on the filter. A feature-detect
would have to compare rendered pixels to catch this. Its 8-bit displacement
field is also quantised to ~3.4 device px against tier 1's exact-pixel LUT.

**Read frame times before draw times.** Every tier held 120fps at every
throttle level (frame p50 pinned at 8.3ms). At this size performance does not
choose between the approaches; *fidelity* does. Tier 1 measured 2.6ms p95 draw
at 4x CPU throttle. Chromatic aberration adds +0.3ms at 4x but +3.3ms at 6x, so
it is the first thing to drop on a slow device, not an unconditional feature.

### The real cost is memory, not CPU

Tier 1 needs the source at ~5.2 device px per CSS px across everything the rim
can reach: **~13MB per print**, held for the loupe's lifetime. Fine for one,
impossible for twenty-four. Build the buffer lazily for the print under the
loupe and release it on exit; `getImageData` at that size costs ~10ms, which
fits inside the gesture that summons the loupe.

Related trap: `will-change` on scaled content rasterises the **whole element**
at 5.2x — about 37MB per layer.

### Correction to the published optical constants

For `f(r) = r · (a + b·r⁴)` with `a = 0.3846`, `b = 0.7654`: `f(1) = 1.1500`
exactly as intended, but the centre is flat to within 1% only out to
**r ≈ 0.266**, not r = 0.3. At r = 0.3 the deviation is 1.61%. Buying 1% at
r = 0.3 needs `b ≈ 0.47`, which drops `f(1)` to 0.86 and kills the rim in-pull
that is the entire point. Keep the constants; quote the real figure.

## Smaller things that carried real weight

- **A dedicated tight contact shadow** at the object's actual footprint (blur
  ~3px, near-opaque) is what glues it to the page. An ambient pool alone leaves
  it hovering. This is separate from, and more important than, the soft shadow.
- **Blend modes on the barrel, not just gradients.** Painted flat, white
  specular bands flood the dark side of a torus and it reads as a ceramic
  plate. `background-blend-mode: screen, screen, multiply, normal, normal`
  keeps the unlit side at `#171c21`. This survived three failed rounds of
  "just darken the conic".
- **A glossy surface reflects the shape of the light source**, not merely a
  falloff. Two soft blobs at `blur(11px)`, screen-blended, read as a window.
- **Two densities per shadow.** An ambient and a core shadow per element; one
  shadow reads as a grey copy of the object.
- **One grain field across object and background together.** A render sits on
  textured paper like a sticker until the same grain crosses both.
- **A turned profile is one `clip-path: path()`**, not a stack of rounded
  boxes. Stacked boxes read as a caramel chess pawn. The pinch at the waist and
  the flare into the skirt are most of what says *turned on a lathe*.
- **Less magnification can be more legible.** The loupe dropped from 2.45x to
  ~1.5x: at 2.45x the lens filled with one photograph and read as a porthole.
  At 1.5x you see the rebate and sprocket ticks go big inside the glass while
  the frames outside stay small, which is what identifies it as a loupe at all.

## Two bug classes worth recognising

**Percentage padding resolves against the containing block, not the element.**
`padding: 5.1% 5.1% 26.75%` looked right in a shrink-to-fit slot and grew a
double-size frame the moment the object sat directly in a 720px flex card.
Anything proportional to the object must be `calc()` off a single `--w`.

**Explicit z-index on every layer of a composited stack.** A positioned layer
paints over a static sibling that comes later in the DOM — except on frames
where a `filter` happens to promote the sibling into its own stacking context.
That makes a half-developed state look right and a finished one look broken.
Adding a filter for visual reasons silently changes paint order.

## Process notes

- **Headless Chrome silently served cached CSS for two rounds**, which made a
  build wrongly conclude two fixes had failed. Cache-bust the URL.
- Too many live composited surfaces makes Blink **stop laying out entirely**
  while JS keeps running, with nothing erroring. An inline `<svg>` overlay
  wedged the renderer hard enough that CDP stopped responding.
- Several craft stylesheets are CSS modules with a `.hit` class, so
  `[class*="__hit"]` matches more than one craft. Scope test queries to the
  craft's own root, or you will spend an hour debugging a component that was
  working the whole time.

## What did not matter

- **A tight SVG `<filter>` region.** For a 91×34.5px word the tight region is
  4345px² against the default's 4521px² — a 4% saving. The default only looks
  wasteful on large boxes, and a word is a small box. Worth setting, not worth
  designing around.
- **Resolution above 640w** for a 2.6x loupe over a 115px frame. 480w is −39%
  acutance against 640w; 900w buys +4.0% for 80% more bytes; 1400w buys nothing
  over 900w.

## The honest limit

Every one of these renders was self-assessed as surviving a side-by-side with a
real photograph for "about two seconds". What breaks them is never the shadow
work by that point. It is the absence of grubbiness: a dust speck, a hair, a
scuff, an edge that is not perfectly die-cut. One imperfection buys more
realism than another gradient layer.
