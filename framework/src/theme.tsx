import React, {createContext, useContext} from 'react';
import {useVideoConfig} from 'remotion';
import {loadFont as inter} from '@remotion/google-fonts/Inter';
import {loadFont as poppins} from '@remotion/google-fonts/Poppins';
import {loadFont as spaceGrotesk} from '@remotion/google-fonts/SpaceGrotesk';
import {loadFont as manrope} from '@remotion/google-fonts/Manrope';
import {loadFont as dmSans} from '@remotion/google-fonts/DMSans';
import type {Brand, FontName, ThemeSpec} from './spec';

export type Theme = Required<Omit<ThemeSpec, 'font'>> & {font: FontName; fontFamily: string};

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
};

const LOADERS: Record<FontName, () => {fontFamily: string}> = {
  Inter: () => inter('normal', {weights: ['400', '500', '700', '800'], subsets: ['latin']}),
  Poppins: () => poppins('normal', {weights: ['400', '500', '700', '800'], subsets: ['latin']}),
  'Space Grotesk': () => spaceGrotesk('normal', {weights: ['400', '500', '700'], subsets: ['latin']}),
  Manrope: () => manrope('normal', {weights: ['400', '500', '700', '800'], subsets: ['latin']}),
  'DM Sans': () => dmSans('normal', {weights: ['400', '500', '700', '800'], subsets: ['latin']}),
};
const loaded: Partial<Record<FontName, string>> = {};
export const fontFamilyFor = (name: FontName) => {
  if (!loaded[name]) loaded[name] = (LOADERS[name] ?? LOADERS.Inter)().fontFamily;
  return loaded[name]!;
};

export const resolveTheme = (t: ThemeSpec = {}): Theme => {
  const merged = {...DEFAULT_THEME, ...t};
  return {...merged, fontFamily: fontFamilyFor(merged.font)};
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
