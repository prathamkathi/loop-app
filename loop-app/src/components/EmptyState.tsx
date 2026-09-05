import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Broadcast } from 'phosphor-react-native';
import { useTheme, typography, radii } from '../theme';

type Props = {
  onReset: () => void;
  onEditInterests: () => void;
};

export default function EmptyState({ onReset, onEditInterests }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.rings}>
        <View style={[styles.ring, styles.ring1, { borderColor: colors.border }]} />
        <View style={[styles.ring, styles.ring2, { borderColor: colors.borderSubtle }]} />
        <View style={[styles.ring, styles.ring3, { borderColor: colors.borderSubtle }]} />
        <Broadcast size={40} weight="regular" color={colors.primaryMuted} />
      </View>

      <Text style={[styles.heading, { color: colors.foreground }]}>
        The campus is quiet.
      </Text>
      <Text style={[styles.body, { color: colors.muted }]}>
        No events match your current filters. Adjust your interests, or reset filters to explore everything happening.
      </Text>

      <View style={styles.actions}>
        <Pressable
          onPress={onReset}
          accessibilityRole="button"
          accessibilityLabel="Reset filters"
          style={({ pressed }) => [
            styles.primaryBtn,
            {
              backgroundColor: colors.primary,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
            Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
          ]}
        >
          <Text style={[styles.btnText, { color: colors.onPrimary }]}>Reset filters</Text>
        </Pressable>
        <Pressable
          onPress={onEditInterests}
          accessibilityRole="button"
          accessibilityLabel="Edit interests"
          style={({ pressed }) => [
            styles.secondaryBtn,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
            Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
          ]}
        >
          <Text style={[styles.btnText, { color: colors.primary }]}>Edit interests</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 400,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  rings: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: radii.full,
  },
  ring1: { width: 128, height: 128 },
  ring2: { width: 96, height: 96 },
  ring3: { width: 64, height: 64 },
  heading: {
    ...typography.displayMd,
    fontWeight: '600',
    textAlign: 'center',
  },
  body: {
    ...typography.bodyMd,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 340,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },
  primaryBtn: {
    height: 44,
    paddingHorizontal: 24,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    height: 44,
    paddingHorizontal: 24,
    borderRadius: radii.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    ...typography.labelMd,
    fontSize: 14,
    fontWeight: '600',
  },
});
