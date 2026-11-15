import React from 'react';
import {keyframes, useTime} from '../motion';
import type {ZoomKey} from '../spec';

/**
 * Camera move over its children: each key focuses point (x, y) (fractions)
 * at `scale`, at `at` seconds. Edges never come into view. Children render in
 * media coordinates, so callouts and cursors placed inside follow the zoom.
 * Pass `render` to get the current scale (for counter-scaling labels).
 */
export const ZoomPan: React.FC<{keys?: ZoomKey[]; children: (scale: number) => React.ReactNode}> = ({keys = [], children}) => {
  const t = useTime();
  const scale = keys.length ? Math.max(1, keyframes(keys, t, 'scale')) : 1;
  const x = keys.length ? keyframes(keys, t, 'x') : 0.5;
  const y = keys.length ? keyframes(keys, t, 'y') : 0.5;
  const lim = (scale - 1) * 50;
  const tx = Math.max(-lim, Math.min(lim, -(x - 0.5) * scale * 100));
  const ty = Math.max(-lim, Math.min(lim, -(y - 0.5) * scale * 100));
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${tx}%, ${ty}%) scale(${scale})`, transformOrigin: '50% 50%'}}>{children(scale)}</div>
  );
};
