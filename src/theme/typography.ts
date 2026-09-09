/**
 * Loop Design System — Typography (Electric Campus)
 *
 * Display / Headline: Space Grotesk (brutalist, loud, wide)
 * Body / Label / Data: Inter (neutral, highly readable)
 */

import { Platform, TextStyle } from 'react-native';

const headingFamily = Platform.select({
  web: 'SpaceGrotesk_700Bold, sans-serif',
  ios: 'SpaceGrotesk_700Bold',
  android: 'SpaceGrotesk_700Bold',
  default: 'SpaceGrotesk_700Bold',
});

const bodyFamily = Platform.select({
  web: 'Inter_400Regular, sans-serif',
  ios: 'Inter_400Regular',
  android: 'Inter_400Regular',
  default: 'Inter_400Regular',
});

const labelFamily = Platform.select({
  web: 'Inter_600SemiBold, sans-serif',
  ios: 'Inter_600SemiBold',
  android: 'Inter_600SemiBold',
  default: 'Inter_600SemiBold',
});

export const typography = {
  // Headings
  displayXl: {
    fontFamily: headingFamily,
    fontSize: 52,
    fontWeight: '700',
    letterSpacing: -1.8,
    lineHeight: 56,
    textTransform: 'uppercase',
  } as TextStyle,
  displayLg: {
    fontFamily: headingFamily,
    fontSize: 38,
    fontWeight: '700',
    letterSpacing: -1.2,
    lineHeight: 42,
    textTransform: 'uppercase',
  } as TextStyle,
  displayMd: { // text-3xl font-semibold tracking-tight
    fontFamily: headingFamily,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.75,
    lineHeight: 36,
    textTransform: 'uppercase',
  } as TextStyle,
  titleXl: { // text-2xl font-semibold leading-tight
    fontFamily: headingFamily,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    textTransform: 'uppercase',
  } as TextStyle,
  titleLg: { // text-lg font-semibold tracking-tight leading-snug
    fontFamily: headingFamily,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.45,
    lineHeight: 25,
  } as TextStyle,
  titleMd: { // text-lg font-medium leading-snug
    fontFamily: headingFamily,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 25,
  } as TextStyle,
  
  // Body
  bodyMd: { // text-base
    fontFamily: bodyFamily,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  } as TextStyle,
  bodySm: { // text-sm
    fontFamily: bodyFamily,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } as TextStyle,
  bodyXs: { // text-xs
    fontFamily: bodyFamily,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } as TextStyle,
  
  // Labels
  labelCaps: { // text-xs font-semibold uppercase tracking-[0.22em]
    fontFamily: labelFamily,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2.64, 
    lineHeight: 16,
  } as TextStyle,
  labelMd: { // text-sm font-semibold
    fontFamily: labelFamily,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,
  titleSm: {
    fontFamily: headingFamily,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  } as TextStyle,
  labelLg: {
    fontFamily: labelFamily,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,
  labelSm: { // text-xs font-medium
    fontFamily: labelFamily,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  } as TextStyle,
  caption: {
    fontFamily: bodyFamily,
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 15,
  } as TextStyle,
} as const;
