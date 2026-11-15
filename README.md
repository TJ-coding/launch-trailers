# launch-trailers

A framework for **product launch trailers** and **feature launch trailers**.
You describe the trailer as a list of scenes in one JSON file, and the kit
renders it to MP4/GIF in 16:9, 1:1 and 9:16. It's built on
[Remotion](https://www.remotion.dev) and includes reusable scenes,
components, scripts and an agent skill. It is meant to be consumed as a
**git submodule**.

```
framework/src/
├── spec.ts            trailer.json types, default durations, timeline maths
├── Trailer.tsx        renders a spec: scenes + transitions + music
├── Root.tsx           compositions: Trailer (used by scripts), Templates/*
├── theme.tsx          theme tokens, fonts, layout unit (works in every format)
├── motion.ts          springs, rise/pop, keyframes
├── components/        Background, Stage, KineticText, RiseText, Pill, Logo,
│                      Button, Counter, KeyCaps, FeatureCard, DeviceFrame,
│                      Media, ZoomPan, Callout, Cursor
├── scenes/            hook, problem, logo, announce, screen, montage, keys,
│                      features, stat, beforeAfter, quote, cta
└── lib.ts             public API for custom compositions
templates/
├── product/           30s product-launch recipe (trailer.json + public/)
├── feature/           20s feature-launch recipe
└── storyboard.md      the plan you fill in first
scripts/               new-trailer, check-spec, studio, render, capture, grid, trim
skills/launch-trailer/ SKILL.md + references/ (spec, components)
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

## Agent skill

`skills/launch-trailer/SKILL.md` covers the workflow (brief → storyboard →
assets → spec → stills → render), the two recipes and the rules of thumb. To
make it available to Claude Code in a consuming repo:

```bash
mkdir -p .claude/skills && ln -s ../../trailers/kit/skills/launch-trailer .claude/skills/launch-trailer
```

## Developing the kit

```bash
npm install
npm run studio     # browse Templates/ProductLaunch and Templates/FeatureLaunch
npm test           # validates both templates + typechecks
```

Improve the kit here, not in a trailer: new scene types, components and
themes help every future trailer. Then bump the submodule in consuming repos
(`git submodule update --remote trailers/kit`).

## Licence

MIT for this kit (see [LICENSE](LICENSE)). Remotion has its own
[licence](https://www.remotion.dev/license): it is free for individuals and
companies of up to 3 people, and larger companies need a company licence.
Music and screenshots you add are your responsibility.
