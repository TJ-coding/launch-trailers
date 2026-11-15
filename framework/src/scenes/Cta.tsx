import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Button, hasFile, Headline, Logo, RiseText, Stage} from '../components';
import {useBrand, useLayout} from '../theme';
import type {CtaScene} from '../spec';

/** Closing card: logo, headline, button, URL. */
export const Cta: React.FC<CtaScene> = ({headline, subline, button = 'Try it now', url, showLogo = true, photo}) => {
  const brand = useBrand();
  const {portrait} = useLayout();
  return (
    <AbsoluteFill>
    {photo && hasFile(photo) && (
      <AbsoluteFill>
        <Img src={staticFile(photo)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(14px) brightness(0.45) saturate(1.1)', transform: 'scale(1.08)'}} />
      </AbsoluteFill>
    )}
    <Stage gap={44}>
      {showLogo && <Logo size={130} withName />}
      <Headline text={headline} delay={0.3} size={portrait ? 104 : 116} align="center" maxWidth={1500} />
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
    </AbsoluteFill>
  );
};
