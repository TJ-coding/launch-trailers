import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {alpha, useLayout, useTheme} from '../theme';

/** Full-frame backdrop: slow-drifting glow plus an optional grid or dot texture. */
export const Background: React.FC<{variant?: 'gradient' | 'grid' | 'dots' | 'solid'; intensity?: number}> = ({variant, intensity = 1}) => {
  const theme = useTheme();
  const {u} = useLayout();
  const frame = useCurrentFrame();
  const v = variant ?? theme.background;
  const drift = Math.sin(frame / 90) * 8;
  const glow =
    v === 'solid'
      ? 'none'
      : `radial-gradient(60% 55% at ${30 + drift}% ${25 - drift / 2}%, ${alpha(theme.accent, 0.22 * intensity)}, transparent 70%),
         radial-gradient(50% 50% at ${75 - drift}% ${80 + drift / 2}%, ${alpha(theme.accent2, 0.18 * intensity)}, transparent 70%),
         linear-gradient(160deg, ${theme.bg} 0%, ${theme.bg2} 100%)`;
  const step = 64 * u;
  const texture =
    v === 'grid'
      ? `linear-gradient(${alpha(theme.fg, 0.07)} 1px, transparent 1px) 0 0 / ${step}px ${step}px,
         linear-gradient(90deg, ${alpha(theme.fg, 0.07)} 1px, transparent 1px) 0 0 / ${step}px ${step}px`
      : v === 'dots'
        ? `radial-gradient(${alpha(theme.fg, 0.09)} 1.2px, transparent 1.2px) 0 0 / ${step / 2}px ${step / 2}px`
        : undefined;
  return (
    <AbsoluteFill style={{background: theme.bg}}>
      <AbsoluteFill style={{background: glow}} />
      {texture && (
        <AbsoluteFill
          style={{background: texture, maskImage: 'radial-gradient(70% 70% at 50% 50%, black, transparent)', WebkitMaskImage: 'radial-gradient(70% 70% at 50% 50%, black, transparent)'}}
        />
      )}
    </AbsoluteFill>
  );
};
