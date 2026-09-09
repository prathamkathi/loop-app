import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, FlatList, ScrollView, Text, TextInput, StyleSheet, useWindowDimensions, ActivityIndicator, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MagnifyingGlass, X, BookmarkSimple, ArrowClockwise, SlidersHorizontal, ArrowRight } from 'phosphor-react-native';
import { useTheme, typography, radii, spacing } from '../theme';
import EventCard from '../components/EventCard';
import FilterPills from '../components/FilterPills';
import SectionLabel from '../components/SectionLabel';
import type { EventItem } from '../data/events';
import { filterEvents, isPastEvent, type DiscoveryView, type TimeHorizon } from '../utils/eventDiscovery';

type Props = {
  interests: Set<string>; saved: Set<string>; liveEvents: EventItem[]; loading: boolean;
  error?: string | null; onRefresh?: () => Promise<void>;
  onToggleSave: (id: string) => void; onOpenEvent: (event: EventItem) => void;
  onResetFilters: () => void; onEditInterests: () => void; onOpenAI?: () => void;
};
const HORIZONS: Array<{ id: TimeHorizon; label: string }> = [
  { id: 'all', label: 'Any date' }, { id: 'today', label: 'Today' },
  { id: 'weekend', label: 'This weekend' }, { id: 'week', label: 'Next 7 days' },
];

