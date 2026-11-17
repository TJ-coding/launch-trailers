import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {hasFile, Logo} from '../components';
import {keyframes, useTime} from '../motion';
import {alpha, useBrand, useLayout, useTheme} from '../theme';
import type {DemoScene, EndScene, ZoomKey} from '../spec';

// The demo film look: flat colour, the real product large, a few heavy words.
// One scene = one claim (headline) + the product proving it (media).

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const VIDEO = /\.(mp4|webm|mov|m4v)$/i;

const lum = (hex: string) => {
  const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};

/** Scene colours from `bg`: paper (light), ink (dark), accent, accent2 or a hex. */
export const useDemoColors = (bg: string = 'paper') => {
  const theme = useTheme();
  const paper = lum(theme.bg) > 0.5 ? theme.bg : '#F2F0EB';
  const ink = lum(theme.bg) > 0.5 ? theme.fg : '#0D1014';
  const fill = bg === 'paper' ? paper : bg === 'ink' ? ink : bg === 'accent' ? theme.accent : bg === 'accent2' ? theme.accent2 : bg;
  const light = lum(fill) > 0.55;
  const coloured = bg !== 'paper' && bg !== 'ink';
  return {
    fill,
    light,
    text: light ? '#101216' : '#FFFFFF',
    // the selection box: brand accent on paper/ink, plain contrast on a colour field
    box: coloured ? (light ? '#101216' : '#FFFFFF') : light ? theme.accentInk : theme.accent,
    dots: bg === 'paper' || bg === 'ink',
  };
};

export const DemoBackground: React.FC<{bg?: string}> = ({bg}) => {
  const c = useDemoColors(bg);
  const {u} = useLayout();
  const step = 36 * u;
  return (
    <AbsoluteFill style={{background: c.fill}}>
      {c.dots && <AbsoluteFill style={{background: `radial-gradient(${alpha(c.light ? '#000000' : '#FFFFFF', c.light ? 0.13 : 0.08)} ${1.4 * u}px, transparent ${1.6 * u}px) 0 0 / ${step}px ${step}px`}} />}
    </AbsoluteFill>
  );
};

type Tok = {text: string; boxed: boolean; br?: boolean};
/** "Tells you what to do [now]." → words; [..] marks the boxed phrase; \n forces a line break. */
export const parseBoxed = (s: string): Tok[][] => {
  const lines: Tok[][] = [];
  for (const line of s.split('\n')) {
    const out: Tok[] = [];
    let boxed = false;
    for (const part of line.split(/(\[|\])/)) {
      if (part === '[') boxed = true;
      else if (part === ']') boxed = false;
      else if (part.trim()) {
        if (boxed) out.push({text: part.trim(), boxed: true});
        else part.trim().split(/\s+/).forEach((w) => out.push({text: w, boxed: false}));
      }
    }
    // punctuation right after a box belongs inside it
    for (let i = 1; i < out.length; i++) {
      if (out[i - 1].boxed && /^[.,!?;:]+$/.test(out[i].text)) {
        out[i - 1].text += out[i].text;
        out.splice(i, 1);
        i--;
      }
    }
    lines.push(out);
  }
  return lines;
};

