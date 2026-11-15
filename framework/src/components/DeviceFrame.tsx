import React from 'react';
import {alpha, useLayout, useTheme} from '../theme';
import type {Frame} from '../spec';

/**
 * Wraps content in browser / app window / phone chrome. `width` is the outer
 * width in px; the screen area keeps `aspect` (width / height).
 */
export const DeviceFrame: React.FC<{frame?: Frame; width: number; aspect: number; url?: string; title?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({
  frame = 'browser',
  width,
  aspect,
  url,
  title,
  children,
  style,
}) => {
  const theme = useTheme();
  const {u} = useLayout();
  const r = theme.radius * u;
  const shadow = `0 ${40 * u}px ${120 * u}px rgba(0,0,0,0.55), 0 0 0 1px ${alpha(theme.fg, 0.1)}`;

  if (frame === 'none') {
    return <div style={{width, height: width / aspect, borderRadius: r, overflow: 'hidden', boxShadow: shadow, position: 'relative', ...style}}>{children}</div>;
  }
  if (frame === 'phone') {
    const bezel = width * 0.035;
    const inner = width - bezel * 2;
    return (
      <div style={{width, padding: bezel, borderRadius: width * 0.16, background: '#0A0A0C', boxShadow: shadow, ...style}}>
        <div style={{width: inner, height: inner / aspect, borderRadius: width * 0.13, overflow: 'hidden', position: 'relative'}}>
          {children}
          <div style={{position: 'absolute', top: inner * 0.03, left: '50%', transform: 'translateX(-50%)', width: inner * 0.3, height: inner * 0.085, borderRadius: 999, background: '#000'}} />
        </div>
      </div>
    );
  }
  const barH = 44 * u * (width / (1400 * u));
  const dot = (c: string) => <div style={{width: barH * 0.28, height: barH * 0.28, borderRadius: 999, background: c}} />;
  return (
    <div style={{width, borderRadius: r, overflow: 'hidden', background: theme.surface, boxShadow: shadow, ...style}}>
      <div style={{height: barH, display: 'flex', alignItems: 'center', gap: barH * 0.18, padding: `0 ${barH * 0.4}px`, background: alpha(theme.fg, 0.05), borderBottom: `1px solid ${alpha(theme.fg, 0.08)}`}}>
        {dot('#FF5F57')}
        {dot('#FEBC2E')}
        {dot('#28C840')}
        {frame === 'browser' ? (
          <div
            style={{
              flex: 1,
              margin: `0 ${barH * 1.5}px`,
              height: barH * 0.6,
              borderRadius: 999,
              background: alpha(theme.fg, 0.07),
              color: theme.muted,
              fontFamily: theme.fontFamily,
              fontSize: barH * 0.32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {url ?? ''}
          </div>
        ) : (
          <div style={{flex: 1, textAlign: 'center', color: theme.muted, fontFamily: theme.fontFamily, fontSize: barH * 0.34, fontWeight: 500, marginRight: barH * 1.2}}>{title ?? ''}</div>
        )}
      </div>
      <div style={{width, height: width / aspect, overflow: 'hidden', position: 'relative'}}>{children}</div>
    </div>
  );
};

export const defaultAspect = (frame?: Frame) => (frame === 'phone' ? 9 / 19.5 : 16 / 10);
