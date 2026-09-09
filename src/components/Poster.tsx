import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path, Pattern } from 'react-native-svg';
import { useTheme } from '../theme';

interface PosterProps {
  category: string;
  width?: number | string;
  height?: number | string;
  seed?: string;
}

const CATEGORY_MAP: Record<string, { bg1: string, bg2: string, text: string, shape: 'circle' | 'square' | 'triangle' | 'blob' }> = {
  'Academics': { bg1: '#e0eaf5', bg2: '#c9dcf0', text: 'focus', shape: 'square' },
  'Career & Professional': { bg1: '#e8e6eb', bg2: '#d8d4df', text: 'hustle', shape: 'triangle' },
  'Cultural & Arts': { bg1: '#f8e6e9', bg2: '#f3d3d9', text: 'after hours', shape: 'blob' },
  'Sports & Fitness': { bg1: '#e3eee1', bg2: '#d0e5cd', text: 'move', shape: 'circle' },
  'Science & Tech': { bg1: '#e6e6f1', bg2: '#d5d5e8', text: 'make something', shape: 'square' },
  'Campus Notices': { bg1: '#f9eee6', bg2: '#f5e3d2', text: 'notice', shape: 'circle' },
};

const DEFAULT = { bg1: '#f0f0f0', bg2: '#e4e4e4', text: 'happening', shape: 'circle' as const };

export default function Poster({ category, width = '100%', height = '100%', seed = '1' }: PosterProps) {
  const { colors, isDark } = useTheme();
  
  const config = useMemo(() => {
    return CATEGORY_MAP[category] || DEFAULT;
  }, [category]);

  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const patternScale = 1 + (hash % 3) * 0.5;

  return (
    <View style={[styles.container, { width, height, backgroundColor: isDark ? '#1a1a1a' : config.bg1 } as any]}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={isDark ? '#2a2a2a' : config.bg1} stopOpacity="1" />
            <Stop offset="100%" stopColor={isDark ? '#111111' : config.bg2} stopOpacity="1" />
          </LinearGradient>
          <Pattern id="dots" x="0" y="0" width={10 * patternScale} height={10 * patternScale} patternUnits="userSpaceOnUse">
            <Circle cx="2" cy="2" r="1.5" fill={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"} />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#dots)" />
        
        {config.shape === 'circle' && (
          <Circle cx="50%" cy="50%" r="35%" fill={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"} />
        )}
        {config.shape === 'square' && (
          <Rect x="20%" y="20%" width="60%" height="60%" rx="16" fill={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"} />
        )}
        {config.shape === 'triangle' && (
          <Path d="M50,20 L80,80 L20,80 Z" fill={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"} />
        )}
        {config.shape === 'blob' && (
          <Path d="M40.4,-67.2C54.4,-60.7,68.9,-51.7,77.7,-38.6C86.4,-25.5,89.5,-8.3,87.6,8.7C85.7,25.7,78.8,42.5,68.5,56.5C58.1,70.5,44.3,81.6,28.7,85.2C13.1,88.7,-4.3,84.7,-20.9,78C-37.5,71.3,-53.3,61.9,-64.1,48.7C-74.9,35.5,-80.7,18.5,-79.8,2.2C-78.9,-14.1,-71.4,-29.7,-60.7,-42C-50,-54.3,-36.2,-63.3,-22,-69.1C-7.8,-74.9,6.6,-77.5,20.5,-74C34.4,-70.5,47.8,-60.8,40.4,-67.2Z" transform="translate(50 50) scale(0.6)" fill={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"} />
        )}
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.typography, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)' }]}>
          {config.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    padding: 24,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typography: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 28,
    textTransform: 'uppercase',
    letterSpacing: -1,
    textAlign: 'center',
    lineHeight: 32,
  }
});
