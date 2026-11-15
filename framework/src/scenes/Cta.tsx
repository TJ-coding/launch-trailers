import React from 'react';
import {Button, KineticText, Logo, RiseText, Stage} from '../components';
import {useBrand, useLayout} from '../theme';
import type {CtaScene} from '../spec';

/** Closing card: logo, headline, button, URL. */
export const Cta: React.FC<CtaScene> = ({headline, subline, button = 'Try it now', url, showLogo = true}) => {
  const brand = useBrand();
  const {portrait} = useLayout();
  return (
    <Stage gap={44}>
      {showLogo && <Logo size={130} withName />}
      <KineticText text={headline} delay={0.3} size={portrait ? 100 : 110} />
      {subline && (
        <RiseText size={42} muted delay={0.7}>
          {subline}
        </RiseText>
      )}
      <Button delay={0.9}>{button}</Button>
      {(url ?? brand.url) && (
        <RiseText size={38} weight={600} delay={1.2} muted>
          {url ?? brand.url}
        </RiseText>
      )}
    </Stage>
  );
};
