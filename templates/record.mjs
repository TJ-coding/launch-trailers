// The session this film is cut from: one person, one job, start to finish.
// Run the app locally, then:  node $KIT/scripts/record.mjs <this folder>
// See skills/launch-trailer/references/recording.md.
export const config = {
  url: 'http://localhost:5173/',
  viewport: [1280, 800], // small viewport = big, readable UI
  scale: 2,
  time: '2026-01-12T17:00:00', // a believable weekday moment; the clock keeps ticking
  colorScheme: 'dark',
};

export default async ({page, clip, mark, move, click, type, press, wait}) => {
  // Set-up (not recorded): dismiss tours, wait for toasts to leave.
  await wait(1);

  await clip('home', async () => {
    await move({x: 640, y: 300}, 1.2);
    await wait(3);
  });

  await clip('ask', async () => {
    // await click('input[placeholder^="Add"]', 0.9);
    mark('typing');
    // await type('What the person types', 20);
    // await press('Enter');
    mark('answered');
    await wait(2.2);
  });

  // await page.goto(config.url + '#/next-screen');   // travel between screens is not recorded
  await clip('work', async () => {
    await wait(4);
  });

  await clip('result', async () => {
    await wait(4);
  });
};
