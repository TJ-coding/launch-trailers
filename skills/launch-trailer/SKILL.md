---
name: launch-trailer
description: Make a product launch film, feature launch video or campaign clip (short promo video, MP4/GIF, 16:9, 1:1 or 9:16) with the launch-trailers kit (Remotion). Records the real product doing a real job in one scripted session, then cuts it into flat-colour scenes with heavy headlines. Use when the user asks for a launch video, trailer, promo, teaser, release video, "what's new" video, feature announcement clip, or an animated demo of a product or feature for a landing page, social post, Product Hunt or release notes.
---

# Launch films

A film here is **one recorded session of the real product**, cut into a handful
of scenes. Each scene is a flat colour field, the product large on it, and one
heavy headline of two to five words with one phrase boxed. No stock photos, no
actors, no 3D. The model is the release clips posted by accounts such as
@HermesWatcher: claim, typed request, watch it work, result, handle.

The kit root is two levels above this file (`$KIT`; in a consuming repo usually
`trailers/kit`).

```bash
$KIT/scripts/new-trailer.sh product|feature <dir> ["Brand"] [url]   # scaffold: trailer.json, record.mjs, storyboard.md
node $KIT/scripts/record.mjs <dir> [--only clip]                    # play record.mjs in the real app -> public/*.mp4 + clips.json
node $KIT/scripts/check-spec.mjs <dir>                              # validate + timeline + [craft] warnings
$KIT/scripts/render.sh <dir> [landscape|square|vertical|all] [--gif] [--poster] [--draft] [--strict]
node $KIT/scripts/review.mjs <dir>                                  # contact sheets of the render: LOOK at them
$KIT/scripts/studio.sh <dir>                                        # live preview :3000
node $KIT/scripts/grid.mjs <frame.png> /tmp/g.png [20]              # read coordinates off a frame
node $KIT/scripts/beats.mjs <dir>/public/music.mp3                  # only if the film has music
```

## What went wrong before (don't repeat it)

The owner rejected two generations of trailers from this kit. Their words on
the second: *"Everything is so incoherent, a man suddenly turns into a woman, a
woman on a smartphone operating a desktop UI, no story, so chaotic and AI slop
in general."* Both generations passed validation. The causes:

- **Stock photos.** A different stranger in a different room in every scene,
  with a small product card floating beside them. Nothing connected one scene
  to the next, and the device in the photo didn't match the UI shown.
- **Fragments, not a job.** Three-second crops from unrelated recordings with
  unrelated data. The viewer never saw a task start and finish.
- **A feature tour.** Each scene announced another feature; no scene followed
  from the one before.
- **Unreadable UI, equal-length scenes, a crossfade on every cut.**

## The rules

1. **One session, one person, one job.** Decide who is using the product and
   what they get done in the next two minutes. Record that, start to finish, in
   one browser session, so the task typed in scene 2 is the task ticked in
   scene 4 and the one shown under its goal in scene 5. Continuity of data is
   the story. If a scene could be removed without breaking the chain, it's a
   tour stop: cut it.
2. **One promise, told in the product's own method.** Write the sentence the
   viewer should believe afterwards as `promise`. Scene 1 states it; the end
   card repeats it. If the product has a named method or steps (Life Console:
   Strategise → Distribute → Execute), that method is the film's structure:
   one scene per step, in order, each labelled with a `kicker` ("1 ·
   Strategise"), and the opener lists the steps. Ask the owner what the method
   is and which screen they are proudest of; give that screen the most room.
3. **The product is the picture.** Every scene except the end card shows the
   real UI, large, doing something: text typed, a slot filled, a timer started.
   No stock photos, no illustrations of people, no device mock-ups.
4. **The data on screen must agree with the words.** Read every large value
   in the shot against the headline. The owner rejected a dashboard reading
   "Free until 18:30" under the line "tells you what to do now". Set the
   clock, seed the data and tick off earlier tasks in `record.mjs` so that the
   state on screen is the state the headline describes: a task running, not a
   gap; nothing overdue beside a task marked done; no deadline shouting "due
   today" for something already finished.
5. **Frame a whole component.** The camera (`view`) shows one complete panel:
   never a window that cuts words in half at its edge. The thing the headline
   claims must be readable at phone size. Read `phone.png` to check.
6. **Few words, heavy, one boxed.** Two to five words, broken into short lines
   (about ten characters a line keeps the type big). Box the word that carries
   the claim: `It finds [the time].` The headline says what it means for the
   viewer; the picture shows it happening. Never caption the picture.
7. **Show the request.** When the person types or asks something, show it as a
   `prompt` bubble typed over the product, then cut to the product's answer.
8. **Colour is the edit.** Paper for the opening and the end; one or two brand
   colour fields in between; the product full-frame (`layout: "full"`) at least
   once. Hard cuts only. Alternate which side the words sit on. Vary scene
   lengths; the longest goes to the scene where the most happens.
9. **The logo opens and closes it, large.** Ask the owner for the logo file;
   don't assume the app icon is it. Open with the icon and name
   (`brandMark`, from `brand.logo`); close with the full logo artwork, large,
   on the `end` scene (`brand.lockup`). The owner chose that order: icon
   first, full logo as the pay-off. An icon alone does not count as using the
   logo.
10. **End on a hero shot.** `end` with `media`: the logo, the promise, one
   button and the URL, with the product rising large behind them. Use the
   product's best state for it (the same rule about data applies).
11. **Sound is the owner's call.** Ask once. Silent is acceptable (set
   `"silent": true`); then the words carry everything. With music, pick the
   track first and cut to it (`beats.mjs`).

