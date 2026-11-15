# trailer.json reference

Times are **seconds**. Positions (`x`, `y`, `w`, `h`) are **fractions of the
screenshot** (0..1, from the top-left); read them off with `scripts/grid.mjs`.
Files are names inside the trailer's `public/` folder.

## Top level

| field | default | |
|---|---|---|
| `type` | required | `"product"` or `"feature"` (only used by checks and recipes) |
| `title` | | for humans, shown by check-spec |
| `format` | `landscape` | `landscape` 1920×1080 · `square` 1080×1080 · `vertical` 1080×1920 (render.sh can override) |
| `fps` | 30 | |
| `brand` | required | `{name, logo?, url?, tagline?}`; without a logo file you get a gradient lettermark |
| `theme` | | `{bg, bg2, fg, muted, accent, accent2, surface, font, radius, background}`; `font`: Inter · Poppins · Space Grotesk · Manrope · DM Sans; `background`: gradient · grid · dots · solid |
| `music` | | `{src, volume=0.7, fadeIn=0.5, fadeOut=1.5, startFrom=0}` |
| `transition` | `fade` | default between scenes: fade · slide · wipe · none |
| `transitionDuration` | 0.4 | overlap between scenes (subtracted from total length) |
| `scenes` | required | array; each has `type`, optional `duration`, `transition`, `audio` (a voice-over or sound effect for that scene) |

## Scenes

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
| `cta` | 4 | `headline`, `subline?`, `button="Try it now"`, `url?` (falls back to `brand.url`), `showLogo=true` |

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

### 3D scenes

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

## Timing tips

- Total length = sum of durations − (scenes − 1) × transitionDuration. Check
  it with `check-spec.mjs`.
- Text appears in about 0.3–1.2s, so leave at least 1.5s of hold after the
  last line before the scene ends.
- Durations: hook 2.5–3.5, screen 4–6, cta 3.5–5.
