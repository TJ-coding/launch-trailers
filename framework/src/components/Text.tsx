import React from 'react';
import {rise, useEnter} from '../motion';
import {useLayout, useTheme} from '../theme';

/** Simple rising text line: headings, captions, labels. */
export const RiseText: React.FC<{
  children: React.ReactNode;
  size?: number;
  weight?: number;
  delay?: number;
  muted?: boolean;
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: React.CSSProperties;
}> = ({children, size = 44, weight = 500, delay = 0, muted, color, align = 'center', style}) => {
  const theme = useTheme();
  const {u} = useLayout();
  const p = useEnter(delay);
  return (
    <div
      style={{
        fontFamily: theme.fontFamily,
        fontSize: size * u,
        fontWeight: weight,
        lineHeight: 1.2,
        letterSpacing: size > 60 ? '-0.025em' : '-0.01em',
        color: color ?? (muted ? theme.muted : theme.fg),
        textAlign: align,
        ...rise(p, 30 * u),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Small rounded label, e.g. "NEW", "v2.0", "Before". */
export const Pill: React.FC<{children: React.ReactNode; delay?: number; size?: number; solid?: boolean; style?: React.CSSProperties}> = ({
  children,
  delay = 0,
  size = 30,
  solid = false,
  style,
}) => {
  const theme = useTheme();
  const {u} = useLayout();
  const p = useEnter(delay, 'bouncy');
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10 * u,
        padding: `${10 * u}px ${24 * u}px`,
        borderRadius: 999,
        fontFamily: theme.fontFamily,
        fontWeight: 700,
        fontSize: size * u,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: solid ? theme.bg : theme.accent,
        background: solid ? `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})` : 'transparent',
        border: solid ? 'none' : `${2 * u}px solid ${theme.accent}`,
        opacity: Math.min(1, p * 1.5),
        transform: `scale(${0.6 + 0.4 * p})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
