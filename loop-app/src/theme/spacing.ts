/**
 * Loop Design System — Spacing
 *
 * 8px grid with 4px micro-adjustments.
 * Follows the DESIGN.md low-density, spacious philosophy.
 */

export const spacing = {
  /** 4px — micro-adjustment */
  xs: 4,
  /** 8px — tight gaps */
  sm: 8,
  /** 16px — standard padding */
  md: 16,
  /** 24px — comfortable gaps, gutter */
  lg: 24,
  /** 48px — section separators */
  xl: 48,
  /** 80px — hero spacing */
  xxl: 80,
  /** 24px — grid gutter */
  gutter: 24,
  /** 20px — mobile horizontal margin */
  marginMobile: 20,
  /** 64px — desktop horizontal margin */
  marginDesktop: 64,
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  xxl: 28,
  xxxl: 32,
  full: 9999,
} as const;

export const shadows = {
  card: {
    shadowColor: '#8A1538',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 4,
  },
  cardHover: {
    shadowColor: '#8A1538',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 8,
  },
  bottomBar: {
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 60,
    elevation: 16,
  },
  button: {
    shadowColor: '#8A1538',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 6,
  },
} as const;
