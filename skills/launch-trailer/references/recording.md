# Recording the session

`scripts/record.mjs <dir>` runs `<dir>/record.mjs` in headless Chrome against
the real app and writes one clean clip per scene to `<dir>/public/`, plus
`<dir>/clips.json` with each clip's length, size and the times you marked.

## Before recording

- **Run the real app locally** with demo data (for a Vite app: `npx vite --port 5199`).
  Never record production data or a signed-in personal account.
- **Small viewport, big UI.** 1280×800 at scale 2 is the default. A larger
  viewport makes every label smaller in the film. Clips are capped at 1920px
  wide.
- **Freeze the date and time** with `config.time` so the dates on screen suit
  the story (a weekday evening, not 05:40) and re-recording gives the same
  film. The clock still ticks, so countdowns move.
- **Make the data agree with the script.** Seed what the story needs before the
  first clip (write to the app's local storage and reload, as
  `life-console/trailers/launch-v3/seed.mjs` does), and move the clock between
  clips with `page.clock.fastForward(ms)` when the story jumps from morning to
  evening. Tick off or remove anything that would look overdue or contradict a
  headline.
- **Clear the stage**: dismiss first-run tours, wait for toasts to leave, close
  drawers, before the first `clip()`.

## The script

```js
export const config = {url: 'http://localhost:5199/', viewport: [1280, 800], scale: 2, time: '2026-11-16T17:01:30', colorScheme: 'dark'};

export default async ({page, clip, mark, move, click, type, press, wait}) => {
  await page.getByText('Skip tour').click();   // set-up: not recorded
  await wait(6);

  await clip('add', async () => {               // -> public/add.mp4
    await click('input[placeholder^="Add to today"]', 0.9);
    mark('typing');                             // -> clips.json add.marks.typing (seconds into the clip)
    await type('Stretch after the run 20m @BASE p2', 20);
    await press('Enter');
    mark('added');
    await wait(2.2);                            // hold on the result
  });

  await page.goto(config.url + '#/briefing');   // between clips: not recorded
  await clip('brief', async () => { /* … */ });
};
```

- `clip(name, fn)`: everything inside is recorded. Everything outside is
  set-up or travel between screens, and state carries over.
- `move(target, seconds)`, `click(target, seconds)`: glide a drawn pointer to a
  selector, a Playwright locator or `{x, y}`. `type(text, cps)` types at a
  readable speed. `press(key)`, `wait(seconds)`.
- `mark(label)`: note the moment something happens. Use these numbers in
  `trailer.json` for `startFrom`, `steps[].at`, `view[].at`. A scene with
  `playbackRate` r and `startFrom` s shows mark m at `(m - s) / r`.
- `page` is the Playwright page for anything else.
- `--only name` re-records one clip (the others still run, unrecorded, so the
  state is the same).

## What makes a clip usable

- One clip, one action, with a result the viewer can see: a row appears, a slot
  fills, a number changes. Hold 1.5–2.5s on the result.
- Start each clip half a second before the action, not three.
- Believable data in every field the camera will show. The data typed in one
  clip should show up again in a later one.
- Slow parts are sped up in the edit (`playbackRate` 1.5–2), not by rushing the
  script.
- Look at a strip of each clip before writing the spec. If a dialog, a drawer
  or a toast got in, fix the script and record again.
