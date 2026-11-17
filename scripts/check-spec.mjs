#!/usr/bin/env node
// Validate a trailer folder and print its timeline.
//   node scripts/check-spec.mjs <dir> [--strict] [--poster-frame] [--json]
// --strict        missing media is an error (final renders), not a warning
// --poster-frame  print only the frame number used for the poster still
// --json          print the timeline as JSON (used by review.mjs)
//
// Two kinds of finding: ✗ errors (the spec is broken) and ⚠ warnings. Warnings
// tagged [craft] are the rules that separate a watchable trailer from a slide
// show (see skills/launch-trailer/references/principles.md): fix each one or
// be able to say why it doesn't apply.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith('--'));
const strict = args.includes('--strict');
if (!dir) {
  console.error('usage: check-spec.mjs <trailer-dir> [--strict] [--poster-frame]');
  process.exit(1);
}

const DEFAULT_DURATION = {hook: 3, problem: 4, logo: 2.5, announce: 3, screen: 5, montage: 4, keys: 3, features: 5, stat: 3, beforeAfter: 5, quote: 4, cta: 4, device3d: 5, assemble: 5, carousel3d: 6, logo3d: 3, moment: 4, widget: 4, demo: 4, end: 3.5};
const REQUIRED = {hook: ['lines'], problem: ['items'], logo: [], announce: ['title'], screen: [], montage: ['items'], keys: ['keys'], features: ['items'], stat: ['value', 'label'], beforeAfter: ['before', 'after'], quote: ['text'], cta: ['headline'], device3d: [], assemble: ['pieces'], carousel3d: ['items'], logo3d: [], moment: ['photo'], widget: ['media'], demo: [], end: ['headline']};
const FORMATS = ['landscape', 'square', 'vertical'];
const FONTS = ['Inter', 'Poppins', 'Space Grotesk', 'Manrope', 'DM Sans', 'Sora', 'Hanken Grotesk', 'Schibsted Grotesk'];
const DISPLAY_FONTS = [...FONTS, 'Instrument Serif', 'Fraunces', 'Newsreader', 'Playfair Display'];
const TRANSITIONS = ['fade', 'slide', 'wipe', 'cut', 'none'];
const GRADES = ['none', 'warm', 'cool', 'film'];
const FRAMES = ['browser', 'window', 'phone', 'none'];

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const craft = (m) => warnings.push(`[craft] ${m}`);

let spec;
try {
  spec = JSON.parse(fs.readFileSync(path.join(dir, 'trailer.json'), 'utf8'));
} catch (e) {
  console.error(`✗ ${path.join(dir, 'trailer.json')}: ${e.message}`);
  process.exit(1);
}
const pub = path.join(dir, 'public');
// clip lengths written by record.mjs, keyed by file name
const clipInfo = {};
try {
  for (const c of Object.values(JSON.parse(fs.readFileSync(path.join(dir, 'clips.json'), 'utf8')))) clipInfo[c.file] = c;
} catch {}
// Average luminance 0..255 of an image (ffmpeg scales it to one grey pixel).
const luma = (f) => {
  try {
    return execFileSync('ffmpeg', ['-v', 'error', '-i', path.join(pub, f), '-frames:v', '1', '-vf', 'scale=1:1,format=gray', '-f', 'rawvideo', '-'])[0];
  } catch {
    return undefined;
  }
};
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
if (spec.theme?.grade && !GRADES.includes(spec.theme.grade)) err(`theme.grade must be one of ${GRADES.join(', ')}`);
if (spec.transition && !TRANSITIONS.includes(spec.transition)) err(`transition must be one of ${TRANSITIONS.join(', ')}`);
if (!spec.brand?.name) err('brand.name is required');
if (spec.brand?.lockup && !fs.existsSync(path.join(pub, spec.brand.lockup))) warn(`brand.lockup: public/${spec.brand.lockup} not found (the small mark and name render instead)`);
if (spec.brand?.logo && !fs.existsSync(path.join(pub, spec.brand.logo))) warn(`brand.logo: public/${spec.brand.logo} not found (lettermark renders)`);
if (spec.music?.src && !fs.existsSync(path.join(pub, spec.music.src))) (strict ? err : warn)(`music: public/${spec.music.src} not found${strict ? '' : ' (silent)'}`);
if (!Array.isArray(spec.scenes) || !spec.scenes.length) err('scenes must be a non-empty array');

