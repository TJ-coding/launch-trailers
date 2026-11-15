import React from 'react';
import {Logo, RiseText, Stage} from '../components';
import {useBrand} from '../theme';
import type {LogoScene} from '../spec';

/** The brand moment: logo + name, then the tagline. */
export const LogoReveal: React.FC<LogoScene> = ({tagline}) => {
  const brand = useBrand();
  return (
    <Stage gap={36}>
      <Logo size={200} withName delay={0.1} />
      {(tagline ?? brand.tagline) && (
        <RiseText size={48} muted delay={0.7}>
          {tagline ?? brand.tagline}
        </RiseText>
      )}
    </Stage>
  );
};
