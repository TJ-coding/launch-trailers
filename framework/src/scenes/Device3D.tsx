import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {RiseText} from '../components';
import {CameraRig, fitDistance, LAPTOP, Laptop, Phone, PHONE, Stage3D, useImageTextures} from '../three';
import {useLayout, useTheme} from '../theme';
import type {Device3DScene} from '../spec';

const ease = Easing.bezier(0.16, 1, 0.3, 1); // fast out, long settle
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

type Pose = {rotX: number; rotY: number; y: number; scale: number; open: number};

/** Motion presets: device pose at time t of a scene lasting d seconds. */
const POSES: Record<NonNullable<Device3DScene['motion']>, (t: number, d: number, s: number) => Pose> = {
  // One and a bit turns into a three-quarter view, then a slow drift.
  spin: (t, _d, s) => ({
    rotY: interpolate(t, [0, 1.9], [-Math.PI * 2 - 0.6, -0.3], {...clamp, easing: ease}) + Math.sin(t * 0.7) * 0.05,
    rotX: interpolate(t, [0, 1.9], [0.5, 0.14], {...clamp, easing: ease}),
    y: interpolate(t, [0, 1.9], [-0.8, 0], {...clamp, easing: ease}),
    scale: 0.55 + 0.45 * s,
    open: 1,
  }),
  // Closed laptop turns towards you and the lid opens.
  open: (t) => ({
    rotY: interpolate(t, [0, 2.4], [-0.75, -0.18], {...clamp, easing: ease}),
    rotX: interpolate(t, [0, 2.4], [0.55, 0.12], {...clamp, easing: ease}),
    y: 0,
    scale: 1,
    open: interpolate(t, [0.5, 2.0], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)}),
  }),
  // Slow sweep from left three-quarter to right three-quarter.
  orbit: (t, d) => ({rotY: interpolate(t, [0, d], [-0.75, 0.75], {...clamp, easing: Easing.inOut(Easing.sin)}), rotX: 0.16, y: 0, scale: 1, open: 1}),
  // Rises up from below, tipping upright.
  rise: (t, _d, s) => ({
    rotY: interpolate(t, [0, 1.8], [0.5, -0.22], {...clamp, easing: ease}),
    rotX: interpolate(t, [0, 1.8], [1.1, 0.13], {...clamp, easing: ease}),
    y: interpolate(s, [0, 1], [-3.2, 0]),
    scale: 1,
    open: 1,
  }),
  // Idle hero: gentle bob and sway.
  float: (t) => ({rotY: -0.3 + Math.sin(t * 0.8) * 0.12, rotX: 0.14 + Math.sin(t * 0.6) * 0.03, y: Math.sin(t * 1.1) * 0.06, scale: 1, open: 1}),
};

/**
 * Hero 3D device(s) showing your screenshots: laptop, phone, or both ("duo").
 * `pushIn` dives into the laptop screen at the end, so the next 2D screen
 * scene continues seamlessly.
 */
export const Device3D: React.FC<Device3DScene & {duration?: number}> = ({device = 'laptop', media, phoneMedia, motion = 'spin', color, title, caption, pushIn = false, duration = 5}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {width, height, portrait} = useLayout();
  const theme = useTheme();
  const phoneSrc = device === 'duo' ? phoneMedia : media ?? phoneMedia;
  const [laptopTex, phoneTex] = useImageTextures([device === 'phone' ? undefined : media, device === 'laptop' ? undefined : phoneSrc], {bg: theme.surface, fg: theme.fg, accent: theme.accent});
  const t = frame / fps;
  const s = spring({frame, fps, config: {damping: 16, stiffness: 90}});
  const pose = POSES[motion](t, duration, s);
  const hasText = Boolean(title || caption);

  // What we frame: laptop ≈ 3.6 × 3.0 world units, phone 1.1 × 2.2, duo wider.
  const box = device === 'phone' ? [1.3, 2.4] : device === 'duo' ? [5.8, 3.4] : [3.8, 3.0];
  const avail = hasText ? (portrait ? 0.6 : 0.74) : 0.92;
  const dist = fitDistance(box[0], box[1] / avail, width / height, 1.08);
  const lift = hasText ? (box[1] / avail) * (portrait ? 0.15 : 0.09) : 0; // push content below the title

  // Push-in: rotate flat, raise the lid upright and fly the camera to the screen.
  const push = pushIn && device !== 'phone' ? interpolate(t, [duration - 1.3, duration], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)}) : 0;
  const rotX = lerp(pose.rotX, 0, push);
  const rotY = lerp(pose.rotY, 0, push);
  const open = lerp(pose.open, 1 / (105 / 90), push); // lid at 90°
  const screenY = LAPTOP.t + LAPTOP.lidH / 2 + 0.03;
  const screenZ = -LAPTOP.d / 2 + 0.03 + 0.2; // + laptopCenter z
  const screenDist = fitDistance(LAPTOP.screenW, LAPTOP.screenH, width / height, 1.0);

  const laptopCenter: [number, number, number] = [0, -1.25, 0.2];
  const camPos: [number, number, number] = [0, lerp(lift, screenY + laptopCenter[1], push), lerp(dist, screenZ + screenDist * 0.98, push)];
  const camTarget: [number, number, number] = [0, lerp(lift, screenY + laptopCenter[1], push), lerp(0, screenZ, push)];

  const phoneIn = device === 'duo' ? spring({frame: frame - Math.round(0.7 * fps), fps, config: {damping: 15, stiffness: 80}}) : 1;
  const titleOut = 1 - push;

  return (
    <AbsoluteFill>
      <Stage3D>
        <CameraRig position={camPos} target={camTarget} />
        <group position={[0, pose.y, 0]} scale={pose.scale}>
          {device !== 'phone' && (
            <group position={device === 'duo' ? [-0.9, -1.25, 0] : laptopCenter} rotation={[rotX, rotY, 0]}>
              <Laptop screen={laptopTex} open={open} color={color} />
            </group>
          )}
          {device !== 'laptop' && (
            <group
              position={device === 'duo' ? [lerp(6, 1.9, phoneIn), -0.05, 0.9] : [0, 0, 0]}
              rotation={device === 'duo' ? [0.08, lerp(-Math.PI * 1.5, -0.35, phoneIn), 0] : [pose.rotX * 0.6, pose.rotY, 0]}
            >
              <Phone screen={phoneTex} color={color} />
            </group>
          )}
        </group>
      </Stage3D>
      {hasText && (
        <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: (portrait ? 0.1 : 0.06) * height, gap: 14, opacity: titleOut}}>
          {title && (
            <RiseText size={portrait ? 72 : 66} weight={800} delay={0.3}>
              {title}
            </RiseText>
          )}
          {caption && (
            <RiseText size={36} muted delay={0.5}>
              {caption}
            </RiseText>
          )}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export {PHONE};
