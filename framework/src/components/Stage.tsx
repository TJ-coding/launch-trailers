import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useLayout} from '../theme';

/** Centered, padded column every scene sits in (safe margins per format). */
export const Stage: React.FC<{children: React.ReactNode; gap?: number; style?: React.CSSProperties}> = ({children, gap = 40, style}) => {
  const {u, portrait} = useLayout();
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: gap * u,
        padding: portrait ? `${200 * u}px ${70 * u}px` : `${80 * u}px ${140 * u}px`,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
