import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useVideoConfig} from 'remotion';
import {defaultAspect, DeviceFrame, Media, RiseText} from '../components';
import {useTime} from '../motion';
import {useLayout} from '../theme';
import {fitDevice} from './Screen';
import type {MontageScene} from '../spec';

/** Quick cuts through several screens, each with a label: "and it does all this". */
export const Montage: React.FC<MontageScene & {duration?: number}> = ({title, items, frame = 'browser', aspect, duration = 4}) => {
  const {fps} = useVideoConfig();
  const {u, width, height, portrait} = useLayout();
  const a = aspect ?? defaultAspect(frame);
  const per = Math.max(1, Math.floor((duration * fps) / Math.max(1, items.length)));
  const w = fitDevice(frame, a, width - (portrait ? 100 : 360) * u, height - (portrait ? 640 : 360) * u);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * u}}>
      {title && (
        <RiseText size={60} weight={800}>
          {title}
        </RiseText>
      )}
      <div style={{position: 'relative', width: w, height: w / a + w * 0.05}}>
        {items.map((it, i) => (
          <Sequence key={i} from={i * per} durationInFrames={i === items.length - 1 ? Infinity : per} layout="none">
            <Cut w={w} a={a} frame={frame} media={it.media} label={it.label} />
          </Sequence>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Cut: React.FC<{w: number; a: number; frame: MontageScene['frame']; media?: string; label?: string}> = ({w, a, frame, media, label}) => {
  const t = useTime();
  const {u} = useLayout();
  const p = interpolate(t, [0, 0.25], [0, 1], {extrapolateRight: 'clamp'});
  const drift = 1.04 - 0.04 * Math.min(1, t / 1.5);
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 * u, opacity: p, transform: `scale(${drift})`}}>
      <DeviceFrame frame={frame} width={w} aspect={a}>
        <Media src={media} />
      </DeviceFrame>
      {label && (
        <RiseText size={40} weight={600}>
          {label}
        </RiseText>
      )}
    </div>
  );
};
