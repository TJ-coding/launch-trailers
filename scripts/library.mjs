#!/usr/bin/env node
// Reusable photo library for scenario trailers. The metadata (source, credit,
// tags, the scene it shows, measured screen corners, headline side) is
// committed in library/photos.json. The image files live in library/cache/
// (gitignored, re-downloaded on demand), because stock licences forbid
// redistributing the photos as a collection.
//
//   library.mjs search "<query>" [--source unsplash|pexels] [--n 15]  needs an API key (see below)
//   library.mjs add pexels:<id>|unsplash:<id> [--tags a,b] [--scene "…"] [--personas a,b]
//                   [--time morning] [--tone dark|light] [--headline top-left] [--author "…"]
//   library.mjs set <id> --tags … --scene … --tone … --headline …   edit metadata
//   library.mjs corners <id> <device> "x,y x,y x,y x,y"              store a screen quad (TL TR BR BL)
//   library.mjs grid <id> [divisions=20]                            coordinate grid of the cached photo
//   library.mjs list [--tag t] [--persona p]                        what's in the library
//   library.mjs sheet [--tag t] [--persona p] [out.png]             labelled contact sheet to look at
//   library.mjs fetch [<id>…]                                       download missing cache files
//   library.mjs use <id>… <trailer-dir>                             copy into public/, add CREDITS, print moment JSON
//
// API keys: UNSPLASH_ACCESS_KEY / PEXELS_API_KEY in the environment or in
// ~/.config/launch-trailers/keys.env (KEY=value lines). Without keys, add
// Pexels photos by id (find ids on pexels.com).
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DB = path.join(KIT, 'library/photos.json');
const CACHE = path.join(KIT, 'library/cache');
fs.mkdirSync(CACHE, {recursive: true});

const keys = {...process.env};
const keyFile = path.join(os.homedir(), '.config/launch-trailers/keys.env');
if (fs.existsSync(keyFile))
  for (const line of fs.readFileSync(keyFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/);
    if (m && !keys[m[1]]) keys[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }

const load = () => (fs.existsSync(DB) ? JSON.parse(fs.readFileSync(DB, 'utf8')) : {photos: []});
const save = (db) => {
  db.photos.sort((a, b) => a.id.localeCompare(b.id));
  fs.writeFileSync(DB, JSON.stringify(db, null, 2) + '\n');
};
const args = process.argv.slice(2);
const cmd = args.shift();
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return def;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const list = (v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : undefined);
const find = (db, id) => {
  const p = db.photos.find((x) => x.id === id || x.sourceId === id);
  if (!p) throw new Error(`${id} is not in the library (library.mjs list)`);
  return p;
};
const file = (p) => path.join(CACHE, `${p.id}.jpg`);
const UA = {'User-Agent': 'launch-trailers-library'};

async function download(p) {
  if (fs.existsSync(file(p))) return file(p);
  const res = await fetch(p.download, {headers: UA});
  if (!res.ok) throw new Error(`download ${p.id}: HTTP ${res.status}`);
  fs.writeFileSync(file(p), Buffer.from(await res.arrayBuffer()));
  // Unsplash API guidelines: register the download.
  if (p.source === 'unsplash' && p.downloadLocation && keys.UNSPLASH_ACCESS_KEY)
    await fetch(p.downloadLocation, {headers: {Authorization: `Client-ID ${keys.UNSPLASH_ACCESS_KEY}`}}).catch(() => {});
  return file(p);
}

const size = (f) => execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', f]).toString().trim().split(',').map(Number);

function chrome(html, out, w, h) {
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'lib-')), 'page.html');
  fs.writeFileSync(tmp, html);
  const bin = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'google-chrome', 'chromium'].find((c) => {
    try {
      execFileSync(c, ['--version'], {stdio: 'ignore'});
      return true;
    } catch {
      return false;
    }
  });
  execFileSync(bin, ['--headless=new', '--hide-scrollbars', '--allow-file-access-from-files', `--window-size=${w},${h}`, '--virtual-time-budget=15000', `--screenshot=${out}`, `file://${tmp}`], {stdio: 'ignore'});
}

function sheetHtml(items, cols = 4) {
  const cells = items
    .map((it) => `<figure><img src="${it.src}"><figcaption><b>${it.label}</b> ${it.caption ?? ''}</figcaption></figure>`)
    .join('');
  return `<!doctype html><body style="margin:0;background:#111;font:13px system-ui;color:#ddd"><style>
  main{display:grid;grid-template-columns:repeat(${cols},1fr);gap:8px;padding:8px}figure{margin:0}img{width:100%;height:220px;object-fit:cover;display:block;border-radius:4px}
  figcaption{padding:4px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}b{color:#fff;background:#c2185b;padding:1px 5px;border-radius:3px;margin-right:4px}</style><main>${cells}</main></body>`;
}

