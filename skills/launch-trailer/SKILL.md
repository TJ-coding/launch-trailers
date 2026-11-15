---
name: launch-trailer
description: Make a product launch trailer or a feature launch trailer (short promo video, MP4/GIF, 16:9, 1:1 or 9:16) from a JSON storyboard with the launch-trailers kit (Remotion). Use when the user asks for a launch video, trailer, promo, teaser, release video, "what's new" video, or an animated demo of a product or feature for a landing page, social post, Product Hunt or release notes.
---

# Launch trailers

The kit renders a whole trailer from one `trailer.json` (a list of scenes) plus
a `public/` folder of assets. You write JSON, not animation code. The kit root
is two levels above this file (`$KIT`; in a consuming repo usually
`trailers/kit`).

```bash
$KIT/scripts/new-trailer.sh product|feature <dir> ["Brand"] [url]   # scaffold
node $KIT/scripts/check-spec.mjs <dir>                              # validate + timeline
$KIT/scripts/studio.sh <dir>                                        # live preview :3000
$KIT/scripts/render.sh <dir> [landscape|square|vertical|all] [--gif] [--poster] [--draft] [--strict]
$KIT/scripts/capture.sh <url> <dir>/public/x.png [1440x900] [--dark] # screenshot a page
node $KIT/scripts/grid.mjs <dir>/public/x.png /tmp/x.grid.png        # read off coordinates
$KIT/scripts/trim.sh rec.mov 3.2 9.8 <dir>/public/clip.mp4 [speed]   # cut a screen recording
```

The first run installs the kit's node_modules (Remotion and a headless Chrome).
Output goes to `<dir>/out/` (gitignored).

## Workflow

1. **Brief**: the product or feature, the audience and where it plays, the
   format, the length, the one thing to remember, and the CTA. Ask only for
   what you can't find in the repo (README, landing page, changelog, release
   notes).
2. **Storyboard**: fill `<dir>/storyboard.md` with one row per scene: type,
   seconds, on-screen words (≤ 8) and what the viewer must see. Pick a recipe
   below. Show it to the user before building if the brief was thin.
3. **Assets** go into `<dir>/public/`: logo, screenshots (`capture.sh`, or
   the user's own captures), clips (`trim.sh`) and music. Screenshots
   should match the frame's aspect: 16:10 for browser and window frames
   (1440×900 @2x), 9:19.5 for phone. For a different aspect, set `aspect`
   on the scene.
4. **Spec**: edit `trailer.json` (reference: `references/spec.md`). For
   `zoom`, `callouts` and `cursor`, run `grid.mjs` on the screenshot, look at
   the image and read off the fractions. Don't guess them.
5. **Check**: run `check-spec.mjs` until it passes, then render a few stills
   and look at them before doing a full render:
   `cd $KIT && npx remotion still Trailer /tmp/f.png --props=<dir>/trailer.json --public-dir=<dir>/public --frame=<n> --scale=0.5`
   (the timeline from check-spec gives each scene's start time; frame = s × fps).
6. **Render**: `render.sh <dir> --draft` for review. When it's approved,
   run `render.sh <dir> all --gif --poster --strict`. Report the paths in
   `out/`.

## Recipes

**Product launch (30–60s, introduce the whole product)**
`hook` → `problem` → `logo` → `screen` ×2–3 (the core loop, real UI) →
`keys` or `stat` or `quote` (one proof) → `features` (3–6) → `montage`
(optional breadth) → `cta`.

**Feature launch (15–30s, one feature, existing users)**
`announce` (badge "New in vX") → `beforeAfter` (the pain it removes) →
`screen` with `cursor` + `callouts` (the feature being used, one flow) →
`keys` (if it has a shortcut) → `cta` ("Update" / "Try it now").

Templates with both recipes: `$KIT/templates/{product,feature}/trailer.json`.

## Rules of thumb

- **One idea per scene.** Keep on-screen text to 8 words or fewer. The
  viewer gets about 3s per line.
- **Show the real product.** Real UI beats feature cards: use `screen`
  scenes for proof and `features` for summary.
- **Zoom to the point.** Every `screen` should push in on the thing the title
  claims (scale 1.4–1.8), then add a callout or cursor click there.
- **Faces and arrows point at the product or CTA, never off-frame.**
- **End on the CTA** with the URL visible for at least 2s. The default
  button is "Try it now".
- **Silent-first.** Most feeds autoplay muted, so the story has to work
  without sound. Music is a bonus: set `music.src` to a licensed track.
- **Vertical (9:16)**: keep titles short. Phone-frame screenshots work best.
  Check the stills, since text wraps differently.

## When the spec can't express it

Extend the kit; don't fork it per trailer:
- New look: `theme` (colours, font, radius, background).
- New scene type: add `framework/src/scenes/<Name>.tsx`, register it in
  `scenes/index.ts`, add its type to `spec.ts` and the required fields to
  `scripts/check-spec.mjs`, then document it in `references/spec.md`.
  Build from the components in `references/components.md`.
- A one-off composition: import from `framework/src/lib.ts` (every
  component, scene and helper is exported there).

Then run `npm test` in `$KIT` (validates the templates and typechecks).
