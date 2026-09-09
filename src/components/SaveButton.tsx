import React from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import { BookmarkSimple } from 'phosphor-react-native';
import { useTheme } from '../theme';

type Props = {
  saved: boolean;
  onPress: () => void;
  light?: boolean;
  inline?: boolean;
};

export default function SaveButton({ saved, onPress, light = false, inline = false }: Props) {
  const { colors, isDark } = useTheme();

  return (
    <Pressable
      onPress={(e) => {
        e.stopPropagation();
        onPress();
      }}
      style={({ pressed }) => [
        styles.btn,
        inline && { position: 'relative', top: 0, right: 0 },
        saved
          ? { backgroundColor: colors.primary }
          : light
            ? { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)' }
            : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
        Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
        { transform: [{ scale: pressed ? 0.9 : 1 }] },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: saved }}
      accessibilityLabel={saved ? 'Remove bookmark' : 'Bookmark event'}
    >
      <BookmarkSimple
        size={20}
        weight={saved ? 'fill' : 'regular'}
        color={saved ? colors.onPrimary : light ? (isDark ? '#FFFFFF' : '#1C1917') : colors.primary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  lightBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
});
