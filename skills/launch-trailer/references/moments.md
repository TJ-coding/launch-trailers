# Context photos and moments (opt-in, not the default)

The owner rejected this look for launch films: a different stock person in each
scene read as incoherent. Use it only when asked for by name, and then only
with photos of one person from one shoot. The default is the demo film in
SKILL.md.

A `moment` is the target viewer in their real setting, with the product
beside them. The photo is there so the viewer recognises their own life; the
widget is there so they see the product answer it.

## Who is in the photo?

Write the target viewer and their pain in one line in `storyboard.md`, from
the product's own docs or its owner (for example: "hyper-optimizers
overloaded with deadlines who feel their life isn't making consistent
progress"). Every photo shows **that person in that situation**: their desk,
their campus, their late night. Reject a photo that could illustrate any
SaaS.

Choosing a set:

- One light and colour family across the lit scenes, or set `theme.grade`
  (`film`, `warm`, `cool`) to pull mixed sources together. Check `phone.png`:
  the odd one out is obvious there.
- The problem photo is dark (check-spec rejects bright ones). The payoff
  photo works best as its answer: the same kind of place and hour, calm.
- Empty space on one side for the headline and the card. Nothing may cover a
  face.
- The subject looks towards the card or the centre, never out of frame.

## Placing the widget

- Crop the recording to **one component**, then size the card so its text is
  readable: check-spec estimates the text height, `phone.png` proves it.
  Roughly: crop width ≤ 0.45 of a 1440px-wide recording for a 1000–1200px
  card.
- Add `focus` when the claim lives in one corner of the component.
- `pos` is the card's top-left as frame fractions. Put it under the headline
  on the empty side. Alternate sides between scenes so the edit doesn't
  repeat itself.
- Bring the card in early (`at` 0.2–0.3s). The scene is about the card.

## The UI on a screen inside the photo (`screens`)

Optional, and only when the photo has a clear, unobstructed screen at a
moderate angle. A warped screenshot is rarely readable, so it never replaces
the widget; it only makes the photo belong to the product.

1. `node $KIT/scripts/grid.mjs photo.jpg /tmp/g.png 20`, look at it, and read
   the screen's four corners as fractions: top-left, top-right, bottom-right,
   bottom-left. Ignore rounded corners; use where the edges would meet.
2. Put them in `screens[].corners`. Render a still mid-scene and adjust in
   steps of 0.005 until the screenshot sits exactly in the bezel.

## Headline and camera

- `tone`: `dark` (ink text) on bright photos, `light` on dark ones. Set
  `headlineWidth` so the line doesn't break awkwardly or run over the
  subject.
- Camera: a slow push towards the subject or the card (scale 1.05–1.15).
  Change direction between scenes.

## Photo library: reuse before you search

`$KIT/scripts/library.mjs` keeps every photo used: source, credit, tags,
personas, scene, tone, headline side and measured screen corners. Metadata is
committed in `library/photos.json`; files are cached in `library/cache/`
(gitignored, re-downloaded on demand).

```bash
node $KIT/scripts/library.mjs list [--persona hyper-optimizer] [--tag overwhelmed]
node $KIT/scripts/library.mjs sheet --persona founder /tmp/s.png   # look before choosing
node $KIT/scripts/library.mjs use pexels-12470765 pexels-5717778 <trailer-dir>   # copies + CREDITS + moment JSON
node $KIT/scripts/library.mjs search "student desk at night"       # needs UNSPLASH_ACCESS_KEY or PEXELS_API_KEY
node $KIT/scripts/library.mjs add pexels:<id> --scene "…" --tags … --personas … --time … --tone … --headline …
node $KIT/scripts/library.mjs corners <id> monitor "x,y x,y x,y x,y"
```

Sources, in order: the user's own photos, the library, free stock (Pexels
photos are free for commercial use; a direct image URL looks like
`https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?w=2400`). Add
every new photo with honest tags, and list each source in the trailer's
`CREDITS.md`. API keys live in `~/.config/launch-trailers/keys.env`, never in
a repo.
