import React from 'react';
import {Composition, Folder} from 'remotion';
import {calculateTrailerMetadata, Trailer} from './Trailer';
import type {TrailerSpec} from './spec';
import product from '../../templates/product/trailer.json';
import feature from '../../templates/feature/trailer.json';

const comp = (id: string, spec: TrailerSpec) => (
  <Composition
    id={id}
    component={Trailer}
    defaultProps={spec}
    calculateMetadata={calculateTrailerMetadata}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
);

export const Root: React.FC = () => (
  <>
    {/* Scripts render "Trailer" with --props=<dir>/trailer.json. */}
    {comp('Trailer', product as TrailerSpec)}
    <Folder name="Templates">
      {comp('ProductLaunch', product as TrailerSpec)}
      {comp('FeatureLaunch', feature as TrailerSpec)}
    </Folder>
  </>
);
