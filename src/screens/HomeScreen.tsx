import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, FlatList, ScrollView, Text, TextInput, StyleSheet, useWindowDimensions, ActivityIndicator, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MagnifyingGlass, X, BookmarkSimple, ArrowClockwise, SlidersHorizontal, ArrowRight } from 'phosphor-react-native';
import { useTheme, typography, radii, spacing } from '../theme';
import EventCard from '../components/EventCard';
import FilterPills from '../components/FilterPills';
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
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  // Immersive layouts use less horizontal margins, we'll keep grid padding inside items
  const columns = width >= 1080 ? 3 : width >= 650 ? 2 : 1;
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
  
  // For the hype engine, we grab top 3 events for spotlight
  const isDefaultView = view === 'upcoming' && category === 'all' && horizon === 'all' && !search && !personalized;
  const spotlightEvents = isDefaultView ? filtered.slice(0, 3) : [];
  const rest = isDefaultView ? filtered.slice(3) : filtered;
  
  const hasFilters = Boolean(search || category !== 'all' || horizon !== 'all' || personalized);
  const reset = () => { setSearch(''); setCategory('all'); setHorizon('all'); setPersonalized(false); };
  const changeView = (next: DiscoveryView) => { setView(next); reset(); };

  const header = (
    <View style={{ marginBottom: spacing.xl }}>
      {/* Immersive Spotlight Carousel */}
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
              <View style={{ width, paddingHorizontal: spacing.marginMobile }}>
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
          
          {/* Brutalist Ticker Tape */}
          <View style={[styles.tickerTape, { backgroundColor: colors.primary }]}>
            <Text style={[styles.tickerText, { color: '#000' }]} numberOfLines={1}>
              HAPPENING TODAY · HAPPENING TODAY · HAPPENING TODAY · HAPPENING TODAY · HAPPENING TODAY
            </Text>
          </View>
        </View>
      )}

      <View style={{ paddingHorizontal: spacing.marginMobile }}>
        <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
          {(['upcoming', 'saved', 'past'] as const).map((id) => (
            <Pressable key={id} onPress={() => changeView(id)} accessibilityRole="tab" accessibilityState={{ selected: view === id }}
              style={[styles.tab, { borderBottomColor: view === id ? colors.primary : 'transparent' }]}>
              {id === 'saved' && <BookmarkSimple size={17} color={view === id ? colors.primary : colors.muted} />}
              <Text style={[typography.labelMd, { color: view === id ? colors.primary : colors.muted, textTransform: 'uppercase' }]}>
                {id === 'upcoming' ? 'Discover' : id === 'saved' ? 'Saved' + (saved.size ? ' (' + saved.size + ')' : '') : 'Past events'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MagnifyingGlass size={21} color={colors.muted} />
          <TextInput accessibilityLabel="Search events" placeholder="Search events or clubs" placeholderTextColor={colors.muted}
            value={search} onChangeText={setSearch} returnKeyType="search" style={[styles.searchInput, { color: colors.foreground }]} />
          {search !== '' && <Pressable onPress={() => setSearch('')} accessibilityRole="button" style={styles.iconButton}><X size={20} color={colors.muted} /></Pressable>}
        </View>

        {view !== 'past' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {HORIZONS.map((item) => (
              <Pressable key={item.id} onPress={() => setHorizon(item.id)} accessibilityRole="button" accessibilityState={{ selected: horizon === item.id }}
                style={[styles.chip, { backgroundColor: horizon === item.id ? colors.primary : colors.surface, borderColor: horizon === item.id ? colors.primary : colors.border }]}>
                <Text style={[typography.labelSm, { color: horizon === item.id ? '#000' : colors.foregroundSecondary }]}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
        
        <FilterPills selectedCategory={category === 'all' ? null : category} onSelectCategory={(c) => setCategory(c || 'all')} />
        
        {error && (
          <View accessibilityRole="alert" style={[styles.notice, { backgroundColor: colors.highlight }]}>
            <Text style={[typography.bodySm, { color: colors.foregroundSecondary, flex: 1 }]}>{error}</Text>
            <Pressable onPress={refresh} disabled={refreshing} accessibilityRole="button" style={styles.iconButton}><ArrowClockwise size={22} color={colors.primary} /></Pressable>
          </View>
        )}

        <View style={styles.resultsHeader}>
          <View style={{ flex: 1 }}>
            <Text accessibilityRole="header" style={[typography.displayMd, { color: colors.foreground }]}>
              {view === 'saved' ? 'YOUR SAVED' : view === 'past' ? 'ARCHIVE' : 'THE GRID'}
            </Text>
          </View>
          <Pressable onPress={() => setPersonalized(!personalized)} accessibilityRole="checkbox" accessibilityState={{ checked: personalized }}
            style={[styles.preferenceButton, { borderColor: personalized ? colors.primary : colors.border, backgroundColor: personalized ? colors.highlight : colors.surface }]}>
            <SlidersHorizontal size={18} color={colors.primary} /><Text style={[typography.labelSm, { color: colors.primary }]}>FOR YOU</Text>
          </Pressable>
        </View>
        
        {personalized && (
          <Pressable onPress={onEditInterests} accessibilityRole="button" style={styles.editInterests}>
            <Text style={[typography.bodySm, { color: colors.primary }]}>Edit your interests</Text><ArrowRight size={16} color={colors.primary} />
          </Pressable>
        )}
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
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom, paddingTop: spacing.xl }}
        columnWrapperStyle={columns > 1 ? { paddingHorizontal: spacing.marginMobile, gap: 16 } : undefined} 
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <View style={{ width: columns === 1 ? '100%' : ((100 - (columns - 1) * 2) / columns) + '%' as `${number}%`, paddingHorizontal: columns === 1 ? spacing.marginMobile : 0 }}>
            <EventCard event={item} saved={saved.has(item.id)} onToggleSave={() => onToggleSave(item.id)} onPress={() => onOpenEvent(item)} isPast={isPastEvent(item, now)} />
          </View>
        )}
        refreshing={refreshing} onRefresh={onRefresh ? refresh : undefined} 
        initialNumToRender={6} maxToRenderPerBatch={6} windowSize={5}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
        ListEmptyComponent={(
          <View style={[styles.empty, { borderColor: colors.border, marginHorizontal: spacing.marginMobile }]}>
            {loading ? <ActivityIndicator color={colors.primary} /> : <BookmarkSimple size={32} color={colors.primary} weight="bold" />}
            <Text style={[typography.titleLg, { color: colors.foreground, textAlign: 'center' }]}>
              {loading ? 'LOADING HYPE' : hasFilters ? 'NO MATCHES' : 'DEAD AIR'}
            </Text>
            {!loading && (
              <Pressable onPress={hasFilters ? reset : refresh} style={[styles.emptyAction, { backgroundColor: colors.primary }]}>
                <Text style={[typography.labelMd, { color: '#000' }]}>{hasFilters ? 'CLEAR FILTERS' : 'REFRESH'}</Text>
              </Pressable>
            )}
          </View>
        )}
        ListFooterComponent={(
          <View style={[styles.footer, { borderTopColor: colors.border, marginHorizontal: spacing.marginMobile }]}>
            <Text style={[typography.bodySm, { color: colors.muted }]}>End of feed.</Text>
          </View>
        )} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tickerTape: {
    width: '100%',
    paddingVertical: 10,
    marginTop: spacing.sm,
    transform: [{ rotate: '-1deg' }],
  },
  tickerText: {
    ...typography.displayMd,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 2,
    fontWeight: '800',
    textAlign: 'center',
  },
  tabs: { flexDirection: 'row', gap: spacing.lg, borderBottomWidth: 1, marginBottom: spacing.lg },
  tab: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: spacing.sm - 2, borderBottomWidth: 2 },
  search: { minHeight: 56, borderWidth: 1, borderRadius: radii.md, paddingLeft: 16, paddingRight: 6, flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchInput: { ...typography.bodyMd, flex: 1, minWidth: 0, height: 54 }, 
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  chips: { gap: 8, paddingTop: 14 }, 
  chip: { minHeight: 44, paddingHorizontal: 16, justifyContent: 'center', borderRadius: radii.sm, borderWidth: 1 },
  notice: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8, borderRadius: radii.md, marginBottom: 20 },
  resultsHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: spacing.xl, marginBottom: spacing.md },
  preferenceButton: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingHorizontal: 12, minHeight: 44, borderWidth: 1, borderRadius: radii.sm },
  editInterests: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, marginBottom: spacing.md },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20, borderWidth: 2, borderStyle: 'solid', gap: 14, marginBottom: 24, borderRadius: 0 },
  emptyAction: { paddingHorizontal: 20, minHeight: 48, justifyContent: 'center', marginTop: 12, borderRadius: 0 },
  footer: { borderTopWidth: 1, paddingVertical: 24, gap: 8, marginTop: spacing.xl },
});
