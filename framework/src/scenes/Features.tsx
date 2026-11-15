import React from 'react';
import {FeatureCard, RiseText, Stage} from '../components';
import {useLayout} from '../theme';
import type {FeaturesScene} from '../spec';

/** Grid of up to six feature cards that pop in one by one. */
export const Features: React.FC<FeaturesScene> = ({title, items}) => {
  const {u, portrait, square} = useLayout();
  const cols = portrait ? 1 : square ? 2 : items.length === 4 ? 2 : Math.min(3, items.length);
  const cardW = portrait ? 860 : square ? 440 : cols === 2 ? 640 : 500;
  return (
    <Stage gap={56}>
      {title && (
        <RiseText size={68} weight={800}>
          {title}
        </RiseText>
      )}
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cardW * u}px)`, gap: 32 * u, justifyContent: 'center'}}>
        {items.slice(0, 6).map((it, i) => (
          <FeatureCard key={i} {...it} delay={0.3 + i * 0.15} width={cardW} />
        ))}
      </div>
    </Stage>
  );
};
