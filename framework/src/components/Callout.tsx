import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SPRINGS} from '../motion';
import {alpha, useLayout, useTheme} from '../theme';
import type {CalloutSpec} from '../spec';

/**
 * Highlight ring around a region of the media (fractions), with an optional
 * label. Place inside <ZoomPan> and pass its scale so the label stays readable.
 */
export const Callout: React.FC<CalloutSpec & {scale?: number}> = ({x, y, w, h, label, at = 0.5, until, side = 'bottom', scale = 1}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const theme = useTheme();
  const {u} = useLayout();
  const inP = spring({frame: frame - Math.round(at * fps), fps, config: SPRINGS.snappy});
  const outP = until === undefined ? 0 : interpolate(frame, [until * fps, until * fps + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const o = inP * (1 - outP);
  if (o <= 0.001) return null;
  const k = 1 / scale;
  const labelPos: React.CSSProperties =
    side === 'top'
      ? {bottom: '100%', left: '50%', transform: `translate(-50%, ${-12 * u * k}px) scale(${k})`, transformOrigin: 'bottom center'}
      : side === 'left'
        ? {right: '100%', top: '50%', transform: `translate(${-14 * u * k}px, -50%) scale(${k})`, transformOrigin: 'right center'}
        : side === 'right'
          ? {left: '100%', top: '50%', transform: `translate(${14 * u * k}px, -50%) scale(${k})`, transformOrigin: 'left center'}
          : {top: '100%', left: '50%', transform: `translate(-50%, ${12 * u * k}px) scale(${k})`, transformOrigin: 'top center'};
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: `${w * 100}%`,
        height: `${h * 100}%`,
        opacity: o,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 12 * u * k,
          border: `${3 * u * k}px solid ${theme.accent}`,
          boxShadow: `0 0 0 ${9999}px ${alpha('#000000', 0.28 * o)}, 0 0 ${30 * u * k}px ${alpha(theme.accent, 0.6)}`,
          transform: `scale(${1.15 - 0.15 * inP})`,
        }}
      />
      {label && (
        <div
          style={{
            position: 'absolute',
            ...labelPos,
            whiteSpace: 'nowrap',
            padding: `${10 * u}px ${20 * u}px`,
            borderRadius: 999,
            background: theme.accent,
            color: theme.bg,
            fontFamily: theme.fontFamily,
            fontWeight: 700,
            fontSize: 28 * u,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
