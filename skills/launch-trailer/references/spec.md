# trailer.json reference

Times are **seconds**. Positions (`x`, `y`, `w`, `h`) are **fractions of the
screenshot** (0..1, from the top-left); read them off with `scripts/grid.mjs`.
Files are names inside the trailer's `public/` folder.

## Top level

| field | default | |
|---|---|---|
| `type` | required | `"product"`, `"feature"` or `"scenario"` (only used by checks and recipes) |
| `title` | | for humans, shown by check-spec |
| `promise` | | the one sentence the viewer should believe afterwards. check-spec and review.mjs print it; every scene must serve it |
| `format` | `landscape` | `landscape` 1920×1080 · `square` 1080×1080 · `vertical` 1080×1920 (render.sh can override) |
| `fps` | 30 | |
| `brand` | required | `{name, logo?, lockup?, url?, tagline?}`. `logo`: the small square mark. `lockup`: the full logo artwork that already contains the name; when set, the `end` scene shows it large. The opener's `brandMark` still shows the small mark and name (`brandMark: "lockup"` would show the artwork there too). Without either you get a gradient lettermark |
| `theme` | | `{bg, bg2, fg, muted, accent, accent2, surface, font, display, radius, background}`; `display`: headline font for moments and CTA (Instrument Serif · Fraunces · Newsreader · Playfair Display, or a body font); `font`: Sora (the demo-film default) · Hanken Grotesk · Schibsted Grotesk · Inter · Poppins · Space Grotesk · Manrope · DM Sans; `background`: gradient · grid · dots · solid; `grade`: none · film · warm · cool (one colour grade over every context photo, so mixed sources read as one film) |
| `music` | | `{src, volume=0.7, fadeIn=0.5, fadeOut=1.5, startFrom=0, bpm, offset}`; `bpm` and `offset` (seconds to the first beat) come from `scripts/beats.mjs`, and check-spec then reports every cut that misses the beat |
| `silent` | false | `true` when the owner chose a film without sound: check-spec and review.mjs stop asking for music |
| `transition` | `fade` | default between scenes: cut (hard cut; `none` is the same) · fade · slide · wipe. Set `cut` here and `fade` on the one or two scenes that turn the story |
| `transitionDuration` | 0.4 | overlap of a fade/slide/wipe (subtracted from total length) |
| `scenes` | required | array; each has `type`, optional `duration`, `transition` (the change **into** this scene), `audio` (a voice-over or sound effect for that scene), `mood` problem·solution (`problem` is the default for the `problem` type) |

## Demo films: `demo` and `end`

The default look (see SKILL.md). Set the theme once:

```json
"transition": "cut",
"theme": {"bg": "#F2F0EB", "fg": "#101216", "accent": "#14B8D4", "accent2": "#F2B632", "font": "Sora"}
```

`bg` is the paper colour, `fg` the ink, `accent` and `accent2` the two colour
fields and the selection box.

### `demo` (default 4s)

| field | default | |
|---|---|---|
| `headline` | | 2–5 words. `[phrase]` gets the selection box; `\n` breaks the line. Keep lines near ten characters: the type is sized to fit the longest line |
| `bg` | `paper` | `paper` · `ink` · `accent` · `accent2` · any hex. Text colour follows automatically |
| `layout` | `left` | where the words sit: `left` · `right` · `top`, or `full` (the product fills the frame, words over it). Square and vertical formats always stack |
| `media` | | a clip from `record.mjs` (or a screenshot) |
| `mediaAspect`, `uiWidth` | 1.6, 1280 | copy from `clips.json` |
| `startFrom`, `playbackRate` | 0, 1 | where in the clip the scene starts, and how fast it plays |
| `view` | whole clip | the camera: `[{at, x, y, scale}]`, centre as fractions of the clip, eased between keys. One key = a fixed framing; add keys to push in or pan when something happens |
| `windowWidth` | 0.54 | share of the frame width the product window may take; the words get the rest |
| `windowAspect` | `mediaAspect` | a window of another shape (1.05 for a tall panel, 1.9 for a wide strip); the camera fills it |
| `tilt` | false | hold the window in perspective: the opening shot |
| `brandMark` | false | the small mark and name above the headline: the opening shot. `"lockup"` shows the full logo artwork instead |
| `kicker` | | a small step label above the headline: `"1 · Strategise"`. Use it when the film follows the product's own numbered method |
| `prompt` | | what the person typed: `{label?, text, at=0.4, cps=24, until?}`. In `full` layout it sits centred over the dimmed product and leaves at `until` |
| `steps` | | `[{text, at}]`: short results that tick in under the headline, in step with the clip. `check: true` shows ticks instead of numbers |
| `tag` | | a small label on the pointer beside the boxed phrase (`""` uses the brand name) |

