import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useVideoConfig} from 'remotion';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {Background, hasFile} from './components';
import {SCENES} from './scenes';
import {resolveTheme, ThemeProvider} from './theme';
import {FORMATS, sceneSeconds, sceneTransition, timeline, type Transition, type TrailerSpec} from './spec';
import type {CalculateMetadataFunction} from 'remotion';
import type {TransitionPresentation} from '@remotion/transitions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const presentation = (t: Transition): TransitionPresentation<any> =>
  t === 'slide' ? slide({direction: 'from-right'}) : t === 'wipe' ? wipe({direction: 'from-left'}) : fade();

/** Renders a whole trailer from its spec (trailer.json). */
export const Trailer: React.FC<TrailerSpec> = (spec) => {
  const theme = resolveTheme(spec.theme);
  const {fps, durationInFrames} = useVideoConfig();
  const tl = timeline(spec);
  const items: React.ReactNode[] = [];
  spec.scenes.forEach((s, i) => {
    const Comp = SCENES[s.type];
    if (!Comp) throw new Error(`Unknown scene type "${(s as {type: string}).type}" (scene ${i + 1})`);
    const tr = sceneTransition(spec, s);
    if (i > 0 && tr !== 'none') {
      const d = Math.min(tl.transitionFrames, tl.scenes[i], tl.scenes[i - 1]);
      items.push(<TransitionSeries.Transition key={`t${i}`} presentation={presentation(tr)} timing={linearTiming({durationInFrames: d})} />);
    }
    items.push(
      <TransitionSeries.Sequence key={`s${i}`} durationInFrames={tl.scenes[i]}>
        <Comp {...s} duration={sceneSeconds(s)} />
        {s.audio && hasFile(s.audio) && <Audio src={staticFile(s.audio)} />}
      </TransitionSeries.Sequence>,
    );
  });

  const m = spec.music;
  const vol = m?.volume ?? 0.7;
  const fi = (m?.fadeIn ?? 0.5) * fps;
  const fo = (m?.fadeOut ?? 1.5) * fps;
  return (
    <ThemeProvider theme={theme} brand={spec.brand}>
      <AbsoluteFill style={{fontFamily: theme.fontFamily}}>
        <Background />
        <TransitionSeries>{items}</TransitionSeries>
        {m && hasFile(m.src) && (
          <Audio
            src={staticFile(m.src)}
            startFrom={Math.round((m.startFrom ?? 0) * fps)}
            volume={(f) =>
              interpolate(f, [0, Math.max(1, fi), Math.max(fi + 1, durationInFrames - fo), durationInFrames], [0, vol, vol, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
            }
          />
        )}
      </AbsoluteFill>
    </ThemeProvider>
  );
};

/** Duration, size and fps come from the spec, so the CLI only needs --props. */
export const calculateTrailerMetadata: CalculateMetadataFunction<TrailerSpec> = ({props}) => {
  const tl = timeline(props);
  const size = FORMATS[props.format ?? 'landscape'] ?? FORMATS.landscape;
  return {durationInFrames: tl.total, fps: tl.fps, ...size};
};
