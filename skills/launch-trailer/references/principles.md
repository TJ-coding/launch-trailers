# What makes a launch trailer work

Distilled from published guidance on launch videos, demo videos, trailer
editing and on-screen text (sources at the end), and from this kit's own
failed cuts. Vendor blogs supplied many of the numbers, so read them as
orders of magnitude, not measurements. Where they all agree, that's the rule.

## The house style, and why

After two rejected generations the owner pointed at the release clips from
@HermesWatcher as the model. Looked at frame by frame, they do the same few
things every time:

- **No people, no photos.** Flat paper or one saturated colour behind the real
  application. Nothing on screen that isn't the product or a few words.
- **One job, watched from request to result.** A claim ("Hermes has its own
  browser"), then the request typed in a white bubble ("Just ask."), then the
  product doing it, then one or two consequences, then the handle.
- **Heavy sans headlines of two to four words**, one phrase in a selection box
  with a small named pointer. The words state the meaning; they never describe
  the picture.
- **The product is large.** Either the whole frame or a window taking over half
  of it, framed on the part that matters.
- **Colour changes mark the scene changes**: paper, dark app, magenta, blue,
  paper. Hard cuts. No dissolves.
- **Lists build in step with the action**: numbered requests on the left as
  each one is made on the right, then ticked off.
- **Length follows the job**: 30s for one capability, 45s for three, 75s for a
  five-step how-to with subtitles.

This is why the kit's default is the `demo` scene and a recorded session. The
second generation of trailers failed on exactly the opposite choices: a
different stock stranger per scene, a small card of UI, unrelated fragments.
The owner's verdict: "incoherent… no story… AI slop".

## How the kit's early trailers failed

Worth knowing, because each failure passed validation and rendered cleanly:

- **Silent.** No audio stream at all.
- **Metronome.** Four scenes of exactly 3.8s, joined by 0.5s crossfades. On a
  contact sheet every scene had the same width and half the frames were
  double exposures.
- **Unreadable product.** Whole dashboards cropped at 0.66–0.82 of the screen
  width and shown on a 900px card. Ordinary UI text came out 8–14px tall at
  1080p. The viewer saw "some dark UI", never the thing the headline claimed.
- **A tour.** Four features at equal weight, no result, then a CTA.
- **A slow start.** Frame 0 nearly black; in the longest cut the product
  arrived after a logo scene.
- **Five photos, five colour moods.**
- **Nobody looked.** The cut was rendered and handed over without a critical
  viewing. Every problem above is visible in ten seconds on a contact sheet.

## 1. One promise

A launch video supports one main promise, two if they are tightly linked.
Showing every feature turns a demo into a catalogue and tires the viewer; a
feature announcement that covers three features should be three clips. The
cut test: if removing a scene doesn't cost the viewer the change, remove it.

Lead with the outcome, not the mechanism. "Know what to do right now" is a
promise; "time-boxing, quick add and a goal graph" is an inventory.

## 2. The opening

- Viewers decide within about 2–3 seconds whether to keep watching. The
  opening is the highest-value part of the video.
- Open on the pain or on the result. Not a logo sting, not a title card, not
  a slow zoom, not "Hi, I'm the founder".
- The viewer should understand the problem, the change and the payoff within
  about ten seconds, and see the product within five. Common failure:
  thirty seconds of context before the product appears.
- Hooks that work: a named, specific pain; a concrete number; a bold claim in
  under twelve words; a visual pattern break.
- Order: show the pain, show the win, and only then show the interface.
  Explaining UI before the viewer feels the problem means nothing to them.

## 3. Structure

The shape nearly every source converges on:

**hook → problem → solution → proof → one CTA**

For a 15–20s trailer that is: pain (3s) → the product answering it (3–4s) →
one or two quick proofs (2–3s each) → the result, held (4s) → CTA (3.5s).
Problem time stays under a quarter of the whole. Trailer editors think of it
as three acts with a rise: set-up, escalation, release. The middle should be
the fastest part; the payoff the longest single hold.

Let the result sit before the ask. Rushing from the last feature into "try it
now" interrupts the payoff. One CTA, not three.

A strong ending answers the opening image: the same kind of place and hour,
changed. Before and after is the oldest advertising structure because the
viewer does the comparison themselves.

## 4. Showing software

- The picture must show a change, and the viewer must be able to read it.
  Screen-recording tools that make demos look professional do mainly one
  thing: zoom to where the action is (about 1.5–2.2×), follow the cursor,
  and hide everything else.
- Crop to one component. Then punch in on the spot where the change happens
  (`focus`). A rule of thumb for this kit: ordinary UI text should be at
  least ~20px tall at 1080p, about 2% of the frame height. check-spec
  estimates this; `phone.png` shows the truth.
- Dense views (week grids, tables, graphs) don't survive video. Either crop
  to three or four items or leave them out.
- Use believable demo data. Real-sounding task names sell the scene; "Test
  task 1" kills it.
- Speed up typing and waits (1.5–2×) and never show a spinner.
- Motion needs a reason: it directs attention to the change. Ease in and out;
  avoid motion for decoration.

## 5. Rhythm and editing

- Pacing alternates slow and fast. A run of equal-length scenes has no
  rhythm, however good each one is.
- Cut on the beat. Editors choose the music first and cut the picture to it,
  never the reverse. In this kit: `beats.mjs` gives the beat length; make
  each scene a whole number of beats; hard cuts then land on the beat.
- Hard cuts carry energy. Dissolves say "time passes" or "this changes
  everything"; use one, at the turn from problem to solution (and optionally
  into the CTA). A dissolve on every change smears the rhythm.