// ── craft helpers ───────────────────────────────────────────────────────────
const words = (t) => (typeof t === 'string' ? t.replace(/[*\[\]]/g, '').trim().split(/\s+/).filter(Boolean).length : 0);
/** Every word the viewer is asked to read in a scene. */
const sceneWords = (s) =>
  [s.title, s.caption, s.headline, s.subline, s.label, s.sublabel, s.subtitle, s.tagline, s.text, s.chip, s.timeLabel, ...(s.lines ?? []), ...(s.type === 'problem' ? s.items ?? [] : []), ...(s.type === 'features' ? (s.items ?? []).flatMap((i) => [i.title, i.text]) : []), ...(s.overlays ?? []).flatMap((o) => [o.title, o.text]), ...(s.type === 'demo' ? [s.kicker, s.prompt?.label, ...(s.steps ?? []).map((x) => x.text)] : []), s.type === 'end' ? s.button : undefined].reduce((n, t) => n + words(t), 0);
/** Does the scene show the real product (UI), not just words or a photo? */
const showsProduct = (s) => (s.type === 'demo' && s.media) || ['screen', 'widget', 'montage', 'device3d', 'assemble', 'carousel3d'].includes(s.type) || (s.type === 'beforeAfter' && (s.before?.media || s.after?.media)) || (s.type === 'moment' && ((s.screens ?? []).length || (s.overlays ?? []).some((o) => o.kind === 'widget')));
/**
 * Rough px height (at 1080p) of ordinary 13px UI text once a widget is on
 * screen: rendered width over the CSS px of UI it shows, times any punch-in.
 */
