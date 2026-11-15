import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bubble, Chip, hasFile, Headline, Media, WidgetCard, Notification, quadMatrix, TimeStamp, Toast, useImageSize} from '../components';
import {alpha, useLayout, useTheme} from '../theme';
import type {MomentScene, Overlay} from '../spec';

const VIDEO = /\.(mp4|webm|mov|m4v)$/i;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Photo: React.FC<{src: string; style?: React.CSSProperties}> = ({src, style}) => {
  const s: React.CSSProperties = {position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...style};
  if (!hasFile(src))
    return (
      <div style={{...s, background: 'linear-gradient(135deg, #3a3f4a, #1a1d23)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontFamily: 'system-ui', fontSize: 40}}>
        photo goes here: public/{src}
      </div>
    );
  return VIDEO.test(src) ? <OffthreadVideo src={staticFile(src)} muted style={s} /> : <Img src={staticFile(src)} style={s} />;
};

/**
 * A moment of use: a context photo with a slow camera move, the product UI
 * on the screen inside it, notifications/bubbles/toasts around it, and an
 * editorial headline. The building block of scenario trailers.
 */
export const Moment: React.FC<MomentScene & {duration?: number}> = ({
  photo,
  after,
  changeAt = 1.5,
  camera,
  time,
  timeLabel,
  headline,
  headlinePos = 'top-left',
  headlineWidth,
  tone = 'light',
  shade = true,
  chip,
  screens = [],
  overlays = [],
  glow,
  duration = 4,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {u, width: W, height: H, portrait} = useLayout();
  const t = frame / fps;
  const size = useImageSize(VIDEO.test(photo) ? undefined : photo) ?? {w: 16, h: 9};
  // (missing photo: useImageSize returns 16:9 and Photo draws a placeholder)
  const pa = VIDEO.test(photo) ? 16 / 9 : size.w / size.h;

  // Photo box that covers the frame, then a camera move over it.
  const cw = pa > W / H ? H * pa : W;
  const ch = pa > W / H ? H : W / pa;
  const from = {x: 0.5, y: 0.5, scale: 1, ...camera?.from};
  const to = {x: from.x, y: from.y, scale: 1.08, ...camera?.to};
  const k = interpolate(t, [0, duration], [0, 1], {...clamp, easing: Easing.bezier(0.33, 0, 0.2, 1)});
  const s = from.scale + (to.scale - from.scale) * k;
  const fx = from.x + (to.x - from.x) * k;
  const fy = from.y + (to.y - from.y) * k;
  const left = Math.min(0, Math.max(W - cw * s, W / 2 - fx * cw * s));
  const top = Math.min(0, Math.max(H - ch * s, H / 2 - fy * ch * s));
  const afterO = after ? interpolate(t, [changeAt, changeAt + 0.7], [0, 1], clamp) : 0;

  const vertical = headlinePos.startsWith('top') ? 'top' : headlinePos.startsWith('bottom') ? 'bottom' : 'center';
  const horizontal = headlinePos.endsWith('right') ? 'right' : headlinePos === 'center' ? 'center' : 'left';
  const shadeColor = tone === 'light' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.6)';
  const shadeBg =
    vertical === 'center'
      ? `radial-gradient(60% 50% at 50% 50%, ${shadeColor}, transparent)`
      : `linear-gradient(${vertical === 'top' ? 180 : 0}deg, ${shadeColor} 0%, transparent ${portrait ? 45 : 55}%)`;
  const pad = (portrait ? 90 : 96) * u;

  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: cw, height: ch, transform: `translate(${left}px, ${top}px) scale(${s})`, transformOrigin: '0 0'}}>
        <Photo src={photo} />
        {after && <Photo src={after} style={{opacity: afterO}} />}
        {glow && <Glow {...glow} cw={cw} ch={ch} t={t} />}
        {screens.map((sc, i) => (
          <ScreenInPhoto key={i} {...sc} cw={cw} ch={ch} t={t} />
        ))}
      </div>
      {headline && shade && <AbsoluteFill style={{background: shadeBg}} />}
      <AbsoluteFill
        style={{
          padding: pad,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: vertical === 'top' ? 'flex-start' : vertical === 'bottom' ? 'flex-end' : 'center',
          alignItems: horizontal === 'left' ? 'flex-start' : horizontal === 'right' ? 'flex-end' : 'center',
          gap: 22 * u,
        }}
      >
        {time && <TimeStamp time={time} label={timeLabel} tone={tone} />}
        {headline && <Headline text={headline} tone={tone} align={horizontal} delay={0.25} size={portrait ? 100 : 96} maxWidth={headlineWidth ?? (portrait ? 900 : 1000)} />}
        {chip && <Chip text={chip} tone={tone} at={0.9} />}
      </AbsoluteFill>
      {overlays.map((o, i) => (
        <OverlayAt key={i} o={o} W={W} H={H} duration={duration} />
      ))}
      <AbsoluteFill style={{boxShadow: `inset 0 0 ${200 * u}px ${alpha('#000000', 0.35)}`, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

const DEFAULT_POS: Record<Overlay['kind'], [number, number]> = {notification: [0.6, 0.08], bubble: [0.62, 0.4], toast: [0.62, 0.78], chip: [0.06, 0.86], widget: [0.5, 0.3]};

const OverlayAt: React.FC<{o: Overlay; W: number; H: number; duration: number}> = ({o, W, H, duration}) => {
  const {u} = useLayout();
  const [x, y] = o.pos ?? DEFAULT_POS[o.kind];
  const box: React.CSSProperties = {position: 'absolute', left: x * W, top: y * H};
  return (
    <div style={box}>
      {o.kind === 'notification' && <Notification app={o.app} title={o.title} text={o.text ?? ''} time={o.time} at={o.at} until={o.until} width={o.width} />}
      {o.kind === 'bubble' && <Bubble from={o.from} text={o.text ?? ''} at={o.at} until={o.until} speak={o.speak} width={o.width} />}
      {o.kind === 'toast' && <Toast text={o.text ?? ''} at={o.at} until={o.until} />}
      {o.kind === 'chip' && <Chip text={o.text ?? ''} at={o.at} until={o.until} />}
      {o.kind === 'widget' && (
        <WidgetCard media={o.media} crop={o.crop} mediaAspect={o.mediaAspect} startFrom={o.startFrom} playbackRate={o.playbackRate} width={(o.width ?? 900) * u} at={o.at ?? 0.6} duration={duration} glass />
      )}
    </div>
  );
};

/** Screenshot warped onto a screen in the photo; it powers on at `at`. */
const ScreenInPhoto: React.FC<NonNullable<MomentScene['screens']>[number] & {cw: number; ch: number; t: number}> = ({media, corners, at = 0.2, radius = 0.015, glare = true, cw, ch, t}) => {
  const q = corners.map(([x, y]) => [x * cw, y * ch]) as [[number, number], [number, number], [number, number], [number, number]];
  const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const sw = (dist(q[0], q[1]) + dist(q[3], q[2])) / 2;
  const sh = (dist(q[0], q[3]) + dist(q[1], q[2])) / 2;
  const bw = 1600;
  const bh = Math.round((bw * sh) / sw);
  const on = interpolate(t, [at, at + 0.5], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: bw, height: bh, transformOrigin: '0 0', transform: quadMatrix(bw, bh, q), borderRadius: radius * bw, overflow: 'hidden', background: '#05060A'}}>
      <div style={{position: 'absolute', inset: 0, opacity: on, filter: `brightness(${0.6 + 0.35 * on}) contrast(0.96)`}}>
        <Media src={media} />
      </div>
      {glare && <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 35%, transparent 55%)'}} />}
    </div>
  );
};

/** Soft light bloom at (x, y) of the photo, e.g. a phone lighting up the table. */
const Glow: React.FC<{x: number; y: number; at?: number; size?: number; cw: number; ch: number; t: number}> = ({x, y, at = 0.5, size = 0.35, cw, ch, t}) => {
  const theme = useTheme();
  const o = interpolate(t, [at, at + 0.4, at + 2.5], [0, 1, 0.75], clamp);
  const d = size * cw;
  return (
    <div
      style={{
        position: 'absolute',
        left: x * cw - d / 2,
        top: y * ch - d / 2,
        width: d,
        height: d,
        borderRadius: '50%',
        background: `radial-gradient(closest-side, ${alpha(theme.accent, 0.45)}, ${alpha(theme.accent, 0.12)} 55%, transparent)`,
        mixBlendMode: 'screen',
        opacity: o,
      }}
    />
  );
};
