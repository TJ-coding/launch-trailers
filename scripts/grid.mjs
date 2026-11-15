#!/usr/bin/env node
// Overlay a labelled 0..1 coordinate grid on a screenshot, so you can read off
// the fractions for zoom / callouts / cursor in trailer.json.
//   node scripts/grid.mjs <image> [out.png] [divisions=10]
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [img, outArg, divArg] = process.argv.slice(2);
if (!img) {
  console.error('usage: grid.mjs <image> [out.png] [divisions=10]');
  process.exit(1);
}
const abs = path.resolve(img);
const out = path.resolve(outArg ?? abs.replace(/(\.\w+)$/, '.grid.png'));
const n = Number(divArg ?? 10);
const [w, h] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', abs]).toString().trim().split(',').map(Number);
const W = 1600;
const H = Math.round((W * h) / w);
let lines = '';
for (let i = 1; i < n; i++) {
  const p = (i / n) * 100;
  const v = (i / n).toFixed(2).replace(/^0/, '');
  lines += `<div class="v" style="left:${p}%"><b>${v}</b></div><div class="h" style="top:${p}%"><b>${v}</b></div>`;
}
const html = `<!doctype html><html><body style="margin:0;width:${W}px;height:${H}px;position:relative;overflow:hidden;font:600 13px system-ui">
<img src="file://${abs}" style="width:100%;height:100%;display:block">
<style>.v,.h{position:absolute;background:rgba(255,40,90,.75)}.v{top:0;bottom:0;width:1px}.h{left:0;right:0;height:1px}
b{position:absolute;background:#ff285a;color:#fff;padding:1px 4px;border-radius:3px}.v b{top:4px;left:3px}.h b{left:4px;top:2px}</style>${lines}</body></html>`;
const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'grid-')), 'grid.html');
fs.writeFileSync(tmp, html);
const chrome = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'google-chrome', 'chromium'].find((c) => {
  try {
    execFileSync(c, ['--version'], {stdio: 'ignore'});
    return true;
  } catch {
    return false;
  }
});
if (!chrome) throw new Error('Chrome not found');
execFileSync(chrome, ['--headless=new', '--hide-scrollbars', '--allow-file-access-from-files', `--window-size=${W},${H}`, `--screenshot=${out}`, `file://${tmp}`], {stdio: 'ignore'});
console.log(`✓ ${out}  (x → right, y → down, fractions of the image; source ${w}×${h}, aspect ${(w / h).toFixed(4)})`);
