import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {RiseText} from '../components';
import {CameraRig, coverCrop, fitDistance, roundedPlane, Stage3D, textureAspect, useImageTexture, type Crop} from '../three';
import {useLayout, useTheme} from '../theme';
import type {AssembleScene} from '../spec';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * Decomposed UI. `assemble`: the widgets (pieces) fly in from all sides and
 * snap into their slots, then the screen turns flat to camera.
 * `explode`: the flat screen tilts and its widgets lift off in layers.
 */
export const Assemble: React.FC<AssembleScene & {duration?: number}> = ({media, pieces, mode = 'assemble', aspect, title, caption, duration = 5}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const theme = useTheme();
  const {width, height, portrait} = useLayout();
  const t = frame / fps;
  const tex = useImageTexture(media, {bg: theme.surface, fg: theme.fg, accent: theme.accent});
  const a = aspect ?? textureAspect(tex, 16 / 10);
  const W = 4;
  const H = W / a;
  const hasText = Boolean(title || caption);
  const avail = hasText ? (portrait ? 0.62 : 0.74) : 0.9;
  const dist = fitDistance(W * 1.05, (H * 1.25) / avail, width / height, 1.05);
  const lift = hasText ? ((H * 1.25) / avail) * (portrait ? 0.16 : 0.11) : 0;
  const imgCrop = coverCrop(textureAspect(tex, a), a);
  const baseGeo = useMemo(() => roundedPlane(W, H, 0.06, imgCrop), [H, imgCrop[0], imgCrop[1], imgCrop[2], imgCrop[3]]); // eslint-disable-line react-hooks/exhaustive-deps

  // Group tilt: isometric while pieces move, flat at the end (assemble) / the reverse (explode).
  const tiltP =
    mode === 'assemble'
      ? interpolate(t, [Math.max(1.2, duration * 0.62), Math.max(1.2, duration * 0.62) + 1.2], [1, 0], {...clamp, easing: Easing.inOut(Easing.cubic)})
      : interpolate(t, [0.3, 1.6], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const rotX = -0.62 * tiltP;
  const rotZ = 0.0;
  const rotY = 0.5 * tiltP + (mode === 'explode' ? Math.sin(t * 0.6) * 0.05 * tiltP : 0);

  const allIn = 0.35 + pieces.length * 0.16 + 0.8;
  const baseDim =
    mode === 'assemble' ? interpolate(t, [allIn - 0.3, allIn + 0.4], [0.35, 1], clamp) : interpolate(t, [0.8, 2.0], [1, 0.4], clamp);

  return (
    <AbsoluteFill>
      <Stage3D>
        <CameraRig position={[0, lift, dist]} target={[0, lift, 0]} />
        <group rotation={[rotX, rotY, rotZ]} rotation-order="YXZ">
          <mesh geometry={baseGeo}>
            <meshBasicMaterial map={tex} color={new THREE.Color(baseDim, baseDim, baseDim)} toneMapped={false} />
          </mesh>
          {pieces.map((p, i) => (
            <Piece key={i} i={i} p={p} t={t} fps={fps} frame={frame} W={W} H={H} tex={tex} imgCrop={imgCrop} mode={mode} accent={theme.accent} bg={theme.bg} />
          ))}
        </group>
      </Stage3D>
      {hasText && (
        <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: (portrait ? 0.1 : 0.06) * height, gap: 14}}>
          {title && (
            <RiseText size={portrait ? 72 : 66} weight={800} delay={0.2}>
              {title}
            </RiseText>
          )}
          {caption && (
            <RiseText size={36} muted delay={0.4}>
              {caption}
            </RiseText>
          )}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const Piece: React.FC<{
  i: number;
  p: AssembleScene['pieces'][number];
  t: number;
  fps: number;
  frame: number;
  W: number;
  H: number;
  tex: THREE.Texture | null;
  imgCrop: Crop;
  mode: 'assemble' | 'explode';
  accent: string;
  bg: string;
}> = ({i, p, t, fps, frame, W, H, tex, imgCrop, mode, accent, bg}) => {
  const [cx, cy, cw, ch] = imgCrop;
  const crop: Crop = [cx + p.x * cw, cy + p.y * ch, p.w * cw, p.h * ch];
  const w = p.w * W;
  const h = p.h * H;
  const geo = useMemo(() => roundedPlane(w, h, Math.min(w, h) * 0.06, crop), [w, h, crop[0], crop[1], crop[2], crop[3]]); // eslint-disable-line react-hooks/exhaustive-deps
  const glowGeo = useMemo(() => roundedPlane(w + 0.06, h + 0.06, Math.min(w, h) * 0.08), [w, h]);
  const hx = (p.x + p.w / 2 - 0.5) * W;
  const hy = (0.5 - (p.y + p.h / 2)) * H;

  let pos: [number, number, number];
  let rot: [number, number, number];
  let glow: number;
  let hole: number;
  let shadow = 0;
  if (mode === 'assemble') {
    const delay = 0.35 + i * 0.16;
    const s = spring({frame: frame - Math.round(delay * fps), fps, config: {damping: 14, stiffness: 70, mass: 0.9}});
    const rx = (random(`x${i}`) - 0.5) * 7;
    const ry = (random(`y${i}`) - 0.5) * 5;
    const rz = 2.5 + random(`z${i}`) * 3;
    pos = [hx + rx * (1 - s), hy + ry * (1 - s), 0.004 + rz * (1 - s)];
    rot = [(random(`a${i}`) - 0.5) * 2.4 * (1 - s), (random(`b${i}`) - 0.5) * 2.4 * (1 - s), (random(`c${i}`) - 0.5) * 1.6 * (1 - s)];
    const land = delay + 0.55;
    glow = interpolate(t, [land - 0.15, land, land + 0.5], [0, 1, 0], clamp);
    hole = 1 - interpolate(s, [0.85, 1], [0, 1], clamp);
  } else {
    const delay = 0.8 + i * 0.12;
    const up = interpolate(t, [delay, delay + 1.0], [0, 1], {...clamp, easing: ease});
    const z = up * (0.35 + i * 0.22) + Math.sin(t * 1.2 + i) * 0.03 * up;
    pos = [hx, hy, 0.004 + z];
    rot = [0, 0, 0];
    glow = up * 0.85;
    hole = up;
    shadow = up;
  }
  return (
    <>
      {/* the empty slot */}
      {hole > 0.01 && (
        <mesh geometry={geo} position={[hx, hy, 0.002]}>
          <meshBasicMaterial color={bg} transparent opacity={0.85 * hole} depthWrite={false} />
        </mesh>
      )}
      {shadow > 0.01 && (
        <mesh geometry={glowGeo} position={[hx + 0.05 * shadow, hy - 0.08 * shadow, 0.003]}>
          <meshBasicMaterial color="#000000" transparent opacity={0.45 * shadow} depthWrite={false} />
        </mesh>
      )}
      <group position={pos} rotation={rot}>
        {glow > 0.01 && (
          <mesh geometry={glowGeo} position={[0, 0, -0.002]}>
            <meshBasicMaterial color={accent} transparent opacity={glow} toneMapped={false} />
          </mesh>
        )}
        <mesh geometry={geo}>
          <meshBasicMaterial map={tex} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </>
  );
};
