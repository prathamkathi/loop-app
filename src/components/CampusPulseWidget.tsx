import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import {
  Sparkle,
  BookmarkSimple,
  CalendarCheck,
  Megaphone,
  Robot,
  ArrowRight,
} from 'phosphor-react-native';
import { useTheme, radii, typography } from '../theme';

type Props = {
  upcomingCount: number;
  savedCount: number;
  onSelectUpcoming: () => void;
  onSelectSaved: () => void;
  onOpenAI: () => void;
  onOpenDirectory?: () => void;
};

const TICKER_ITEMS = [
  'IIT Delhi Campus • Live club events, workshops & major fests updated daily',
  'Hospital & Ambulance 24/7 emergency contact in Campus Directory',
  'Ask Loop AI anything about hostel venues, schedules & contacts',
  'Tap any event card to view full flyer details & WhatsApp sync',
];

export default function CampusPulseWidget({
  upcomingCount,
  savedCount,
  onSelectUpcoming,
  onSelectSaved,
  onOpenAI,
}: Props) {
  const { colors, isDark } = useTheme();
  const [tickerIndex, setTickerIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      // Fade & slide out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -8,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTickerIndex((prev) => (prev + 1) % TICKER_ITEMS.length);
        slideAnim.setValue(8);
        // Fade & slide in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Dynamic Animated Campus Ticker */}
      <View
        style={[
          styles.tickerBar,
          {
            backgroundColor: isDark ? 'rgba(225, 29, 72, 0.08)' : 'rgba(138, 21, 56, 0.06)',
            borderColor: isDark ? 'rgba(225, 29, 72, 0.20)' : 'rgba(138, 21, 56, 0.14)',
          },
        ]}
      >
        <View style={styles.tickerPulse}>
          <View style={[styles.pulseDot, { backgroundColor: colors.primary }]} />
          <Megaphone size={14} color={colors.primary} weight="bold" />
        </View>
        <Animated.View
          style={[
            styles.tickerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.tickerText, { color: colors.foreground }]} numberOfLines={1}>
            {TICKER_ITEMS[tickerIndex]}
          </Text>
        </Animated.View>
      </View>

      {/* Quick Interactive Stat Widgets Row */}
      <View style={styles.statsRow}>
        {/* Upcoming Count Widget */}
        <Pressable
          onPress={onSelectUpcoming}
          accessibilityRole="button"
          accessibilityLabel={`View ${upcomingCount} upcoming events`}
          style={({ pressed }) => [
            styles.statCard,
            {
              backgroundColor: isDark ? colors.surface : colors.surface,
              borderColor: colors.border,
            },
            Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'all 0.18s ease' } as any),
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
        >
          <View style={[styles.statIconBadge, { backgroundColor: isDark ? 'rgba(225, 29, 72, 0.15)' : 'rgba(138, 21, 56, 0.10)' }]}>
            <CalendarCheck size={16} color={colors.primary} weight="bold" />
          </View>
          <View style={styles.statInfo}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{upcomingCount}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Upcoming</Text>
          </View>
        </Pressable>

        {/* Saved Count Widget */}
        <Pressable
          onPress={onSelectSaved}
          accessibilityRole="button"
          accessibilityLabel={`View ${savedCount} saved events`}
          style={({ pressed }) => [
            styles.statCard,
            {
              backgroundColor: isDark ? colors.surface : colors.surface,
              borderColor: colors.border,
            },
            Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'all 0.18s ease' } as any),
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
        >
          <View style={[styles.statIconBadge, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(217, 119, 6, 0.10)' }]}>
            <BookmarkSimple size={16} color={isDark ? '#FBBF24' : '#D97706'} weight="bold" />
          </View>
          <View style={styles.statInfo}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{savedCount}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Bookmarked</Text>
          </View>
        </Pressable>

        {/* AI Concierge Quick Trigger Widget */}
        <Pressable
          onPress={onOpenAI}
          accessibilityRole="button"
          accessibilityLabel="Open Loop AI Assistant"
          style={({ pressed }) => [
            styles.statCard,
            {
              backgroundColor: isDark ? colors.surface : colors.surface,
              borderColor: colors.border,
            },
            Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'all 0.18s ease' } as any),
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
        >
          <View style={[styles.statIconBadge, { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.10)' }]}>
            <Robot size={16} color={isDark ? '#38BDF8' : '#0284C7'} weight="bold" />
          </View>
          <View style={styles.statInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[styles.statValue, { color: colors.foreground, fontSize: 13 }]}>Loop AI</Text>
              <Sparkle size={12} color={colors.primary} weight="fill" />
            </View>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Concierge</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    gap: 12,
  },
  tickerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  tickerPulse: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
  },
  tickerContent: {
    flex: 1,
  },
  tickerText: {
    ...typography.bodySm,
    fontSize: 12,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  statIconBadge: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    ...typography.labelMd,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
});
