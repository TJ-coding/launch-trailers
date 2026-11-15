import React from 'react';
import {interpolate} from 'remotion';
import {RiseText, Stage} from '../components';
import {useTime} from '../motion';
import {alpha, useLayout, useTheme} from '../theme';
import type {ProblemScene} from '../spec';

/** The pain: a title and items that appear one by one, then get struck through. */
export const Problem: React.FC<ProblemScene & {duration?: number}> = ({title, items, strike = true, duration = 4}) => {
  const theme = useTheme();
  const {u} = useLayout();
  const t = useTime();
  const step = Math.min(0.45, (duration * 0.55) / Math.max(1, items.length));
  const strikeAt = 0.4 + items.length * step + 0.3;
  return (
    <Stage gap={28}>
      {title && (
        <RiseText size={52} muted weight={600}>
          {title}
        </RiseText>
      )}
      {items.map((it, i) => {
        const s = strike ? interpolate(t, [strikeAt + i * 0.12, strikeAt + i * 0.12 + 0.3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
        return (
          <RiseText key={i} delay={0.4 + i * step} size={84} weight={700} color={s > 0.5 ? alpha(theme.fg, 0.45) : theme.fg}>
            <span style={{position: 'relative', display: 'inline-block'}}>
              {it}
              <span style={{position: 'absolute', left: -10 * u, top: '54%', height: 8 * u, borderRadius: 8 * u, width: `calc(${s * 100}% + ${20 * u * s}px)`, background: '#FF5F57'}} />
            </span>
          </RiseText>
        );
      })}
    </Stage>
  );
};
