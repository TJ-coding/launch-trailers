import React, {useLayoutEffect} from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {useTheme} from '../theme';

export const FOV = 30;

/** Camera distance that fits a box of size w × h (world units) in view, with margin. */
export const fitDistance = (w: number, h: number, aspect: number, margin = 1.15, fov = FOV) => {
  const t = Math.tan(THREE.MathUtils.degToRad(fov / 2));
  return Math.max(h / 2 / t, w / 2 / (t * aspect)) * margin;
};

/** Points the camera every frame (Remotion re-renders per frame; no useFrame). */
export const CameraRig: React.FC<{position: [number, number, number]; target?: [number, number, number]; fov?: number}> = ({position, target = [0, 0, 0], fov = FOV}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...position);
    camera.fov = fov;
    camera.near = 0.05;
    camera.far = 200;
    camera.lookAt(...target);
    camera.updateProjectionMatrix();
  });
  return null;
};

/** Key + fill + two accent rim lights in the theme colours. */
export const Lights: React.FC<{intensity?: number}> = ({intensity = 1}) => {
  const theme = useTheme();
  return (
    <>
      <ambientLight intensity={0.9 * intensity} />
      <directionalLight position={[4, 6, 8]} intensity={2.4 * intensity} />
      <directionalLight position={[-6, 2, 4]} intensity={0.6 * intensity} />
      <pointLight position={[-5, 2.5, 2]} intensity={60 * intensity} color={theme.accent} />
      <pointLight position={[5, -1.5, 2]} intensity={45 * intensity} color={theme.accent2} />
    </>
  );
};

/**
 * Full-frame transparent WebGL layer (the 2D Background shows through).
 * Put 3D content and a <CameraRig> inside; 2D overlays go after it.
 */
export const Stage3D: React.FC<{children: React.ReactNode; lights?: boolean}> = ({children, lights = true}) => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} camera={{fov: FOV, position: [0, 0, 10]}} gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}}>
        {lights && <Lights />}
        {children}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
