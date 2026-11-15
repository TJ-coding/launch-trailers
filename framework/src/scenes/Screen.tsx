import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Callout, Cursor, defaultAspect, DeviceFrame, Media, RiseText, ZoomPan} from '../components';
import {useEnter} from '../motion';
import {useLayout} from '../theme';
import type {Frame, ScreenScene} from '../spec';

/** Height of a device frame of outer width w. */
export const frameHeight = (frame: Frame, w: number, aspect: number) =>
  frame === 'phone' ? (w * 0.93) / aspect + w * 0.07 : frame === 'none' ? w / aspect : w / aspect + (w * 44) / 1400;

/** Largest device width fitting the box. */
export const fitDevice = (frame: Frame, aspect: number, boxW: number, boxH: number) => {
  const perW = frameHeight(frame, 1, aspect);
  return Math.min(boxW, boxH / perW);
};

/** Product UI in a device frame, with camera moves, callouts and a cursor. */
export const Screen: React.FC<ScreenScene> = ({media, frame = 'browser', aspect, url, title, caption, layout = 'center', zoom, callouts = [], cursor = []}) => {
  const {u, width, height, portrait, square} = useLayout();
  const a = aspect ?? defaultAspect(frame);
  const enter = useEnter(0.05);
  const side = !portrait && !square && layout !== 'center' && (title || caption);
  const hasText = Boolean(title || caption);

  const text = (align: 'left' | 'center') => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 18 * u, alignItems: align === 'left' ? 'flex-start' : 'center'}}>
      {title && (
        <RiseText size={side ? 76 : portrait ? 72 : 64} weight={800} align={align} delay={0.15}>
          {title}
        </RiseText>
      )}
      {caption && (
        <RiseText size={side ? 38 : 36} muted align={align} delay={0.35}>
          {caption}
        </RiseText>
      )}
    </div>
  );

  const boxW = side ? width * 0.56 : width - (portrait ? 100 : 260) * u;
  const boxH = side ? height - 200 * u : height - (hasText ? (portrait ? 620 : 250) : 140) * u;
  const w = fitDevice(frame, a, boxW, boxH);

  const device = (
    <div style={{transform: `perspective(${2400 * u}px) rotateX(${(1 - enter) * 14}deg) translateY(${(1 - enter) * 120 * u}px)`, opacity: enter}}>
      <DeviceFrame frame={frame} width={w} aspect={a} url={url}>
        <ZoomPan keys={zoom}>
          {(scale) => (
            <>
              <Media src={media} />
              {callouts.map((c, i) => (
                <Callout key={i} {...c} scale={scale} />
              ))}
              <Cursor path={cursor} scale={scale} />
            </>
          )}
        </ZoomPan>
      </DeviceFrame>
    </div>
  );

  if (side) {
    return (
      <AbsoluteFill style={{flexDirection: layout === 'right' ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'center', gap: 80 * u, padding: `0 ${110 * u}px`}}>
        <div style={{flex: 1}}>{text('left')}</div>
        {device}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: (portrait ? 70 : 44) * u}}>
      {hasText && text('center')}
      {device}
    </AbsoluteFill>
  );
};