Framing a camera: take a frame of the clip (`ffmpeg -ss 3 -i clip.mp4 -frames:v 1 f.png`),
run `grid.mjs` on it and read the component's left, right, top and bottom as
fractions. The visible share of the clip is `1/scale` wide (times
`windowAspect/mediaAspect` when the window is narrower than the clip) and
`1/scale` tall. Choose `scale` so the whole component fits, and `x`, `y` as its
centre. If a word is cut at the window's edge, the framing is wrong.

### `end` (default 3.5s)

`headline` (with a `[boxed]` phrase), `button="Try it now"`, `url` (falls back
to `brand.url`), `note?` (one small line, e.g. the method's three steps),
`bg="paper"`. The logo is always shown. With `brand.lockup`, set `bg` to the
artwork's own background colour (sample a corner pixel, e.g. `"#111111"`) so the
logo sits on the field with no visible square; in landscape the lockup goes
left and the words right.

Add `media` (with `mediaAspect`, `startFrom`, `view`) for a **hero shot**: the
product rises large behind the words, tilted back, cropped by the bottom of the
frame. Frame `view` on the top of the product's best screen, since only the top
half of the window shows.

## Older scenes

| type | default s | fields |
|---|---|---|
| `hook` | 3 | `lines[]` (one line each, kinetic word reveal), `accentWords[]` (gradient-coloured) |
| `problem` | 4 | `items[]`, `title?`, `strike=true` (red strike-through after they appear) |
| `logo` | 2.5 | `tagline?` (falls back to `brand.tagline`) |
| `announce` | 3 | `title`, `badge="New"`, `subtitle?` |
| `screen` | 5 | `media?` (png/jpg/mp4/webm/mov), `frame` browser·window·phone·none, `aspect` (16/10; phone 9/19.5), `url?` (browser bar), `title?`, `caption?`, `layout` center·left·right (side layouts only in landscape), `zoom[]`, `callouts[]`, `cursor[]` |
| `montage` | 4 | `items[] {media?, label?}` (time is split evenly), `title?`, `frame`, `aspect` |
| `keys` | 3 | `keys[]` (e.g. `["⌘","K"]`, `["Ctrl","Shift","P"]`), `label?`, `sublabel?` |
| `features` | 5 | `items[] {icon?, title, text?}` (≤ 6; icon = emoji or 1–2 chars), `title?` |
| `stat` | 3 | `value`, `label`, `prefix?`, `suffix?`, `decimals?` |
| `beforeAfter` | 5 | `before`/`after`: `{label?, items?[]}` (two cards) **or** `{media}` (one frame, wipe reveal); `title?`, `frame`, `aspect` |
| `quote` | 4 | `text`, `author?`, `role?` |
| `logo3d` | 3 | `tagline?`. The app icon (brand.logo on a glossy slab) flies in spinning, then the name types on |
| `device3d` | 5 | `device` laptop·phone·duo, `media` (laptop screen, or phone screen when device=phone), `phoneMedia` (duo), `motion` spin·open·orbit·rise·float, `color` space·silver·midnight, `title?`, `caption?`, `pushIn` (dive into the laptop screen at the end, laptop only) |
| `assemble` | 5 | `media`, `pieces[] {x,y,w,h}` (widget rectangles, fractions; ≤ 8), `mode` assemble·explode, `aspect?`, `title?`, `caption?` |
| `carousel3d` | 6 | `items[] {media, label?}` (time split evenly; each comes to the front), `title?`, `aspect=16/10` |
| `widget` | 4 | `media` (screen recording or screenshot), `crop [x, y, w, h]` (the one component, as fractions of the media), `mediaAspect=16/10`, `startFrom` (s), `playbackRate`, `focus {x, y, scale, at=0.9, until?}` (punch in on a point of the crop), `uiWidth=1440` (CSS px width of the recorded window, for the legibility estimate), `title?`, `caption?`. The component plays big on its own card |
| `moment` | 4 | `photo` (context photo or video), `after?` + `changeAt` (crossfade to a changed version of the same shot), `camera {from, to}` (`{x, y, scale}`, slow push; default 1 → 1.08), `time?`, `timeLabel?`, `headline?` (`*accent*` words in italics), `headlinePos` top-left·top-right·bottom-left·bottom-right·center, `headlineWidth?`, `tone` light·dark, `shade=true`, `chip?`, `screens[] {media, corners, at, radius, glare}`, `overlays[]`, `glow? {x, y, at, size}` |
| `cta` | 4 | `headline` (`*accent*` supported), `subline?`, `button="Try it now"`, `url?` (falls back to `brand.url`), `showLogo=true`, `photo?` (blurred, dimmed background) |

### moment: screens and overlays

```json
"screens":  [{"media": "week.png", "corners": [[0.067, 0.169], [0.514, 0.2], [0.528, 0.678], [0.075, 0.714]], "at": 0.3, "radius": 0.015}],
"overlays": [{"kind": "notification", "at": 1.5, "pos": [0.64, 0.42], "title": "Team sync", "text": "Starts in 10 min."},
             {"kind": "bubble", "from": "You", "text": "Can you push my gym session to 5?", "at": 2.0},
             {"kind": "toast", "text": "Gym moved to 5:00 PM", "at": 3.0},
             {"kind": "chip", "text": "calendar.move {\"to\": \"17:00\"}", "at": 3.2},
             {"kind": "widget", "media": "quickadd.mp4", "crop": [0.335, 0.055, 0.66, 0.29], "startFrom": 1.2, "playbackRate": 1.75, "at": 0.5, "pos": [0.4, 0.42], "width": 1060}]
```

- `corners`: the screen's quad in the **photo** as fractions, in the order TL, TR, BR,
  BL. The screenshot is warped onto it with a projective transform, moves
  with the camera, and powers on at `at`. `radius` is a fraction of the screen
  width (phones ≈ 0.09).
- A `widget` overlay is one product component at work: a crop of a recording
  (same fields as the `widget` scene, including `focus`), floating as a card
  `width` px wide (at 1080p). Put it on the empty side of the photo, never
  over faces.
- `focus`: `x`, `y` are fractions of the **crop** (the point that stays put
  while the rest scales), `scale` 1.2–2. Use it when the claim lives in one
  part of the component: the task title, the parsed chips, the goal node.
- `overlays` sit on the **frame** (not the photo); `pos` is their top-left as
  frame fractions. A `bubble` lights its words up as if spoken (`speak: false`
  shows it all at once). `notification` takes `app` (default brand name),
  `title`, `text`, `time`.
- `theme.display` sets the headline font: Instrument Serif · Fraunces ·
  Newsreader · Playfair Display. With a serif, accent words are italic;
  without one, they get the accent gradient.

### screen: camera, callouts, cursor

```json
"zoom":     [{"at": 0.8, "x": 0.5, "y": 0.5, "scale": 1},
             {"at": 2.4, "x": 0.72, "y": 0.2, "scale": 1.7}],
"callouts": [{"x": 0.6, "y": 0.15, "w": 0.27, "h": 0.1, "label": "One click", "at": 2.6, "until": 4.5, "side": "bottom"}],
"cursor":   [{"at": 1.0, "x": 0.4, "y": 0.6},
             {"at": 2.2, "x": 0.74, "y": 0.2},
             {"at": 2.5, "x": 0.74, "y": 0.2, "click": true}]
```

- `zoom`: camera keyframes, eased. `(x, y)` is the point brought to the
  centre (clamped so edges never show) and `scale` ≥ 1. Hold a zoom by
  repeating a key, and zoom back out with `scale: 1` at the end.
- `callouts`: ring plus dimmed surroundings, and a label on `side`. They
  appear at `at` and leave at `until` (or stay). They follow the zoom.
- `cursor`: positions over time, and `click: true` ripples. Put a still
  key just before a click so the pointer settles first.
- For video `media`, the clip plays from its start, so trim it to the scene
  length with `scripts/trim.sh`.

### 3D scenes (opt-in)

3D scenes take **images only** (png/jpg/webp); check-spec flags video. They
draw procedural models (no model files), lit with the theme's accent colours.

- **`device3d` motions:** `spin` turns more than once into a three-quarter view (hero
  moment), `open` turns a closed laptop towards you and opens the lid (pair it with
  `pushIn: true`, then a `screen` scene with the same media so the cut is
  seamless), `orbit` is a slow sweep, `rise` comes up from below, `float` is idle
  bobbing (good for `duo`).
- **`assemble`:** draw `pieces` around the screenshot's widgets (cards, panels,
  sidebar) with `grid.mjs`, the same way as callouts. `assemble` scatters
  them in 3D, snaps them into their slots with a glow, then turns the screen
  flat. `explode` does the reverse: it tilts the screen and lifts the pieces
  into floating layers. Use 3–6 pieces that don't overlap.
