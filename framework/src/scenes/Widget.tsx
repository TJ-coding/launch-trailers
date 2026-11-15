import React from 'react';
import {AbsoluteFill} from 'remotion';
import {RiseText, WidgetCard, widgetAspect} from '../components';
import {useLayout} from '../theme';
import type {WidgetScene} from '../spec';

/** One component of the product at work, played big on its own card. */
export const Widget: React.FC<WidgetScene & {duration?: number}> = ({title, caption, duration = 4, ...src}) => {
  const {u, width, height, portrait} = useLayout();
  const hasText = Boolean(title || caption);
  const aspect = widgetAspect(src);
  const boxW = width - (portrait ? 90 : 220) * u;
  const boxH = height - (hasText ? (portrait ? 560 : 330) : 160) * u;
  const W = Math.min(boxW, boxH * aspect);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: (portrait ? 60 : 40) * u}}>
      {hasText && (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 * u}}>
          {title && (
            <RiseText size={portrait ? 72 : 64} weight={800} delay={0.1}>
              {title}
            </RiseText>
          )}
          {caption && (
            <RiseText size={34} muted delay={0.3}>
              {caption}
            </RiseText>
          )}
        </div>
      )}
      <WidgetCard {...src} width={W} duration={duration} />
    </AbsoluteFill>
  );
};
