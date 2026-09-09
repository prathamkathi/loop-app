import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, FlatList, ScrollView, Text, TextInput, StyleSheet, useWindowDimensions, ActivityIndicator, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MagnifyingGlass, X, BookmarkSimple, ArrowClockwise, SlidersHorizontal, ArrowRight } from 'phosphor-react-native';
import { useTheme, typography, radii } from '../theme';
import EventCard from '../components/EventCard';
import type { EventItem } from '../data/events';
import { CATEGORIES } from '../data/categories';
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
  const contentWidth = width - (width >= 1024 ? 232 : 0);
  const columns = contentWidth >= 1080 ? 3 : contentWidth >= 650 ? 2 : 1;
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
  const upcomingCount = liveEvents.filter((event) => !isPastEvent(event, now)).length;
  const featured = view === 'upcoming' && category === 'all' && horizon === 'all' && !search && !personalized
    ? filtered.find((event) => event.featured) || filtered[0] : null;
  const rest = featured ? filtered.filter((event) => event.id !== featured.id) : filtered;
  const hasFilters = Boolean(search || category !== 'all' || horizon !== 'all' || personalized);
  const reset = () => { setSearch(''); setCategory('all'); setHorizon('all'); setPersonalized(false); };
  const changeView = (next: DiscoveryView) => { setView(next); reset(); };
  const dateLabel = new Date(now).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' });

  const header = <>
    <View style={[styles.intro, { borderBottomColor: colors.border }]}>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>IIT DELHI / CAMPUS LIFE</Text>
      <Text accessibilityRole="header" style={[styles.heading, { color: colors.foreground }, contentWidth < 500 && styles.headingMobile]}>Find your next{'\n'}campus moment.</Text>
      <View style={styles.introBottom}>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Talks, tournaments, late-night gigs.{'\n'}Make room for something beyond class.</Text>
        {contentWidth >= 850 && <View style={styles.dateStamp}>
          <Text style={[typography.labelMd, { color: colors.foreground }]}>{dateLabel}</Text>
          <Text style={[typography.bodySm, { color: colors.muted }]}>{upcomingCount} upcoming · IIT Delhi</Text>
        </View>}
      </View>
    </View>
    <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
      {(['upcoming', 'saved', 'past'] as const).map((id) => <Pressable key={id} onPress={() => changeView(id)} accessibilityRole="tab" accessibilityState={{ selected: view === id }}
        accessibilityLabel={id === 'upcoming' ? 'Discover events' : id === 'saved' ? 'Saved events' : 'Past events'}
        style={[styles.tab, { borderBottomColor: view === id ? colors.primary : 'transparent' }]}>
        {id === 'saved' && <BookmarkSimple size={17} color={view === id ? colors.primary : colors.muted} />}
        <Text style={[typography.labelMd, { color: view === id ? colors.primary : colors.muted }]}>{id === 'upcoming' ? 'Discover' : id === 'saved' ? 'Saved' + (saved.size ? ' (' + saved.size + ')' : '') : 'Past events'}</Text>
      </Pressable>)}
    </View>
    <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <MagnifyingGlass size={21} color={colors.muted} />
      <TextInput accessibilityLabel="Search events, clubs or venues" placeholder="Search events, clubs or venues" placeholderTextColor={colors.muted}
        value={search} onChangeText={setSearch} returnKeyType="search" style={[styles.searchInput, { color: colors.foreground }]} />
      {search !== '' && <Pressable onPress={() => setSearch('')} accessibilityRole="button" accessibilityLabel="Clear search" style={styles.iconButton}><X size={20} color={colors.muted} /></Pressable>}
    </View>
    {view !== 'past' && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {HORIZONS.map((item) => <Pressable key={item.id} onPress={() => setHorizon(item.id)} accessibilityRole="button" accessibilityState={{ selected: horizon === item.id }}
        style={[styles.chip, { backgroundColor: horizon === item.id ? colors.accent : colors.surface, borderColor: horizon === item.id ? colors.accent : colors.border }]}>
        <Text style={[typography.labelSm, { color: horizon === item.id ? colors.onAccent : colors.foregroundSecondary }]}>{item.label}</Text>
      </Pressable>)}
    </ScrollView>}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
      {['all', ...CATEGORIES.filter((item) => item !== 'All')].map((item) => <Pressable key={item} onPress={() => setCategory(item)} accessibilityRole="button" accessibilityState={{ selected: category === item }}
        style={[styles.category, { backgroundColor: category === item ? colors.highlight : 'transparent', borderColor: category === item ? colors.primary : 'transparent' }]}>
        <Text style={[typography.labelSm, { color: category === item ? colors.primary : colors.muted }]}>{item === 'all' ? 'All categories' : item}</Text>
      </Pressable>)}
    </ScrollView>
    {error && <View accessibilityRole="alert" style={[styles.notice, { backgroundColor: colors.highlight }]}>
      <Text style={[typography.bodySm, { color: colors.foregroundSecondary, flex: 1 }]}>{error}</Text>
      <Pressable onPress={refresh} disabled={refreshing} accessibilityRole="button" accessibilityLabel="Retry loading events" style={styles.iconButton}><ArrowClockwise size={22} color={colors.primary} /></Pressable>
    </View>}
    {featured && <View style={styles.featured}>
      <Text style={[styles.sectionLabel, { color: colors.muted }]}>{featured.featured ? 'IN THE SPOTLIGHT' : 'UP NEXT ON CAMPUS'}</Text>
      <EventCard event={featured} saved={saved.has(featured.id)} onToggleSave={() => onToggleSave(featured.id)} onPress={() => onOpenEvent(featured)} featured />
    </View>}
    <View style={styles.resultsHeader}>
      <View style={{ flex: 1 }}>
        <Text accessibilityRole="header" style={[typography.titleXl, { color: colors.foreground }]}>{view === 'saved' ? 'Your saved plans' : view === 'past' ? 'Around campus, recently' : featured ? 'More to explore' : 'Explore campus'}</Text>
        <Text accessibilityLiveRegion="polite" style={[typography.bodySm, { color: colors.muted, marginTop: 4 }]}>{loading ? 'Finding campus events…' : rest.length + (rest.length === 1 ? ' event' : ' events') + (hasFilters ? ' match your filters' : view === 'past' ? ' in the recent archive' : ' to discover')}</Text>
      </View>
      <Pressable onPress={() => setPersonalized(!personalized)} accessibilityRole="checkbox" accessibilityState={{ checked: personalized }} accessibilityLabel="Only show my interests"
        style={[styles.preferenceButton, { borderColor: personalized ? colors.primary : colors.border, backgroundColor: personalized ? colors.highlight : colors.surface }]}>
        <SlidersHorizontal size={18} color={colors.primary} /><Text style={[typography.labelSm, { color: colors.primary }]}>For you</Text>
      </Pressable>
    </View>
    {personalized && <Pressable onPress={onEditInterests} accessibilityRole="button" style={styles.editInterests}><Text style={[typography.bodySm, { color: colors.primary }]}>Edit your interests</Text><ArrowRight size={16} color={colors.primary} /></Pressable>}
  </>;
  return <FlatList key={columns} data={rest} numColumns={columns} keyExtractor={(event) => event.id} style={styles.list}
    contentContainerStyle={[styles.content, { paddingHorizontal: contentWidth < 500 ? 20 : 32, paddingBottom: width < 1024 ? 108 + insets.bottom : 40 }]}
    columnWrapperStyle={columns > 1 ? styles.gridRow : undefined} ListHeaderComponent={header}
    renderItem={({ item }) => <View style={{ width: columns === 1 ? '100%' : ((100 - (columns - 1) * 2) / columns) + '%' as `${number}%`, marginBottom: 24 }}>
      <EventCard event={item} saved={saved.has(item.id)} onToggleSave={() => onToggleSave(item.id)} onPress={() => onOpenEvent(item)} isPast={isPastEvent(item, now)} />
    </View>}
    refreshing={refreshing} onRefresh={onRefresh ? refresh : undefined} initialNumToRender={6} maxToRenderPerBatch={6} windowSize={5}
    keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
    ListEmptyComponent={<View style={[styles.empty, { borderColor: colors.border }]}>
      {loading ? <ActivityIndicator color={colors.primary} /> : <BookmarkSimple size={32} color={colors.primary} weight="duotone" />}
      <Text style={[typography.titleLg, { color: colors.foreground, textAlign: 'center' }]}>{loading ? 'Loading campus events' : featured ? 'You’re all caught up.' : hasFilters ? 'No events match just yet.' : view === 'saved' ? 'Good plans deserve a bookmark.' : error ? 'Let’s reconnect.' : 'A quiet moment on campus.'}</Text>
      <Text style={[styles.emptyText, { color: colors.muted }]}>{hasFilters ? 'Try another date or category, or clear your search.' : view === 'saved' ? 'Save an event to keep its poster, time and venue close at hand.' : 'Check back for the next round of events from IIT Delhi clubs.'}</Text>
      {!loading && <Pressable onPress={hasFilters ? reset : view === 'saved' ? () => changeView('upcoming') : refresh} accessibilityRole="button" style={[styles.emptyAction, { backgroundColor: colors.primary }]}>
        <Text style={[typography.labelMd, { color: colors.onPrimary }]}>{hasFilters ? 'Clear filters' : view === 'saved' ? 'Discover events' : 'Refresh events'}</Text>
      </Pressable>}
    </View>}
    ListFooterComponent={<View style={[styles.footer, { borderTopColor: colors.border }]}>
      <Text style={[typography.bodySm, { color: colors.muted }]}>Made for the moments between classes.</Text>
      {onOpenAI && <Pressable onPress={onOpenAI} accessibilityRole="button" style={styles.editInterests}><Text style={[typography.labelMd, { color: colors.primary }]}>Need a hand? Ask Loop</Text><ArrowRight size={17} color={colors.primary} /></Pressable>}
    </View>} />;
}
const styles = StyleSheet.create({
  list: { flex: 1, width: '100%', alignSelf: 'center', maxWidth: 1240 },
  content: { paddingTop: 20 }, intro: { paddingBottom: 28, borderBottomWidth: 1 },
  eyebrow: { ...typography.labelCaps, fontSize: 11, letterSpacing: 2, marginBottom: 16 },
  heading: { ...typography.displayMd, fontSize: 52, lineHeight: 56, letterSpacing: -1.8 },
  headingMobile: { fontSize: 38, lineHeight: 42, letterSpacing: -1.2 },
  subtitle: { ...typography.bodyMd, lineHeight: 24 },
  introBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, marginTop: 18 },
  dateStamp: { gap: 6, alignItems: 'flex-end' }, tabs: { flexDirection: 'row', gap: 24, borderBottomWidth: 1, marginBottom: 24 },
  tab: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 6, borderBottomWidth: 2 },
  search: { minHeight: 56, borderWidth: 1, borderRadius: radii.lg, paddingLeft: 16, paddingRight: 6, flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchInput: { ...typography.bodyMd, flex: 1, minWidth: 0, height: 54 }, iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  chips: { gap: 8, paddingTop: 14 }, chip: { minHeight: 44, paddingHorizontal: 16, justifyContent: 'center', borderRadius: radii.full, borderWidth: 1 },
  categories: { gap: 8, paddingVertical: 12 }, category: { minHeight: 44, paddingHorizontal: 12, justifyContent: 'center', borderBottomWidth: 1, borderRadius: radii.md },
  notice: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8, borderRadius: radii.md, marginBottom: 20 },
  featured: { marginTop: 16, marginBottom: 36 }, sectionLabel: { ...typography.labelCaps, fontSize: 11, letterSpacing: 1.8, marginBottom: 14 },
  resultsHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, marginBottom: 24 },
  preferenceButton: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingHorizontal: 12, minHeight: 44, borderWidth: 1, borderRadius: radii.md },
  gridRow: { gap: '2%' }, editInterests: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20, borderWidth: 1, borderStyle: 'dashed', borderRadius: radii.lg, gap: 14, marginBottom: 24 },
  emptyText: { ...typography.bodySm, textAlign: 'center', maxWidth: 380 }, emptyAction: { paddingHorizontal: 20, minHeight: 48, justifyContent: 'center', borderRadius: radii.full, marginTop: 6 },
  footer: { borderTopWidth: 1, paddingVertical: 24, gap: 8 },
});
