import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {useEnter} from '../motion';
import {alpha, useLayout, useTheme} from '../theme';

/** Call-to-action button with a pop-in and a gentle shine sweep. */
export const Button: React.FC<{children: React.ReactNode; delay?: number; size?: number}> = ({children, delay = 0, size = 44}) => {
  const theme = useTheme();
  const {u} = useLayout();
  const frame = useCurrentFrame();
  const p = useEnter(delay, 'bouncy');
  const shine = interpolate(frame % 75, [0, 40], [-30, 130], {extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: `${size * 0.55 * u}px ${size * 1.3 * u}px`,
        borderRadius: 999,
        background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`,
        color: theme.bg,
        fontFamily: theme.fontFamily,
        fontWeight: 800,
        fontSize: size * u,
        letterSpacing: '-0.01em',
        boxShadow: `0 ${20 * u}px ${60 * u}px ${alpha(theme.accent, 0.45)}`,
        opacity: Math.min(1, p * 1.5),
        transform: `scale(${0.6 + 0.4 * p})`,
      }}
    >
      {children}
      <div style={{position: 'absolute', top: 0, bottom: 0, left: `${shine}%`, width: '25%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)', transform: 'skewX(-20deg)'}} />
    </div>
  );
};
