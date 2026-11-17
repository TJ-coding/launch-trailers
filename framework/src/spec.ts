// The trailer spec: one JSON file (trailer.json) describes a whole trailer.
// Every scene type is rendered by a component in ./scenes; see
// skills/launch-trailer/references/spec.md for the full field reference.

export type Format = 'landscape' | 'square' | 'vertical';
export type FontName = 'Inter' | 'Poppins' | 'Space Grotesk' | 'Manrope' | 'DM Sans' | 'Sora' | 'Hanken Grotesk' | 'Schibsted Grotesk';
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
  grade?: 'none' | 'warm' | 'cool' | 'film'; // one colour grade over every context photo, so mixed sources read as one film
};

/** `logo`: the small square mark. `lockup`: the full logo artwork that already contains the name; when set, the end scene shows it large (and a demo scene does with brandMark: 'lockup'). */
export type Brand = {name: string; logo?: string; lockup?: string; url?: string; tagline?: string};

/** Position on a screenshot as fractions of its width/height (0..1). */
export type Point = {x: number; y: number};
export type ZoomKey = Point & {at: number; scale: number};
export type CalloutSpec = {x: number; y: number; w: number; h: number; label?: string; at?: number; until?: number; side?: 'top' | 'bottom' | 'left' | 'right'};
export type CursorKey = Point & {at: number; click?: boolean};
export type Frame = 'browser' | 'window' | 'phone' | 'none';

/** Visual grammar: problems are dark, the solution brings the light. */
export type Mood = 'problem' | 'solution';
type Base = {duration?: number; transition?: Transition; audio?: string; mood?: Mood};
export type Transition = 'fade' | 'slide' | 'wipe' | 'cut' | 'none'; // cut = none (a hard cut)

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
export type WidgetScene = Base & {
  type: 'widget';
  media?: string; // screen recording (or screenshot) in public/
  crop?: [number, number, number, number]; // the component: x, y, w, h as fractions of the media
  mediaAspect?: number; // width / height of the media (default 16/10)
  startFrom?: number; // seconds into the recording
  playbackRate?: number;
  focus?: Focus; // punch in on the spot where the change happens
  uiWidth?: number; // CSS px width of the recorded window (default 1440); used by check-spec's legibility estimate
  title?: string;
  caption?: string;
};
/** Punch-in inside a widget: (x, y) are fractions of the crop; it eases in at `at`, and back out at `until` if set. */
export type Focus = {x: number; y: number; scale: number; at?: number; until?: number};
/**
 * The demo-film scene: a flat colour field, the real product large, one heavy headline.
 * `[word]` in the headline gets a selection box. `layout: 'full'` makes the product fill the frame.
 */
export type DemoScene = Base & {
  type: 'demo';
  bg?: 'paper' | 'ink' | 'accent' | 'accent2' | string; // or a hex colour
  headline?: string; // 2-5 words; [boxed] phrase; \n for a line break
  headlineSize?: number;
  layout?: 'left' | 'right' | 'top' | 'full'; // where the words sit (full: over the product)
  media?: string; // a clip from record.mjs (or a screenshot) in public/
  mediaAspect?: number; // width / height of the media (clips.json)
  uiWidth?: number; // CSS px width of the recorded viewport (clips.json), for the legibility estimate
  startFrom?: number;
  playbackRate?: number;
  view?: ZoomKey[]; // camera on the media: centre (x, y) and scale over time
  windowWidth?: number; // fraction of the frame width the window may take (default 0.54)
  windowAspect?: number; // show a window of another shape than the media (it crops to `view`)
  tilt?: boolean; // hold the window in perspective (opening shot)
  prompt?: {label?: string; text: string; at?: number; cps?: number; until?: number}; // what the person typed
  steps?: {text: string; at: number}[]; // short results ticking in under the headline
  check?: boolean; // steps as ticks instead of numbers
  tag?: string; // label on the pointer next to the boxed word
  brandMark?: boolean | 'lockup'; // true: the small mark + name above the headline; 'lockup': the full logo artwork instead
  kicker?: string; // small step label above the headline: "1 · Strategise"
};
/** Closing card. With `media` it becomes a hero shot: the product rising large behind the line. */
export type EndScene = Base & {type: 'end'; bg?: string; headline: string; button?: string; url?: string; tag?: string; note?: string; media?: string; mediaAspect?: number; uiWidth?: number; startFrom?: number; view?: ZoomKey[]};
export type CtaScene = Base & {type: 'cta'; headline: string; subline?: string; button?: string; url?: string; showLogo?: boolean; photo?: string};

export type Corners = [[number, number], [number, number], [number, number], [number, number]];
export type Overlay = {
  kind: 'notification' | 'bubble' | 'toast' | 'chip' | 'widget';
  // widget: a component of the product at work, cropped from a recording
  media?: string;
  crop?: [number, number, number, number];
  mediaAspect?: number;
  startFrom?: number;
  playbackRate?: number;
  focus?: Focus;
  uiWidth?: number;
  at?: number;
  until?: number;
  pos?: [number, number]; // top-left of the overlay, fractions of the frame
  app?: string;
  title?: string;
  text?: string;
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
  | DemoScene
  | EndScene
  | MomentScene
  | WidgetScene
  | Device3DScene
  | AssembleScene
  | Carousel3DScene
  | Logo3DScene;

export type SceneType = Scene['type'];

export type TrailerSpec = {
  type: 'product' | 'feature' | 'scenario';
  title?: string;
  promise?: string; // the one thing the viewer should believe after watching; every scene must serve it
  format?: Format;
  fps?: number;
  theme?: ThemeSpec;
  brand: Brand;
  music?: {src: string; volume?: number; fadeIn?: number; fadeOut?: number; startFrom?: number; bpm?: number; offset?: number}; // bpm + offset (s of the first beat, after startFrom): check-spec snaps cuts to the beat
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
  demo: 4,
  end: 3.5,
  moment: 4,
  widget: 4,
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

/** Problem scenes default to the dark mood. */
export const sceneMood = (s: Scene): Mood => s.mood ?? (s.type === 'problem' ? 'problem' : 'solution');

export const sceneSeconds = (s: Scene) => s.duration ?? DEFAULT_DURATION[s.type];
export const transitionSeconds = (spec: TrailerSpec) => spec.transitionDuration ?? 0.4;
export const sceneTransition = (spec: TrailerSpec, s: Scene): Transition => {
  const t = s.transition ?? spec.transition ?? 'fade';
  return t === 'cut' ? 'none' : t;
};

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