async function search(q) {
  const source = flag('source', keys.UNSPLASH_ACCESS_KEY ? 'unsplash' : 'pexels');
  const n = Number(flag('n', '15'));
  let results = [];
  if (source === 'unsplash') {
    if (!keys.UNSPLASH_ACCESS_KEY) throw new Error('UNSPLASH_ACCESS_KEY missing (see the header of this script)');
    const r = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=${n}&orientation=landscape&content_filter=high`, {
      headers: {Authorization: `Client-ID ${keys.UNSPLASH_ACCESS_KEY}`, 'Accept-Version': 'v1'},
    });
    if (!r.ok) throw new Error(`Unsplash search: HTTP ${r.status}`);
    results = (await r.json()).results.map((x) => ({ref: `unsplash:${x.id}`, thumb: x.urls.small, caption: `${x.alt_description ?? ''} · ${x.user.name}`}));
  } else {
    if (!keys.PEXELS_API_KEY) throw new Error('PEXELS_API_KEY missing. Search pexels.com in a browser (or the web) and add photos by id: library.mjs add pexels:<id>');
    const r = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=${n}&orientation=landscape`, {headers: {Authorization: keys.PEXELS_API_KEY}});
    if (!r.ok) throw new Error(`Pexels search: HTTP ${r.status}`);
    results = (await r.json()).photos.map((x) => ({ref: `pexels:${x.id}`, thumb: x.src.medium, caption: `${x.alt ?? ''} · ${x.photographer}`}));
  }
  results.forEach((x, i) => console.log(`${String(i + 1).padStart(2)}  ${x.ref.padEnd(26)} ${x.caption.slice(0, 90)}`));
  const out = path.join(os.tmpdir(), `library-search-${Date.now()}.png`);
  chrome(sheetHtml(results.map((x, i) => ({src: x.thumb, label: `${i + 1} ${x.ref}`, caption: ''})), 5), out, 1800, Math.ceil(results.length / 5) * 250 + 20);
  console.log(`\ncontact sheet: ${out}\nadd one: library.mjs add <ref> --scene "…" --tags … --personas …`);
}

async function add(ref) {
  const [source, sid] = ref.split(':');
  const db = load();
  const id = `${source}-${sid}`;
  if (db.photos.some((p) => p.id === id)) throw new Error(`${id} is already in the library`);
  let meta;
  if (source === 'pexels') {
    meta = {page: `https://www.pexels.com/photo/${sid}/`, download: `https://images.pexels.com/photos/${sid}/pexels-photo-${sid}.jpeg?auto=compress&cs=tinysrgb&w=2400`, license: 'Pexels License (free, commercial use, no attribution required)'};
    if (keys.PEXELS_API_KEY) {
      const r = await fetch(`https://api.pexels.com/v1/photos/${sid}`, {headers: {Authorization: keys.PEXELS_API_KEY}});
      if (r.ok) {
        const x = await r.json();
        Object.assign(meta, {page: x.url, author: x.photographer, authorUrl: x.photographer_url, alt: x.alt});
      }
    }
  } else if (source === 'unsplash') {
    if (!keys.UNSPLASH_ACCESS_KEY) throw new Error('UNSPLASH_ACCESS_KEY missing');
    const r = await fetch(`https://api.unsplash.com/photos/${sid}`, {headers: {Authorization: `Client-ID ${keys.UNSPLASH_ACCESS_KEY}`}});
    if (!r.ok) throw new Error(`Unsplash photo: HTTP ${r.status}`);
    const x = await r.json();
    meta = {
      page: x.links.html,
      download: `${x.urls.raw}&w=2400&q=85&fm=jpg`,
      downloadLocation: x.links.download_location,
      author: x.user.name,
      authorUrl: x.user.links.html,
      alt: x.alt_description,
      license: 'Unsplash License (free, commercial use; credit appreciated)',
    };
  } else throw new Error('ref must be pexels:<id> or unsplash:<id>');
  const p = {
    id,
    source,
    sourceId: sid,
    ...meta,
    author: flag('author', meta.author ?? ''),
    scene: flag('scene', meta.alt ?? ''),
    tags: list(flag('tags')) ?? [],
    personas: list(flag('personas')) ?? [],
    time: flag('time', ''),
    tone: flag('tone', 'light'),
    headline: flag('headline', 'top-left'),
    screens: [],
  };
  await download(p);
  const [w, h] = size(file(p));
  Object.assign(p, {width: w, height: h});
  db.photos.push(p);
  save(db);
  console.log(`✓ added ${id} (${w}×${h}) → ${file(p)}\n  next: library.mjs grid ${id}, then library.mjs corners ${id} <laptop|phone|monitor> "x,y x,y x,y x,y"`);
}

