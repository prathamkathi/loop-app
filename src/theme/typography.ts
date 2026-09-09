/**
 * Loop Design System — Typography
 *
 * Display / Headline: Manrope (elegant, modern, editorial)
 * Body / Label / Data: DM Sans (clear, highly readable)
 */

import { Platform, TextStyle } from 'react-native';

const headingFamily = Platform.select({
  web: 'Manrope_600SemiBold, sans-serif',
  ios: 'Manrope_600SemiBold',
  android: 'Manrope_600SemiBold',
  default: 'Manrope_600SemiBold',
});

const bodyFamily = Platform.select({
  web: 'DMSans_400Regular, sans-serif',
  ios: 'DMSans_400Regular',
  android: 'DMSans_400Regular',
  default: 'DMSans_400Regular',
});

const labelFamily = Platform.select({
  web: 'DMSans_500Medium, sans-serif',
  ios: 'DMSans_500Medium',
  android: 'DMSans_500Medium',
  default: 'DMSans_500Medium',
});

export const typography = {
  // Headings
  displayMd: { // text-3xl font-semibold tracking-tight
    fontFamily: headingFamily,
    fontSize: 30,
    fontWeight: '600',
    letterSpacing: -0.75,
    lineHeight: 36,
  } as TextStyle,
  titleXl: { // text-2xl font-semibold leading-tight
    fontFamily: headingFamily,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
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
