import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet, View } from 'react-native';
import { useTheme, typography, spacing, radii } from '../theme';
import { CATEGORIES } from '../data/categories';

interface FilterPillsProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function FilterPills({ selectedCategory, onSelectCategory }: FilterPillsProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Pressable
          onPress={() => onSelectCategory(null)}
          style={[
            styles.pill,
            { borderColor: colors.borderSubtle, backgroundColor: selectedCategory === null ? colors.primary : colors.surfaceElevated },
          ]}
        >
          <Text style={[typography.labelSm, { color: selectedCategory === null ? colors.onPrimary : colors.muted }]}>
            All
          </Text>
        </Pressable>

        {CATEGORIES.filter(c => c !== 'All').map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <Pressable
              key={category}
              onPress={() => onSelectCategory(category)}
              style={[
                styles.pill,
                { 
                  borderColor: colors.borderSubtle, 
                  backgroundColor: isSelected ? colors.primary : colors.surfaceElevated 
                },
              ]}
            >
              <Text style={[typography.labelSm, { color: isSelected ? colors.onPrimary : colors.muted }]}>
                {category}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 12,
  },
  container: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