const uiTextPx = (w, renderW) => 13 * (renderW / ((w.crop?.[2] ?? 1) * (w.uiWidth ?? 1440))) * (w.focus?.scale ?? 1);
const MIN_UI_PX = 20;
const legible = (where, w, renderW) => {
  if (!w.media) return;
  const px = uiTextPx(w, renderW);
  if (px < MIN_UI_PX) {
    const need = renderW / ((MIN_UI_PX / 13 / (w.focus?.scale ?? 1)) * (w.uiWidth ?? 1440));
    craft(`${where}: UI text will be about ${px.toFixed(0)}px tall at 1080p (unreadable on a phone under ~${MIN_UI_PX}px). Crop to one component (crop width ≤ ${need.toFixed(2)}), show the card wider, or add "focus" to punch in`);
  }
};

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
      if (!['notification', 'bubble', 'toast', 'chip', 'widget'].includes(o.kind)) err(`${where} overlays[${j}]: kind must be notification, bubble, toast, chip or widget`);
      if (o.kind === 'widget') media(`${where} overlays[${j}]`, o.media, true);
      else if (!o.text) err(`${where} overlays[${j}]: text is required`);
      within(`${where} overlays[${j}]`, o.at, dur);
    });
    if (s.headline && s.headline.replace(/\*/g, '').split(/\s+/).length > 8) warn(`${where}: headline over 8 words`);
  }
  if (s.type === 'cta' && s.photo) media(`${where} photo`, s.photo);
  if (s.mood && !['problem', 'solution'].includes(s.mood)) err(`${where}: mood must be problem or solution`);
  // Visual grammar: problems are dark, the solution brings the light.
  const mood = s.mood ?? (s.type === 'problem' ? 'problem' : 'solution');
  const photo = s.photo && fs.existsSync(path.join(pub, s.photo)) && !/\.(mp4|webm|mov|m4v)$/i.test(s.photo) ? s.photo : undefined;
  if (photo) {
    const l = luma(photo);
    if (l !== undefined && mood === 'problem' && l > 95) err(`${where}: problem scenes must be dark (light signals the solution); ${photo} averages ${l}/255, use a photo under ~95`);
    if (l !== undefined && mood === 'solution' && l < 45) warn(`${where}: a solution scene on a very dark photo (${l}/255) reads as a problem; prefer warmer, brighter light`);
  }
  if (s.type === 'widget') {
    media(where, s.media, true);
    if (s.crop && (s.crop.length !== 4 || s.crop.some((v) => v < 0 || v > 1) || s.crop[0] + s.crop[2] > 1.001 || s.crop[1] + s.crop[3] > 1.001)) err(`${where}: crop must be [x, y, w, h] fractions inside the media`);
  }
  if (s.type === 'montage') (s.items ?? []).forEach((it, j) => media(`${where} items[${j}]`, it.media, true));
  if (s.type === 'beforeAfter') ['before', 'after'].forEach((k) => s[k] && media(`${where} ${k}`, s[k].media));
  if (s.type === 'features' && s.items?.length > 6) warn(`${where}: only the first 6 items show`);
  if (s.type === 'hook' && s.lines?.join(' ').split(/\s+/).length > 10) warn(`${where}: hooks over ~10 words read slowly`);
  if (s.type === 'widget') {
    // Same box maths as scenes/Widget.tsx (landscape, 1080p units).
    const aspect = ((s.crop?.[2] ?? 1) * (s.mediaAspect ?? 1.6)) / (s.crop?.[3] ?? 1);
    legible(where, s, Math.min(1700, (s.title || s.caption ? 750 : 920) * aspect));
  }
  if (s.type === 'moment') (s.overlays ?? []).forEach((o, j) => o.kind === 'widget' && legible(`${where} overlays[${j}]`, o, o.width ?? 900));
  if (s.type === 'end' && s.media) media(where, s.media, true);
  if (s.type === 'demo') {
    if (s.layout && !['left', 'right', 'top', 'full'].includes(s.layout)) err(`${where}: layout must be left, right, top or full`);
    if (s.media) media(where, s.media, true);
    (s.view ?? []).forEach((v, j) => {
      frac(`${where} view[${j}]`, v, ['x', 'y']);
      within(`${where} view[${j}]`, v.at, dur);
      if (!(v.scale >= 1)) err(`${where} view[${j}]: scale must be ≥ 1`);
    });
    (s.steps ?? []).forEach((st, j) => within(`${where} steps[${j}]`, st.at, dur));
    if (s.media) {
      // Same maths as scenes/Demo.tsx: the window's width on a 1920 frame, times the camera scale.
      const winW = s.layout === 'full' ? 1920 : (s.windowWidth ?? 0.54) * 1920;
      const best = Math.max(1, ...(s.view ?? []).map((v) => v.scale));
      const px = 13 * (winW / (s.uiWidth ?? 1280)) * best;
      if (px < MIN_UI_PX) craft(`${where}: UI text comes out about ${px.toFixed(0)}px tall at 1080p, too small to read. Zoom the camera in ("view" with scale ≥ ${(MIN_UI_PX / (px / best)).toFixed(1)} on the part the headline is about), use layout "full", or record at a smaller viewport`);
      if (best > 3.2) craft(`${where}: view scale ${best} goes past the recording's sharpness; record at a smaller viewport instead`);
      const isVideo = /\.(mp4|webm|mov|m4v)$/i.test(s.media);
      if (!isVideo && (s.view ?? []).length < 2) craft(`${where}: a still screenshot with a fixed camera: nothing changes for ${dur}s. Use a recorded clip (record.mjs) or move the camera`);
      const info = clipInfo[s.media];
      if (isVideo && info) {
        const need = (s.startFrom ?? 0) + dur * (s.playbackRate ?? 1);
        if (need > info.seconds + 0.15) warn(`${where}: needs the clip up to ${need.toFixed(1)}s but ${s.media} is ${info.seconds}s long: the last frame freezes for ${((need - info.seconds) / (s.playbackRate ?? 1)).toFixed(1)}s`);
      }
    }
    if (s.prompt && !s.prompt.text) err(`${where}: prompt.text is required`);
    if (s.prompt) {
      const typed = (s.prompt.at ?? 0.4) + s.prompt.text.length / (s.prompt.cps ?? 24);
      if (typed + 0.6 > Math.min(dur, s.prompt.until ?? dur)) craft(`${where}: the prompt finishes typing at ${typed.toFixed(1)}s and is gone ${(Math.min(dur, s.prompt.until ?? dur) - typed).toFixed(1)}s later; give it 0.6s to be read (shorter text, higher cps, or a longer scene)`);
    }
  }
  for (const f of [s.focus, ...(s.overlays ?? []).map((o) => o.focus)].filter(Boolean)) {
    frac(`${where} focus`, f, ['x', 'y']);
    if (!(f.scale >= 1)) err(`${where} focus: scale must be ≥ 1`);
    if (f.scale > 2.5) craft(`${where} focus: scale ${f.scale} blurs the recording; crop tighter instead and keep the punch-in ≤ 2`);
  }
  let tr = s.transition ?? spec.transition ?? 'fade';
  if (tr === 'cut') tr = 'none';
  const overlap = i > 0 && tr !== 'none' ? tSec : 0;
  clock -= overlap;
  // Reading time: ~0.3s a word (BBC subtitle floor), plus the entrance and a beat to land.
  const nWords = sceneWords(s);
  const need = 0.6 + nWords * 0.3;
  if (nWords && dur - overlap < need) craft(`${where}: ${nWords} words with ${(dur - overlap).toFixed(1)}s clear of the transition; a viewer needs about ${need.toFixed(1)}s. Cut words (best) or hold longer`);
  const heading = s.title ?? s.headline;
  if (!['cta', 'end'].includes(s.type) && words(heading) > 6) craft(`${where}: "${heading}" is ${words(heading)} words; titles land at 2–5`);
  if (s.title && s.caption && s.type !== 'announce') craft(`${where}: title and caption together; the picture should say what the caption says. Drop the caption`);
  rows.push({n: i + 1, type: s.type, start: clock, dur, tr: i === 0 ? 'open' : tr, words: nWords, product: Boolean(showsProduct(s)), mood: s.mood ?? (s.type === 'problem' ? 'problem' : 'solution'), text: String(s.title ?? s.headline ?? s.lines?.join(' ') ?? s.prompt?.label ?? s.label ?? s.text ?? '').replace(/\s+/g, ' ')});
  clock += dur;
});
const total = Math.max(clock, 0);

