/**
 * Loop Design System — Typography (Elite & Classy)
 *
 * Exclusively utilizing Inter for flawless, premium readability.
 * Sentence-case headings, strict tracking control, geometric purity.
 */

import { Platform, TextStyle } from 'react-native';

const interFamily = Platform.select({
  web: 'Inter_400Regular, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  ios: 'Inter_400Regular',
  android: 'Inter_400Regular',
  default: 'Inter_400Regular',
});

const interMedium = Platform.select({
  web: 'Inter_500Medium, -apple-system, BlinkMacSystemFont, sans-serif',
  ios: 'Inter_500Medium',
  android: 'Inter_500Medium',
  default: 'Inter_500Medium',
});

const interSemiBold = Platform.select({
  web: 'Inter_600SemiBold, -apple-system, BlinkMacSystemFont, sans-serif',
  ios: 'Inter_600SemiBold',
  android: 'Inter_600SemiBold',
  default: 'Inter_600SemiBold',
});

const interBold = Platform.select({
  web: 'Inter_700Bold, -apple-system, BlinkMacSystemFont, sans-serif',
  ios: 'Inter_700Bold',
  android: 'Inter_700Bold',
  default: 'Inter_700Bold',
});

export const typography = {
  // Headings - Refined, sentence case, tight but not aggressive tracking
  displayXl: {
    fontFamily: interBold,
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1.0,
    lineHeight: 56,
  } as TextStyle,
  displayLg: {
    fontFamily: interBold,
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -0.8,
    lineHeight: 48,
  } as TextStyle,
  displayMd: { 
    fontFamily: interBold,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: 40,
  } as TextStyle,
  titleXl: { 
    fontFamily: interSemiBold,
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 32,
  } as TextStyle,
  titleLg: { 
    fontFamily: interSemiBold,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
    lineHeight: 28,
  } as TextStyle,
  titleMd: { 
    fontFamily: interMedium,
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: -0.2,
    lineHeight: 26,
  } as TextStyle,
  titleSm: {
    fontFamily: interSemiBold,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.1,
    lineHeight: 24,
  } as TextStyle,
  
  // Body - Optimized for legibility and airiness
  bodyMd: { 
    fontFamily: interFamily,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 24,
  } as TextStyle,
  bodySm: { 
    fontFamily: interFamily,
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 22,
  } as TextStyle,
  bodyXs: { 
    fontFamily: interFamily,
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.1,
    lineHeight: 18,
  } as TextStyle,
  
  // Labels - Precise, structured
  labelCaps: { 
    fontFamily: interSemiBold,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2, 
    lineHeight: 16,
  } as TextStyle,
  labelLg: {
    fontFamily: interSemiBold,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.1,
    lineHeight: 20,
  } as TextStyle,
  labelMd: { 
    fontFamily: interSemiBold,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
    lineHeight: 20,
  } as TextStyle,
  labelSm: { 
    fontFamily: interMedium,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 16,
  } as TextStyle,
  caption: {
    fontFamily: interFamily,
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.1,
    lineHeight: 16,
  } as TextStyle,
} as const;
