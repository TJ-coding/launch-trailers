import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {KineticText, RiseText} from '../components';
import {AppIcon, CameraRig, Stage3D, useImageTexture} from '../three';
import {useBrand, useLayout, useTheme} from '../theme';
import type {Logo3DScene} from '../spec';

/** App icon flies in spinning, lands with a bounce; name and tagline follow. */
export const Logo3D: React.FC<Logo3DScene> = ({tagline}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const brand = useBrand();
  const {height, portrait} = useLayout();
  const theme = useTheme();
  const logo = useImageTexture(brand.logo, {bg: theme.accent, fg: theme.bg, accent: theme.accent2, label: ''});
  const t = frame / fps;
  const s = spring({frame, fps, config: {damping: 11, stiffness: 70}});
  const spin = interpolate(t, [0, 1.3], [Math.PI * 3, 0], {extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1)});
  const wobble = Math.sin(t * 1.4) * 0.12 * Math.min(1, t / 1.5);
  return (
    <AbsoluteFill>
      <Stage3D>
        <CameraRig position={[0, portrait ? -0.9 : -0.75, portrait ? 13 : 9]} target={[0, portrait ? -0.9 : -0.75, 0]} />
        <group position={[0, 0.25, -6 * (1 - s)]} rotation={[0.25 * (1 - s) + 0.06, spin + wobble, 0]}>
          <AppIcon logo={logo} size={1.9} />
        </group>
      </Stage3D>
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: (portrait ? 0.3 : 0.17) * height, gap: 20}}>
        <KineticText text={brand.name} delay={0.8} size={portrait ? 110 : 120} />
        {(tagline ?? brand.tagline) && (
          <RiseText size={44} muted delay={1.3}>
            {tagline ?? brand.tagline}
          </RiseText>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