async function main() {
  const db = load();
  switch (cmd) {
    case 'search':
      return search(args.join(' '));
    case 'add':
      return add(args[0]);
    case 'set': {
      const p = find(db, args[0]);
      for (const k of ['scene', 'time', 'tone', 'headline', 'author', 'notes']) {
        const v = flag(k);
        if (v !== undefined) p[k] = v;
      }
      for (const k of ['tags', 'personas']) {
        const v = list(flag(k));
        if (v) p[k] = v;
      }
      save(db);
      return console.log(`✓ ${p.id} updated`);
    }
    case 'corners': {
      const [id, device, quad] = args;
      const p = find(db, id);
      const corners = quad.trim().split(/\s+/).map((pt) => pt.split(',').map(Number));
      if (corners.length !== 4 || corners.flat().some((v) => !(v >= 0 && v <= 1))) throw new Error('give 4 points "x,y x,y x,y x,y" as fractions: TL TR BR BL');
      p.screens = (p.screens ?? []).filter((s) => s.device !== device).concat({device, corners});
      save(db);
      return console.log(`✓ ${p.id}: ${device} screen stored`);
    }
    case 'grid': {
      const p = find(db, args[0]);
      const f = await download(p);
      const out = path.join(os.tmpdir(), `${p.id}.grid.png`);
      execFileSync('node', [path.join(KIT, 'scripts/grid.mjs'), f, out, args[1] ?? '20'], {stdio: 'inherit'});
      return;
    }
    case 'fetch': {
      const ids = args.length ? args : db.photos.map((p) => p.id);
      for (const id of ids) {
        const p = find(db, id);
        await download(p);
        console.log(`✓ ${p.id}`);
      }
      return;
    }
    case 'list': {
      const tag = flag('tag');
      const persona = flag('persona');
      for (const p of db.photos.filter((p) => (!tag || p.tags.includes(tag)) && (!persona || p.personas.includes(persona))))
        console.log(`${p.id.padEnd(18)} ${(p.time || '').padEnd(9)} ${p.tone.padEnd(5)} ${(p.screens ?? []).map((s) => s.device).join('+').padEnd(14)} ${p.scene.slice(0, 70)}  [${p.tags.join(', ')}]`);
      return;
    }
    case 'sheet': {
      const tag = flag('tag');
      const persona = flag('persona');
      const ps = db.photos.filter((p) => (!tag || p.tags.includes(tag)) && (!persona || p.personas.includes(persona)));
      for (const p of ps) await download(p);
      const out = path.resolve(args[0] ?? path.join(os.tmpdir(), 'library-sheet.png'));
      chrome(sheetHtml(ps.map((p) => ({src: `file://${file(p)}`, label: p.id, caption: `${p.time} · ${p.scene}`}))), out, 1800, Math.ceil(ps.length / 4) * 250 + 20);
      return console.log(`✓ ${out}`);
    }
    case 'use': {
      const dir = path.resolve(args.pop());
      const pub = path.join(dir, 'public');
      fs.mkdirSync(pub, {recursive: true});
      const credits = path.join(dir, 'CREDITS.md');
      let text = fs.existsSync(credits) ? fs.readFileSync(credits, 'utf8') : '# Photo credits\n\n| file | author | source | licence |\n|---|---|---|---|\n';
      const snippets = [];
      for (const id of args) {
        const p = find(db, id);
        fs.copyFileSync(await download(p), path.join(pub, `${p.id}.jpg`));
        if (!text.includes(`${p.id}.jpg`)) text += `| ${p.id}.jpg | ${p.author || ''} | ${p.page} | ${p.license} |\n`;
        snippets.push({
          type: 'moment',
          photo: `${p.id}.jpg`,
          tone: p.tone,
          headlinePos: p.headline,
          headline: '…',
          ...(p.screens?.length ? {screens: p.screens.map((s) => ({media: `<${s.device} screenshot>`, corners: s.corners, ...(s.device === 'phone' ? {radius: 0.09} : {})}))} : {}),
        });
      }
      fs.writeFileSync(credits, text);
      console.log(`✓ copied ${args.length} photo(s) to ${pub}, credits in ${credits}\nmoment scenes to start from:`);
      for (const s of snippets) console.log(JSON.stringify(s));
      return;
    }
    default:
      console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 24).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  }
}
main().catch((e) => {
  console.error(`✗ ${e.message}`);
  process.exit(1);
});
