import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, Platform } from 'react-native';
import {
  Check,
  Clock,
  SquaresFour,
  MaskHappy,
  Cpu,
  Trophy,
  Heart,
  Confetti,
  ChatCircleDots,
  Megaphone,
  Bell,
  Sliders,
} from 'phosphor-react-native';
import { useTheme, typography, radii } from '../theme';
import SectionLabel from '../components/SectionLabel';
import { CATEGORIES } from '../data/categories';

type Props = {
  interests: Set<string>;
  onToggle: (cat: string) => void;
  reminder: number;
  onReminderChange: (value: number) => void;
};

const DEFAULT_REMINDER_OPTS = [
  { id: 0, label: 'At event start' },
  { id: 15, label: '15 min before' },
  { id: 30, label: '30 min before' },
  { id: 60, label: '1 hour before' },
  { id: 1440, label: '1 day before' },
];

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

export default function CurateScreen({ interests, onToggle, reminder, onReminderChange }: Props) {
  const { colors } = useTheme();

  const [customValue, setCustomValue] = useState('45');
  const [customUnit, setCustomUnit] = useState<'minutes' | 'hours' | 'days'>('minutes');
  const [isCustomMode, setIsCustomMode] = useState(!DEFAULT_REMINDER_OPTS.some((o) => o.id === reminder));

  const handleApplyCustom = () => {
    const val = parseInt(customValue.trim(), 10);
    if (isNaN(val) || val <= 0) return;

    let totalMinutes = val;
    if (customUnit === 'hours') totalMinutes = val * 60;
    if (customUnit === 'days') totalMinutes = val * 1440;

    onReminderChange(totalMinutes);
  };

  const formatReminderSummary = (minutes: number) => {
    if (minutes === 0) return 'At start time';
    if (minutes < 60) return `${minutes} minutes before`;
    if (minutes % 1440 === 0) return `${minutes / 1440} day(s) before`;
    if (minutes % 60 === 0) return `${minutes / 60} hour(s) before`;
    return `${minutes} minutes before`;
  };

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
        {CATEGORIES.map((cat) => {
          const selected = interests.has(cat);
          const iconColor = selected ? colors.onPrimary : colors.primary;

          return (
            <Pressable
              key={cat}
              onPress={() => onToggle(cat)}
              accessibilityRole="button"
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

      {/* Enhanced Event Reminders (Default & Custom) */}
      <View style={[styles.reminderSection, { borderTopColor: colors.border }]}>
        <View style={styles.reminderHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.reminderTitle, { color: colors.foreground }]}>
              Calendar Notifications & Reminders
            </Text>
            <Text style={[styles.reminderSubtitle, { color: colors.muted }]}>
              Active setting: <Text style={{ color: colors.primary, fontWeight: '700' }}>{formatReminderSummary(reminder)}</Text>
            </Text>
          </View>
          <Bell size={22} color={colors.primary} weight="duotone" />
        </View>

        {/* Default Quick Options */}
        <View style={styles.reminderGrid}>
          {DEFAULT_REMINDER_OPTS.map((opt) => {
            const on = reminder === opt.id && !isCustomMode;
            return (
              <Pressable
                key={opt.id}
                onPress={() => {
                  setIsCustomMode(false);
                  onReminderChange(opt.id);
                }}
                style={({ pressed }) => [
                  styles.reminderBtn,
                  {
                    backgroundColor: on ? colors.primary : colors.surface,
                    borderColor: on ? colors.primary : colors.border,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                  Platform.OS === 'web' && ({
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }),
                ]}
              >
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: on ? 'rgba(255, 255, 255, 0.2)' : colors.highlight },
                  ]}
                >
                  <Clock size={16} weight={on ? 'fill' : 'regular'} color={on ? colors.onPrimary : colors.primary} />
                </View>
                <Text style={[styles.reminderLabel, { color: on ? colors.onPrimary : colors.foreground }]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Custom Reminder Trigger & Picker */}
        <View style={[styles.customCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.customCardHeader}>
            <Sliders size={18} color={colors.primary} weight="bold" />
            <Text style={[styles.customCardTitle, { color: colors.foreground }]}>Custom Reminder Time</Text>
          </View>

          <View style={styles.customInputRow}>
            <TextInput
              placeholder="e.g. 45"
              placeholderTextColor={colors.muted}
              value={customValue}
              onChangeText={setCustomValue}
              keyboardType="numeric"
              style={[
                styles.customInput,
                { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border },
              ]}
            />

            {/* Unit Buttons */}
            <View style={styles.unitRow}>
              {(['minutes', 'hours', 'days'] as const).map((unit) => {
                const isSelected = customUnit === unit;
                return (
                  <Pressable
                    key={unit}
                    onPress={() => setCustomUnit(unit)}
                    style={[
                      styles.unitBtn,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.background,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                      Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                    ]}
                  >
                    <Text style={[styles.unitBtnText, { color: isSelected ? colors.onPrimary : colors.foreground }]}>
                      {unit}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={() => {
                setIsCustomMode(true);
                handleApplyCustom();
              }}
              style={({ pressed }) => [
                styles.applyBtn,
                { backgroundColor: colors.primary },
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                pressed && { transform: [{ scale: 0.96 }] },
              ]}
            >
              <Text style={[styles.applyBtnText, { color: colors.onPrimary }]}>Set</Text>
            </Pressable>
          </View>
        </View>
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
  reminderSection: {
    borderTopWidth: 1,
    paddingTop: 32,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  reminderTitle: {
    ...typography.titleLg,
    fontSize: 18,
    marginBottom: 4,
  },
  reminderSubtitle: {
    ...typography.bodySm,
  },
  reminderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  reminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radii.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  iconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderLabel: {
    ...typography.labelSm,
    fontSize: 13,
    fontWeight: '600',
  },
  customCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: 18,
    marginTop: 6,
    gap: 14,
  },
  customCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customCardTitle: {
    ...typography.labelMd,
    fontWeight: '700',
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  customInput: {
    width: 70,
    height: 42,
    borderRadius: radii.md,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    outlineStyle: 'none' as any,
  },
  unitRow: {
    flexDirection: 'row',
    gap: 6,
  },
  unitBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  unitBtnText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  applyBtn: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: radii.md,
    marginLeft: 'auto',
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