if (spec.type === 'feature' && total > 40) warn(`feature trailers work best under ~30s (this one is ${total.toFixed(1)}s)`);
if (spec.type === 'product' && total > 75) warn(`product trailers work best at 30–60s (this one is ${total.toFixed(1)}s)`);
const last = spec.scenes?.[spec.scenes.length - 1];
const firstSolution = (spec.scenes ?? []).findIndex((s) => (s.mood ?? (s.type === 'problem' ? 'problem' : 'solution')) === 'solution');
if ((spec.scenes ?? []).slice(firstSolution + 1).some((s) => s.mood === 'problem')) warn('a problem scene comes after the solution started; keep problems first (dark → light)');
if (last && !['cta', 'end'].includes(last.type)) warn('the last scene is not a "cta" or "end": end on what to do next');

// ── craft: the trailer as a whole ───────────────────────────────────────────
if (rows.length > 1) {
  if (!spec.promise) craft('no "promise": write the one sentence the viewer should believe afterwards, then cut every scene that does not prove it');
  // Hook: the first seconds decide whether anyone sees the rest.
  if (['logo', 'logo3d'].includes(rows[0].type)) craft('opens on a logo: nobody cares yet. Open on the pain or the result, and bring the logo in at the turn or the CTA');
  const firstProduct = rows.find((r) => r.product);
  if (!firstProduct) craft('the product is never on screen: show the real UI working (widget, screen or a moment with a widget)');
  else if (firstProduct.start > 5) craft(`the product first appears at ${firstProduct.start.toFixed(1)}s: get it on screen within 5s (shorten or merge the scenes before scene ${firstProduct.n})`);
  const problemTime = rows.filter((r) => r.mood === 'problem').reduce((a, r) => a + r.dur, 0);
  if (problemTime > Math.max(4, total * 0.25)) craft(`${problemTime.toFixed(1)}s of problem in a ${total.toFixed(0)}s trailer: the pain needs one beat (≤ ${Math.max(4, total * 0.25).toFixed(1)}s), the change needs the rest`);
  // One promise, not a tour.
  const proofs = rows.filter((r) => r.product);
  if (total <= 35 && proofs.length > (rows.some((r) => r.type === 'demo') ? 5 : 4)) craft(`${proofs.length} product scenes in ${total.toFixed(0)}s is a feature tour: keep the 2–3 that prove the promise and give them room`);
  if (rows.some((r) => r.type === 'features') && total <= 35) craft('a "features" card list in a short trailer: lists are forgotten; show one of them working instead');
  // Rhythm: equal lengths and soft dissolves read as a slide show.
  let run = 1;
  let worst = 1;
  for (let i = 1; i < rows.length; i++) {
    run = Math.abs(rows[i].dur - rows[i - 1].dur) < 0.15 ? run + 1 : 1;
    worst = Math.max(worst, run);
  }
  if (worst >= 3) craft(`${worst} scenes in a row have the same length: that is a metronome, not an edit. Vary it (quick beats 1.5–2.5s, one long hold on the payoff)`);
  const trans = rows.slice(1);
  const soft = trans.filter((r) => r.tr === 'fade' && tSec >= 0.35).length;
  if (trans.length >= 3 && soft / trans.length > 0.5) craft(`${soft} of ${trans.length} scene changes are ${tSec}s crossfades: dissolves blur the rhythm. Use "transition": "cut" inside an act and keep one fade for the turn from problem to solution`);
  // One film: one look, one continuous session.
  const types = new Set(rows.map((r) => r.type));
  const photos = new Set((spec.scenes ?? []).filter((x) => x.type === 'moment').map((x) => x.photo));
  if (photos.size > 1) craft(`${photos.size} different stock photos: different people and rooms in each scene read as an incoherent collage. Tell the story inside the product instead ("demo" scenes cut from one recorded session), or use photos from one shoot of one person`);
  if (types.has('demo') && (types.has('moment') || types.has('widget') || types.has('screen'))) craft('demo scenes mixed with moment/widget/screen scenes: two visual languages in one film. Pick one');
  if (types.has('demo') && !fs.existsSync(path.join(dir, 'record.mjs'))) craft('no record.mjs next to trailer.json: demo clips should come from one scripted session (scripts/record.mjs), so the same data carries from scene to scene and the footage can be re-recorded');
  // Ending.
  if (['cta', 'end'].includes(last?.type) && rows[rows.length - 1].dur < 3) craft('the CTA is under 3s: the URL needs 2s on screen after it has animated in');
  const beforeCta = rows[rows.length - 2];
  if (['cta', 'end'].includes(last?.type) && beforeCta && beforeCta.dur < 2.5) craft(`scene ${beforeCta.n} runs straight into the CTA after ${beforeCta.dur}s: let the win sit for a moment before asking`);
  if (total < 8) craft(`${total.toFixed(1)}s is too short to show a change`);
  if (spec.type !== 'product' && total > 35) craft(`${total.toFixed(1)}s: social and landing-page trailers hold attention at 15–30s`);
  // Sound: the edit should be cut to the music, not scored afterwards.
  if (spec.silent) {
    // the owner chose a silent film: the words and the picture carry it
  } else if (!spec.music?.src) craft('no music: pick the track first, run beats.mjs on it and cut to its beat. If the film is meant to be silent, set "silent": true');
  else if (!spec.music.bpm) craft(`music has no "bpm": run  node scripts/beats.mjs ${path.join(pub, spec.music.src)}  and set music.bpm and music.offset so cuts can sit on the beat`);
  else {
    const beat = 60 / spec.music.bpm;
    const off = spec.music.offset ?? 0;
    for (const r of trans) {
      const cut = r.start + (r.tr === 'none' ? 0 : tSec / 2); // a dissolve reads as cutting at its midpoint
      const k = Math.round((cut - off) / beat);
      const d = cut - (off + k * beat);
      if (Math.abs(d) > 0.07) craft(`cut into scene ${r.n} at ${cut.toFixed(2)}s is ${Math.abs(d).toFixed(2)}s ${d > 0 ? 'after' : 'before'} the beat: make scene ${r.n - 1} ${Math.abs(d).toFixed(2)}s ${d > 0 ? 'shorter' : 'longer'} (${(rows[r.n - 2].dur - d).toFixed(2)}s)`);
    }
  }
}

