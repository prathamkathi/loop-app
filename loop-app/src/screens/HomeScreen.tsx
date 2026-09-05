import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView, RefreshControl,
  Text,
  TextInput,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  Pressable,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MagnifyingGlass, X, BookmarkSimple, WarningCircle } from 'phosphor-react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useTheme, typography, radii, shadows } from '../theme';
import SectionLabel from '../components/SectionLabel';
import FeaturedCard from '../components/FeaturedCard';
import EventCard from '../components/EventCard';
import EmptyState from '../components/EmptyState';
import { type EventItem } from '../data/events';
import { CATEGORIES } from '../data/categories';
import { getEventTimeMillis, toValidDate } from '../utils/timestampUtils';

type Props = {
  interests: Set<string>;
  saved: Set<string>;
  liveEvents: EventItem[];
  loading: boolean;
  error?: string | null;
  onToggleSave: (id: string) => void;
  onOpenEvent: (event: EventItem) => void;
  onResetFilters: () => void;
  onEditInterests: () => void;
};

export default function HomeScreen({
  interests,
  saved,
  liveEvents,
  loading,
  error,
  onToggleSave,
  onOpenEvent,
  onResetFilters,
  onEditInterests,
}: Props) {
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const isWideDesktop = width >= 1120;

  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [timeHorizon, setTimeHorizon] = useState<'all' | 'today' | 'weekend' | 'week'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const HORIZONS = [
    { id: 'all' as const, label: 'All Dates' },
    { id: 'today' as const, label: 'Happening Today' },
    { id: 'weekend' as const, label: 'This Weekend' },
    { id: 'week' as const, label: 'Next 7 Days' },
  ];

  // F-41: Filter chips keyed by stable ID, not mutable display strings
  const allChips = useMemo(() => [
    { id: 'all', label: 'All' },
    { id: 'saved', label: `★ Saved (${saved.size})` },
    ...CATEGORIES.filter((c) => c !== 'All').map((c) => ({ id: c, label: c })),
  ], [saved.size]);

  // Combined Search & Category & Saved & Horizon Filtering
  const filtered = useMemo(() => {
    let result = liveEvents;

    // F-50 / F-13: Drop past events and sort by startsAt
    const nowMs = Date.now();
    result = result
      .filter((e) => {
        const eventTimeMs = getEventTimeMillis(e.startsAt);
        if (eventTimeMs === null) return true; // keep undated events
        // keep if event is in the future or started within the last 12 hours
        return eventTimeMs + 12 * 60 * 60 * 1000 >= nowMs;
      })
      .sort((a, b) => {
        const timeA = getEventTimeMillis(a.startsAt) ?? Number.MAX_SAFE_INTEGER;
        const timeB = getEventTimeMillis(b.startsAt) ?? Number.MAX_SAFE_INTEGER;
        return timeA - timeB;
      });

    // Filter by Time Horizon
    if (timeHorizon === 'today') {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      result = result.filter((e) => {
        const d = toValidDate(e.startsAt);
        if (!d) return false;
        return d >= startOfToday && d <= endOfToday;
      });
    } else if (timeHorizon === 'weekend') {
      result = result.filter((e) => {
        const d = toValidDate(e.startsAt);
        if (!d) return false;
        const day = d.getDay();
        return day === 0 || day === 6; // Sunday or Saturday
      });
    } else if (timeHorizon === 'week') {
      const now = new Date();
      const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      result = result.filter((e) => {
        const d = toValidDate(e.startsAt);
        if (!d) return false;
        return d >= now && d <= in7Days;
      });
    }

    // Filter by category, saved, or interests (F-41 / F-11)
    if (activeCategoryId === 'saved') {
      result = result.filter((e) => saved.has(e.id));
    } else if (activeCategoryId !== 'all') {
      result = result.filter((e) => e.category === activeCategoryId);
    } else if (interests.size > 0) {
      // F-11: Wire interests into the filter body when viewing 'All'
      result = result.filter((e) => interests.has(e.category));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          (e.title && e.title.toLowerCase().includes(q)) ||
          (e.host && e.host.toLowerCase().includes(q)) ||
          (e.venue && e.venue.toLowerCase().includes(q)) ||
          (e.blurb && e.blurb.toLowerCase().includes(q))
      );
    }

    return result;
  }, [activeCategoryId, timeHorizon, searchQuery, interests, liveEvents, saved]);

  // Featured selection: requires explicit featured: true OR startsAt within 48h
  const featured = useMemo(() => {
    const explicitlyFeatured = filtered.find((e) => e.featured);
    if (explicitlyFeatured) return explicitlyFeatured;

    const nowMs = Date.now();
    const fortyEightHoursMs = 48 * 60 * 60 * 1000;
    
    return filtered.find((e) => {
      const timeMs = getEventTimeMillis(e.startsAt);
      return timeMs !== null && timeMs >= nowMs - (6 * 60 * 60 * 1000) && timeMs <= nowMs + fortyEightHoursMs;
    });
  }, [filtered]);

  const rest = useMemo(() => {
    return featured ? filtered.filter((e) => e.id !== featured.id) : filtered;
  }, [filtered, featured]);

  // F-23: a failed load must not look like a campus with nothing on tonight.
  if (error && liveEvents.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <View style={[styles.errorBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <WarningCircle size={40} color={colors.primary} weight="duotone" />
          <Text style={[styles.errorTitle, { color: colors.foreground }]}>Couldn't load events</Text>
          <Text style={[styles.errorBody, { color: colors.muted }]}>{error}</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <BlurView
          intensity={40}
          tint={isDark ? 'dark' : 'light'}
          style={[
            styles.loadingBlur,
            Platform.OS === 'web' && ({
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              backgroundColor: isDark ? 'rgba(24, 24, 27, 0.7)' : 'rgba(255, 255, 255, 0.8)',
            } as any),
          ]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.foreground }]}>Loading live feed...</Text>
        </BlurView>
      </View>
    );
  }

  const handleReset = () => {
    setActiveCategoryId('all');
    setTimeHorizon('all');
    setSearchQuery('');
    onResetFilters();
  };

  return (
    <ScrollView
      style={[
        styles.scroll,
        Platform.OS === 'web' && ({ maxWidth: 1280, width: '100%', alignSelf: 'center' } as any),
      ]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <MagnifyingGlass size={18} color={colors.muted} />
          <TextInput
            placeholder="Search events, clubs, venues..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <X size={16} color={colors.muted} weight="bold" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Quick Time Horizon Pills */}
      <View style={styles.horizonSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizonScroll}>
          {HORIZONS.map((h) => {
            const isSelected = timeHorizon === h.id;
            return (
              <Pressable
                key={h.id}
                onPress={() => setTimeHorizon(h.id)}
                style={({ pressed }) => [
                  styles.horizonPill,
                  {
                    backgroundColor: isSelected ? (isDark ? 'rgba(196, 77, 106, 0.22)' : 'rgba(138, 21, 56, 0.12)') : 'transparent',
                    borderColor: isSelected ? colors.primary : colors.border,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  },
                  Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'all 0.15s ease' } as any),
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${h.label}`}
              >
                <Text
                  style={[
                    styles.horizonText,
                    {
                      color: isSelected ? colors.primary : colors.muted,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {h.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Category & Saved Filter Chips */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {allChips.map((chip) => {
            const isSelected = activeCategoryId === chip.id;

            return (
              <Pressable
                key={chip.id}
                onPress={() => setActiveCategoryId(chip.id)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  },
                  Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'all 0.15s ease' } as any),
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${chip.label}`}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isSelected ? colors.onPrimary : colors.foreground,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {chip.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Empty State when no events match */}
      {filtered.length === 0 ? (
        activeCategoryId === 'saved' ? (
          <View style={[styles.emptySavedBox, { borderColor: colors.border }]}>
            <BookmarkSimple size={44} color={colors.primary} weight="light" />
            <Text style={[styles.emptySavedTitle, { color: colors.foreground }]}>No Saved Events Yet</Text>
            <Text style={[styles.emptySavedSubtitle, { color: colors.muted }]}>
              Bookmark any event card with the ribbon icon to easily track it here.
            </Text>
            <Pressable
              onPress={() => setActiveCategoryId('all')}
              style={({ pressed }) => [
                styles.browseBtn,
                { backgroundColor: colors.primary },
                pressed && { transform: [{ scale: 0.96 }] },
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
              ]}
            >
              <Text style={[styles.browseBtnText, { color: colors.onPrimary }]}>Browse All Events</Text>
            </Pressable>
          </View>
        ) : (
          <EmptyState onReset={handleReset} onEditInterests={onEditInterests} />
        )
      ) : (
        <>
          {/* Featured Header Card */}
          {featured && (
            <>
              <SectionLabel>FEATURED TONIGHT</SectionLabel>
              <FeaturedCard
                event={featured}
                saved={saved.has(featured.id)}
                onToggleSave={() => onToggleSave(featured.id)}
                onPress={() => onOpenEvent(featured)}
              />
            </>
          )}

          {/* Grid Header */}
          <View style={styles.weekHeader}>
            <SectionLabel style={{ marginBottom: 0 }}>UPCOMING FEED</SectionLabel>
            <Text style={[styles.count, { color: colors.muted }]}>
              {rest.length} events curated for you
            </Text>
          </View>

          {/* Multi-Column Desktop Grid (2-3 cards side-by-side) vs Edge-to-Edge Mobile */}
          <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
            {rest.map((e, index) => {
              const gridItemStyle = isWideDesktop
                ? styles.gridItemWide
                : isDesktop
                ? styles.gridItemDesktop
                : styles.gridItemMobile;

              return (
                <View key={e.id} style={gridItemStyle}>
                  <EventCard
                    event={e}
                    index={index}
                    saved={saved.has(e.id)}
                    onToggleSave={() => onToggleSave(e.id)}
                    onPress={() => onOpenEvent(e)}
                  />
                </View>
              );
            })}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  searchSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    outlineStyle: 'none' as any,
  },
  clearBtn: {
    padding: 4,
  },
  horizonSection: {
    marginBottom: 12,
    marginHorizontal: -20,
  },
  horizonScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  horizonPill: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 32,
  },
  horizonText: {
    ...typography.labelSm,
    fontSize: 12,
  },
  filterSection: {
    marginBottom: 24,
    marginHorizontal: -20,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radii.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 40,
  },
  chipText: {
    ...typography.labelSm,
    fontSize: 13,
  },
  emptySavedBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 20,
    gap: 12,
  },
  emptySavedTitle: {
    ...typography.titleSm,
    fontWeight: '700',
  },
  emptySavedSubtitle: {
    ...typography.bodySm,
    textAlign: 'center',
    maxWidth: 320,
  },
  browseBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radii.full,
    marginTop: 6,
  },
  browseBtnText: {
    ...typography.labelSm,
    fontWeight: '700',
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 20,
  },
  count: {
    ...typography.bodySm,
  },
  grid: {
    gap: 20,
    width: '100%',
  },
  gridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 20,
  },
  // Wide monitors (> 1120px): 3 cards side-by-side
  gridItemWide: {
    width: '31.8%',
  },
  // Standard desktop / tablets (768px - 1120px): 2 cards side-by-side
  gridItemDesktop: {
    width: '48.5%',
  },
  // Mobile (< 768px): 1 card full width
  gridItemMobile: {
    width: '100%',
  },
  errorBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 32,
    borderRadius: radii.xl,
    borderWidth: 1,
    maxWidth: 360,
  },
  errorTitle: {
    ...typography.titleSm,
    fontWeight: '700',
  },
  errorBody: {
    ...typography.bodySm,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBlur: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    overflow: 'hidden',
  },
  loadingText: {
    ...typography.labelMd,
    fontWeight: '600',
  },
});
