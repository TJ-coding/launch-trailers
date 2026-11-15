import type React from 'react';
import type {SceneType} from '../spec';
import {Announce} from './Announce';
import {BeforeAfter} from './BeforeAfter';
import {Cta} from './Cta';
import {Features} from './Features';
import {Hook} from './Hook';
import {Keys} from './Keys';
import {LogoReveal} from './LogoReveal';
import {Montage} from './Montage';
import {Problem} from './Problem';
import {Quote} from './Quote';
import {Screen} from './Screen';
import {Stat} from './Stat';

/** Scene type → component. Add a new scene type here (and in spec.ts). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SCENES: Record<SceneType, React.FC<any>> = {
  hook: Hook,
  problem: Problem,
  logo: LogoReveal,
  announce: Announce,
  screen: Screen,
  montage: Montage,
  keys: Keys,
  features: Features,
  stat: Stat,
  beforeAfter: BeforeAfter,
  quote: Quote,
  cta: Cta,
};

export {Announce, BeforeAfter, Cta, Features, Hook, Keys, LogoReveal, Montage, Problem, Quote, Screen, Stat};
