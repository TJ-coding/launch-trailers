import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SPRINGS} from '../motion';
import {useLayout, useTheme} from '../theme';

/**
 * Word-by-word reveal. `accentWords` are coloured with the accent gradient.
 * `size` is in layout units (px at 1080p).
 */
export const KineticText: React.FC<{
  text: string;
  size?: number;
  weight?: number;
  delay?: number; // seconds before the first word
  stagger?: number; // seconds between words
  accentWords?: string[];
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: React.CSSProperties;
}> = ({text, size = 110, weight = 800, delay = 0, stagger = 0.08, accentWords = [], color, align = 'center', style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const theme = useTheme();
  const {u} = useLayout();
  const accents = accentWords.map((w) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ''));
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <div
      style={{
        fontFamily: theme.fontFamily,
        fontSize: size * u,
        fontWeight: weight,
        lineHeight: 1.05,
        letterSpacing: '-0.03em',
        color: color ?? theme.fg,
        textAlign: align,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        columnGap: '0.25em',
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = spring({frame: frame - Math.round((delay + i * stagger) * fps), fps, config: SPRINGS.snappy});
        const isAccent = accents.includes(w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ''));
        return (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: '0.08em'}}>
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${(1 - p) * 100}%)`,
                opacity: Math.min(1, p * 2),
                ...(isAccent
                  ? {background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}
                  : {}),
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};
