import React from 'react';
import {Easing, interpolate} from 'remotion';
import {useTime} from '../motion';
import {useLayout, useTheme} from '../theme';

/** Number that counts up from 0 to `value` over `duration` seconds. */
export const Counter: React.FC<{value: number; prefix?: string; suffix?: string; decimals?: number; delay?: number; duration?: number; size?: number}> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  delay = 0.2,
  duration = 1.4,
  size = 240,
}) => {
  const theme = useTheme();
  const {u} = useLayout();
  const t = useTime();
  const v = interpolate(t, [delay, delay + duration], [0, value], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <div
      style={{
        fontFamily: theme.fontFamily,
        fontWeight: 800,
        fontSize: size * u,
        letterSpacing: '-0.05em',
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
        background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
      }}
    >
      {prefix}
      {v.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals})}
      {suffix}
    </div>
  );
};