/** Heavy headline; the [boxed] phrase gets a selection frame and a named pointer. */
export const BoxedHeadline: React.FC<{text: string; size: number; color: string; box: string; tag?: string; delay?: number; align?: 'left' | 'center'; maxWidth?: number}> = ({text, size, color, box, tag, delay = 0.1, align = 'left', maxWidth}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const theme = useTheme();
  const {u} = useLayout();
  const lines = parseBoxed(text);
  let n = 0;
  const total = lines.flat().length;
  const boxAt = delay + total * 0.06 + 0.25;
  const bp = spring({frame: frame - Math.round(boxAt * fps), fps, config: {damping: 18, stiffness: 220}});
  const fs = size * u;
  const h = Math.max(7 * u, fs * 0.085);
  const handle = (pos: React.CSSProperties): React.CSSProperties => ({position: 'absolute', width: h, height: h, background: '#FFFFFF', border: `${Math.max(2, fs * 0.022)}px solid ${box}`, boxSizing: 'border-box', transform: `scale(${bp})`, ...pos});
  return (
    <div style={{fontFamily: theme.fontFamily, fontWeight: 800, fontSize: fs, lineHeight: 1.08, letterSpacing: '-0.035em', color, textAlign: align, maxWidth: maxWidth ? maxWidth * u : undefined}}>
      {lines.map((line, li) => (
        <div key={li} style={{display: 'flex', flexWrap: 'wrap', columnGap: '0.24em', rowGap: '0.04em', justifyContent: align === 'center' ? 'center' : 'flex-start'}}>
          {line.map((tok) => {
            const i = n++;
            const p = spring({frame: frame - Math.round((delay + i * 0.06) * fps), fps, config: {damping: 22, stiffness: 240}});
            const word = (
              <span style={{display: 'inline-block', opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 0.45}em)`, whiteSpace: 'nowrap'}}>{tok.text}</span>
            );
            if (!tok.boxed) return <React.Fragment key={i}>{word}</React.Fragment>;
            return (
              <span key={i} style={{position: 'relative', display: 'inline-block', padding: '0 0.12em', margin: '0 -0.04em'}}>
                {word}
                <span style={{position: 'absolute', inset: `${fs * 0.04}px 0 ${-fs * 0.02}px 0`, border: `${Math.max(2.5, fs * 0.03)}px solid ${box}`, opacity: bp, clipPath: `inset(0 ${(1 - bp) * 100}% 0 0)`}} />
                <span style={handle({left: -h / 2, top: fs * 0.04 - h / 2})} />
                <span style={handle({right: -h / 2, top: fs * 0.04 - h / 2})} />
                <span style={handle({left: -h / 2, bottom: -fs * 0.02 - h / 2})} />
                <span style={handle({right: -h / 2, bottom: -fs * 0.02 - h / 2})} />
                {tag && (
                  <span style={{position: 'absolute', right: -fs * 0.1, bottom: -fs * 0.52, display: 'flex', alignItems: 'flex-start', gap: fs * 0.02, opacity: bp, transform: `translate(${(1 - bp) * fs * 0.5}px, ${(1 - bp) * fs * 0.35}px)`}}>
                    <svg width={fs * 0.26} height={fs * 0.26} viewBox="0 0 24 24">
                      <path d="M3 2l16 9.5-7 1.5-3.5 7z" fill="#101216" stroke="#FFFFFF" strokeWidth={1.4} strokeLinejoin="round" />
                    </svg>
                    <span style={{marginTop: fs * 0.2, padding: `${fs * 0.045}px ${fs * 0.11}px`, background: box, color: lum(box) > 0.55 ? '#101216' : '#FFFFFF', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontWeight: 700, fontSize: Math.max(18 * u, fs * 0.17), letterSpacing: '0.08em', lineHeight: 1, whiteSpace: 'nowrap'}}>{tag.toUpperCase()}</span>
                  </span>
                )}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** The product media inside a w×h box, with a camera (centre x, y and scale over time). */
export const CameraMedia: React.FC<{src?: string; w: number; h: number; aspect: number; view?: ZoomKey[]; startFrom?: number; playbackRate?: number}> = ({src, w, h, aspect, view, startFrom = 0, playbackRate = 1}) => {
  const t = useTime();
  const {fps} = useVideoConfig();
  const theme = useTheme();
  const keys = view?.length ? view : [{at: 0, x: 0.5, y: 0.5, scale: 1}];
  const s = keyframes(keys, t, 'scale');
  const cx = keyframes(keys, t, 'x');
  const cy = keyframes(keys, t, 'y');
  const cover = Math.max(w / aspect, h); // media height when it just covers the box
  const mh = cover * s;
  const mw = mh * aspect;
  const left = Math.min(0, Math.max(w - mw, w / 2 - cx * mw));
  const top = Math.min(0, Math.max(h - mh, h / 2 - cy * mh));
  const style: React.CSSProperties = {position: 'absolute', left, top, width: mw, height: mh, display: 'block'};
  if (!src || !hasFile(src))
    return <div style={{width: w, height: h, background: theme.surface, color: theme.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: theme.fontFamily, fontSize: h * 0.05}}>{src ? `missing: public/${src}` : 'recording goes here'}</div>;
  return (
    <div style={{position: 'relative', width: w, height: h, overflow: 'hidden'}}>
      {VIDEO.test(src) ? <OffthreadVideo src={staticFile(src)} style={style} muted startFrom={Math.round(startFrom * fps)} playbackRate={playbackRate} /> : <Img src={staticFile(src)} style={style} />}
    </div>
  );
};

/** What the person typed: a white card with a typed line and a caret. */
export const PromptBubble: React.FC<{label?: string; text: string; at?: number; cps?: number; until?: number; width: number; size?: number}> = ({label, text, at = 0.4, cps = 24, until, width, size = 46}) => {
  const t = useTime();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const theme = useTheme();
  const {u} = useLayout();
  const p = spring({frame: frame - Math.round((at - 0.25) * fps), fps, config: {damping: 20, stiffness: 200}});
  const out = until !== undefined ? interpolate(t, [until, until + 0.25], [0, 1], clamp) : 0;
  const chars = Math.max(0, Math.min(text.length, Math.floor((t - at) * cps)));
  const typing = chars < text.length;
  const caret = typing || Math.floor(t * 2) % 2 === 0;
  return (
    <div style={{width, background: '#FFFFFF', color: '#101216', borderRadius: 22 * u, padding: `${26 * u}px ${34 * u}px ${32 * u}px`, boxShadow: `0 ${30 * u}px ${90 * u}px rgba(0,0,0,0.45)`, fontFamily: theme.fontFamily, opacity: Math.min(1, p * 1.6) * (1 - out), transform: `translateY(${(1 - p) * 40 * u + out * -20 * u}px) scale(${0.96 + 0.04 * p})`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14 * u, marginBottom: 14 * u}}>
        <span style={{background: theme.accentInk, color: '#FFFFFF', borderRadius: 999, padding: `${5 * u}px ${14 * u}px`, fontSize: 20 * u, fontWeight: 800, letterSpacing: '0.06em'}}>YOU</span>
        {label && <span style={{fontSize: 30 * u, fontWeight: 800, letterSpacing: '-0.02em'}}>{label}</span>}
      </div>
      <div style={{fontSize: size * u, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2, minHeight: size * 1.2 * u}}>
        {text.slice(0, chars)}
        <span style={{display: 'inline-block', width: 3 * u, height: size * 0.95 * u, marginLeft: 3 * u, verticalAlign: 'text-bottom', background: '#101216', opacity: caret ? 1 : 0}} />
      </div>
    </div>
  );
};

/** Short results that tick in under the headline: numbered or checked. */
export const StepList: React.FC<{steps: {text: string; at: number}[]; check?: boolean; color: string; size?: number}> = ({steps, check, color, size = 36}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const theme = useTheme();
  const {u} = useLayout();
  const d = size * 1.5 * u;
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 18 * u, fontFamily: theme.fontFamily}}>
      {steps.map((s, i) => {
        const p = spring({frame: frame - Math.round(s.at * fps), fps, config: {damping: 16, stiffness: 220}});
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 20 * u, opacity: Math.min(1, p * 2), transform: `translateX(${(1 - p) * -30 * u}px)`}}>
            <div style={{width: d, height: d, borderRadius: 999, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.75 * u, ...(check ? {background: theme.accentInk, color: '#FFFFFF'} : {border: `${3 * u}px solid ${alpha(color, 0.85)}`, color})}}>{check ? '✓' : i + 1}</div>
            <div style={{background: '#FFFFFF', color: '#101216', borderRadius: 12 * u, padding: `${size * 0.36 * u}px ${size * 0.62 * u}px`, fontWeight: 700, fontSize: size * u, letterSpacing: '-0.02em', boxShadow: `0 ${6 * u}px ${20 * u}px rgba(0,0,0,0.12)`, whiteSpace: 'nowrap'}}>{s.text}</div>
          </div>
        );
      })}
    </div>
  );
};

/** "1 · Strategise": a small step label above the headline. */
export const Kicker: React.FC<{text: string; bg: string; size?: number}> = ({text, bg, size = 30}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {u} = useLayout();
  const p = spring({frame: frame + 2, fps, config: {damping: 20, stiffness: 220}});
  return (
    <div style={{display: 'inline-block', padding: `${size * 0.36 * u}px ${size * 0.7 * u}px`, background: bg, color: lum(bg) > 0.55 ? '#101216' : '#FFFFFF', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontWeight: 700, fontSize: size * u, letterSpacing: '0.1em', lineHeight: 1, borderRadius: 6 * u, whiteSpace: 'nowrap', opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 20 * u}px)`}}>{text.toUpperCase()}</div>
  );
};

export const Demo: React.FC<DemoScene> = ({bg = 'paper', headline, layout = 'left', media, mediaAspect = 1.6, startFrom, playbackRate, view, tilt, windowWidth, windowAspect, prompt, steps, check, tag, brandMark, kicker, headlineSize, duration = 4}) => {
  const {u, width, height, portrait, square} = useLayout();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const brand = useBrand();
  const c = useDemoColors(bg);
  const lockup = useLockup();
  const t = useTime();
  const enter = spring({frame: frame + 4, fps, config: {damping: 26, stiffness: 170}}); // already moving on the first frame: a cut never lands on an empty field
  const stacked = portrait || square || layout === 'top';
  const pad = (portrait ? 70 : 96) * u;

  if (layout === 'full') {
    // The product fills the frame; words sit on top of it.
    const dim = prompt ? interpolate(t, [0, 0.4, prompt.until ?? 1e6, (prompt.until ?? 1e6) + 0.4], [0.25, 0.6, 0.6, 0.12], clamp) : 0.12;
    return (
      <AbsoluteFill style={{background: '#000'}}>
        <CameraMedia src={media} w={width} h={height} aspect={mediaAspect} view={view} startFrom={startFrom} playbackRate={playbackRate} />
        <AbsoluteFill style={{background: `rgba(6,8,12,${dim})`}} />
        {headline && (
          <AbsoluteFill style={{justifyContent: 'flex-end', padding: pad, background: 'linear-gradient(0deg, rgba(6,8,12,0.94) 0%, rgba(6,8,12,0.8) 24%, rgba(6,8,12,0) 50%)'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 26 * u}}>
              {kicker && <Kicker text={kicker} bg={c.box === '#101216' ? '#FFFFFF' : c.box} />}
              <BoxedHeadline text={headline} size={headlineSize ?? (portrait ? 96 : 110)} color="#FFFFFF" box={c.box === '#101216' ? '#FFFFFF' : c.box} tag={tag} delay={0.1} />
            </div>
          </AbsoluteFill>
        )}
        {prompt && (
          <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: headline ? 120 * u : 0}}>
            <PromptBubble {...prompt} width={Math.min(width - 2 * pad, 1180 * u)} size={portrait ? 44 : 54} />
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    );
  }

  // Window size: as large as the layout allows.
  const wa = windowAspect ?? mediaAspect;
  const textW = stacked ? width - 2 * pad : (1 - (windowWidth ?? 0.54) - 0.14) * width;
  const maxW = stacked ? width - 2 * pad : (windowWidth ?? 0.54) * width;
  const maxH = stacked ? height * (portrait ? 0.5 : 0.6) : height - 2 * pad * 0.8;
  const ww = Math.min(maxW, maxH * wa);
  const wh = ww / wa;
  const drift = interpolate(t, [0, duration], [0, 1], clamp);
  const rot = tilt ? {y: (layout === 'right' ? 1 : -1) * (13 - 3 * drift), x: 3} : {y: 0, x: (1 - enter) * 10};
  const win = (
    <div style={{perspective: 2600 * u, flexShrink: 0}}>
      <div style={{width: ww, height: wh, borderRadius: 16 * u, overflow: 'hidden', boxShadow: `0 ${40 * u}px ${110 * u}px rgba(0,0,0,${c.light ? 0.32 : 0.5}), 0 0 0 ${1.5 * u}px ${alpha(c.light ? '#000000' : '#FFFFFF', 0.14)}`, transform: `rotateY(${rot.y}deg) rotateX(${rot.x}deg) translateY(${(1 - enter) * 70 * u}px) scale(${tilt ? 0.96 + 0.03 * drift : 1})`, opacity: Math.min(1, enter * 3), background: '#0D1014'}}>
        <CameraMedia src={media} w={ww} h={wh} aspect={mediaAspect} view={view} startFrom={startFrom} playbackRate={playbackRate} />
      </div>
    </div>
  );
  // Largest size at which the longest line still fits the text column (Sora 800 runs about 0.62em a character).
  const longest = Math.max(1, ...(headline ?? '').split('\n').map((l) => l.replace(/[\[\]]/g, '').length + (l.includes('[') ? 0.6 : 0)));
  const size = headlineSize ?? Math.min(stacked ? (portrait ? 110 : 96) : 124, textW / u / (longest * 0.62));
  const text = (
    <div style={{display: 'flex', flexDirection: 'column', gap: (stacked ? 28 : 40) * u, width: textW, flexShrink: 0, alignItems: 'flex-start'}}>
      {brandMark && (lockup && brandMark === 'lockup' ? <Lockup size={stacked ? 200 : 300} blend={!c.light} /> : <BrandLine color={c.text} size={Math.max(56, size * 0.7)} />)}
      {kicker && <Kicker text={kicker} bg={c.box} />}
      {headline && <BoxedHeadline text={headline} size={size} color={c.text} box={c.box} tag={tag === undefined ? undefined : tag || brand.name} delay={0} />}
      {prompt && <PromptBubble {...prompt} width={Math.min(textW, 720 * u)} size={38} />}
      {steps && <StepList steps={steps} check={check} color={c.text} size={stacked ? 34 : 36} />}
    </div>
  );
  return (
    <AbsoluteFill>
      <DemoBackground bg={bg} />
      <AbsoluteFill style={{flexDirection: stacked ? 'column' : layout === 'right' ? 'row-reverse' : 'row', alignItems: stacked ? 'flex-start' : 'center', justifyContent: stacked ? 'center' : 'space-between', gap: (stacked ? 44 : 60) * u, padding: stacked && !portrait ? `${pad * 0.7}px ${pad}px` : pad}}>
        {text}
        {media !== undefined && <div style={stacked ? {alignSelf: 'center'} : undefined}>{win}</div>}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** The full logo artwork (brand.lockup), large. With `blend` (a dark scene whose `bg` is the artwork's own background colour) it sits on the field with no visible edge; otherwise it is a rounded tile. */
export const Lockup: React.FC<{size: number; blend?: boolean; delay?: number}> = ({size, blend, delay = 0}) => {
  const brand = useBrand();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {u} = useLayout();
  const p = spring({frame: frame - Math.round(delay * fps) + 3, fps, config: {damping: 18, stiffness: 150}});
  const s = size * u;
  return (
    <Img
      src={staticFile(brand.lockup!)}
      style={{width: s, height: s, objectFit: 'contain', flexShrink: 0, opacity: Math.min(1, p * 2), transform: `scale(${0.9 + 0.1 * p})`, ...(blend ? {maskImage: FEATHER, WebkitMaskImage: FEATHER, maskComposite: 'intersect', WebkitMaskComposite: 'source-in'} : {borderRadius: s * 0.12, boxShadow: `0 ${24 * u}px ${70 * u}px rgba(0,0,0,0.28)`})}}
    />
  );
};
// Feather the artwork's outer 3% on every side, so a slight mismatch with the field colour never shows as a square.
const FEATHER = 'linear-gradient(90deg, transparent, black 3%, black 97%, transparent), linear-gradient(0deg, transparent, black 3%, black 97%, transparent)';
export const useLockup = () => {
  const brand = useBrand();
  return Boolean(brand.lockup && hasFile(brand.lockup));
};

const BrandLine: React.FC<{color: string; size: number}> = ({color, size}) => {
  const brand = useBrand();
  const theme = useTheme();
  const {u} = useLayout();
  const s = size * u;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: s * 0.3, fontFamily: theme.fontFamily, fontWeight: 800, fontSize: s, letterSpacing: '-0.03em', color}}>
      {brand.logo && hasFile(brand.logo) && <Img src={staticFile(brand.logo)} style={{width: s * 1.5, height: s * 1.5, objectFit: 'contain', borderRadius: s * 0.3}} />}
      {brand.name}
    </div>
  );
};

/** Closing card: the line, the brand, one action. With `media` it is a hero shot: the product rising large behind the words. */
export const End: React.FC<EndScene> = ({bg = 'paper', headline, button = 'Try it now', url, tag, note, media, mediaAspect = 1.6, startFrom, view, duration = 4}) => {
  const {u, width, height, portrait} = useLayout();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const theme = useTheme();
  const brand = useBrand();
  const c = useDemoColors(bg);
  const t = frame / fps;
  const bp = spring({frame: frame - Math.round(0.7 * fps), fps, config: {damping: 14, stiffness: 180}});
  const up = interpolate(t, [0.9, 1.3], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const hero = Boolean(media);
  const lockup = useLockup();
  const side = lockup && hero && !portrait; // logo left, words right, product rising below
  const rise = spring({frame: frame + 3, fps, config: {damping: 30, stiffness: 90}});
  const push = interpolate(t, [0, duration], [0, 1], clamp);
  const ww = (portrait ? 0.9 : 0.64) * width;
  const wh = ww / mediaAspect;
  const action = (
    <div style={{display: 'flex', alignItems: 'center', gap: 36 * u, opacity: Math.min(1, bp * 1.5), transform: `scale(${0.8 + 0.2 * bp})`}}>
      <div style={{background: c.light ? '#101216' : '#FFFFFF', color: c.light ? '#FFFFFF' : '#101216', fontFamily: theme.fontFamily, fontWeight: 800, fontSize: 40 * u, letterSpacing: '-0.02em', padding: `${22 * u}px ${48 * u}px`, borderRadius: 999}}>{button} →</div>
      {(url ?? brand.url) && <div style={{fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontWeight: 700, fontSize: 36 * u, color: c.text}}>{url ?? brand.url}</div>}
    </div>
  );
  return (
    <AbsoluteFill>
      <DemoBackground bg={bg} />
      {hero && (
        <AbsoluteFill style={{alignItems: 'center', perspective: 2200 * u}}>
          <div style={{position: 'absolute', top: height * (portrait ? 0.54 : side ? 0.56 : 0.47), width: ww, height: wh, borderRadius: 18 * u, overflow: 'hidden', background: '#0D1014', transformOrigin: '50% 0%', transform: `translateY(${(1 - rise) * 260 * u}px) rotateX(${16 - 5 * push}deg) scale(${1 + 0.04 * push})`, opacity: Math.min(1, rise * 2.5), boxShadow: `0 ${-10 * u}px ${140 * u}px ${alpha(theme.accent, 0.35)}, 0 ${40 * u}px ${120 * u}px rgba(0,0,0,0.4), 0 0 0 ${1.5 * u}px ${alpha(c.light ? '#000000' : '#FFFFFF', 0.16)}`}}>
            <CameraMedia src={media} w={ww} h={wh} aspect={mediaAspect} view={view} startFrom={startFrom} />
          </div>
        </AbsoluteFill>
      )}
      {side ? (
        <AbsoluteFill style={{flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 70 * u, padding: `${44 * u}px ${90 * u}px`}}>
          <Lockup size={500} blend={!c.light} />
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 36 * u, paddingTop: 96 * u}}>
            <BoxedHeadline text={headline} size={100} color={c.text} box={c.box} tag={tag} delay={0.1} maxWidth={980} />
            {action}
            {note && <div style={{fontFamily: theme.fontFamily, fontWeight: 600, fontSize: 28 * u, color: alpha(c.text, 0.65), opacity: up}}>{note}</div>}
          </div>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: hero ? 'flex-start' : 'center', flexDirection: 'column', gap: (hero ? 34 : 44) * u, padding: hero ? `${(portrait ? 150 : 64) * u}px ${90 * u}px` : 90 * u}}>
          {lockup ? (
            <Lockup size={hero ? 300 : 380} blend={!c.light} />
          ) : (
            <div style={{opacity: Math.min(1, bp * 3 + (hero ? 1 : 0))}}>
              <BrandLine color={c.text} size={hero ? 58 : 50} />
            </div>
          )}
          <BoxedHeadline text={headline} size={hero ? (portrait ? 104 : 112) : portrait ? 120 : lockup ? 112 : 136} color={c.text} box={c.box} tag={tag} align="center" delay={0.1} maxWidth={1700} />
          {action}
          {note && <div style={{fontFamily: theme.fontFamily, fontWeight: 600, fontSize: 28 * u, color: alpha(c.text, 0.6), opacity: up, marginTop: -8 * u}}>{note}</div>}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// re-export so custom compositions can place the brand line
export {BrandLine, Logo as DemoLogo};
