/**
 * Loop Design System — Color Tokens (Elite & Classy)
 *
 * Meticulously crafted monochrome palette handling Light/Dark modes gracefully.
 * Pristine white, deep obsidian, and a refined IITD Crimson for essential actions.
 */

export const palette = {
  // Canvas
  pureWhite: '#FFFFFF',
  offWhite: '#F9FAFB',
  obsidian: '#0A0A0C',
  charcoal: '#141415',
  
  // Brand
  crimson: '#8A1538',
  crimsonSoft: 'rgba(138, 21, 56, 0.1)',
  crimsonMuted: 'rgba(138, 21, 56, 0.05)',

  // Neutrals (Graphite/Silver)
  graphite900: '#1C1C1E',
  graphite800: '#2C2C2E',
  graphite700: '#3A3A3C',
  silver600: '#8E8E93',
  silver500: '#AEAEB2',
  silver400: '#C7C7CC',
  silver300: '#D1D1D6',
  silver200: '#E5E5EA',
  silver100: '#F2F2F7',

  // Highlight
  glassLight: 'rgba(255, 255, 255, 0.75)',
  glassDark: 'rgba(0, 0, 0, 0.65)',
  overlayLight: 'rgba(0, 0, 0, 0.04)',
  overlayDark: 'rgba(255, 255, 255, 0.04)',

  // Semantic
  error: '#FF3B30',
  success: '#34C759',
  info: '#007AFF',

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
  
  olive: string;

  highlight: string;
  highlightDim: string;

  facilityBlue: string;
  facilityGreen: string;
  facilityCrimson: string;
  surfaceHover: string;
  surfaceOverlay: string;

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
  background: palette.offWhite,
  surface: palette.pureWhite,
  surfaceElevated: palette.pureWhite,
  card: palette.pureWhite,
  border: palette.silver200,
  borderSubtle: palette.silver100,

  primary: palette.graphite900,
  primarySoft: palette.silver200,
  primaryMuted: palette.silver100,
  onPrimary: palette.pureWhite,

  accent: palette.crimson,
  accentSoft: palette.crimsonSoft,
  onAccent: palette.pureWhite,
  
  olive: palette.graphite900,

  highlight: palette.overlayLight,
  highlightDim: 'rgba(0,0,0,0.02)',

  facilityBlue: 'rgba(0, 122, 255, 0.1)',
  facilityGreen: 'rgba(52, 199, 89, 0.1)',
  facilityCrimson: 'rgba(255, 59, 48, 0.1)',
  
  surfaceHover: palette.overlayLight,
  surfaceOverlay: palette.glassLight,

  foreground: palette.graphite900,
  foregroundSecondary: palette.graphite700,
  muted: palette.silver600,

  success: palette.success,
  error: palette.error,
  errorContainer: 'rgba(255, 59, 48, 0.1)',
  onError: palette.pureWhite,
  whatsapp: palette.success,
};

export const darkColors: ThemeColors = {
  background: palette.obsidian,
  surface: palette.charcoal,
  surfaceElevated: '#1C1C1E',
  card: palette.charcoal,
  border: 'rgba(255, 255, 255, 0.12)',
  borderSubtle: 'rgba(255, 255, 255, 0.05)',

  primary: palette.pureWhite,
  primarySoft: 'rgba(255, 255, 255, 0.15)',
  primaryMuted: 'rgba(255, 255, 255, 0.05)',
  onPrimary: palette.obsidian,

  accent: palette.crimson,
  accentSoft: palette.crimsonSoft,
  onAccent: palette.pureWhite,
  
  olive: palette.pureWhite,

  highlight: palette.overlayDark,
  highlightDim: 'rgba(255,255,255,0.02)',

  facilityBlue: 'rgba(10, 132, 255, 0.2)',
  facilityGreen: 'rgba(48, 209, 88, 0.2)',
  facilityCrimson: 'rgba(255, 69, 58, 0.2)',
  
  surfaceHover: palette.overlayDark,
  surfaceOverlay: palette.glassDark,

  foreground: palette.pureWhite,
  foregroundSecondary: palette.silver300,
  muted: palette.silver600,

  success: '#30D158',
  error: '#FF453A',
  errorContainer: 'rgba(255, 69, 58, 0.2)',
  onError: palette.pureWhite,
  whatsapp: '#30D158',
};
