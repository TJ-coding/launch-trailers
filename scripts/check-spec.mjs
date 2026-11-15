#!/usr/bin/env node
// Validate a trailer folder and print its timeline.
//   node scripts/check-spec.mjs <dir> [--strict] [--poster-frame] [--json]
// --strict        missing media is an error (final renders), not a warning
// --poster-frame  print only the frame number used for the poster still
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith('--'));
const strict = args.includes('--strict');
if (!dir) {
  console.error('usage: check-spec.mjs <trailer-dir> [--strict] [--poster-frame]');
  process.exit(1);
}

const DEFAULT_DURATION = {hook: 3, problem: 4, logo: 2.5, announce: 3, screen: 5, montage: 4, keys: 3, features: 5, stat: 3, beforeAfter: 5, quote: 4, cta: 4, device3d: 5, assemble: 5, carousel3d: 6, logo3d: 3, moment: 4};
const REQUIRED = {hook: ['lines'], problem: ['items'], logo: [], announce: ['title'], screen: [], montage: ['items'], keys: ['keys'], features: ['items'], stat: ['value', 'label'], beforeAfter: ['before', 'after'], quote: ['text'], cta: ['headline'], device3d: [], assemble: ['pieces'], carousel3d: ['items'], logo3d: [], moment: ['photo']};
const FORMATS = ['landscape', 'square', 'vertical'];
const FONTS = ['Inter', 'Poppins', 'Space Grotesk', 'Manrope', 'DM Sans'];
const DISPLAY_FONTS = [...FONTS, 'Instrument Serif', 'Fraunces', 'Newsreader', 'Playfair Display'];
const TRANSITIONS = ['fade', 'slide', 'wipe', 'none'];
const FRAMES = ['browser', 'window', 'phone', 'none'];

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

let spec;
try {
  spec = JSON.parse(fs.readFileSync(path.join(dir, 'trailer.json'), 'utf8'));
} catch (e) {
  console.error(`✗ ${path.join(dir, 'trailer.json')}: ${e.message}`);
  process.exit(1);
}
const pub = path.join(dir, 'public');
const media = (where, f, required = false) => {
  if (!f) {
    if (required) warn(`${where}: no media set, a placeholder will render`);
    return;
  }
  if (!fs.existsSync(path.join(pub, f))) (strict ? err : warn)(`${where}: public/${f} not found${strict ? '' : ' (placeholder renders)'}`);
};
const frac = (where, o, keys) => keys.forEach((k) => typeof o[k] === 'number' && (o[k] < 0 || o[k] > 1) && err(`${where}: ${k}=${o[k]} must be a fraction 0..1`));
const within = (where, at, dur) => typeof at === 'number' && at > dur && warn(`${where}: at=${at}s is after the scene ends (${dur}s)`);

if (!['product', 'feature', 'scenario'].includes(spec.type)) err(`type must be "product", "feature" or "scenario"`);
if (spec.format && !FORMATS.includes(spec.format)) err(`format must be one of ${FORMATS.join(', ')}`);
if (spec.theme?.font && !FONTS.includes(spec.theme.font)) err(`theme.font must be one of ${FONTS.join(', ')}`);
if (spec.theme?.display && !DISPLAY_FONTS.includes(spec.theme.display)) err(`theme.display must be one of ${DISPLAY_FONTS.join(', ')}`);
if (spec.transition && !TRANSITIONS.includes(spec.transition)) err(`transition must be one of ${TRANSITIONS.join(', ')}`);
if (!spec.brand?.name) err('brand.name is required');
if (spec.brand?.logo && !fs.existsSync(path.join(pub, spec.brand.logo))) warn(`brand.logo: public/${spec.brand.logo} not found (lettermark renders)`);
if (spec.music?.src && !fs.existsSync(path.join(pub, spec.music.src))) (strict ? err : warn)(`music: public/${spec.music.src} not found${strict ? '' : ' (silent)'}`);
if (!Array.isArray(spec.scenes) || !spec.scenes.length) err('scenes must be a non-empty array');

