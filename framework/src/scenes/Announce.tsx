import React from 'react';
import {KineticText, Logo, Pill, RiseText, Stage} from '../components';
import {useLayout} from '../theme';
import type {AnnounceScene} from '../spec';

/** Feature-launch opener: small logo, "NEW" badge, feature name. */
export const Announce: React.FC<AnnounceScene> = ({badge = 'New', title, subtitle}) => {
  const {portrait} = useLayout();
  return (
    <Stage gap={34}>
      <Logo size={90} withName />
      <Pill delay={0.35} solid>
        {badge}
      </Pill>
      <KineticText text={title} delay={0.55} size={portrait ? 110 : 128} />
      {subtitle && (
        <RiseText size={44} muted delay={1.1}>
          {subtitle}
        </RiseText>
      )}
    </Stage>
  );
};
