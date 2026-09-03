import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme, typography } from '../theme';

type Props = { children: React.ReactNode; style?: object };

export default function SectionLabel({ children, style }: Props) {
  const { colors } = useTheme();
  return (
    <Text
      style={[
        styles.label,
        { color: colors.primaryMuted },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.labelCaps,
    marginBottom: 20,
    letterSpacing: 2.6,
  },
});
