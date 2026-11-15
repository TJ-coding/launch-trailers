import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {defaultAspect, DeviceFrame, Media, Pill, RiseText} from '../components';
import {useTime} from '../motion';
import {alpha, useLayout, useTheme} from '../theme';
import {fitDevice} from './Screen';
import type {BeforeAfterScene} from '../spec';

type Side = BeforeAfterScene['before'];

/**
 * Before → after. With media on both sides: one frame, a wipe reveals the
 * "after" screenshot. Otherwise: two lists side by side.
 */
export const BeforeAfter: React.FC<BeforeAfterScene & {duration?: number}> = ({title, before, after, frame = 'browser', aspect, duration = 5}) => {
  const theme = useTheme();
  const {u, width, height, portrait} = useLayout();
  const t = useTime();
  const a = aspect ?? defaultAspect(frame);

  if (before.media || after.media) {
    const w = fitDevice(frame, a, width - (portrait ? 100 : 300) * u, height - (portrait ? 640 : 340) * u);
    const wipe = interpolate(t, [duration * 0.35, duration * 0.35 + 1.1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * u}}>
        {title && (
          <RiseText size={64} weight={800}>
            {title}
          </RiseText>
        )}
        <DeviceFrame frame={frame} width={w} aspect={a}>
          <Media src={before.media} />
          <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${(1 - wipe) * 100}%)`}}>
            <Media src={after.media} />
          </div>
          <div style={{position: 'absolute', top: 0, bottom: 0, left: `${(1 - wipe) * 100}%`, width: 4 * u, background: theme.accent, boxShadow: `0 0 ${24 * u}px ${theme.accent}`, opacity: wipe > 0 && wipe < 1 ? 1 : 0}} />
          <div style={{position: 'absolute', top: 24 * u, left: 24 * u}}>
            <Pill size={24} style={{background: alpha(theme.bg, 0.8)}}>
              {wipe < 0.5 ? before.label ?? 'Before' : after.label ?? 'After'}
            </Pill>
          </div>
        </DeviceFrame>
      </AbsoluteFill>
    );
  }

  const col = (s: Side, i: number, good: boolean) => (
    <div
      style={{
        flex: 1,
        padding: 44 * u,
        borderRadius: theme.radius * 1.4 * u,
        background: alpha(good ? theme.accent : theme.fg, good ? 0.1 : 0.04),
        border: `${2 * u}px solid ${alpha(good ? theme.accent : theme.fg, good ? 0.5 : 0.1)}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 22 * u,
      }}
    >
      <Pill size={26} delay={0.2 + i * 1.2} solid={good} style={{alignSelf: 'flex-start'}}>
        {s.label ?? (good ? 'After' : 'Before')}
      </Pill>
      {(s.items ?? []).map((it, j) => (
        <RiseText key={j} align="left" size={42} weight={600} delay={0.45 + i * 1.2 + j * 0.15} color={good ? theme.fg : theme.muted}>
          {good ? '✓ ' : '× '}
          {it}
        </RiseText>
      ))}
    </div>
  );
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 50 * u, padding: portrait ? `${200 * u}px ${70 * u}px` : `${90 * u}px ${150 * u}px`}}>
      {title && (
        <RiseText size={64} weight={800}>
          {title}
        </RiseText>
      )}
      <div style={{display: 'flex', flexDirection: portrait ? 'column' : 'row', gap: 40 * u, width: '100%'}}>
        {col(before, 0, false)}
        {col(after, 1, true)}
      </div>
    </AbsoluteFill>
  );
};
