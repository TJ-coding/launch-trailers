import {useEffect, useMemo, useState} from 'react';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';
import * as THREE from 'three';
import {hasFile} from '../components/Media';

/** Crop rect [x, y, w, h] in image fractions, measured from the top-left. */
export type Crop = [number, number, number, number];

type Placeholder = {bg: string; fg: string; accent: string; label?: string};

/**
 * Loads public/<src> files as textures and holds the render until all are on
 * the GPU-side React tree. Call it in the scene component (outside
 * <Stage3D>), then pass the textures in: the WebGL canvas only redraws on
 * frame changes, so a texture that arrives inside it would never show.
 * Missing or unset files give a drawn placeholder, so drafts still render.
 */
export const useImageTextures = (srcs: (string | undefined)[], placeholder: Placeholder): (THREE.Texture | null)[] => {
  const key = srcs.map((s) => s ?? '').join('|');
  const present = srcs.map((s) => hasFile(s));
  const [loaded, setLoaded] = useState<Record<string, THREE.Texture>>({});
  const [handle] = useState(() => (present.some(Boolean) ? delayRender(`Loading textures ${key}`) : null));
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const want = [...new Set(srcs.filter((s, i) => s && present[i]))] as string[];
    Promise.all(
      want.map(
        (src) =>
          new Promise<[string, THREE.Texture]>((resolve, reject) =>
            loader.load(
              staticFile(src),
              (t) => {
                t.colorSpace = THREE.SRGBColorSpace;
                t.anisotropy = 8;
                resolve([src, t]);
              },
              undefined,
              () => reject(new Error(`Could not load public/${src}`)),
            ),
          ),
      ),
    )
      .then((pairs) => setLoaded(Object.fromEntries(pairs)))
      .catch((e) => cancelRender(e));
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const done = present.every((p, i) => !p || loaded[srcs[i]!]);
  useEffect(() => {
    if (done && handle !== null) continueRender(handle);
  }, [done, handle]);
  const fallbacks = useMemo(
    () => srcs.map((s, i) => (present[i] ? null : placeholderTexture(placeholder.bg, placeholder.fg, placeholder.accent, placeholder.label ?? (s ? `missing: public/${s}` : 'screenshot goes here')))),
    [key, placeholder.bg, placeholder.fg, placeholder.accent, placeholder.label], // eslint-disable-line react-hooks/exhaustive-deps
  );
  return srcs.map((s, i) => (present[i] ? loaded[s!] ?? null : fallbacks[i]));
};

/** One texture; see useImageTextures. */
export const useImageTexture = (src: string | undefined, placeholder: Placeholder) => useImageTextures([src], placeholder)[0];

/** Aspect (w / h) of a loaded texture, or `fallback`. */
export const textureAspect = (t: THREE.Texture | null, fallback: number) => {
  const img = t?.image as {width?: number; height?: number} | undefined;
  return img?.width && img?.height ? img.width / img.height : fallback;
};

/** Crop that cover-fits an image of aspect `img` into a box of aspect `box`, top-aligned. */
export const coverCrop = (img: number, box: number): Crop => {
  if (Math.abs(img - box) < 0.01) return [0, 0, 1, 1];
  if (img > box) {
    const w = box / img;
    return [(1 - w) / 2, 0, w, 1];
  }
  return [0, 0, 1, img / box];
};

/** Flat rounded rectangle centred on the origin, with UVs mapped to `crop` of the texture. */
export const roundedPlane = (w: number, h: number, r: number, crop: Crop = [0, 0, 1, 1]) => {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  const rr = Math.max(0.0001, Math.min(r, w / 2, h / 2));
  s.moveTo(x + rr, y);
  s.lineTo(x + w - rr, y);
  s.quadraticCurveTo(x + w, y, x + w, y + rr);
  s.lineTo(x + w, y + h - rr);
  s.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  s.lineTo(x + rr, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - rr);
  s.lineTo(x, y + rr);
  s.quadraticCurveTo(x, y, x + rr, y);
  const g = new THREE.ShapeGeometry(s, 10);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  const [cx, cy, cw, ch] = crop;
  for (let i = 0; i < pos.count; i++) {
    const u = (pos.getX(i) - x) / w;
    const v = (pos.getY(i) - y) / h;
    uv.setXY(i, cx + u * cw, 1 - (cy + (1 - v) * ch));
  }
  uv.needsUpdate = true;
  return g;
};

const canvasTexture = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  draw(cv.getContext('2d')!);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const rr = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fill();
};

export const placeholderTexture = (bg: string, fg: string, accent: string, label: string) =>
  canvasTexture(1600, 1000, (c) => {
    c.fillStyle = bg;
    c.fillRect(0, 0, 1600, 1000);
    c.globalAlpha = 0.1;
    c.fillStyle = fg;
    [70, 55, 80, 60, 45].forEach((w, i) => rr(c, 40, 60 + i * 50, (w / 100) * 220, 20, 6));
    rr(c, 330, 60, 500, 40, 8);
    c.globalAlpha = 0.18;
    c.fillStyle = accent;
    rr(c, 330, 140, 380, 560, 16);
    c.globalAlpha = 0.07;
    c.fillStyle = fg;
    rr(c, 740, 140, 380, 560, 16);
    rr(c, 1150, 140, 400, 560, 16);
    rr(c, 330, 760, 1100, 22, 8);
    rr(c, 330, 810, 800, 22, 8);
    c.globalAlpha = 1;
    c.fillStyle = fg;
    c.font = '600 40px system-ui, sans-serif';
    c.textAlign = 'center';
    c.fillText(label, 800, 520);
  });

/** Aluminium deck with keyboard and trackpad, drawn once. */
export const keyboardTexture = (body: string, keys: string) =>
  canvasTexture(1600, 1080, (c) => {
    c.fillStyle = body;
    c.fillRect(0, 0, 1600, 1080);
    c.fillStyle = keys;
    const rows = [14, 14, 13, 12, 10];
    const kw = 92;
    rows.forEach((n, r) => {
      const total = n * kw + (n - 1) * 10;
      for (let i = 0; i < n; i++) rr(c, (1600 - total) / 2 + i * (kw + 10), 70 + r * 92, kw, 80, 10);
    });
    rr(c, 330, 70 + 5 * 92, 940, 80, 10); // space row
    c.globalAlpha = 0.5;
    rr(c, 520, 680, 560, 340, 22); // trackpad
    c.globalAlpha = 1;
  });

/** Soft round shadow for under objects. */
export const shadowTexture = () =>
  canvasTexture(256, 256, (c) => {
    const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(0,0,0,0.75)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
  });
