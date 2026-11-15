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
$KIT/scripts/new-trailer.sh product|feature|scenario <dir> ["Brand"] [url]   # scaffold
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
   `zoom`, `callouts`, `cursor` and `assemble` pieces, run `grid.mjs` on the screenshot, look at
   the image and read off the fractions. Don't guess them.
5. **Check**: run `check-spec.mjs` until it passes, then render a few stills
   and look at them before doing a full render:
   `cd $KIT && npx remotion still Trailer /tmp/f.png --props=<dir>/trailer.json --public-dir=<dir>/public --frame=<n> --scale=0.5`
   (the timeline from check-spec gives each scene's start time; frame = s × fps).
6. **Render**: `render.sh <dir> --draft` for review. When it's approved,
   run `render.sh <dir> all --gif --poster --strict`. Report the paths in
   `out/`.

## Who is it for? (decide before any photo)

Write the target viewer and their pain in one line in `storyboard.md`, from
the product's own docs, landing page or owner. For example: "hyper-optimizers
overloaded with tasks and deadlines who feel their life isn't making
consistent progress". Every photo must show **that person in their real
setting**: their desk, their campus, their late night. A generic "person
with laptop" isn't enough. Then tell the story as their arc, not as a
feature list:

1. **Pain:** the moment they live now, e.g. notifications piling up at 23:40.
2. **Turn:** the product in that same kind of setting, solving it.
3. **Proof over time:** the small result, then the same again days or weeks
   later. Time stamps like "Day 2", "Day 12", "Week 6" carry the change.
4. **CTA.**

## Recipes

Default to **components at work**. Keep it concise (around 20s). Use **scenario** only with
photos that genuinely show the target viewer's own setting (the owner rejected
generic stock scenes).

**Scenario / day in the life (20–35s), `new-trailer.sh scenario`**
4–6 `moment` scenes, then a `cta` (with `photo`). Each moment is one concrete
situation: a time stamp, a context photo, the product on the screen in that
photo (or a notification next to it), a ≤ 6-word serif headline with one
*accent* word, and an optional mono `chip` as proof. Order the moments through a
day (morning → work → on the move → evening) or through one task end to end.
References: Project Glass "One day…", and the Hermes plugin videos (home at
dusk, then lights, heat, blinds, each a single beat).

**Product launch: components at work (≈20s, the owner's preferred style)**
`problem` (dark, 3 short lines) → `logo` (the light comes on) → 3–4 `widget`
scenes → `cta`. Each widget is **one component working**, cropped from a real
screen recording: a countdown ticking, a parser reading a typed line, tasks
dropping into a week, a graph tracing. One title of 3–5 words each. No
feature lists, no keys or montage unless asked. Record the clips first
(screen recording, or the app's own demo videos), then find each crop with
`grid.mjs` on a frame (`ffmpeg -ss <t> -i clip.mp4 -frames:v 1 f.png`). Crop
tight enough that UI text is readable at 1080p: about 0.35–0.7 of the
recording's width.

**Product tour (30–60s)**
`hook` → `problem` → `logo` → `screen` ×2–3 → `keys`/`stat`/`quote` →
`features` → `montage` → `cta`.

**Feature launch (15–30s, one feature, existing users)**
`announce` (badge "New in vX") → `moment` (the situation where the feature
helps) → `screen` with `cursor` + `callouts` (the feature in use) →
`beforeAfter` → `keys` → `cta`.

**3D scenes (opt-in only)**: `device3d`, `assemble`, `carousel3d` and
`logo3d` exist but are not in any recipe. The procedural models look
synthetic next to real photos. Use them only when the user asks for 3D.

### Photo library: reuse before you search

`$KIT/scripts/library.mjs` keeps every photo you've used: its source, credit,
tags, personas, the scene, tone, headline side and **measured screen
corners**. The metadata is committed in `library/photos.json`; the files are
cached in `library/cache/` (gitignored, re-downloaded on demand).

```bash
node $KIT/scripts/library.mjs list [--persona hyper-optimizer] [--tag overwhelmed]
node $KIT/scripts/library.mjs sheet --persona founder /tmp/s.png   # look before choosing
node $KIT/scripts/library.mjs use pexels-12470765 pexels-5717778 <trailer-dir>   # copies + CREDITS + moment JSON with corners
node $KIT/scripts/library.mjs search "student desk at night"       # needs UNSPLASH_ACCESS_KEY or PEXELS_API_KEY
node $KIT/scripts/library.mjs add pexels:<id> --scene "…" --tags … --personas … --time … --tone … --headline …
node $KIT/scripts/library.mjs corners <id> monitor "x,y x,y x,y x,y"
```

Add every new photo you use, with honest tags and personas, so the next
trailer starts from the library. Keys live in
`~/.config/launch-trailers/keys.env` (`UNSPLASH_ACCESS_KEY=…`,
`PEXELS_API_KEY=…`), never in a repo.

### Making a moment

1. Find a photo, library first: the user's own, AI-generated, or free stock. Pexels photos
   are free for commercial use, and Pexels is searchable from the web. A
   direct image URL looks like
   `https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?w=2400`.
   Pick photos with a visible, unobstructed screen at a moderate angle (a
   blank or white screen is ideal), one consistent light and colour mood, and
   empty space on one side for the headline. List each source in the trailer's
   `CREDITS.md`.
2. Run `grid.mjs` on the photo with 20 divisions
   (`node $KIT/scripts/grid.mjs photo.jpg /tmp/g.png 20`), look at it, and
   read the screen's four corners as fractions: top-left, top-right,
   bottom-right, bottom-left. These go in `screens[].corners`. Ignore the
   rounded corners and use where the edges would meet.
3. Choose `tone`: `dark` (ink text) for bright photos, `light` for dark
   ones. Put the headline on the empty side, and set `headlineWidth` so it
   wraps before it reaches the device.
4. Move the camera towards the screen (`camera.to` at about the screen's centre,
   scale 1.1–1.3). Bring overlays in at 1–2s, after the headline.
5. Render a still at the middle of the moment and check that the screen sits
   exactly in the bezel. Adjust corners in steps of 0.005.

## Rules of thumb

- **Problems are dark; the solution brings light.** Set `mood: "problem"` on
  problem scenes. check-spec rejects bright photos on them.
- **Concise.** About 20s, 3–5 words per title, one component per scene.
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
