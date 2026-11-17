#!/usr/bin/env node
// Record the real product doing a real job, as clean clips for `demo` scenes.
//
//   node scripts/record.mjs <trailer-dir>            # runs <trailer-dir>/record.mjs
//   node scripts/record.mjs <trailer-dir> --only add # just the clip(s) named
//
// <trailer-dir>/record.mjs drives ONE browser session from start to finish, so
// the data on screen carries over from clip to clip (the task typed in clip 2
// is still there in clip 4). That continuity is what makes the film a story.
//
//   export const config = {
//     url: 'http://localhost:5173/',
//     viewport: [1280, 800],       // CSS px. Small viewport = big, readable UI.
//     scale: 2,                    // device pixel ratio of the capture
//     time: '2026-11-16T17:12:00', // optional: freeze "now" for the app (it keeps ticking)
//     colorScheme: 'dark',
//   };
//   export default async ({page, clip, mark, move, click, type, press, wait}) => {
//     await page.getByText('Skip tour').click();          // set-up, not recorded
//     await clip('add', async () => {                     // -> public/add.mp4
//       await click('input[placeholder^="Add to today"]');
//       mark('typing');                                   // -> clips.json: add.marks.typing = seconds
//       await type('Stretch after the run 20m p2');
//       await press('Enter');
//       mark('added');
//       await wait(1.2);
//     });
//   };
//
// Clips are capped at 1920px wide (Remotion's video decoder fails on larger ones).
// Each clip is captured losslessly frame by frame (no screen-recorder blur) and
// written to <trailer-dir>/public/<name>.mp4. Marks and clip sizes go to
// <trailer-dir>/clips.json: use the mark times for `startFrom`, `zoom[].at`
// and `prompt.at` in trailer.json.
import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('usage: node scripts/record.mjs <trailer-dir> [--only name[,name]]');
  process.exit(1);
}
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
const root = resolve(dir);
const scriptPath = join(root, 'record.mjs');
if (!existsSync(scriptPath)) {
  console.error(`error: ${scriptPath} not found. Write the recording script first (see the header of scripts/record.mjs).`);
  process.exit(1);
}

let chromium;
try {
  ({chromium} = await import('playwright-core'));
} catch {
  console.error('error: playwright-core is not installed. Run `npm install` in the kit.');
  process.exit(1);
}
const launch = async () => {
  const scale = (mod.config?.scale ?? 2);
  const [w0, h0] = mod.config?.viewport ?? [1280, 800];
  const tries = [
    process.env.CHROME_PATH && {executablePath: process.env.CHROME_PATH},
    {channel: 'chrome'},
    {channel: 'chromium'},
    {},
  ].filter(Boolean);
  let last;
  for (const o of tries) {
    try {
      return await chromium.launch({...o, args: ['--headless=new', '--hide-scrollbars', `--force-device-scale-factor=${scale}`, `--window-size=${w0},${h0 + 87}`]});
    } catch (e) {
      last = e;
    }
  }
  console.error('error: no Chrome found. Install Google Chrome or set CHROME_PATH.\n' + String(last).split('\n')[0]);
  process.exit(1);
};

const mod = await import(pathToFileURL(scriptPath).href);
const cfg = {viewport: [1280, 800], scale: 2, colorScheme: 'dark', fps: 30, cursor: true, ...(mod.config ?? {})};
if (!cfg.url) {
  console.error('error: record.mjs must export config.url');
  process.exit(1);
}
const [vw, vh] = cfg.viewport;

// The screencast only captures at device pixels when the whole browser runs at
// that scale, so the scale is a launch flag and the window is sized to match.
const browser = await launch();
const ctx = await browser.newContext({viewport: null, colorScheme: cfg.colorScheme});
const page = await ctx.newPage();
{
  const s = await ctx.newCDPSession(page);
  const {windowId, bounds} = await s.send('Browser.getWindowForTarget');
  const inner = await page.evaluate(() => [innerWidth, innerHeight]);
  await s.send('Browser.setWindowBounds', {windowId, bounds: {width: bounds.width + vw - inner[0], height: bounds.height + vh - inner[1]}});
  await s.detach();
  const got = await page.evaluate(() => [innerWidth, innerHeight]);
  if (got[0] !== vw || got[1] !== vh) console.warn(`  ! viewport is ${got.join('×')}, wanted ${vw}×${vh}`);
}
if (cfg.time) await page.clock.install({time: new Date(cfg.time)});

// A drawn pointer: headless Chrome has none. It follows the real mouse events.
const CURSOR = `(() => {
  if (window.__ltCursor) return;
  const c = document.createElement('div');
  c.id = '__lt_cursor';
  c.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M3 2l16 9.5-7 1.5-3.5 7z" fill="#fff" stroke="#111" stroke-width="1.3" stroke-linejoin="round"/></svg>';
  Object.assign(c.style, {position: 'fixed', left: '-100px', top: '-100px', zIndex: 2147483647, pointerEvents: 'none', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.5))', transition: 'transform .08s'});
  const add = () => document.documentElement.appendChild(c);
  document.documentElement ? add() : addEventListener('DOMContentLoaded', add);
  addEventListener('mousemove', (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }, true);
  addEventListener('mousedown', () => { c.style.transform = 'scale(.82)'; }, true);
  addEventListener('mouseup', () => { c.style.transform = 'scale(1)'; }, true);
  window.__ltCursor = c;
})()`;
if (cfg.cursor) await page.addInitScript(CURSOR);

await page.goto(cfg.url);
await page.waitForLoadState('networkidle').catch(() => {});

