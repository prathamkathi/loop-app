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
  alabaster: '#FDFCF8',
  white: '#FFFFFF',
  stone50: '#FAFAF9',
  stone200: '#E7E5E4',
  stone400: '#A8A29E',
  stone500: '#78716C',
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
  border: 'rgba(138, 21, 56, 0.10)',
  borderSubtle: 'rgba(138, 21, 56, 0.06)',

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

  success: palette.emerald,
  error: palette.error,
  errorContainer: palette.errorContainer,
  onError: palette.white,
  whatsapp: '#25D366',
};

export const darkColors: ThemeColors = {
  background: palette.obsidian,
  surface: palette.obsidianCard,
  surfaceElevated: palette.obsidianElevated,
  card: palette.obsidianCard,
  border: 'rgba(138, 21, 56, 0.18)',
  borderSubtle: 'rgba(138, 21, 56, 0.10)',

  primary: '#C44D6A',       // Desaturated crimson for dark surfaces
  primarySoft: '#D4708A',
  primaryMuted: 'rgba(196, 77, 106, 0.5)',
  onPrimary: palette.white,

  accent: palette.white,    // Onyx flips to white in dark mode
  accentSoft: '#E4E4E7',
  onAccent: palette.onyx,

  highlight: 'rgba(253, 236, 239, 0.08)',
  highlightDim: 'rgba(253, 236, 239, 0.12)',

  foreground: '#F5F5F4',
  foregroundSecondary: '#D4D4D8',
  muted: '#A1A1AA',

  success: '#4ADE80',
  error: '#FF8A8A',
  errorContainer: 'rgba(255, 217, 221, 0.12)',
  onError: '#690005',
  whatsapp: '#25D366',
};
