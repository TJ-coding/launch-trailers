// The trailer spec: one JSON file (trailer.json) describes a whole trailer.
// Every scene type is rendered by a component in ./scenes; see
// skills/launch-trailer/references/spec.md for the full field reference.

export type Format = 'landscape' | 'square' | 'vertical';
export type FontName = 'Inter' | 'Poppins' | 'Space Grotesk' | 'Manrope' | 'DM Sans';
export type DisplayFontName = FontName | 'Instrument Serif' | 'Fraunces' | 'Newsreader' | 'Playfair Display';

export type ThemeSpec = {
  bg?: string; // page background
  bg2?: string; // second gradient stop
  fg?: string; // main text
  muted?: string; // secondary text
  accent?: string; // highlights, buttons, callouts
  accent2?: string; // second accent (gradients)
  surface?: string; // cards / device chrome
  font?: FontName;
  display?: DisplayFontName; // headline font for moment scenes (and cta)
  radius?: number; // px at 1080p
  background?: 'gradient' | 'grid' | 'dots' | 'solid';
};

export type Brand = {name: string; logo?: string; url?: string; tagline?: string};

/** Position on a screenshot as fractions of its width/height (0..1). */
export type Point = {x: number; y: number};
export type ZoomKey = Point & {at: number; scale: number};
export type CalloutSpec = {x: number; y: number; w: number; h: number; label?: string; at?: number; until?: number; side?: 'top' | 'bottom' | 'left' | 'right'};
export type CursorKey = Point & {at: number; click?: boolean};
export type Frame = 'browser' | 'window' | 'phone' | 'none';

type Base = {duration?: number; transition?: Transition; audio?: string};
export type Transition = 'fade' | 'slide' | 'wipe' | 'none';

export type HookScene = Base & {type: 'hook'; lines: string[]; accentWords?: string[]};
export type ProblemScene = Base & {type: 'problem'; title?: string; items: string[]; strike?: boolean};
export type LogoScene = Base & {type: 'logo'; tagline?: string};
export type AnnounceScene = Base & {type: 'announce'; badge?: string; title: string; subtitle?: string};
export type ScreenScene = Base & {
  type: 'screen';
  media?: string; // image or video in public/
  frame?: Frame;
  aspect?: number; // media width / height (default 16/10, phone 9/19.5)
  url?: string; // shown in the browser frame address bar
  title?: string;
  caption?: string;
  layout?: 'center' | 'left' | 'right';
  zoom?: ZoomKey[];
  callouts?: CalloutSpec[];
  cursor?: CursorKey[];
};
export type MontageScene = Base & {type: 'montage'; title?: string; items: {media?: string; label?: string}[]; frame?: Frame; aspect?: number};
export type KeysScene = Base & {type: 'keys'; keys: string[]; label?: string; sublabel?: string};
export type FeaturesScene = Base & {type: 'features'; title?: string; items: {icon?: string; title: string; text?: string}[]};
export type StatScene = Base & {type: 'stat'; value: number; prefix?: string; suffix?: string; label: string; decimals?: number};
export type BeforeAfterScene = Base & {
  type: 'beforeAfter';
  title?: string;
  before: {media?: string; label?: string; items?: string[]};
  after: {media?: string; label?: string; items?: string[]};
  frame?: Frame;
  aspect?: number;
};
export type QuoteScene = Base & {type: 'quote'; text: string; author?: string; role?: string};
export type Device3DScene = Base & {
  type: 'device3d';
  device?: 'laptop' | 'phone' | 'duo';
  media?: string; // laptop screen (or phone screen when device = phone)
  phoneMedia?: string; // phone screen in duo
  motion?: 'spin' | 'open' | 'orbit' | 'rise' | 'float';
  color?: 'space' | 'silver' | 'midnight';
  title?: string;
  caption?: string;
  pushIn?: boolean; // dive into the laptop screen at the end
};
export type AssembleScene = Base & {
  type: 'assemble';
  media?: string;
  aspect?: number;
  mode?: 'assemble' | 'explode';
  pieces: {x: number; y: number; w: number; h: number}[];
  title?: string;
  caption?: string;
};
export type Carousel3DScene = Base & {type: 'carousel3d'; items: {media?: string; label?: string}[]; title?: string; aspect?: number};
export type Logo3DScene = Base & {type: 'logo3d'; tagline?: string};
export type CtaScene = Base & {type: 'cta'; headline: string; subline?: string; button?: string; url?: string; showLogo?: boolean; photo?: string};