export default function HomeScreen({ interests, saved, liveEvents, loading, error, onRefresh, onToggleSave, onOpenEvent, onEditInterests, onOpenAI }: Props) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  // Calculate grid columns and padding
  const contentWidth = width - (width >= 1024 ? 232 : 0);
  const columns = contentWidth >= 1080 ? 3 : contentWidth >= 650 ? 2 : 1;
  const paddingHorizontal = contentWidth < 500 ? spacing.marginMobile : spacing.marginDesktop;

  const [view, setView] = useState<DiscoveryView>('upcoming');
  const [category, setCategory] = useState('all');
  const [horizon, setHorizon] = useState<TimeHorizon>('all');
  const [search, setSearch] = useState('');
  const [personalized, setPersonalized] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(Date.now);
  
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(timer); }, []);
  
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try { await onRefresh?.(); } finally { setRefreshing(false); }
  }, [onRefresh]);
  
  const filtered = useMemo(() => filterEvents(liveEvents, { view, category, horizon, search, interests, saved, personalized, now }),
    [liveEvents, view, category, horizon, search, interests, saved, personalized, now]);
  
  const isDefaultView = view === 'upcoming' && category === 'all' && horizon === 'all' && !search && !personalized;
  const spotlightEvents = isDefaultView ? filtered.slice(0, 3) : [];
  const rest = isDefaultView ? filtered.slice(3) : filtered;
  
  const hasFilters = Boolean(search || category !== 'all' || horizon !== 'all' || personalized);
  const reset = () => { setSearch(''); setCategory('all'); setHorizon('all'); setPersonalized(false); };
  const changeView = (next: DiscoveryView) => { setView(next); reset(); };

  const dateLabel = new Date(now).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  const header = (
    <View style={{ marginBottom: spacing.lg }}>
      <View style={{ paddingHorizontal, paddingTop: spacing.xl, paddingBottom: spacing.lg }}>
        <Text style={[typography.caption, { color: colors.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }]}>
          {dateLabel}
        </Text>
        <Text style={[typography.displayLg, { color: colors.foreground, marginBottom: spacing.xs }]}>
          Discover
        </Text>
      </View>

      {/* Elegant Spotlight Carousel */}
      {spotlightEvents.length > 0 && (
        <View style={{ marginBottom: spacing.xl }}>
          <FlatList
            data={spotlightEvents}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={e => e.id}
            snapToInterval={width}
            decelerationRate="fast"
            renderItem={({ item }) => (
              <View style={{ width, paddingHorizontal }}>
                <EventCard 
                  event={item} 
                  saved={saved.has(item.id)} 
                  onToggleSave={() => onToggleSave(item.id)} 
                  onPress={() => onOpenEvent(item)} 
                  featured 
                />
              </View>
            )}
          />
        </View>
      )}

      <View style={{ paddingHorizontal }}>
        <View style={[styles.tabs, { borderBottomColor: colors.borderSubtle }]}>
          {(['upcoming', 'saved', 'past'] as const).map((id) => (
            <Pressable key={id} onPress={() => changeView(id)} accessibilityRole="tab" accessibilityState={{ selected: view === id }}
              style={[styles.tab, { borderBottomColor: view === id ? colors.foreground : 'transparent' }]}>
              {id === 'saved' && <BookmarkSimple size={16} color={view === id ? colors.foreground : colors.muted} weight={view === id ? 'fill' : 'regular'} />}
              <Text style={[typography.labelMd, { color: view === id ? colors.foreground : colors.muted }]}>
                {id === 'upcoming' ? 'All Events' : id === 'saved' ? 'Saved' + (saved.size ? ` (${saved.size})` : '') : 'Archive'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.search, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
          <MagnifyingGlass size={20} color={colors.muted} />
          <TextInput accessibilityLabel="Search events" placeholder="Search events or clubs" placeholderTextColor={colors.muted}
            value={search} onChangeText={setSearch} returnKeyType="search" style={[styles.searchInput, { color: colors.foreground }]} />
          {search !== '' && <Pressable onPress={() => setSearch('')} accessibilityRole="button" style={styles.iconButton}><X size={18} color={colors.muted} /></Pressable>}
        </View>

        {view !== 'past' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {HORIZONS.map((item) => (
              <Pressable key={item.id} onPress={() => setHorizon(item.id)} accessibilityRole="button" accessibilityState={{ selected: horizon === item.id }}
                style={[styles.chip, { backgroundColor: horizon === item.id ? colors.foreground : colors.surfaceElevated, borderColor: horizon === item.id ? colors.foreground : colors.borderSubtle }]}>
                <Text style={[typography.labelSm, { color: horizon === item.id ? colors.background : colors.foregroundSecondary }]}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
        
        <FilterPills selectedCategory={category === 'all' ? null : category} onSelectCategory={(c) => setCategory(c || 'all')} />
        
        {error && (
          <View accessibilityRole="alert" style={[styles.notice, { backgroundColor: colors.errorContainer }]}>
            <Text style={[typography.bodySm, { color: colors.foregroundSecondary, flex: 1 }]}>{error}</Text>
            <Pressable onPress={refresh} disabled={refreshing} accessibilityRole="button" style={styles.iconButton}><ArrowClockwise size={20} color={colors.error} /></Pressable>
          </View>
        )}

        <View style={styles.resultsHeader}>
          <View style={{ flex: 1 }}>
            <SectionLabel>{view === 'saved' ? 'Saved Plans' : view === 'past' ? 'Archive' : 'The Feed'}</SectionLabel>
          </View>
          <Pressable onPress={() => setPersonalized(!personalized)} accessibilityRole="checkbox" accessibilityState={{ checked: personalized }}
            style={[styles.preferenceButton, { borderColor: personalized ? colors.accent : colors.borderSubtle, backgroundColor: personalized ? colors.accentSoft : 'transparent' }]}>
            <SlidersHorizontal size={16} color={personalized ? colors.accent : colors.muted} /><Text style={[typography.labelSm, { color: personalized ? colors.accent : colors.muted }]}>For You</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList 
        key={columns} 
        data={rest} 
        numColumns={columns} 
        keyExtractor={(event) => event.id} 
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        columnWrapperStyle={columns > 1 ? { paddingHorizontal, gap: spacing.md } : undefined} 
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <View style={{ width: columns === 1 ? '100%' : ((100 - (columns - 1) * 2) / columns) + '%' as `${number}%`, paddingHorizontal: columns === 1 ? paddingHorizontal : 0 }}>
            <EventCard event={item} saved={saved.has(item.id)} onToggleSave={() => onToggleSave(item.id)} onPress={() => onOpenEvent(item)} isPast={isPastEvent(item, now)} />
          </View>
        )}
        refreshing={refreshing} onRefresh={onRefresh ? refresh : undefined} 
        initialNumToRender={6} maxToRenderPerBatch={6} windowSize={5}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
        ListEmptyComponent={(
          <View style={[styles.empty, { borderColor: colors.borderSubtle, marginHorizontal: paddingHorizontal }]}>
            {loading ? <ActivityIndicator color={colors.muted} /> : <BookmarkSimple size={32} color={colors.muted} weight="light" />}
            <Text style={[typography.titleLg, { color: colors.foreground, textAlign: 'center' }]}>
              {loading ? 'Loading...' : hasFilters ? 'No events found.' : 'All caught up.'}
            </Text>
            {!loading && (
              <Pressable onPress={hasFilters ? reset : refresh} style={[styles.emptyAction, { backgroundColor: colors.surfaceElevated }]}>
                <Text style={[typography.labelMd, { color: colors.foreground }]}>{hasFilters ? 'Clear Filters' : 'Refresh'}</Text>
              </Pressable>
            )}
          </View>
        )}
        ListFooterComponent={(
          <View style={[styles.footer, { borderTopColor: colors.borderSubtle, marginHorizontal: paddingHorizontal }]}>
            <Text style={[typography.bodySm, { color: colors.muted }]}>Made for the moments between classes.</Text>
          </View>
        )} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: spacing.lg, borderBottomWidth: 1, marginBottom: spacing.lg },
  tab: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 6, borderBottomWidth: 2 },
  search: { minHeight: 50, borderWidth: 1, borderRadius: radii.xl, paddingLeft: 16, paddingRight: 6, flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchInput: { ...typography.bodyMd, flex: 1, minWidth: 0, height: 48 }, 
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  chips: { gap: 8, paddingTop: 14 }, 
  chip: { minHeight: 40, paddingHorizontal: 16, justifyContent: 'center', borderRadius: radii.full, borderWidth: 1 },
  notice: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8, borderRadius: radii.lg, marginBottom: 20 },
  resultsHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: spacing.xl, marginBottom: spacing.sm },
  preferenceButton: { flexDirection: 'row', gap: 6, alignItems: 'center', paddingHorizontal: 12, minHeight: 36, borderWidth: 1, borderRadius: radii.full },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20, borderWidth: 1, gap: 14, marginBottom: 24, borderRadius: radii.xl },
  emptyAction: { paddingHorizontal: 20, minHeight: 44, justifyContent: 'center', marginTop: 12, borderRadius: radii.full },
  footer: { borderTopWidth: 1, paddingVertical: 24, gap: 8, marginTop: spacing.xl },
});
