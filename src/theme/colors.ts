/**
 * Loop Design System — Color Tokens (Electric Campus)
 *
 * Void Black canvas, Neon Lime primary, Electric Violet accents
 * Dark mode everywhere.
 */

export const palette = {
  // Brand
  neonLime: '#CCFF00',
  neonLimeSoft: '#E6FF80',
  neonLimeMuted: 'rgba(204, 255, 0, 0.2)',

  // Brand Accents
  electricViolet: '#7000FF',

  // Canvas
  voidBlack: '#050505',
  voidSurface: '#121212',
  voidElevated: '#1A1A1A',
  
  // Highlight
  glass: 'rgba(255, 255, 255, 0.04)',
  glassHover: 'rgba(255, 255, 255, 0.08)',
  glassDim: 'rgba(255, 255, 255, 0.02)',

  // Neutrals
  white: '#FFFFFF',
  silver: '#888891',
  stone400: '#A8A29E',
  stone500: '#6D6661',
  stone700: '#44403C',

  // Semantic
  error: '#FF3366',
  errorContainer: 'rgba(255, 51, 102, 0.15)',

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
  
  olive: string; // Deprecated but kept for type compatibility

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

const electricTheme: ThemeColors = {
  background: palette.voidBlack,
  surface: palette.voidSurface,
  surfaceElevated: palette.voidElevated,
  card: palette.voidSurface,
  border: 'rgba(255, 255, 255, 0.1)',
  borderSubtle: 'rgba(255, 255, 255, 0.05)',

  primary: palette.neonLime,
  primarySoft: palette.neonLimeSoft,
  primaryMuted: palette.neonLimeMuted,
  onPrimary: '#000000', // Black text on lime

  accent: palette.electricViolet,
  accentSoft: '#8F33FF',
  onAccent: palette.white,
  
  olive: '#CCFF00', // Override olive with lime for old components

  highlight: palette.glass,
  highlightDim: palette.glassDim,

  facilityBlue: 'rgba(56, 189, 248, 0.15)',
  facilityGreen: 'rgba(204, 255, 0, 0.15)', // Neon lime tint
  facilityCrimson: 'rgba(255, 51, 102, 0.15)', // Error tint
  surfaceHover: palette.glassHover,
  surfaceOverlay: 'rgba(0, 0, 0, 0.75)',

  foreground: palette.white,
  foregroundSecondary: '#D1D1D6',
  muted: palette.silver,

  success: '#CCFF00',
  error: palette.error,
  errorContainer: palette.errorContainer,
  onError: palette.white,
  whatsapp: '#CCFF00',
};

// Force dark mode everywhere
export const lightColors: ThemeColors = electricTheme;
export const darkColors: ThemeColors = electricTheme;