- A brief hold before a reveal makes it land harder than the reveal itself.
- Watch for the edit repeating itself: same layout, same move, same length.
  Vary the side the card sits on, the camera direction, the scene length.

## 6. Words

- Design for sound off: most social video plays muted. The story must read
  from picture and text alone.
- Reading speed for on-screen text is about 160–180 words a minute: allow
  roughly 0.3s a word, plus the entrance and a beat to land. Three to five
  words need about two seconds; eight need about three.
- Two to five words per headline for short-form. One line where possible.
- Text height between 1/20 and 1/10 of the frame height. The kit's headline
  sizes are inside that; don't shrink them to fit more words, cut words.
- Captions should add meaning, not describe what is visibly happening. "Type
  it. It's planned." beats "Quick add with natural-language parsing".
- Keep text inside the middle of the frame on vertical cuts: platform chrome
  covers roughly the bottom fifth and the right edge.

## 7. Sound

- Music sets the emotional register before a word is read. Choose a track
  whose mood matches the product (calm and modern for a planner; not epic).
- Prefer a track with one clear lift. Put the turn on it.
- Simple arrangements leave room; busy tracks fight the text.
- Only use music you have the right to use. Free-to-use libraries exist
  (YouTube Audio Library, Pixabay Music, Uppbeat's free tier); check each
  track's licence and note it in the trailer's `CREDITS.md`.
- An agent can't hear. Pick by the library's own description and tempo, use
  `beats.mjs` for the grid, and tell the user the track is unheard so they
  can swap it.

## 8. One look

- Keep colour, type and transitions consistent across scenes and formats.
- Photos from different shoots need one grade (`theme.grade`) or they read as
  a stock-photo collage.
- Light carries meaning here: problems are dark and cold, the solution brings
  light. Never show a problem in a bright room.
- The viewer must recognise themselves: their desk, their hour, their mess. A
  generic "person with laptop" is not context.
- Faces and eyelines point at the product or the CTA, never out of frame. Nothing
  covers a face.

## 9. Length and formats

- Short-form social and hero loops: 15–30s. Feature announcements: 12–20s.
  The long "explainer" version (up to 90s) is a different film; make it only
  when asked.
- Export 16:9, 1:1 and 9:16 from the same spec and review the vertical cut
  separately: text wraps and cards crop differently.
- The poster frame (thumbnail) should be the payoff or the CTA, never black.

## Sources

- [The 8-second rule: why most SaaS demos lose viewers instantly](https://dev.to/cvchelles/the-8-second-rule-why-most-saas-demos-lose-viewers-instantly-2elg)
- [7 reasons your demo video feels longer than it is](https://dev.to/mickeyhu/7-reasons-your-demo-video-feels-longer-than-it-is-2ppm)
- [How to create a launch video that drives real conversions](https://www.launchvideo.com/blog/how-to-create-a-launch-video-that-drives-real-conversions)
- [How to make a viral launch video (a16z speedrun)](https://speedrun.substack.com/p/how-to-make-a-viral-launch-video)
- [How to make a launch video people actually want to watch](https://vizard.ai/blog/how-to-make-a-launch-video-people-actually-want-to-watch)
- [Your product videos are dying in the first 3 seconds](https://funnl.ai/why-product-videos-arent-converting-how-to-fix/)
- [Tips for editing better trailers](https://motionarray.com/learn/post-production/tips-for-editing-better-trailers)
- [3 ingredients every great trailer needs](https://www.premiumbeat.com/blog/3-ingredients-every-great-trailer-needs)
- [Trailer tips (Neil Oseman)](https://neiloseman.com/?p=2173)
- [The 10 biggest mistakes you're making in your demo videos](https://www.spielcreative.com/blog/?p=18319)
- [How long should on-screen text stay](https://www.overseeros.com/blog/how-long-should-on-screen-text-stay-youtube)
- [Subtitle styling and caption timing guide](https://syllaby.io/blog/subtitle-styling-burn-in-caption-timing-guide/)
- [How to position captions on video: safe zones](https://joyspace.ai/text-on-screen-psychology-safe-zone)
- [Creating demos with zoom and cursor (OpenScreen guide)](https://www.mintlify.com/siddharthvaddem/openscreen/guides/creating-demos)
- [How to make tasteful screen-capture videos](https://www.clueso.io/blog/how-to-make-tasteful-screen-capture-videos)
- [Sound design for product films](https://xo3d.co.uk/guides/sound-design-product-films/)
- [Making motion meaningful (Google Design)](https://design.google/library/making-motion-meaningful)
