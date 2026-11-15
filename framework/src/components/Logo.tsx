import React from 'react';
import {Img, staticFile} from 'remotion';
import {useEnter} from '../motion';
import {alpha, useBrand, useLayout, useTheme} from '../theme';
import {hasFile} from './Media';

/** Brand logo (public/<brand.logo>) or a lettermark fallback, with a pop-in. */
export const Logo: React.FC<{size?: number; delay?: number; withName?: boolean}> = ({size = 160, delay = 0, withName = false}) => {
  const theme = useTheme();
  const brand = useBrand();
  const {u} = useLayout();
  const p = useEnter(delay, 'bouncy');
  const s = size * u;
  const mark =
    brand.logo && hasFile(brand.logo) ? (
      <Img src={staticFile(brand.logo)} style={{width: s, height: s, objectFit: 'contain', borderRadius: theme.radius * u}} />
    ) : (
      <div
        style={{
          width: s,
          height: s,
          borderRadius: s * 0.28,
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: theme.fontFamily,
          fontWeight: 800,
          fontSize: s * 0.5,
          color: theme.bg,
          boxShadow: `0 ${20 * u}px ${60 * u}px ${alpha(theme.accent, 0.35)}`,
        }}
      >
        {brand.name.slice(0, 1).toUpperCase()}
      </div>
    );
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: s * 0.22, opacity: Math.min(1, p * 1.5), transform: `scale(${0.5 + 0.5 * p}) rotate(${(1 - p) * -8}deg)`}}>
      {mark}
      {withName && <div style={{fontFamily: theme.fontFamily, fontWeight: 800, fontSize: s * 0.45, color: theme.fg, letterSpacing: '-0.03em'}}>{brand.name}</div>}
    </div>
  );
};