const cdp = await ctx.newCDPSession(page);
const sleep = (s) => new Promise((r) => setTimeout(r, s * 1000));
let pos = {x: vw / 2, y: vh / 2};
let rec = null; // {name, frames: [{file, t}], t0, marks, tmp}
const clips = {};

cdp.on('Page.screencastFrame', async (f) => {
  cdp.send('Page.screencastFrameAck', {sessionId: f.sessionId}).catch(() => {});
  if (!rec) return;
  const file = join(rec.tmp, `f${String(rec.frames.length).padStart(6, '0')}.jpg`);
  writeFileSync(file, Buffer.from(f.data, 'base64'));
  rec.frames.push({file, t: f.metadata.timestamp});
});

const now = () => Date.now() / 1000;
const target = async (to) => {
  if (typeof to === 'string') to = page.locator(to).first();
  if (to && typeof to.boundingBox === 'function') {
    await to.scrollIntoViewIfNeeded().catch(() => {});
    const b = await to.boundingBox();
    if (!b) throw new Error('record: target not visible');
    return {x: b.x + b.width / 2, y: b.y + b.height / 2};
  }
  return to;
};
/** Glide the pointer to a selector, locator or {x, y} with an eased, human move. */
const move = async (to, seconds = 0.6) => {
  const p = await target(to);
  const n = Math.max(2, Math.round(seconds * 60));
  const from = {...pos};
  for (let i = 1; i <= n; i++) {
    const k = i / n;
    const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    await page.mouse.move(from.x + (p.x - from.x) * e, from.y + (p.y - from.y) * e);
    await sleep(seconds / n);
  }
  pos = p;
};
const click = async (to, seconds = 0.6) => {
  await move(to, seconds);
  await sleep(0.12);
  await page.mouse.down();
  await sleep(0.07);
  await page.mouse.up();
};
/** Type into the focused field at a steady, readable speed (characters per second). */
const type = async (text, cps = 22) => {
  for (const ch of text) {
    await page.keyboard.type(ch);
    await sleep(1 / cps);
  }
};
const press = (key) => page.keyboard.press(key);
const mark = (label) => {
  if (rec) rec.marks[label] = +(now() - rec.t0).toFixed(2);
};

const encode = (r) => {
  if (r.frames.length < 2) throw new Error(`record: clip "${r.name}" captured ${r.frames.length} frame(s); nothing changed on screen`);
  const list = [];
  const end = r.tEnd;
  r.frames.forEach((f, i) => {
    const next = i + 1 < r.frames.length ? r.frames[i + 1].t : end;
    list.push(`file '${f.file}'`, `duration ${Math.max(0.001, next - f.t).toFixed(4)}`);
  });
  list.push(`file '${r.frames[r.frames.length - 1].file}'`);
  const listFile = join(r.tmp, 'list.txt');
  writeFileSync(listFile, list.join('\n'));
  mkdirSync(join(root, 'public'), {recursive: true});
  const out = join(root, 'public', `${r.name}.mp4`);
  const res = spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-vf', `fps=${cfg.fps},scale='trunc(min(iw,1920)/2)*2':-2:flags=lanczos:out_range=tv,format=yuv420p`, '-c:v', 'libx264', '-crf', '14', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-g', '15', '-movflags', '+faststart', out], {encoding: 'utf8'});
  if (res.status !== 0) throw new Error('ffmpeg failed: ' + res.stderr);
  const probe = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', out], {encoding: 'utf8'});
  const j = JSON.parse(probe.stdout);
  const info = {file: `${r.name}.mp4`, seconds: +(+j.format.duration).toFixed(2), width: j.streams[0].width, height: j.streams[0].height, mediaAspect: +(j.streams[0].width / j.streams[0].height).toFixed(4), uiWidth: vw, marks: r.marks};
  rmSync(r.tmp, {recursive: true, force: true});
  return info;
};

/** Record everything `fn` does as public/<name>.mp4. Code outside clip() is set-up and is not recorded. */
const clip = async (name, fn) => {
  if (only && !only.includes(name)) {
    await fn(); // still run it, so later clips see the same state
    return;
  }
  const tmp = mkdtempSync(join(tmpdir(), 'lt-rec-'));
  await page.mouse.move(pos.x, pos.y);
  await cdp.send('Page.startScreencast', {format: 'jpeg', quality: 96, everyNthFrame: 1});
  await sleep(0.25);
  rec = {name, frames: [], marks: {}, tmp, t0: now()};
  // force a first frame
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const wall0 = now();
  await fn();
  await sleep(0.2);
  const r = rec;
  rec = null;
  await cdp.send('Page.stopScreencast');
  // screencast timestamps are on Chrome's clock; map marks (wall clock) onto it via the first frame
  const first = r.frames[0]?.t ?? 0;
  r.tEnd = first + (now() - wall0);
  clips[name] = encode(r);
  console.log(`  ✓ ${name}.mp4  ${clips[name].seconds}s  ${clips[name].width}×${clips[name].height}  marks: ${JSON.stringify(clips[name].marks)}`);
};

console.log(`› Recording ${cfg.url} at ${vw}×${vh} @${cfg.scale}x`);
try {
  await mod.default({page, context: ctx, clip, mark, move, click, type, press, wait: sleep});
} finally {
  await browser.close();
}
const outJson = join(root, 'clips.json');
let prev = {};
try {
  prev = JSON.parse((await import('node:fs')).readFileSync(outJson, 'utf8'));
} catch {}
writeFileSync(outJson, JSON.stringify({...prev, ...clips}, null, 2) + '\n');
console.log(`✓ ${Object.keys(clips).length} clip(s) in ${join(root, 'public')}; times in clips.json`);
