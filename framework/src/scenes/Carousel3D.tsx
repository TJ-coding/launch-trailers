import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {RiseText} from '../components';
import {CameraRig, coverCrop, fitDistance, roundedPlane, Stage3D, textureAspect, useImageTextures} from '../three';
import {useLayout, useTheme} from '../theme';
import type {Carousel3DScene} from '../spec';

/** Cover-flow of screenshots on a curved arc; each item comes to the front in turn. */
export const Carousel3D: React.FC<Carousel3DScene & {duration?: number}> = ({items, title, aspect = 16 / 10, duration = 6}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {width, height, portrait} = useLayout();
  const theme = useTheme();
  const texs = useImageTextures(items.map((i) => i.media), {bg: theme.surface, fg: theme.fg, accent: theme.accent});
  const t = frame / fps;
  const n = Math.max(1, items.length);
  const per = duration / n;
  const W = 3.2;
  const H = W / aspect;
  const R = 5.5;
  const step = 0.6; // radians between panels
  // Index advances with an eased move in the first 0.6s of each slot.
  const k = Math.min(n - 1, Math.floor(t / per));
  const local = t - k * per;
  const idx = k === 0 ? 0 : k - 1 + interpolate(local, [0, 0.6], [0, 1], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const intro = interpolate(t, [0, 0.9], [1, 0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const dist = fitDistance(W * (portrait ? 1.15 : 2.1), H * 1.9, width / height, 1.0);
  return (
    <AbsoluteFill>
      <Stage3D>
        <CameraRig position={[0, 0.25 + intro * 1.2, R + dist + intro * 3]} target={[0, 0, R]} />
        <group rotation={[0, 0, 0]}>
          {items.map((it, i) => {
            const a = (i - idx) * step;
            const near = 1 - Math.min(1, Math.abs(i - idx));
            return <Panel key={i} tex={texs[i]} W={W} H={H} position={[R * Math.sin(a), 0, R * Math.cos(a)]} rotY={a} near={near} />;
          })}
        </group>
      </Stage3D>
      <AbsoluteFill style={{justifyContent: 'space-between', alignItems: 'center', padding: `${(portrait ? 0.12 : 0.07) * height}px 0`}}>
        <div>
          {title && (
            <RiseText size={portrait ? 72 : 64} weight={800}>
              {title}
            </RiseText>
          )}
        </div>
        <div style={{position: 'relative', height: 60, width: '100%'}}>
          {items.map((it, i) => (
            <Sequence key={i} from={Math.round((i === 0 ? 0 : i * per) * fps)} durationInFrames={Math.round(per * fps)} layout="none">
              <div style={{position: 'absolute', inset: 0}}>
                {it.label && (
                  <RiseText size={44} weight={700} delay={i === 0 ? 0.6 : 0.35}>
                    {it.label}
                  </RiseText>
                )}
              </div>
            </Sequence>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Panel: React.FC<{tex: THREE.Texture | null; W: number; H: number; position: [number, number, number]; rotY: number; near: number}> = ({tex, W, H, position, rotY, near}) => {
  const theme = useTheme();
  const crop = coverCrop(textureAspect(tex, W / H), W / H);
  const geo = useMemo(() => roundedPlane(W, H, 0.08, crop), [W, H, crop[0], crop[1], crop[2], crop[3]]); // eslint-disable-line react-hooks/exhaustive-deps
  const frameGeo = useMemo(() => roundedPlane(W + 0.05, H + 0.05, 0.1), [W, H]);
  const b = 0.35 + 0.65 * near;
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh geometry={frameGeo} position={[0, 0, -0.01]}>
        <meshBasicMaterial color={theme.accent} transparent opacity={0.9 * near} toneMapped={false} />
      </mesh>
      <mesh geometry={geo}>
        <meshBasicMaterial map={tex} color={new THREE.Color(b, b, b)} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {/* reflection */}
      <mesh geometry={geo} position={[0, -H - 0.08, 0]} scale={[1, -1, 1]}>
        <meshBasicMaterial map={tex} color={new THREE.Color(b, b, b)} transparent opacity={0.12 * (0.4 + near)} toneMapped={false} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
};
