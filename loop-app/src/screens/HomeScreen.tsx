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

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter chips including ★ Saved
  const allChips = useMemo(() => {
    return ['All', `★ Saved (${saved.size})`, ...CATEGORIES.filter((c) => c !== 'All')];
  }, [saved.size]);

  // Combined Search & Category & Saved Filtering
  const filtered = useMemo(() => {
    let result = liveEvents;

    // F-13: Drop past events and sort by startsAt
    const now = new Date();
    result = result
      .filter((e) => {
        if (!e.startsAt) return true; // keep if no timestamp
        const eventTime = e.startsAt.toDate ? e.startsAt.toDate() : new Date(e.startsAt);
        // keep if event is in the future or started within the last 12 hours
        return eventTime.getTime() + 12 * 60 * 60 * 1000 >= now.getTime();
      })
      .sort((a, b) => {
        const timeA = a.startsAt?.toDate ? a.startsAt.toDate().getTime() : 0;
        const timeB = b.startsAt?.toDate ? b.startsAt.toDate().getTime() : 0;
        return timeA - timeB;
      });

    // Filter by category, saved, or interests (F-11)
    if (activeCategory.startsWith('★ Saved')) {
      result = result.filter((e) => saved.has(e.id));
    } else if (activeCategory !== 'All') {
      result = result.filter((e) => e.category === activeCategory);
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
  }, [activeCategory, searchQuery, interests, liveEvents, saved]);

  const featured = filtered.find((e) => e.featured) ?? filtered[0];
  const rest = filtered.filter((e) => e.id !== featured?.id);

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
    setActiveCategory('All');
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

      {/* Category & Saved Filter Chips */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {allChips.map((chip) => {
            const isSelected = activeCategory === chip;
            const isSavedChip = chip.startsWith('★ Saved');

            return (
              <Pressable
                key={chip}
                onPress={() => setActiveCategory(chip)}
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
                accessibilityLabel={`Filter by ${chip}`}
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
                  {chip}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Empty State when no events match */}
      {filtered.length === 0 ? (
        activeCategory.startsWith('★ Saved') ? (
          <View style={[styles.emptySavedBox, { borderColor: colors.border }]}>
            <BookmarkSimple size={44} color={colors.primary} weight="light" />
            <Text style={[styles.emptySavedTitle, { color: colors.foreground }]}>No Saved Events Yet</Text>
            <Text style={[styles.emptySavedSubtitle, { color: colors.muted }]}>
              Bookmark any event card with the ribbon icon to easily track it here.
            </Text>
            <Pressable
              onPress={() => setActiveCategory('All')}
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
    fontSize: 14,
    height: '100%',
    outlineStyle: 'none' as any,
  },
  clearBtn: {
    padding: 4,
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
