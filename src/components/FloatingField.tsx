import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, Animated } from 'react-native';
import { useTheme, typography } from '../theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
};

export default function FloatingField({ label, value, onChangeText, multiline }: Props) {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || (value && value.length > 0);

  const anim = React.useRef(new Animated.Value(isFloating ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: isFloating ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isFloating, anim]);

  const top = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [multiline ? 16 : 18, 8],
  });
  const fontSize = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  });

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          styles.input,
          {
            color: colors.foreground,
            backgroundColor: colors.surface,
            borderColor: isFocused
              ? colors.primary
              : isDark
                ? 'rgba(255, 255, 255, 0.12)'
                : 'rgba(138, 21, 56, 0.15)',
            height: multiline ? 104 : 58,
            paddingTop: multiline ? 26 : 20,
            paddingBottom: multiline ? 10 : 4,
          },
          Platform.OS === 'web' && ({
            outlineStyle: 'none' as any as any,
            cursor: 'text' as any,
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease' as any,
            boxShadow: 'none' as any, // isFocused ? `0 0 0 1px ${colors.primary}` : 'none',
          } as any),
        ]}
        placeholderTextColor="transparent"
      />
      <Animated.Text
        style={[
          styles.label,
          {
            color: isFocused ? colors.primary : colors.muted,
            top: top,
            fontSize: fontSize,
            fontWeight: isFloating ? '600' : '400',
            letterSpacing: isFloating ? 0.5 : 0,
          },
          Platform.OS === 'web' && ({
            pointerEvents: 'none',
            userSelect: 'none',
          } as any),
        ]}
      >
        {label}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  input: {
    ...typography.bodyMd,
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  label: {
    position: 'absolute',
    left: 16,
    fontFamily: typography.bodyMd.fontFamily,
  },
});
