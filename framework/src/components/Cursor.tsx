import React from 'react';
import {interpolate} from 'remotion';
import {keyframes, useTime} from '../motion';
import {alpha, useLayout, useTheme} from '../theme';
import type {CursorKey} from '../spec';

/** Animated pointer moving through `path` (fractions of the media); `click` keys ripple. */
export const Cursor: React.FC<{path: CursorKey[]; scale?: number}> = ({path, scale = 1}) => {
  const t = useTime();
  const theme = useTheme();
  const {u} = useLayout();
  if (!path.length) return null;
  const start = Math.min(...path.map((p) => p.at));
  const x = keyframes(path, t, 'x');
  const y = keyframes(path, t, 'y');
  const appear = interpolate(t, [start - 0.3, start], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const clicks = path.filter((p) => p.click);
  const press = clicks.reduce((m, c) => Math.max(m, interpolate(t, [c.at - 0.05, c.at, c.at + 0.15], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})), 0);
  const k = 1 / scale;
  const size = 44 * u * k;
  return (
    <div style={{position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, opacity: appear, zIndex: 10}}>
      {clicks.map((c, i) => {
        const r = interpolate(t, [c.at, c.at + 0.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        if (r <= 0 || r >= 1) return null;
        const d = 120 * u * k * r;
        return (
          <div
            key={i}
            style={{position: 'absolute', left: -d / 2, top: -d / 2, width: d, height: d, borderRadius: 999, border: `${3 * u * k}px solid ${theme.accent}`, background: alpha(theme.accent, 0.15), opacity: 1 - r}}
          />
        );
      })}
      <svg width={size} height={size} viewBox="0 0 24 24" style={{transform: `scale(${1 - 0.15 * press})`, transformOrigin: '0 0', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'}}>
        <path d="M3 2l16 9.5-7 1.5-3.5 7z" fill="#FFFFFF" stroke="#111" strokeWidth={1.2} strokeLinejoin="round" />
      </svg>
    </div>
  );
};