if (args.includes('--poster-frame')) {
  const r = rows[rows.length - 1];
  console.log(r ? Math.max(0, Math.round((r.start + Math.min(r.dur - 0.1, 2.2)) * fps)) : 0);
  process.exit(errors.length ? 1 : 0);
}

if (args.includes('--json')) {
  console.log(JSON.stringify({total, fps, promise: spec.promise, music: Boolean(spec.music?.src), rows, warnings, errors}));
  process.exit(errors.length ? 1 : 0);
}

console.log(`${spec.title ?? spec.brand?.name ?? dir} · ${spec.type} · ${spec.format ?? 'landscape'} · ${total.toFixed(1)}s (${Math.round(total * fps)} frames @ ${fps}fps)`);
if (spec.promise) console.log(`  promise: ${spec.promise}`);
for (const r of rows) console.log(`  ${String(r.n).padStart(2)}  ${r.start.toFixed(1).padStart(5)}s  ${r.dur.toFixed(1).padStart(4)}s  ${r.tr.padEnd(5)} ${r.type.padEnd(11)} ${r.product ? '▣' : ' '} ${String(r.text).slice(0, 56)}`);
for (const w of warnings) console.log(`  ⚠ ${w}`);
for (const e of errors) console.log(`  ✗ ${e}`);
if (errors.length) process.exit(1);
console.log(warnings.length ? `✓ valid (${warnings.length} warning${warnings.length > 1 ? 's' : ''})` : '✓ valid');