const fps = spec.fps ?? 30;
const tSec = spec.transitionDuration ?? 0.4;
let clock = 0;
const rows = [];
(spec.scenes ?? []).forEach((s, i) => {
  const where = `scene ${i + 1} (${s.type})`;
  if (!(s.type in DEFAULT_DURATION)) return err(`${where}: unknown type. Known: ${Object.keys(DEFAULT_DURATION).join(', ')}`);
  for (const k of REQUIRED[s.type]) if (s[k] === undefined) err(`${where}: "${k}" is required`);
  if (s.transition && !TRANSITIONS.includes(s.transition)) err(`${where}: transition must be one of ${TRANSITIONS.join(', ')}`);
  if (s.frame && !FRAMES.includes(s.frame)) err(`${where}: frame must be one of ${FRAMES.join(', ')}`);
  const dur = s.duration ?? DEFAULT_DURATION[s.type];
  if (!(dur > 0)) err(`${where}: duration must be > 0`);
  if (s.audio && !fs.existsSync(path.join(pub, s.audio))) warn(`${where}: public/${s.audio} not found`);
  if (s.type === 'screen') {
    media(where, s.media, true);
    (s.zoom ?? []).forEach((z, j) => {
      frac(`${where} zoom[${j}]`, z, ['x', 'y']);
      if (z.scale < 1) err(`${where} zoom[${j}]: scale must be ≥ 1`);
      within(`${where} zoom[${j}]`, z.at, dur);
    });
    (s.callouts ?? []).forEach((c, j) => {
      frac(`${where} callouts[${j}]`, c, ['x', 'y', 'w', 'h']);
      if (c.x + c.w > 1.001 || c.y + c.h > 1.001) err(`${where} callouts[${j}]: box runs off the media (x+w or y+h > 1)`);
      within(`${where} callouts[${j}]`, c.at, dur);
    });
    (s.cursor ?? []).forEach((c, j) => {
      frac(`${where} cursor[${j}]`, c, ['x', 'y']);
      within(`${where} cursor[${j}]`, c.at, dur);
    });
  }
  const VIDEO = /\.(mp4|webm|mov|m4v)$/i;
  if (s.type === 'device3d') {
    media(where, s.device === 'duo' || !s.device || s.device === 'laptop' ? s.media : s.media ?? s.phoneMedia, true);
    if (s.device === 'duo') media(`${where} phoneMedia`, s.phoneMedia, true);
    if (s.motion && !['spin', 'open', 'orbit', 'rise', 'float'].includes(s.motion)) err(`${where}: motion must be spin, open, orbit, rise or float`);
  }
  if (['device3d', 'assemble', 'carousel3d'].includes(s.type)) {
    const files = [s.media, s.phoneMedia, ...(s.items ?? []).map((i) => i.media)].filter(Boolean);
    for (const f of files) if (VIDEO.test(f)) err(`${where}: 3D scenes take images only (${f}); use a screen scene for video`);
  }
  if (s.type === 'assemble') {
    media(where, s.media, true);
    if (s.mode && !['assemble', 'explode'].includes(s.mode)) err(`${where}: mode must be assemble or explode`);
    (s.pieces ?? []).forEach((c, j) => {
      frac(`${where} pieces[${j}]`, c, ['x', 'y', 'w', 'h']);
      if (c.x + c.w > 1.001 || c.y + c.h > 1.001) err(`${where} pieces[${j}]: runs off the image`);
    });
    if ((s.pieces ?? []).length > 8) warn(`${where}: more than 8 pieces gets busy`);
  }
  if (s.type === 'carousel3d') (s.items ?? []).forEach((it, j) => media(`${where} items[${j}]`, it.media, true));
  if (s.type === 'moment') {
    if (s.photo) media(where, s.photo, true);
    if (s.after) media(`${where} after`, s.after);
    (s.screens ?? []).forEach((sc, j) => {
      media(`${where} screens[${j}]`, sc.media, true);
      if (!Array.isArray(sc.corners) || sc.corners.length !== 4 || sc.corners.some((c) => !Array.isArray(c) || c.length !== 2 || c.some((v) => v < 0 || v > 1)))
        err(`${where} screens[${j}]: corners must be 4 [x, y] fractions: top-left, top-right, bottom-right, bottom-left`);
    });
    (s.overlays ?? []).forEach((o, j) => {
      if (!['notification', 'bubble', 'toast', 'chip'].includes(o.kind)) err(`${where} overlays[${j}]: kind must be notification, bubble, toast or chip`);
      if (!o.text) err(`${where} overlays[${j}]: text is required`);
      within(`${where} overlays[${j}]`, o.at, dur);
    });
    if (s.headline && s.headline.replace(/\*/g, '').split(/\s+/).length > 8) warn(`${where}: headline over 8 words`);
  }
  if (s.type === 'cta' && s.photo) media(`${where} photo`, s.photo);
  if (s.type === 'montage') (s.items ?? []).forEach((it, j) => media(`${where} items[${j}]`, it.media, true));
  if (s.type === 'beforeAfter') ['before', 'after'].forEach((k) => s[k] && media(`${where} ${k}`, s[k].media));
  if (s.type === 'features' && s.items?.length > 6) warn(`${where}: only the first 6 items show`);
  if (s.type === 'hook' && s.lines?.join(' ').split(/\s+/).length > 10) warn(`${where}: hooks over ~10 words read slowly`);
  const tr = s.transition ?? spec.transition ?? 'fade';
  const overlap = i > 0 && tr !== 'none' ? tSec : 0;
  clock -= overlap;
  rows.push({n: i + 1, type: s.type, start: clock, dur, text: s.title ?? s.headline ?? s.lines?.join(' ') ?? s.label ?? s.text ?? ''});
  clock += dur;
});
const total = Math.max(clock, 0);

if (spec.type === 'feature' && total > 40) warn(`feature trailers work best under ~30s (this one is ${total.toFixed(1)}s)`);
if (spec.type === 'product' && total > 75) warn(`product trailers work best at 30–60s (this one is ${total.toFixed(1)}s)`);
const last = spec.scenes?.[spec.scenes.length - 1];
if (last && last.type !== 'cta') warn('the last scene is not a "cta": end on what to do next');

if (args.includes('--poster-frame')) {
  const r = rows[rows.length - 1];
  console.log(r ? Math.max(0, Math.round((r.start + Math.min(r.dur - 0.1, 2.2)) * fps)) : 0);
  process.exit(errors.length ? 1 : 0);
}

console.log(`${spec.title ?? spec.brand?.name ?? dir} · ${spec.type} · ${spec.format ?? 'landscape'} · ${total.toFixed(1)}s (${Math.round(total * fps)} frames @ ${fps}fps)`);
for (const r of rows) console.log(`  ${String(r.n).padStart(2)}  ${r.start.toFixed(1).padStart(5)}s  ${r.dur.toFixed(1).padStart(4)}s  ${r.type.padEnd(11)} ${String(r.text).slice(0, 60)}`);
for (const w of warnings) console.log(`  ⚠ ${w}`);
for (const e of errors) console.log(`  ✗ ${e}`);
if (errors.length) process.exit(1);
console.log(warnings.length ? `✓ valid (${warnings.length} warning${warnings.length > 1 ? 's' : ''})` : '✓ valid');
