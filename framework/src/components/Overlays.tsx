import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {alpha, useBrand, useLayout, useTheme} from '../theme';
import {hasFile} from './Media';

const useAppear = (at: number, until?: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - Math.round(at * fps), fps, config: {damping: 18, stiffness: 140}});
  const out = until === undefined ? 0 : interpolate(frame, [until * fps, until * fps + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return {p, o: Math.min(1, p * 1.4) * (1 - out)};
};

const glass = (u: number): React.CSSProperties => ({
  background: 'rgba(28, 30, 36, 0.72)',
  backdropFilter: `blur(${24 * u}px) saturate(1.4)`,
  WebkitBackdropFilter: `blur(${24 * u}px) saturate(1.4)`,
  border: `1px solid rgba(255,255,255,0.12)`,
  boxShadow: `0 ${18 * u}px ${50 * u}px rgba(0,0,0,0.35)`,
  color: '#FFFFFF',
});

const AppIconSmall: React.FC<{size: number; app?: string}> = ({size, app}) => {
  const brand = useBrand();
  const theme = useTheme();
  if (app && app !== brand.name)
    return (
      <div style={{width: size, height: size, borderRadius: size * 0.24, background: 'rgba(255,255,255,0.22)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.55, fontWeight: 700, textTransform: 'uppercase'}}>
        {app.slice(0, 1)}
      </div>
    );
  return brand.logo && hasFile(brand.logo) ? (
    <Img src={staticFile(brand.logo)} style={{width: size, height: size, borderRadius: size * 0.24, objectFit: 'cover'}} />
  ) : (
    <div style={{width: size, height: size, borderRadius: size * 0.24, background: theme.accent}} />
  );
};

/** Phone-style push notification sliding down. */
export const Notification: React.FC<{app?: string; title?: string; text: string; time?: string; at?: number; until?: number; width?: number}> = ({
  app,
  title,
  text,
  time = 'now',
  at = 0.5,
  until,
  width = 620,
}) => {
  const theme = useTheme();
  const brand = useBrand();
  const {u} = useLayout();
  const {p, o} = useAppear(at, until);
  if (o <= 0.001) return null;
  return (
    <div style={{...glass(u), width: width * u, borderRadius: 30 * u, padding: `${22 * u}px ${26 * u}px`, fontFamily: theme.fontFamily, opacity: o, transform: `translateY(${(1 - p) * -40 * u}px) scale(${0.96 + 0.04 * p})`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12 * u, fontSize: 22 * u, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.04em'}}>
        <AppIconSmall size={34 * u} app={app} />
        <span style={{flex: 1}}>{app ?? brand.name}</span>
        <span style={{textTransform: 'none'}}>{time}</span>
      </div>
      {title && <div style={{marginTop: 12 * u, fontSize: 30 * u, fontWeight: 700}}>{title}</div>}
      <div style={{marginTop: title ? 4 * u : 12 * u, fontSize: 28 * u, lineHeight: 1.3, color: 'rgba(255,255,255,0.92)'}}>{text}</div>
    </div>
  );
};

/** Chat / transcript bubble; words light up progressively (karaoke) when `speak` is on. */
export const Bubble: React.FC<{from?: string; text: string; at?: number; until?: number; speak?: boolean; width?: number}> = ({from, text, at = 0.5, until, speak = true, width = 520}) => {
  const theme = useTheme();
  const brand = useBrand();
  const {u} = useLayout();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {p, o} = useAppear(at, until);
  if (o <= 0.001) return null;
  const words = text.split(/\s+/);
  const lit = speak ? (frame / fps - at - 0.2) / 0.16 : words.length;
  return (
    <div style={{...glass(u), width: width * u, borderRadius: 22 * u, padding: `${18 * u}px ${22 * u}px`, fontFamily: theme.fontFamily, opacity: o, transform: `translateY(${(1 - p) * 20 * u}px)`}}>
      <div style={{fontSize: 18 * u, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', gap: 8 * u}}>
        <span style={{width: 8 * u, height: 8 * u, borderRadius: 9, background: from && from.toLowerCase() === 'you' ? '#FFFFFF' : theme.accent}} />
        {from ?? brand.name}
      </div>
      <div style={{marginTop: 8 * u, fontSize: 30 * u, lineHeight: 1.3}}>
        {words.map((w, i) => (
          <span key={i} style={{color: i < lit ? '#FFFFFF' : 'rgba(255,255,255,0.4)'}}>
            {w}{' '}
          </span>
        ))}
      </div>
    </div>
  );
};

/** Small confirmation pill: "✓ Gym moved to 5:00 PM". */
export const Toast: React.FC<{text: string; at?: number; until?: number}> = ({text, at = 0.5, until}) => {
  const theme = useTheme();
  const {u} = useLayout();
  const {p, o} = useAppear(at, until);
  if (o <= 0.001) return null;
  return (
    <div style={{...glass(u), display: 'inline-flex', alignItems: 'center', gap: 12 * u, borderRadius: 16 * u, padding: `${12 * u}px ${20 * u}px`, fontFamily: theme.fontFamily, fontSize: 26 * u, opacity: o, transform: `scale(${0.9 + 0.1 * p})`}}>
      <span style={{width: 26 * u, height: 26 * u, borderRadius: 99, background: theme.accent2, color: '#0B0D10', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 * u, fontWeight: 800}}>✓</span>
      {text}
    </div>
  );
};

/** Monospace "what actually happened" chip, typed out. */
export const Chip: React.FC<{text: string; at?: number; until?: number; tone?: 'light' | 'dark'}> = ({text, at = 0.6, until, tone = 'light'}) => {
  const {u} = useLayout();
  const theme = useTheme();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {o} = useAppear(at, until);
  if (o <= 0.001) return null;
  const n = Math.floor(Math.max(0, frame / fps - at) * 45);
  const dark = tone === 'dark';
  return (
    <div
      style={{
        display: 'inline-block',
        fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 24 * u,
        padding: `${10 * u}px ${16 * u}px`,
        borderRadius: 10 * u,
        background: dark ? 'rgba(255,255,255,0.8)' : 'rgba(10,12,16,0.62)',
        color: dark ? '#16181C' : '#E9EDF2',
        border: `1px solid ${dark ? 'rgba(0,0,0,0.08)' : alpha(theme.accent, 0.35)}`,
        backdropFilter: `blur(${12 * u}px)`,
        opacity: o,
        whiteSpace: 'pre',
      }}
    >
      {text.slice(0, n)}
      {n < text.length && <span style={{opacity: 0.7}}>▍</span>}
    </div>
  );
};

/** "07:30" style time stamp with a small label. */
export const TimeStamp: React.FC<{time: string; label?: string; tone?: 'light' | 'dark'; at?: number}> = ({time, label, tone = 'light', at = 0}) => {
  const {u} = useLayout();
  const theme = useTheme();
  const {o} = useAppear(at);
  const c = tone === 'dark' ? 'rgba(22,24,28,0.75)' : 'rgba(255,255,255,0.85)';
  return (
    <div style={{display: 'flex', alignItems: 'baseline', gap: 14 * u, opacity: o, fontFamily: theme.fontFamily, color: c}}>
      <span style={{fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace', fontSize: 30 * u, letterSpacing: '0.04em'}}>{time}</span>
      {label && <span style={{fontSize: 24 * u, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.8}}>{label}</span>}
    </div>
  );
};
