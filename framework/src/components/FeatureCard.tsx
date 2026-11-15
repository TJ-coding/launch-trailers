import React from 'react';
import {pop, useEnter} from '../motion';
import {alpha, useLayout, useTheme} from '../theme';

/** Icon (emoji or short text) + title + one line, on a glassy card. */
export const FeatureCard: React.FC<{icon?: string; title: string; text?: string; delay?: number; width?: number}> = ({icon, title, text, delay = 0, width = 460}) => {
  const theme = useTheme();
  const {u} = useLayout();
  const p = useEnter(delay, 'snappy');
  return (
    <div
      style={{
        width: width * u,
        padding: 36 * u,
        borderRadius: theme.radius * 1.4 * u,
        background: alpha(theme.surface, 0.75),
        border: `1px solid ${alpha(theme.fg, 0.1)}`,
        boxShadow: `0 ${24 * u}px ${60 * u}px rgba(0,0,0,0.35)`,
        fontFamily: theme.fontFamily,
        display: 'flex',
        flexDirection: 'column',
        gap: 14 * u,
        ...pop(p),
      }}
    >
      {icon && (
        <div
          style={{
            width: 76 * u,
            height: 76 * u,
            borderRadius: 20 * u,
            background: alpha(theme.accent, 0.16),
            color: theme.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40 * u,
            fontWeight: 800,
          }}
        >
          {icon}
        </div>
      )}
      <div style={{fontSize: 40 * u, fontWeight: 700, color: theme.fg, letterSpacing: '-0.02em'}}>{title}</div>
      {text && <div style={{fontSize: 28 * u, color: theme.muted, lineHeight: 1.35}}>{text}</div>}
    </div>
  );
};
