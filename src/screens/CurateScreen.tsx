import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import {
  Check,
  SquaresFour,
  MaskHappy,
  Cpu,
  Trophy,
  Heart,
  Confetti,
  ChatCircleDots,
  Megaphone,
} from 'phosphor-react-native';
import { useTheme, typography, radii } from '../theme';
import SectionLabel from '../components/SectionLabel';
import { CANONICAL_CATEGORIES } from '../data/categories';

type Props = {
  interests: Set<string>;
  onToggle: (cat: string) => void;
};

const getCategoryIcon = (cat: string, color: string) => {
  const props = { size: 16, color, weight: 'bold' as const };
  switch (cat) {
    case 'All': return <SquaresFour {...props} />;
    case 'Cultural & Arts': return <MaskHappy {...props} />;
    case 'Tech & Innovation': return <Cpu {...props} />;
    case 'Fests & Major Events': return <Confetti {...props} />;
    case 'Competitions & Quizzes': return <Trophy {...props} />;
    case 'Talks & Workshops': return <ChatCircleDots {...props} />;
    case 'Sports & Fitness': return <Trophy {...props} />;
    case 'Social & Wellness': return <Heart {...props} />;
    case 'Campus Notices': return <Megaphone {...props} />;
    default: return <SquaresFour {...props} />;
  }
};

export default function CurateScreen({ interests, onToggle }: Props) {
  const { colors } = useTheme();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <SectionLabel>Personalize</SectionLabel>
      <Text style={[styles.heading, { color: colors.foreground }]}>
        Curate your feed
      </Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Select the topics and campus initiatives you care about most.
      </Text>

      {/* Category Filter Pills */}
      <View style={styles.pills}>
        {CANONICAL_CATEGORIES.map((cat) => {
          const selected = interests.has(cat);
          const iconColor = selected ? colors.onPrimary : colors.primary;

          return (
            <Pressable
              key={cat}
              onPress={() => onToggle(cat)}
              accessibilityRole="button"
              accessibilityLabel={`${cat}: ${selected ? 'Selected' : 'Not selected'}`}
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.pill,
                {
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
                Platform.OS === 'web' && ({
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }),
              ]}
            >
              {!selected && getCategoryIcon(cat, iconColor)}
              {selected && <Check size={16} color={colors.onPrimary} weight="bold" />}
              <Text
                style={[
                  styles.pillText,
                  { color: selected ? colors.onPrimary : colors.foreground },
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 96,
  },
  heading: {
    ...typography.displayMd,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.bodyMd,
    maxWidth: 460,
    marginBottom: 32,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 44,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  pillText: {
    ...typography.bodyMd,
    fontWeight: '500',
    fontSize: 14,
  },
});
