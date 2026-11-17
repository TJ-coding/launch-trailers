import React, {createContext, useContext} from 'react';
import {useVideoConfig} from 'remotion';
import {loadFont as inter} from '@remotion/google-fonts/Inter';
import {loadFont as poppins} from '@remotion/google-fonts/Poppins';
import {loadFont as spaceGrotesk} from '@remotion/google-fonts/SpaceGrotesk';
import {loadFont as manrope} from '@remotion/google-fonts/Manrope';
import {loadFont as dmSans} from '@remotion/google-fonts/DMSans';
import {loadFont as sora} from '@remotion/google-fonts/Sora';
import {loadFont as hanken} from '@remotion/google-fonts/HankenGrotesk';
import {loadFont as schibsted} from '@remotion/google-fonts/SchibstedGrotesk';
import {loadFont as instrumentSerif} from '@remotion/google-fonts/InstrumentSerif';
import {loadFont as fraunces} from '@remotion/google-fonts/Fraunces';
import {loadFont as newsreader} from '@remotion/google-fonts/Newsreader';
import {loadFont as playfair} from '@remotion/google-fonts/PlayfairDisplay';
import type {Brand, DisplayFontName, FontName, ThemeSpec} from './spec';

export type Theme = Required<Omit<ThemeSpec, 'font' | 'display'>> & {font: FontName; fontFamily: string; displayFamily: string; displayWeight: number; accentInk: string};

export const DEFAULT_THEME: Required<ThemeSpec> = {
  bg: '#0B0D12',
  bg2: '#161B2E',
  fg: '#F4F6FA',
  muted: '#9AA3B5',
  accent: '#6E8BFF',
  accent2: '#B57CFF',
  surface: '#1B2030',
  font: 'Inter',
  radius: 18,
  background: 'gradient',
  display: 'Inter',
  grade: 'none',
};

const LOADERS: Record<FontName, () => {fontFamily: string}> = {
  Inter: () => inter('normal', {weights: ['400', '500', '700', '800'], subsets: ['latin']}),
  Poppins: () => poppins('normal', {weights: ['400', '500', '700', '800'], subsets: ['latin']}),
  'Space Grotesk': () => spaceGrotesk('normal', {weights: ['400', '500', '700'], subsets: ['latin']}),
  Manrope: () => manrope('normal', {weights: ['400', '500', '700', '800'], subsets: ['latin']}),
  'DM Sans': () => dmSans('normal', {weights: ['400', '500', '700', '800'], subsets: ['latin']}),
  Sora: () => sora('normal', {weights: ['400', '600', '700', '800'], subsets: ['latin']}),
  'Hanken Grotesk': () => hanken('normal', {weights: ['400', '600', '700', '800'], subsets: ['latin']}),
  'Schibsted Grotesk': () => schibsted('normal', {weights: ['400', '600', '700', '800'], subsets: ['latin']}),
};
const DISPLAY: Record<string, () => {fontFamily: string}> = {
  'Instrument Serif': () => {
    instrumentSerif('italic', {weights: ['400'], subsets: ['latin']});
    return instrumentSerif('normal', {weights: ['400'], subsets: ['latin']});
  },
  Fraunces: () => {
    fraunces('italic', {weights: ['400'], subsets: ['latin']});
    return fraunces('normal', {weights: ['400'], subsets: ['latin']});
  },
  Newsreader: () => {
    newsreader('italic', {weights: ['400'], subsets: ['latin']});
    return newsreader('normal', {weights: ['400'], subsets: ['latin']});
  },
  'Playfair Display': () => {
    playfair('italic', {weights: ['400'], subsets: ['latin']});
    return playfair('normal', {weights: ['400'], subsets: ['latin']});
  },
};
const loaded: Record<string, string> = {};
export const fontFamilyFor = (name: FontName | DisplayFontName) => {
  if (!loaded[name]) loaded[name] = (DISPLAY[name] ?? LOADERS[name as FontName] ?? LOADERS.Inter)().fontFamily;
  return loaded[name]!;
};

/** Darker version of a hex colour, for accents on bright photos. */
const darken = (hex: string, k: number) => {
  const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
  const c = (v: number) => Math.round(v * (1 - k)).toString(16).padStart(2, '0');
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
};

export const resolveTheme = (t: ThemeSpec = {}): Theme => {
  const merged = {...DEFAULT_THEME, ...t};
  const {display, ...rest} = merged;
  return {...rest, fontFamily: fontFamilyFor(merged.font), displayFamily: fontFamilyFor(display ?? merged.font), displayWeight: DISPLAY[display ?? ''] ? 400 : 800, accentInk: darken(merged.accent, 0.45)};
};

type Ctx = {theme: Theme; brand: Brand};
const ThemeContext = createContext<Ctx | null>(null);

export const ThemeProvider: React.FC<{theme: Theme; brand: Brand; children: React.ReactNode}> = ({theme, brand, children}) => (
  <ThemeContext.Provider value={{theme, brand}}>{children}</ThemeContext.Provider>
);

export const useTheme = () => {
  const c = useContext(ThemeContext);
  return c ? c.theme : resolveTheme();
};
export const useBrand = (): Brand => useContext(ThemeContext)?.brand ?? {name: 'Product'};

/** Layout unit: 1u = 1px at 1080p on the short side, so sizes work in every format. */
export const useLayout = () => {
  const {width, height} = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  return {u, width, height, portrait: height > width, square: height === width};
};

/** Translucent version of a hex colour. */
export const alpha = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};
