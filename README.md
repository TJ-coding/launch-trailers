# launch-trailers

A kit for **product launch films** and **feature launch clips**. You script
one session in the real product (`record.mjs`), the kit records it as clean
clips, and one JSON file cuts them into flat-colour scenes with heavy
headlines, rendered to MP4/GIF in 16:9, 1:1 and 9:16. It's built on
[Remotion](https://www.remotion.dev) and Playwright, comes with an agent skill,
and is meant to be consumed as a **git submodule**. Older scene types (context
photos, device frames, three.js) still render but are no longer the default.

```
framework/src/
├── spec.ts            trailer.json types, default durations, timeline maths
├── Trailer.tsx        renders a spec: scenes + transitions + music
├── Root.tsx           compositions: Trailer (used by scripts), Templates/*
├── theme.tsx          theme tokens, fonts, layout unit (works in every format)
├── motion.ts          springs, rise/pop, keyframes
├── three/             3D kit: Stage3D, CameraRig, Laptop, Phone, AppIcon,
│                      textures (rounded/cropped planes, loaders)
├── components/        Background, Stage, KineticText, RiseText, Pill, Logo,
│                      Button, Counter, KeyCaps, FeatureCard, DeviceFrame,
│                      Media, ZoomPan, Callout, Cursor
├── scenes/            demo + end (the default film: real product on a colour
│                      field, boxed headline, typed prompt, steps); older: hook, problem, logo, announce, screen, montage, keys,
│                      features, stat, beforeAfter, quote, cta, widget (one component
│                      cropped from a recording, at work), moment
│                      (context photo + UI on its screen + overlays); opt-in 3D:
│                      logo3d, device3d (laptop/phone/duo: spin, open +
│                      push-in, orbit, rise, float), assemble (widgets fly
│                      into place / explode into layers), carousel3d
└── lib.ts             public API for custom compositions
templates/
├── product/           launch film recipe (demo scenes + end card)
├── feature/           feature clip recipe
├── scenario/          older context-photo recipe (opt-in)
├── record.mjs         starting point for the recording script
└── storyboard.md      the plan you fill in first
library/photos.json    reusable photo library: source, credit, tags, personas,
                       measured screen corners (files cached, not committed)
scripts/               new-trailer, record (plays record.mjs in the real app and
                       writes clips + clips.json), check-spec (validation + [craft] warnings),
                       beats (tempo and beat grid of a track), render, review
                       (contact sheets of a render), studio, capture, grid,
                       trim, library (search/add/corners/sheet/use)
skills/launch-trailer/ SKILL.md + references/ (recording, spec, review,
                       principles, moments, components)
```

## Quick start

```bash
git submodule add https://github.com/TJ-coding/launch-trailers.git trailers/kit
trailers/kit/scripts/new-trailer.sh feature trailers/focus-mode "My App" myapp.dev
trailers/kit/scripts/capture.sh https://myapp.dev trailers/focus-mode/public/feature.png
node trailers/kit/scripts/grid.mjs trailers/focus-mode/public/feature.png   # coordinates for zoom/callouts
# edit trailers/focus-mode/trailer.json
trailers/kit/scripts/studio.sh trailers/focus-mode                          # preview
trailers/kit/scripts/render.sh trailers/focus-mode all --gif --poster       # → trailers/focus-mode/out/
```

The first script run installs the kit's dependencies (Node 18+, ffmpeg for GIF
and trim). Each trailer is just `trailer.json`, `storyboard.md` and `public/`,
so trailers stay small in the consuming repo. Commit them; `out/` is ignored.

A minimal trailer:

```json
{
  "type": "feature",
  "brand": {"name": "My App", "logo": "logo.png", "url": "myapp.dev"},
  "theme": {"accent": "#7CF29C", "accent2": "#5AD1FF"},
  "scenes": [
    {"type": "announce", "badge": "New in v2.4", "title": "Focus mode"},
    {"type": "screen", "media": "feature.png", "title": "Start it from any task",
     "zoom": [{"at": 0.8, "x": 0.5, "y": 0.5, "scale": 1}, {"at": 2.2, "x": 0.74, "y": 0.2, "scale": 1.7}],
     "callouts": [{"x": 0.6, "y": 0.15, "w": 0.27, "h": 0.1, "label": "One click", "at": 2.4}]},
    {"type": "cta", "headline": "Focus mode is live"}
  ]
}
```

Full field reference: [`skills/launch-trailer/references/spec.md`](skills/launch-trailer/references/spec.md).
Components, and how to add a scene type: [`references/components.md`](skills/launch-trailer/references/components.md).

## Making one that's good

A spec that validates can still render a bad trailer. The kit pushes on the
things that decide it:

- One recorded session (`record.mjs`): the same data carries from scene to
  scene, which is what makes it a story and not a feature tour.
- `promise` in the spec: one sentence every scene has to prove.
- `check-spec.mjs` prints `[craft]` warnings: UI text too small to read, a
  still screenshot where nothing changes, a clip that ends before its scene,
  too many words, scenes all the same length, mixed visual styles, several
  unrelated stock photos.
- `review.mjs <dir>` turns a render into three sheets (the first 3 seconds,
  the whole film at 2 frames a second, every scene at phone width) to look at
  before anyone else does. The questions are in
  [`references/review.md`](skills/launch-trailer/references/review.md); the
  reasoning and sources in
  [`references/principles.md`](skills/launch-trailer/references/principles.md).

## Agent skill

`skills/launch-trailer/SKILL.md` covers what makes a trailer work, the
workflow (brief → storyboard → record → spec → check → draft → review → final)
and the scene shapes. To make it available to Claude Code in a consuming repo:

```bash
mkdir -p .claude/skills && ln -s ../../trailers/kit/skills/launch-trailer .claude/skills/launch-trailer
```

## Developing the kit

```bash
npm install
npm run studio     # browse Templates/ProductLaunch and Templates/FeatureLaunch
npm test           # validates the templates + typechecks
```

Improve the kit here, not in a trailer: new scene types, components and
themes help every future trailer. Then bump the submodule in consuming repos
(`git submodule update --remote trailers/kit`).

## Licence

MIT for this kit (see [LICENSE](LICENSE)). Remotion has its own
[licence](https://www.remotion.dev/license): it is free for individuals and
companies of up to 3 people, and larger companies need a company licence.
Music and screenshots you add are your responsibility.
