import React from 'react';
import {Counter, RiseText, Stage} from '../components';
import type {StatScene} from '../spec';

/** One big number counting up, with what it means. */
export const Stat: React.FC<StatScene> = ({value, prefix, suffix, label, decimals}) => (
  <Stage gap={30}>
    <Counter value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
    <RiseText size={52} weight={600} delay={0.6}>
      {label}
    </RiseText>
  </Stage>
);