`check-spec.mjs` prints `[craft]` warnings for what it can measure. Fix each or
be able to say in one sentence why it doesn't apply (an establishing shot of the
whole app may have small labels; the big type still has to read). Only the
review step can tell you the film is good.

## Workflow

1. **Brief.** Read the repo first (README, landing page, changelog, seed or
   demo data). Then ask the owner what you can't find: who it's for, the one
   promise, where it will be posted, sound or silent. They have said "you can
   ask me all the questions": a wrong guess costs a full cut.
2. **Storyboard.** Fill `<dir>/storyboard.md`: the viewer, the promise, then the
   session as a chain: *they do X → the product does Y → which lets them do Z*.
   Five scenes or fewer plus the end card. Use the product's own demo data if
   it has a coherent persona; otherwise write one and seed it.
3. **Record.** Run the app locally, write `<dir>/record.mjs`
   (`references/recording.md`), run `record.mjs`. Look at a strip of every
   clip before going on (`ffmpeg -i clip.mp4 -vf "fps=1,scale=640:-1,tile=5x3" -frames:v 1 strip.png`):
   stray dialogs, toasts and open drawers show up here.
4. **Spec.** Write `trailer.json` (`references/spec.md`). One `demo` scene per
   clip; take `startFrom`, step times and zoom times from the marks in
   `clips.json`. Read camera centres off a frame with `grid.mjs`; never guess
   them.
5. **Check.** `check-spec.mjs` until no errors.
6. **Draft and review. Not optional.** `render.sh <dir> --draft`, then
   `review.mjs <dir>`, then open `sheet.png` and `phone.png` and answer
   `references/review.md`. Expect two or three rounds: reframe, shorten lines,
   re-record a clip, cut a scene.
7. **Final.** `render.sh <dir> all --gif --poster --strict`. Review the
   vertical cut separately. Report the paths, what you cut and why, and what is
   still weak.

## The shape

Lengths are examples. A product film runs 20–35s; a feature clip 12–25s.

| # | scene | example | length |
|---|-------|---------|--------|
| 1 | `demo`, paper, `tilt`, `brandMark`, `steps` | Logo + "Bring systems into [your life]." + 1 Strategise 2 Distribute 3 Execute, beside the live app | 4s |
| 2 | `demo`, colour field, `layout: "top"`, `kicker` | "1 · Strategise" / "Start from [the goal]." over the goal flow lighting up | 6s |
| 3 | `demo`, second colour, `kicker`, `steps` | "2 · Distribute" / "Level [the week]." while an overloaded day is evened out and time-boxed | 6–7s |
| 4 | `demo`, `layout: "full"`, `kicker` | "3 · Execute" / "Do the one thing [now]." over the running task | 4–5s |
| 5 | `end` with `media` | hero shot: logo, the promise, Try it now, URL | 4–5s |

A product without a named method uses the same shape with a typed request in
the middle (`prompt`: "Just type it."), as in `life-console/trailers/launch-v2`.

**Feature clip (existing users).** Skip the opener's explanation: scene 1 is
"[Product] can now [do X]." beside the feature, then the request, the result,
the end card. Three scenes plus the end card is enough.

**How-to (60–80s, only on request).** Numbered steps: put `1/5 Open Settings`
style labels in the headline, one `demo` scene per step, a recap with `steps`.

Worked example: `life-console/trailers/launch-v3` (trailer.json, record.mjs,
seed.mjs, storyboard.md).

## Older scene types

`moment` (stock photo + floating widget), `widget`, `screen`, the 3D scenes,
`features`, `montage` and the rest still render, and are documented in
`references/spec.md` and `references/moments.md`. Don't use them unless the
owner asks for that look by name; never mix them with `demo` scenes.

## Extending the kit

- New look: `theme` (paper and ink colours, accent, font).
- Something `demo` can't do: add a prop to `framework/src/scenes/Demo.tsx`, its
  type in `spec.ts`, its checks in `scripts/check-spec.mjs`, and document it in
  `references/spec.md`. Extend the kit; don't fork it per film.
- A rule learned the hard way: a `[craft]` warning in `check-spec.mjs` if it
  can be measured, a question in `references/review.md` if it can only be seen.

Then run `npm test` in `$KIT`.
