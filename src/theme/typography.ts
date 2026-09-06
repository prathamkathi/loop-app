/**
 * Loop Design System — Typography
 *
 * Display / Headline: Outfit (geometric, modern-luxe)
 * Body / Label / Data: Geist (clear, technical fintech edge)
 *
 * All sizes follow the DESIGN.md editorial scale.
 * Line heights are generous (1.3–1.6) to reinforce the premium, unhurried feel.
 */

import { Platform, TextStyle } from 'react-native';

const outfitFamily = Platform.select({
  web: '"Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  ios: 'Outfit_600SemiBold',
  android: 'Outfit_600SemiBold',
  default: 'Outfit_600SemiBold',
});

const geistFamily = Platform.select({
  web: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  ios: 'Geist_400Regular',
  android: 'Geist_400Regular',
  default: 'Geist_400Regular',
});

export const typography = {
  // Headings
  displayMd: { // text-3xl font-semibold tracking-tight
    fontFamily: outfitFamily,
    fontSize: 30,
    fontWeight: '600',
    letterSpacing: -0.75,
    lineHeight: 36,
  } as TextStyle,
  titleXl: { // text-2xl font-semibold leading-tight
    fontFamily: outfitFamily,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  } as TextStyle,
  titleLg: { // text-lg font-semibold tracking-tight leading-snug
    fontFamily: outfitFamily,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.45,
    lineHeight: 25,
  } as TextStyle,
  titleMd: { // text-lg font-medium leading-snug
    fontFamily: outfitFamily,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 25,
  } as TextStyle,
  
  // Body
  bodyMd: { // text-base
    fontFamily: geistFamily,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  } as TextStyle,
  bodySm: { // text-sm
    fontFamily: geistFamily,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } as TextStyle,
  bodyXs: { // text-xs
    fontFamily: geistFamily,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } as TextStyle,
  
  // Labels
  labelCaps: { // text-xs font-semibold uppercase tracking-[0.22em]
    fontFamily: geistFamily,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2.64, 
    lineHeight: 16,
  } as TextStyle,
  labelMd: { // text-sm font-semibold
    fontFamily: geistFamily,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,
  titleSm: {
    fontFamily: outfitFamily,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  } as TextStyle,
  labelLg: {
    fontFamily: geistFamily,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,
  labelSm: { // text-xs font-medium
    fontFamily: geistFamily,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  } as TextStyle,
  caption: {
    fontFamily: geistFamily,
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 15,
  } as TextStyle,
} as const;
