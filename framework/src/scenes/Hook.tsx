import React from 'react';
import {KineticText, Stage} from '../components';
import {useLayout} from '../theme';
import type {HookScene} from '../spec';

/** Opening line(s), big kinetic type. One line per entry in `lines`. */
export const Hook: React.FC<HookScene> = ({lines, accentWords}) => {
  const {portrait} = useLayout();
  let offset = 0;
  return (
    <Stage gap={10}>
      {lines.map((l, i) => {
        const d = offset;
        offset += l.split(/\s+/).length * 0.08 + 0.25;
        return <KineticText key={i} text={l} delay={d} accentWords={accentWords} size={portrait ? 120 : 130} />;
      })}
    </Stage>
  );
};