export type Corners = [[number, number], [number, number], [number, number], [number, number]];
export type Overlay = {
  kind: 'notification' | 'bubble' | 'toast' | 'chip';
  at?: number;
  until?: number;
  pos?: [number, number]; // top-left of the overlay, fractions of the frame
  app?: string;
  title?: string;
  text: string;
  time?: string;
  from?: string; // bubble speaker
  speak?: boolean; // bubble: light words up progressively
  width?: number;
};
export type MomentScene = Base & {
  type: 'moment';
  photo: string; // full-bleed context photo (or video) in public/
  after?: string; // same shot, changed state (lights on, screen on…)
  changeAt?: number;
  camera?: {from?: {x?: number; y?: number; scale?: number}; to?: {x?: number; y?: number; scale?: number}};
  time?: string; // "07:30"
  timeLabel?: string; // "Morning"
  headline?: string; // *accent* words in italics
  headlineWidth?: number; // max headline width in px at 1080p (wrap it away from the screen)
  headlinePos?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  tone?: 'light' | 'dark'; // text colour: light for dark photos, dark for bright ones
  shade?: boolean; // gradient behind the headline for legibility (default on)
  chip?: string;
  screens?: {media?: string; corners: Corners; at?: number; radius?: number; glare?: boolean}[];
  overlays?: Overlay[];
  glow?: {x: number; y: number; at?: number; size?: number}; // light bloom on the photo (a screen waking up)
};

export type Scene =
  | HookScene
  | ProblemScene
  | LogoScene
  | AnnounceScene
  | ScreenScene
  | MontageScene
  | KeysScene
  | FeaturesScene
  | StatScene
  | BeforeAfterScene
  | QuoteScene
  | CtaScene
  | MomentScene
  | Device3DScene
  | AssembleScene
  | Carousel3DScene
  | Logo3DScene;

export type SceneType = Scene['type'];

export type TrailerSpec = {
  type: 'product' | 'feature' | 'scenario';
  title?: string;
  format?: Format;
  fps?: number;
  theme?: ThemeSpec;
  brand: Brand;
  music?: {src: string; volume?: number; fadeIn?: number; fadeOut?: number; startFrom?: number};
  transition?: Transition; // default between scenes
  transitionDuration?: number; // seconds
  scenes: Scene[];
};

/** Default seconds per scene type when `duration` is omitted. */
export const DEFAULT_DURATION: Record<SceneType, number> = {
  hook: 3,
  problem: 4,
  logo: 2.5,
  announce: 3,
  screen: 5,
  montage: 4,
  keys: 3,
  features: 5,
  stat: 3,
  beforeAfter: 5,
  quote: 4,
  cta: 4,
  moment: 4,
  device3d: 5,
  assemble: 5,
  carousel3d: 6,
  logo3d: 3,
};

export const FORMATS: Record<Format, {width: number; height: number}> = {
  landscape: {width: 1920, height: 1080},
  square: {width: 1080, height: 1080},
  vertical: {width: 1080, height: 1920},
};

export const sceneSeconds = (s: Scene) => s.duration ?? DEFAULT_DURATION[s.type];
export const transitionSeconds = (spec: TrailerSpec) => spec.transitionDuration ?? 0.4;
export const sceneTransition = (spec: TrailerSpec, s: Scene): Transition => s.transition ?? spec.transition ?? 'fade';

/** Frames per scene and total, accounting for transition overlaps. */
export const timeline = (spec: TrailerSpec) => {
  const fps = spec.fps ?? 30;
  const t = Math.round(transitionSeconds(spec) * fps);
  const scenes = spec.scenes.map((s) => Math.round(sceneSeconds(s) * fps));
  let total = 0;
  scenes.forEach((f, i) => {
    total += f;
    if (i > 0 && sceneTransition(spec, spec.scenes[i]) !== 'none') total -= Math.min(t, f, scenes[i - 1]);
  });
  return {fps, transitionFrames: t, scenes, total: Math.max(total, 1)};
};
