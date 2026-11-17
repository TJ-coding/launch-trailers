import React from 'react';
import {Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {alpha, useLayout, useTheme} from '../theme';
import {hasFile} from './Media';

const VIDEO = /\.(mp4|webm|mov|m4v)$/i;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export type WidgetSource = {
  media?: string;
  crop?: [number, number, number, number]; // x, y, w, h fractions of the media
  mediaAspect?: number; // media width / height (default 16/10)
  startFrom?: number; // seconds into the recording
  playbackRate?: number;
  focus?: {x: number; y: number; scale: number; at?: number; until?: number};
};

/** Aspect (w / h) of the cropped component. */
export const widgetAspect = ({crop = [0, 0, 1, 1], mediaAspect = 16 / 10}: WidgetSource) => (crop[2] * mediaAspect) / crop[3];

/**
 * One component of the product at work: a crop of a screen recording (or
 * screenshot) on its own card, `width` px wide. It rises in at `at` seconds;
 * the recording starts playing when the card appears.
 */
export const WidgetCard: React.FC<WidgetSource & {width: number; at?: number; duration?: number; glass?: boolean}> = ({
  media,
  crop = [0, 0, 1, 1],
  mediaAspect = 16 / 10,
  startFrom = 0,
  playbackRate = 1,
  focus,
  width,
  at = 0,
  duration = 4,
  glass = false,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const theme = useTheme();
  const {u} = useLayout();
  const t = frame / fps - at;
  const [cx, cy, cw, ch] = crop;
  const W = width;
  const H = W / widgetAspect({crop, mediaAspect});
  const innerW = W / cw;
  const innerH = innerW / mediaAspect;
  const enter = interpolate(t, [0, 0.6], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)});
  const drift = interpolate(t, [0, duration], [1, 1.03], clamp);
  // Punch-in: scale the recording around the focus point, kept inside the card.
  const fAt = focus?.at ?? 0.9;
  const ease = Easing.bezier(0.65, 0, 0.35, 1);
  const fIn = focus ? interpolate(t, [fAt, fAt + 0.7], [0, 1], {...clamp, easing: ease}) : 0;
  const fOut = focus?.until !== undefined ? interpolate(t, [focus.until, focus.until + 0.6], [0, 1], {...clamp, easing: ease}) : 0;
  const fs = 1 + ((focus?.scale ?? 1) - 1) * fIn * (1 - fOut);
  if (t < 0) return null;
  const ok = hasFile(media);
  const mediaStyle: React.CSSProperties = {position: 'absolute', left: -cx * innerW, top: -cy * innerH, width: innerW, height: innerH, maxWidth: 'none'};
  return (
    <div
      style={{
        position: 'relative',
        width: W,
        height: H,
        borderRadius: theme.radius * u,
        overflow: 'hidden',
        background: theme.surface,
        border: `1px solid ${glass ? 'rgba(255,255,255,0.18)' : alpha(theme.fg, 0.12)}`,
        boxShadow: `0 ${40 * u}px ${100 * u}px rgba(0,0,0,0.55), 0 0 ${120 * u}px ${alpha(theme.accent, 0.12)}`,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 50 * u}px) scale(${(0.96 + 0.04 * enter) * drift})`,
        filter: `blur(${(1 - enter) * 8 * u}px)`,
      }}
    >
      <div style={{position: 'absolute', inset: 0, transform: `scale(${fs})`, transformOrigin: `${(focus?.x ?? 0.5) * 100}% ${(focus?.y ?? 0.5) * 100}%`}}>
      {ok ? (
        <Sequence from={Math.round(at * fps)} layout="none">
          {VIDEO.test(media!) ? (
            <OffthreadVideo src={staticFile(media!)} muted startFrom={Math.round(startFrom * fps)} playbackRate={playbackRate} style={mediaStyle} />
          ) : (
            <Img src={staticFile(media!)} style={mediaStyle} />
          )}
        </Sequence>
      ) : (
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.muted, fontFamily: theme.fontFamily, fontSize: 26 * u}}>
          {media ? `missing: public/${media}` : 'component recording goes here'}
        </div>
      )}
      </div>
    </div>
  );
};
