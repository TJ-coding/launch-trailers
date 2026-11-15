import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {hasFile, RiseText} from '../components';
import {alpha, useLayout, useTheme} from '../theme';
import type {WidgetScene} from '../spec';

const VIDEO = /\.(mp4|webm|mov|m4v)$/i;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * One component of the product at work: a crop of a screen recording (or
 * screenshot), lifted out of the app and played big on its own card.
 */
export const Widget: React.FC<WidgetScene & {duration?: number}> = ({media, crop = [0, 0, 1, 1], mediaAspect = 16 / 10, startFrom = 0, playbackRate = 1, title, caption, duration = 4}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const theme = useTheme();
  const {u, width, height, portrait} = useLayout();
  const t = frame / fps;
  const [cx, cy, cw, ch] = crop;
  const aspect = (cw * mediaAspect) / ch; // of the cropped component
  const hasText = Boolean(title || caption);
  const boxW = width - (portrait ? 90 : 220) * u;
  const boxH = height - (hasText ? (portrait ? 560 : 330) : 160) * u;
  const W = Math.min(boxW, boxH * aspect);
  const H = W / aspect;
  const innerW = W / cw;
  const innerH = innerW / mediaAspect;

  const enter = interpolate(t, [0, 0.6], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)});
  const drift = interpolate(t, [0, duration], [1, 1.035], clamp);
  const ok = hasFile(media);
  const mediaStyle: React.CSSProperties = {position: 'absolute', left: -cx * innerW, top: -cy * innerH, width: innerW, height: innerH, maxWidth: 'none'};

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: (portrait ? 60 : 40) * u}}>
      {hasText && (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 * u}}>
          {title && (
            <RiseText size={portrait ? 72 : 64} weight={800} delay={0.1}>
              {title}
            </RiseText>
          )}
          {caption && (
            <RiseText size={34} muted delay={0.3}>
              {caption}
            </RiseText>
          )}
        </div>
      )}
      <div
        style={{
          position: 'relative',
          width: W,
          height: H,
          borderRadius: theme.radius * u,
          overflow: 'hidden',
          background: theme.surface,
          border: `1px solid ${alpha(theme.fg, 0.12)}`,
          boxShadow: `0 ${40 * u}px ${100 * u}px rgba(0,0,0,0.55), 0 0 ${120 * u}px ${alpha(theme.accent, 0.12)}`,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 60 * u}px) scale(${(0.96 + 0.04 * enter) * drift})`,
          filter: `blur(${(1 - enter) * 8 * u}px)`,
        }}
      >
        {ok ? (
          VIDEO.test(media!) ? (
            <OffthreadVideo src={staticFile(media!)} muted startFrom={Math.round(startFrom * fps)} playbackRate={playbackRate} style={mediaStyle} />
          ) : (
            <Img src={staticFile(media!)} style={mediaStyle} />
          )
        ) : (
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.muted, fontFamily: theme.fontFamily, fontSize: 28 * u}}>
            {media ? `missing: public/${media}` : 'component recording goes here'}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
