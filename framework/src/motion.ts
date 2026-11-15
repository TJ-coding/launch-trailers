import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {CSSProperties} from 'react';

export const SPRINGS = {
  soft: {damping: 200},
  snappy: {damping: 20, stiffness: 200},
  bouncy: {damping: 12, stiffness: 160},
} as const;

/** 0→1 spring that starts `delay` seconds into the current sequence. */
export const useEnter = (delay = 0, config: keyof typeof SPRINGS = 'soft') => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - Math.round(delay * fps), fps, config: SPRINGS[config]});
};

/** Seconds elapsed in the current sequence. */
export const useTime = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return frame / fps;
};

/** Fade + rise style from a 0→1 progress value. */
export const rise = (p: number, distance = 40): CSSProperties => ({
  opacity: p,
  transform: `translateY(${(1 - p) * distance}px)`,
});

export const pop = (p: number): CSSProperties => ({
  opacity: Math.min(1, p * 1.5),
  transform: `scale(${0.85 + 0.15 * p})`,
});

/** Interpolate through keyframes [{at, ...values}] by time in seconds, eased. */
export const keyframes = <K extends {at: number}>(keys: K[], t: number, field: keyof K): number => {
  if (!keys.length) return 0;
  const sorted = [...keys].sort((a, b) => a.at - b.at);
  if (sorted.length === 1) return sorted[0][field] as unknown as number;
  return interpolate(
    t,
    sorted.map((k, i) => k.at + i * 1e-6), // strictly increasing even with equal `at`s
    sorted.map((k) => k[field] as unknown as number),
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)},
  );
};

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