- **`carousel3d`:** cover-flow with reflections, for breadth ("and much more").

## Mood: problems are dark, the solution brings light

`mood: "problem"` draws the scene on a near-black, cold background with no
accent light. Solution scenes (the default) get the theme's glow. check-spec
**fails** a problem scene whose photo averages above ~95/255 in brightness,
and warns when a problem comes after the solution has started. Light means
relief: never show a problem in a bright room.

## Timing

- Total length = sum of durations − transitionDuration for each fade, slide
  or wipe. `check-spec.mjs` prints the timeline: start, length, the change
  into each scene, and ▣ where the product is on screen.
- With a track: `node scripts/beats.mjs public/music.mp3` prints the beat
  length. Make every scene a whole number of beats and use hard cuts; the
  cuts then land on the beat. A fade reads as a cut at its midpoint, so the
  scene before it runs half a transition longer.
- Vary lengths: quick proofs 2–3s, the payoff 4s or more, the CTA 3.5–4.5s.
- Reading time: about 0.3s a word plus 0.6s. check-spec warns when a scene
  is shorter than its words need.

## What check-spec's [craft] warnings mean

| warning | fix |
|---|---|
| no promise | write `promise`; cut scenes that don't prove it |
| opens on a logo / product appears after 5s | open on the pain or the result; shorten or merge what comes before the first ▣ |
| too much problem | one beat of pain, under a quarter of the length |
| UI text about N px | crop to one component, widen the card, or add `focus` |
| N words in Ns / title over 6 words / title and caption | cut words |
| N scenes the same length | vary them; hold the payoff longest |
| crossfades | `"transition": "cut"` at the top level, `fade` only on the turn |
| feature tour / features list | keep the 2–3 scenes that prove the promise |
| CTA under 3s / win not held | lengthen the last two scenes |
| no music / no bpm / cut off the beat | add a track, run `beats.mjs`, use the suggested length |
