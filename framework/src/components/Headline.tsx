import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {alpha, useLayout, useTheme} from '../theme';

/** Splits "Close the day *calm*." into words, marking *accent* ones. */
export type Word = {parts: {text: string; accent: boolean}[]};
export const parseAccent = (text: string): Word[] => {
  const out: Word[] = [];
  let accent = false;
  let glue = false; // previous chunk ended without whitespace: continue that word
  for (const raw of text.split(/(\*)/)) {
    if (raw === '*') {
      accent = !accent;
      continue;
    }
    if (!raw) continue;
    const tokens = raw.split(/(\s+)/);
    tokens.forEach((tok, i) => {
      if (!tok) return;
      if (/^\s+$/.test(tok)) {
        glue = false;
        return;
      }
      if (glue && out.length && i === 0) out[out.length - 1].parts.push({text: tok, accent});
      else out.push({parts: [{text: tok, accent}]});
      glue = true;
    });
  }
  return out;
};

/**
 * Editorial headline: display serif (theme.display), words drift up softly,
 * *accent* words in italic accent colour. `tone` dark = ink text for bright photos.
 */
export const Headline: React.FC<{
  text: string;
  size?: number;
  delay?: number;
  tone?: 'light' | 'dark';
  align?: 'left' | 'center' | 'right';
  maxWidth?: number;
  style?: React.CSSProperties;
}> = ({text, size = 96, delay = 0.2, tone = 'light', align = 'left', maxWidth = 1100, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const theme = useTheme();
  const {u} = useLayout();
  const words = parseAccent(text);
  const ink = tone === 'dark' ? '#16181C' : '#FFFFFF';
  const accent = tone === 'dark' ? theme.accentInk : theme.accent;
  return (
    <div
      style={{
        fontFamily: theme.displayFamily,
        fontSize: size * u,
        fontWeight: theme.displayWeight,
        lineHeight: 1.04,
        letterSpacing: theme.displayWeight > 500 ? '-0.03em' : '-0.015em',
        color: ink,
        textAlign: align,
        maxWidth: maxWidth * u,
        textShadow: tone === 'light' ? `0 ${2 * u}px ${24 * u}px ${alpha('#000000', 0.45)}` : 'none',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        columnGap: '0.24em',
        ...style,
      }}
    >
      {words.map(({parts}, i) => {
        const p = spring({frame: frame - Math.round((delay + i * 0.07) * fps), fps, config: {damping: 200}, durationInFrames: Math.round(0.9 * fps)});
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: p,
              transform: `translateY(${(1 - p) * 0.35}em)`,
              filter: `blur(${(1 - p) * 6 * u}px)`,
            }}
          >
            {parts.map((pt, j) => (
              <span
                key={j}
                style={
                  pt.accent
                    ? theme.displayWeight > 500
                      ? {background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}
                      : {fontStyle: 'italic', color: accent, paddingRight: '0.04em'}
                    : undefined
                }
              >
                {pt.text}
              </span>
            ))}
          </span>
        );
      })}
    </div>
  );
};
