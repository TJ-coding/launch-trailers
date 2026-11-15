import React from 'react';
import {RiseText, Stage} from '../components';
import {useLayout, useTheme} from '../theme';
import type {QuoteScene} from '../spec';

/** Testimonial or press quote. */
export const Quote: React.FC<QuoteScene> = ({text, author, role}) => {
  const theme = useTheme();
  const {u} = useLayout();
  return (
    <Stage gap={36}>
      <div style={{fontFamily: theme.fontFamily, fontSize: 200 * u, lineHeight: 0.5, color: theme.accent, fontWeight: 800}}>“</div>
      <RiseText size={64} weight={600} style={{maxWidth: 1400 * u}}>
        {text}
      </RiseText>
      {author && (
        <RiseText size={34} muted delay={0.6}>
          {author}
          {role ? ` · ${role}` : ''}
        </RiseText>
      )}
    </Stage>
  );
};
