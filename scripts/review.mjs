#!/usr/bin/env node
// Look at a rendered trailer the way a viewer does, before anyone else sees it.
//   node scripts/review.mjs <trailer-dir> [landscape|square|vertical]
// Reads <dir>/out/<slug>-<format>.mp4 (render it first, --draft is fine) and
// writes to <dir>/out/review/:
//   opening.png  the first 3 seconds, a frame every 0.5s (the hook test)
//   sheet.png    the whole film, a frame every 0.5s, 8 per row = 4s per row (the rhythm test)
//   phone.png    the held frame of every scene at phone width (the legibility test)
// Then it prints what to check. Open all three images and answer every
// question in skills/launch-trailer/references/review.md.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const [dirArg, fmtArg] = process.argv.slice(2);
if (!dirArg) {
  console.error('usage: review.mjs <trailer-dir> [landscape|square|vertical]');
  process.exit(1);
}
const dir = path.resolve(dirArg);
const here = path.dirname(fileURLToPath(import.meta.url));
const run = (cmd, a, o = {}) => execFileSync(cmd, a, {stdio: ['ignore', 'pipe', 'pipe'], ...o});
let tl;
try {
  tl = JSON.parse(run('node', [path.join(here, 'check-spec.mjs'), dir, '--json']).toString());
} catch (e) {
  console.error(`✗ check-spec fails; fix the spec first\n${e.stdout ?? e.message}`);
  process.exit(1);
}
const spec = JSON.parse(fs.readFileSync(path.join(dir, 'trailer.json'), 'utf8'));
const fmt = fmtArg ?? spec.format ?? 'landscape';
const mp4 = path.join(dir, 'out', `${path.basename(dir)}-${fmt}.mp4`);
if (!fs.existsSync(mp4)) {
  console.error(`✗ ${mp4} not found. Render it first: scripts/render.sh ${dirArg} ${fmt} --draft`);
  process.exit(1);
}
if (fs.statSync(mp4).mtimeMs < fs.statSync(path.join(dir, 'trailer.json')).mtimeMs) console.log('⚠ trailer.json is newer than the render: you are reviewing an old cut. Re-render.');
const out = path.join(dir, 'out', 'review');
fs.mkdirSync(out, {recursive: true});
const ff = (a) => run('ffmpeg', ['-v', 'error', '-y', ...a]);
const portrait = fmt === 'vertical';
const cols = portrait ? 12 : 8;
const cell = portrait ? 200 : 480;

// The first 3 seconds, large.
ff(['-i', mp4, '-t', '3.01', '-vf', `fps=2,scale=${portrait ? 320 : 960}:-1,tile=${portrait ? 6 : 3}x${portrait ? 1 : 2}:padding=6:color=0x202020`, '-frames:v', '1', path.join(out, 'opening.png')]);
// The whole film.
const rowsN = Math.ceil((tl.total * 2 + 1) / cols);
ff(['-i', mp4, '-vf', `fps=2,scale=${cell}:-1,tile=${cols}x${rowsN}:padding=4:color=0x202020`, '-frames:v', '1', path.join(out, 'sheet.png')]);
// Every scene's held frame, at the width of a phone in portrait (a landscape video is ~390px wide there).
const holds = tl.rows.map((r) => r.start + Math.min(r.dur * 0.7, r.dur - 0.5));
const tmp = fs.mkdtempSync(path.join(out, 'f-'));
holds.forEach((t, i) => ff(['-ss', t.toFixed(2), '-i', mp4, '-frames:v', '1', '-vf', 'scale=390:-1', path.join(tmp, `${String(i).padStart(2, '0')}.png`)]));
const pc = Math.min(4, holds.length);
ff(['-framerate', '1', '-i', path.join(tmp, '%02d.png'), '-vf', `tile=${pc}x${Math.ceil(holds.length / pc)}:padding=8:color=0x202020`, '-frames:v', '1', path.join(out, 'phone.png')]);
fs.rmSync(tmp, {recursive: true});

// Sound.
const hasAudio = run('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=codec_type', '-of', 'csv=p=0', mp4]).toString().trim() !== '';
let level = '';
if (hasAudio) {
  const r = execFileSync('sh', ['-c', `ffmpeg -i "${mp4}" -af volumedetect -vn -f null - 2>&1 | grep mean_volume || true`]).toString();
  level = (r.match(/mean_volume: (-?[\d.]+) dB/) ?? [])[1] ?? '';
}

const p = (s) => console.log(s);
p(`Review: ${spec.title ?? path.basename(dir)} · ${fmt} · ${tl.total.toFixed(1)}s`);
p(`  promise: ${tl.promise ?? '— none set —'}`);
p(`  sound:   ${hasAudio && level && Number(level) > -60 ? `music, mean ${level} dB` : spec.silent ? 'silent by choice ("silent": true)' : 'SILENT'}`);
p('  scenes (held frames in phone.png, left to right, top to bottom):');
tl.rows.forEach((r, i) => p(`    ${String(r.n).padStart(2)}  ${r.start.toFixed(1).padStart(5)}s  ${r.dur.toFixed(1)}s  ${r.tr.padEnd(5)} ${r.type.padEnd(10)} held frame @ ${holds[i].toFixed(1)}s  ${String(r.text).slice(0, 44)}`));
const craft = tl.warnings.filter((w) => w.startsWith('[craft]'));
p(craft.length ? `  ${craft.length} unresolved craft warning(s) from check-spec:` : '  no craft warnings from check-spec');
craft.forEach((w) => p(`    ⚠ ${w}`));
p('');
p('Open and LOOK at each image, then answer review.md honestly:');
p(`  ${path.join(out, 'opening.png')}   frames at 0.0 0.5 1.0 1.5 2.0 2.5 (3.0)`);
p(`  ${path.join(out, 'sheet.png')}     ${cols} frames per row = ${cols / 2}s per row`);
p(`  ${path.join(out, 'phone.png')}     one held frame per scene at 390px wide`);
p('Hook: by 1.0s is there something to read or see? By 3s do I know what this is about?');
p('Phone: can I read every headline AND the one thing in the UI the headline claims?');
p('Rhythm: does the sheet change shape across rows, or is every scene the same picture with different words?');
p('Payoff: is there one frame that shows the result, held, before the CTA?');
p('Fix what fails, re-render, and review again. Do not show the user a cut that fails a question.');
