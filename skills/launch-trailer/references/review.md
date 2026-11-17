# Reviewing a cut

Run after every draft render:

```bash
$KIT/scripts/render.sh <dir> --draft && node $KIT/scripts/review.mjs <dir>
```

It writes three images to `<dir>/out/review/`. Open each one and look at it.
You are checking the film, not the JSON: the spec can be valid and the
picture still wrong. Answer every question with yes or no. One "no" means
another round.

## First: is it one story?

Look at `phone.png` left to right and say the story aloud as a chain: "they do
X, so the product does Y, so they can do Z".

A. Does each scene follow from the one before, or could they be shuffled
   without anyone noticing? Shuffle-able scenes are a feature tour: go back to
   the storyboard.
B. Is it the same session throughout: same data, same date and time, same
   theme? Does something the person made in an early scene show up again
   later?
C. Is every picture the real product? Any stock photo, stranger, mock-up or
   decoration that isn't the product fails this question.
D. Does any product window cut a word in half at its edge, or show a stray
   dialog, drawer or toast? Reframe the camera or re-record.
E. Read every large number and label in each product shot against its
   headline. Does anything contradict it ("Free until 18:30" under "what to
   do now"; an overdue row; a "due today" beside a finished task)? Fix the
   data or the clock in `record.mjs`, not the words.
F. If the product has a named method, does the film follow its steps in order,
   labelled? Does the logo open and close it, and is the last shot a hero
   shot of the product?
G. Would the owner call any frame "AI slop": generic, busy, or unrelated to
   the frames around it? Name it and fix it.

## opening.png: the first 3 seconds (a frame every 0.5s)

1. At 0.5s, is there already something to read or recognise? (A blank or
   near-black opening frame loses the viewer and makes a dead thumbnail.)
2. By 3s, would a stranger know what this is about and who it's for?
3. Is the product itself on screen by 5s (first rows of `sheet.png`)?

## phone.png: every scene's held frame at 390px wide

4. Can you read every headline without effort?
5. In each product scene, can you read the specific thing the headline
   claims: the task name, the typed command, the number? Tiny grey rows that
   look like UI but can't be read count as no. Fix: crop to one component,
   add `focus`, or cut the scene.
6. Is each frame one idea? Cover the headline: does the picture still say
   it? Cover the picture: is the headline more than a label?
7. Does anything sit over a face, or does a headline run over a busy part of
   the photo?
8. Do the frames look like one film: one type style, two or three colour
   fields, the same product theme throughout?
9. Is every headline two to five words in big type, with one phrase boxed?

## sheet.png: the whole film (a frame every 0.5s, rows of 4s)

10. Do scene lengths vary, with the payoff held longest? Count frames per
    scene. If every scene is the same width on the sheet, it's a slide show.
11. Inside each scene, does something change from frame to frame (text typed,
    a timer, a camera push), or is it a still photo with a caption?
12. Are the scene changes clean? Half-dissolved double images on several
    frames mean too many crossfades.
13. Is there a payoff frame before the CTA: the result, not one more feature?
14. Does the end card repeat the promise the first scene made?
15. Is the CTA readable for at least 2s, with one button and the URL?

## Sound (printed by review.mjs)

16. If the owner wants sound: is there music, and do the cuts sit on its beat
    (no off-beat warnings from check-spec)? If the owner chose silent, the
    spec says `"silent": true`. A plain SILENT in the review means nobody
    decided: ask.

## The promise

17. Read the `promise` line, then the sheet. Does every scene prove that
    sentence? Name the weakest scene. If the trailer is better without it,
    cut it. A shorter trailer with three strong scenes beats a longer one
    with a weak fourth.
18. Would the target viewer see their own situation in the first scene and
    want what's in the last one?

## Then

Fix, re-render, review again. Two or three rounds is normal. In your report
to the user, say what you cut and why, and name anything still weak. Don't
describe a cut as good unless it passed every question here.
