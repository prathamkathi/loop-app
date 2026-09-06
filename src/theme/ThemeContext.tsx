/**
 * Loop Design System — Theme Context
 *
 * Provides Light/Dark mode toggle with AsyncStorage persistence.
 * All components consume `useTheme()` to get adaptive colors.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useColorScheme, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, type ThemeColors } from './colors';

const THEME_STORAGE_KEY = '@loop/theme-mode';

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  colors: ThemeColors;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
  mode: 'light',
  setMode: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [loaded, setLoaded] = useState(false);

  // Load persisted theme on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setModeState(stored);
      }
      setLoaded(true);
    });
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : mode === 'light' ? 'dark' : 'light');
  }, [mode, setMode]);

  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  const colors = isDark ? darkColors : lightColors;

  // Don't render full app until we've loaded the persisted preference,
  // but show a themed splash to prevent white screen (F-33)
  if (!loaded) {
    const defaultDark = systemScheme === 'dark';
    const bg = defaultDark ? darkColors.background : lightColors.background;
    const fg = defaultDark ? darkColors.primary : lightColors.primary;
    
    return (
      <View style={{ flex: 1, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 32, fontWeight: '700', color: fg, letterSpacing: -1 }}>
          Loop.
        </Text>
      </View>
    );
  }

  return (
    <ThemeContext.Provider value={{ colors, isDark, mode, setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
