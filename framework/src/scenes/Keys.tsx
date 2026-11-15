import React from 'react';
import {KeyCaps, RiseText, Stage} from '../components';
import {useLayout} from '../theme';
import type {KeysScene} from '../spec';

/** A keyboard shortcut and what it does. */
export const Keys: React.FC<KeysScene> = ({keys, label, sublabel}) => {
  const {portrait} = useLayout();
  const reveal = 0.2 + keys.length * 0.25 + 0.4;
  return (
    <Stage gap={56}>
      <KeyCaps keys={keys} size={portrait ? 170 : 160} />
      {label && (
        <RiseText size={70} weight={800} delay={reveal}>
          {label}
        </RiseText>
      )}
      {sublabel && (
        <RiseText size={38} muted delay={reveal + 0.2}>
          {sublabel}
        </RiseText>
      )}
    </Stage>
  );
};
