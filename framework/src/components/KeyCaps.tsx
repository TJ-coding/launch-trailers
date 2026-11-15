import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SPRINGS} from '../motion';
import {alpha, useLayout, useTheme} from '../theme';

/** Keyboard keys that appear and press down one after another. */
export const KeyCaps: React.FC<{keys: string[]; delay?: number; stagger?: number; size?: number}> = ({keys, delay = 0.2, stagger = 0.25, size = 150}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const theme = useTheme();
  const {u} = useLayout();
  const s = size * u;
  const pressAt = delay + keys.length * stagger + 0.2;
  const press = spring({frame: frame - Math.round(pressAt * fps), fps, config: SPRINGS.bouncy});
  return (
    <div style={{display: 'flex', gap: s * 0.2, alignItems: 'center'}}>
      {keys.map((k, i) => {
        const p = spring({frame: frame - Math.round((delay + i * stagger) * fps), fps, config: SPRINGS.bouncy});
        const down = Math.min(1, press) * (1 - Math.max(0, press - 1) * 4);
        const wide = k.length > 2;
        return (
          <React.Fragment key={i}>
            {i > 0 && <div style={{color: theme.muted, fontFamily: theme.fontFamily, fontSize: s * 0.35, fontWeight: 500, opacity: p}}>+</div>}
            <div
              style={{
                minWidth: s,
                height: s,
                padding: wide ? `0 ${s * 0.25}px` : 0,
                borderRadius: s * 0.2,
                background: `linear-gradient(180deg, ${alpha(theme.fg, 0.14)}, ${alpha(theme.fg, 0.06)})`,
                border: `${2 * u}px solid ${alpha(theme.fg, 0.18)}`,
                boxShadow: `0 ${(1 - down) * s * 0.08}px 0 ${alpha(theme.fg, 0.12)}, 0 ${s * 0.2}px ${s * 0.4}px rgba(0,0,0,0.4)${down > 0.5 ? `, 0 0 ${s * 0.4}px ${alpha(theme.accent, 0.5)}` : ''}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: theme.fontFamily,
                fontSize: wide ? s * 0.3 : s * 0.45,
                fontWeight: 600,
                color: down > 0.5 ? theme.accent : theme.fg,
                opacity: Math.min(1, p * 1.5),
                transform: `translateY(${(1 - p) * s * 0.5 + down * s * 0.06}px) scale(${0.7 + 0.3 * p})`,
              }}
            >
              {k}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
