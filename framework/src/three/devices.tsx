import React, {useMemo} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {useTheme} from '../theme';
import {coverCrop, keyboardTexture, roundedPlane, shadowTexture, textureAspect} from './textures';

export type DeviceColor = 'space' | 'silver' | 'midnight';
const BODY: Record<DeviceColor, {body: string; keys: string; bezel: string}> = {
  space: {body: '#3A3E45', keys: '#1C1F24', bezel: '#08090B'},
  silver: {body: '#C9CDD2', keys: '#2A2D31', bezel: '#0B0C0E'},
  midnight: {body: '#1F2632', keys: '#0F131A', bezel: '#06080B'},
};

/** Laptop dimensions (world units). Screen is 16:10. */
export const LAPTOP = {w: 3.4, d: 2.3, t: 0.09, lidH: 2.22, lidT: 0.05, screenW: 3.18, screenH: 1.9875};
/** Phone dimensions; screen 9:19.5. */
export const PHONE = {w: 0.98, h: 2.04, d: 0.1, screenW: 0.9, screenH: 1.95};

/** A screen surface showing a texture (load it with useImageTextures), cover-fitted. */
export const Screen3D: React.FC<{tex: THREE.Texture | null; w: number; h: number; r: number; z?: number; brightness?: number}> = ({tex, w, h, r, z = 0, brightness = 1}) => {
  const crop = coverCrop(textureAspect(tex, w / h), w / h);
  const geo = useMemo(() => roundedPlane(w, h, r, crop), [w, h, r, crop[0], crop[1], crop[2], crop[3]]); // eslint-disable-line react-hooks/exhaustive-deps
  const c = new THREE.Color(brightness, brightness, brightness);
  return (
    <mesh geometry={geo} position={[0, 0, z]}>
      <meshBasicMaterial map={tex} color={c} toneMapped={false} />
    </mesh>
  );
};

/**
 * Procedural laptop. Origin = centre of the base's bottom face. `open` 0 =
 * closed, 1 = lid at 105°. The screen faces +z when the lid is upright.
 */
export const Laptop: React.FC<{screen: THREE.Texture | null; open?: number; color?: DeviceColor; brightness?: number; shadow?: boolean}> = ({screen, open = 1, color = 'space', brightness = 1, shadow = true}) => {
  const c = BODY[color];
  const {w, d, t, lidH, lidT, screenW, screenH} = LAPTOP;
  const base = useMemo(() => new RoundedBoxGeometry(w, t, d, 4, 0.04), [w, t, d]);
  const lid = useMemo(() => new RoundedBoxGeometry(w, lidH, lidT, 4, 0.04), [w, lidH, lidT]);
  const bezel = useMemo(() => roundedPlane(w - 0.04, lidH - 0.04, 0.07), [w, lidH]);
  const deck = useMemo(() => keyboardTexture(c.body, c.keys), [c.body, c.keys]);
  const shadowTex = useMemo(() => shadowTexture(), []);
  const angle = Math.PI / 2 - open * THREE.MathUtils.degToRad(105);
  return (
    <group>
      {shadow && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0.1]} scale={[w * 1.5, d * 1.6, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={shadowTex} transparent opacity={0.65} depthWrite={false} />
        </mesh>
      )}
      <mesh geometry={base} position={[0, t / 2, 0]}>
        <meshStandardMaterial color={c.body} metalness={0.35} roughness={0.45} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, t + 0.001, 0]}>
        <planeGeometry args={[w - 0.12, d - 0.12]} />
        <meshStandardMaterial map={deck} metalness={0.3} roughness={0.5} />
      </mesh>
      {/* hinge at the back edge of the base */}
      <group position={[0, t, -d / 2 + 0.03]} rotation={[angle, 0, 0]}>
        <mesh geometry={lid} position={[0, lidH / 2, -lidT / 2]}>
          <meshStandardMaterial color={c.body} metalness={0.35} roughness={0.45} />
        </mesh>
        <mesh geometry={bezel} position={[0, lidH / 2, 0.001]}>
          <meshBasicMaterial color={c.bezel} />
        </mesh>
        <group position={[0, lidH / 2 + 0.03, 0.003]}>
          <Screen3D tex={screen} w={screenW} h={screenH} r={0.03} brightness={brightness} />
        </group>
      </group>
    </group>
  );
};

/** Procedural phone, centred on its middle, screen facing +z. */
export const Phone: React.FC<{screen: THREE.Texture | null; color?: DeviceColor; brightness?: number}> = ({screen, color = 'midnight', brightness = 1}) => {
  const c = BODY[color];
  const {w, h, d, screenW, screenH} = PHONE;
  const body = useMemo(() => new RoundedBoxGeometry(w, h, d, 6, 0.045), [w, h, d]);
  const front = useMemo(() => roundedPlane(w - 0.02, h - 0.02, 0.14), [w, h]);
  const island = useMemo(() => roundedPlane(0.26, 0.07, 0.035), []);
  const bump = useMemo(() => new RoundedBoxGeometry(0.38, 0.38, 0.05, 4, 0.02), []);
  return (
    <group>
      <mesh geometry={body}>
        <meshStandardMaterial color={c.body} metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh geometry={front} position={[0, 0, d / 2 + 0.001]}>
        <meshBasicMaterial color={c.bezel} />
      </mesh>
      <group position={[0, 0, d / 2 + 0.003]}>
        <Screen3D tex={screen} w={screenW} h={screenH} r={0.12} brightness={brightness} />
      </group>
      <mesh geometry={island} position={[0, screenH / 2 - 0.09, d / 2 + 0.005]}>
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh geometry={bump} position={[-w / 2 + 0.26, h / 2 - 0.26, -d / 2 - 0.015]}>
        <meshStandardMaterial color={c.body} metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
};

/** App icon tile: rounded slab with the brand logo on the front. */
export const AppIcon: React.FC<{logo: THREE.Texture | null; size?: number}> = ({logo, size = 1.6}) => {
  const theme = useTheme();
  const slab = useMemo(() => new RoundedBoxGeometry(size, size, size * 0.18, 8, size * 0.2), [size]);
  const face = useMemo(() => roundedPlane(size * 0.98, size * 0.98, size * 0.21), [size]);
  return (
    <group>
      <mesh geometry={slab}>
        <meshStandardMaterial color={theme.accent} metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh geometry={face} position={[0, 0, size * 0.09 + 0.002]}>
        <meshBasicMaterial map={logo} toneMapped={false} />
      </mesh>
    </group>
  );
};
