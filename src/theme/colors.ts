/**
 * Loop Design System — Color Tokens
 *
 * Light mode: Alabaster canvas, Crimson primary, Onyx accent, Rose Water highlights
 * Dark mode:  Obsidian canvas, desaturated Crimson tints, soft-white text
 *
 * Champagne Gold has been eliminated per brand guidelines.
 */

export const palette = {
  // Brand
  crimson: '#8A1538',
  crimsonSoft: '#A8324F',
  crimsonMuted: 'rgba(138, 21, 56, 0.7)',

  // Accent
  onyx: '#18181B',
  onyxSoft: '#27272A',

  // Highlight
  roseWater: '#FDECEF',
  roseWaterDim: '#F8D7DC',

  // Neutrals — Light
  alabaster: '#F8F7F4',
  white: '#FFFFFF',
  stone50: '#FAFAF9',
  stone200: '#E7E5E4',
  stone400: '#A8A29E',
  stone500: '#6D6661',
  stone700: '#44403C',
  stone900: '#1C1917',

  // Neutrals — Dark
  obsidian: '#0A0A0C',
  obsidianCard: '#161618',
  obsidianElevated: '#1E1E20',
  obsidianMuted: '#A1A1AA',

  // Semantic
  emerald: '#22C55E',
  error: '#BA1A1A',
  errorContainer: '#FFD9DD',

  // Transparent helpers
  transparent: 'transparent',
} as const;

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  card: string;
  border: string;
  borderSubtle: string;

  primary: string;
  primarySoft: string;
  primaryMuted: string;
  onPrimary: string;

  accent: string;
  accentSoft: string;
  onAccent: string;

  highlight: string;
  highlightDim: string;

  foreground: string;
  foregroundSecondary: string;
  muted: string;

  success: string;
  error: string;
  errorContainer: string;
  onError: string;
  whatsapp: string;
};

export const lightColors: ThemeColors = {
  background: palette.alabaster,
  surface: palette.white,
  surfaceElevated: palette.white,
  card: palette.white,
  border: '#E0DDD8',
  borderSubtle: '#EEEAE5',

  primary: palette.crimson,
  primarySoft: palette.crimsonSoft,
  primaryMuted: palette.crimsonMuted,
  onPrimary: palette.white,

  accent: palette.onyx,
  accentSoft: palette.onyxSoft,
  onAccent: palette.white,

  highlight: palette.roseWater,
  highlightDim: palette.roseWaterDim,

  foreground: palette.stone900,
  foregroundSecondary: palette.stone700,
  muted: palette.stone500,

  success: '#167447',
  error: palette.error,
  errorContainer: palette.errorContainer,
  onError: palette.white,
  whatsapp: '#25D366',
};

export const darkColors: ThemeColors = {
  background: '#131314',
  surface: '#1D1D1F',
  surfaceElevated: '#252527',
  card: '#1D1D1F',
  border: 'rgba(255, 255, 255, 0.09)',
  borderSubtle: 'rgba(255, 255, 255, 0.05)',

  primary: '#C94D6C',
  primarySoft: '#FB7185',
  primaryMuted: 'rgba(225, 29, 72, 0.45)',
  onPrimary: palette.white,

  accent: palette.white,    // Onyx flips to white in dark mode
  accentSoft: '#E2E8F0',
  onAccent: palette.onyx,

  highlight: 'rgba(225, 29, 72, 0.12)',
  highlightDim: 'rgba(225, 29, 72, 0.20)',

  foreground: '#FFFFFF',
  foregroundSecondary: '#E2E8F0',
  muted: '#94A3B8',

  success: '#34D399',
  error: '#F87171',
  errorContainer: 'rgba(248, 113, 113, 0.14)',
  onError: '#FFFFFF',
  whatsapp: '#25D366',
};
