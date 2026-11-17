#!/usr/bin/env node
// Find the beat of a music track, so the edit can be cut to it.
//   node scripts/beats.mjs <track.mp3> [--from 0] [--len 40] [--bpm 60-180]
// Prints the tempo, the time of the first beat, a beat/bar table and where the
// track gets louder (the "drop": put the reveal there). Copy bpm and offset
// into trailer.json's music block; check-spec then tells you which cuts are
// off the beat and by how much.
import {execFileSync} from 'node:child_process';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--') && !/^[\d.-]+$/.test(a));
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
if (!file) {
  console.error('usage: beats.mjs <track> [--from s] [--len s] [--bpm lo-hi]');
  process.exit(1);
}
const from = Number(opt('--from', 0));
const len = Number(opt('--len', 40));
const [lo, hi] = String(opt('--bpm', '70-180')).split('-').map(Number);
const SR = 11025;
const HOP = 128; // ≈ 11.6ms
const raw = execFileSync('ffmpeg', ['-v', 'error', '-ss', String(from), '-t', String(len), '-i', file, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], {maxBuffer: 1 << 28});
const pcm = new Float32Array(raw.buffer, raw.byteOffset, Math.floor(raw.byteLength / 4));
if (pcm.length < SR * 4) {
  console.error('✗ need at least 4s of audio');
  process.exit(1);
}
// Energy envelope → onset strength (positive change in log energy).
const n = Math.floor(pcm.length / HOP);
const env = new Float32Array(n);
for (let i = 0; i < n; i++) {
  let e = 0;
  for (let j = 0; j < HOP; j++) e += pcm[i * HOP + j] ** 2;
  env[i] = Math.log(1e-7 + e / HOP);
}
const on = new Float32Array(n);
for (let i = 1; i < n; i++) on[i] = Math.max(0, env[i] - env[i - 1]);
const mean = on.reduce((a, b) => a + b, 0) / n;
for (let i = 0; i < n; i++) on[i] = Math.max(0, on[i] - mean);
const hz = SR / HOP;
// Tempo: the lag whose comb (lag, 2·lag, 4·lag) matches the onsets best.
const ac = (lag) => {
  let s = 0;
  for (let i = 0; i + lag < n; i++) s += on[i] * on[i + lag];
  return s / (n - lag);
};
let best = {score: -1, bpm: 0};
for (let bpm = lo; bpm <= hi; bpm += 0.25) {
  const lag = (60 / bpm) * hz;
  const at = (k) => {
    const l = lag * k;
    const a = Math.floor(l);
    return ac(a) * (1 - (l - a)) + ac(a + 1) * (l - a);
  };
  const score = at(1) + 0.5 * at(2) + 0.25 * at(4);
  if (score > best.score) best = {score, bpm};
}
// Phase: the offset whose beat grid collects the most onset energy.
const grid = (bpm) => {
  const lagF = (60 / bpm) * hz;
  let ph = {score: -1, off: 0};
  for (let o = 0; o < lagF; o++) {
    let s = 0;
    for (let k = 0; o + k * lagF < n - 1; k++) {
      const i = Math.round(o + k * lagF);
      s += on[i] + 0.5 * (on[i - 1] ?? 0) + 0.5 * on[i + 1];
    }
    if (s > ph.score) ph = {score: s, off: o};
  }
  return ph;
};
// Refine the tempo against the grid itself: a 0.2 bpm error drifts off the beat within 20s.
let ph = grid(best.bpm);
for (let bpm = best.bpm - 0.6; bpm <= best.bpm + 0.6; bpm += 0.02) {
  const g = grid(bpm);
  if (g.score > ph.score) {
    ph = g;
    best.bpm = bpm;
  }
}
const beat = 60 / best.bpm;
const offset = ph.off / hz;
// Loudness per bar (4 beats), to find the lift.
const bars = [];
for (let t = offset; t + beat * 4 <= pcm.length / SR; t += beat * 4) {
  let e = 0;
  const a = Math.floor(t * SR);
  const b = Math.floor((t + beat * 4) * SR);
  for (let i = a; i < b; i++) e += pcm[i] ** 2;
  bars.push({t, db: 10 * Math.log10(1e-9 + e / (b - a))});
}
const f = (v) => v.toFixed(2);
console.log(`${file}${from ? ` (from ${from}s)` : ''}`);
console.log(`  tempo  ${best.bpm.toFixed(2)} bpm   beat ${f(beat)}s   bar ${f(beat * 4)}s   first beat at ${f(offset)}s`);
console.log(`  → "music": {"src": "…", ${from ? `"startFrom": ${from}, ` : ''}"bpm": ${Number(best.bpm.toFixed(2))}, "offset": ${Number(f(offset))}}`);
console.log('  (a tempo of half or double is the same grid; if cuts feel rushed, think in bars)');
console.log('  bar   starts   level');
let prev;
bars.slice(0, 16).forEach((b, i) => {
  const lift = prev !== undefined && b.db - prev > 2.5 ? '  ← lift: put the reveal / turn here' : '';
  console.log(`  ${String(i + 1).padStart(3)}  ${f(b.t).padStart(6)}s  ${b.db.toFixed(1).padStart(6)} dB${lift}`);
  prev = b.db;
});
console.log(`  useful lengths: ${[2, 3, 4, 6, 8].map((k) => `${k} beats = ${f(k * beat)}s`).join(' · ')}`);
console.log('  With hard cuts, a scene N beats long keeps every cut on the beat. With a fade, the cut reads at its midpoint.');
