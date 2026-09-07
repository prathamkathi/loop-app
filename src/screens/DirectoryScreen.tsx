import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  useWindowDimensions,
  Linking,
} from 'react-native';
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  FirstAid,
  Heartbeat,
  BookOpen,
  Cpu,
  Trophy,
  Buildings,
  MapPin,
  PhoneCall,
  MagnifyingGlass,
  X,
  InstagramLogo,
  Sparkle,
} from 'phosphor-react-native';
import { useTheme, typography, radii, shadows } from '../theme';
import SectionLabel from '../components/SectionLabel';
import { DIRECTORY, type DirectoryItem } from '../data/directory';
import { CLUBS, type ClubItem } from '../data/clubs';
import { openExternalLink, openInstagram } from '../utils/linking';

function AnimatedWrapper({ index, children }: { index: number; children: React.ReactNode }) {
  const riseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(riseAnim, {
      toValue: 1,
      duration: 450,
      delay: Math.min(index * 30, 250),
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: true,
    }).start();
  }, [index, riseAnim]);

  const translateY = riseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 0],
  });

  return (
    <Animated.View style={{ opacity: riseAnim, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

const FACILITY_CATEGORIES = [
  'All',
  'Emergency',
  'Academic',
  'Wellness',
  'Sports',
  'Hostels',
  'Transit',
] as const;

const BOARD_TABS = [
  'All',
  'BRCA',
  'CAIC',
  'BSA',
  'BSW',
  'BSP',
  'NSS',
  'Independent',
];

const BOARD_COLORS: Record<string, string> = {
  BRCA: '#E11D48',
  CAIC: '#2563EB',
  BSA: '#059669',
  BSW: '#D97706',
  BSP: '#7C3AED',
  NSS: '#0D9488',
  Independent: '#64748B',
  Official: '#475569',
};

const getFacilityIcon = (category: string, tone: string, isDark: boolean) => {
  const color = tone === 'crimson' ? '#E11D48' : isDark ? '#38BDF8' : '#0284C7';
  const size = 20;
  const weight = 'duotone' as const;

  switch (category) {
    case 'Emergency':
      return <FirstAid size={size} color="#E11D48" weight={weight} />;
    case 'Wellness':
      return <Heartbeat size={size} color={isDark ? '#34D399' : '#059669'} weight={weight} />;
    case 'Academic':
      return <BookOpen size={size} color={color} weight={weight} />;
    case 'Sports':
      return <Trophy size={size} color={isDark ? '#FBBF24' : '#D97706'} weight={weight} />;
    case 'Hostels':
      return <Buildings size={size} color={color} weight={weight} />;
    case 'Transit':
      return <MapPin size={size} color={color} weight={weight} />;
    default:
      return <ShieldCheck size={size} color={color} weight={weight} />;
  }
};

export default function DirectoryScreen() {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [activeFacilityCat, setActiveFacilityCat] = useState<string>('All');
  const [activeBoard, setActiveBoard] = useState<string>('All');
  const [clubSearch, setClubSearch] = useState<string>('');

  // Filter Facilities
  const filteredFacilities = useMemo(() => {
    if (activeFacilityCat === 'All') return DIRECTORY;
    return DIRECTORY.filter((d) => d.category === activeFacilityCat);
  }, [activeFacilityCat]);

  // Filter Clubs by Board & Search
  const filteredClubs = useMemo(() => {
    let list: ClubItem[] = CLUBS;
    if (activeBoard !== 'All') {
      list = list.filter((c) => c.parentTag === activeBoard);
    }
    if (clubSearch.trim()) {
      const q = clubSearch.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.handle.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          c.parentTag.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeBoard, clubSearch]);

  return (
    <ScrollView
      style={[
        styles.scroll,
        Platform.OS === 'web' && ({ maxWidth: 1280, width: '100%', alignSelf: 'center' } as any),
      ]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <SectionLabel>Campus Directory</SectionLabel>
      <Text style={[styles.heading, { color: colors.foreground }]}>
        IIT Delhi Essentials
      </Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Quick access to 24×7 emergency numbers, hospital care, student wellness, libraries, sports facilities, and 40+ student organizations.
      </Text>

      {/* Facilities Category Pills */}
      <View style={styles.catPillSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catPillScroll}>
          {FACILITY_CATEGORIES.map((cat) => {
            const isSelected = activeFacilityCat === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setActiveFacilityCat(cat)}
                accessibilityRole="button"
                accessibilityLabel={`Filter facilities by ${cat}`}
                style={({ pressed }) => [
                  styles.catPill,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  },
                  Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'all 0.15s ease' } as any),
                ]}
              >
                <Text
                  style={[
                    styles.catPillText,
                    {
                      color: isSelected ? colors.onPrimary : colors.muted,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Facilities Grid */}
      <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
        {filteredFacilities.map((d, index) => {
          const isMap = d.span === 'map';
          const isEmergency = d.category === 'Emergency';

          if (isMap) {
            return (
              <View key={d.id} style={isDesktop ? styles.gridItemWide : styles.gridItemFull}>
                <AnimatedWrapper index={index}>
                  <Pressable
                    onPress={() => openExternalLink(d.url)}
                    accessibilityRole="link"
                    accessibilityLabel={`${d.name}, ${d.detail}`}
                    style={({ pressed }) => [
                      styles.mapCard,
                      { borderColor: colors.border },
                      shadows.card,
                      Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                      pressed && { transform: [{ scale: 0.99 }] },
                    ]}
                  >
                    {d.mapImage && (
                      <Image source={{ uri: d.mapImage }} style={styles.mapImage} resizeMode="cover" />
                    )}
                    <View style={styles.mapGradient} />
                    <View style={styles.mapContent}>
                      <View style={{ flex: 1, paddingRight: 16 }}>
                        <View style={styles.badgeRow}>
                          <View style={[styles.facilityBadge, { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.18)' : 'rgba(2, 132, 199, 0.12)' }]}>
                            <MapPin size={12} color={isDark ? '#38BDF8' : '#0284C7'} weight="bold" />
                            <Text style={[styles.facilityBadgeText, { color: isDark ? '#38BDF8' : '#0284C7' }]}>CAMPUS MAP</Text>
                          </View>
                        </View>
                        <Text style={styles.mapTitle}>{d.name}</Text>
                        <Text style={styles.mapDetail}>{d.detail}</Text>
                      </View>
                      <View style={[styles.mapBtn, { backgroundColor: colors.primary }]}>
                        <ArrowRight size={20} color={colors.onPrimary} weight="bold" />
                      </View>
                    </View>
                  </Pressable>
                </AnimatedWrapper>
              </View>
            );
          }

          return (
            <View
              key={d.id}
              style={
                isDesktop
                  ? d.span === 'hero' || d.span === 'wide'
                    ? styles.gridItemWide
                    : styles.gridItemHalf
                  : styles.gridItemFull
              }
            >
              <AnimatedWrapper index={index}>
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: isEmergency && isDark
                        ? 'rgba(225, 29, 72, 0.07)'
                        : colors.surface,
                      borderColor: isEmergency
                        ? isDark ? 'rgba(225, 29, 72, 0.35)' : 'rgba(225, 29, 72, 0.25)'
                        : colors.border,
                    },
                    shadows.card,
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIconWrapper}>
                      {getFacilityIcon(d.category, d.tone, isDark)}
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.cardCategory, { color: isEmergency ? '#E11D48' : colors.primary }]}>
                            {d.category.toUpperCase()}
                          </Text>
                          {d.hours.includes('24') && (
                            <View style={[styles.liveDotBadge, { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.16)' : 'rgba(16, 185, 129, 0.12)' }]}>
                              <View style={styles.liveDot} />
                              <Text style={styles.liveDotText}>24×7</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.cardName, { color: colors.foreground }]} numberOfLines={1}>
                          {d.name}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={[styles.cardDetail, { color: colors.muted }]} numberOfLines={3}>
                    {d.detail}
                  </Text>

                  <View style={styles.cardFooter}>
                    <View style={styles.locationRow}>
                      <MapPin size={13} color={colors.muted} weight="bold" />
                      <Text style={[styles.locationText, { color: colors.muted }]} numberOfLines={1}>
                        {d.location}
                      </Text>
                    </View>

                    {/* Action Button: Call or Open Link */}
                    {d.phone ? (
                      <Pressable
                        onPress={() => Linking.openURL(`tel:${d.phone!.replace(/[^0-9]/g, '')}`)}
                        accessibilityRole="button"
                        accessibilityLabel={`Call ${d.name} at ${d.phone}`}
                        style={({ pressed }) => [
                          styles.callActionBtn,
                          {
                            backgroundColor: isEmergency ? '#E11D48' : colors.primary,
                            transform: [{ scale: pressed ? 0.96 : 1 }],
                          },
                          Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'all 0.15s ease' } as any),
                        ]}
                      >
                        <PhoneCall size={14} color="#FFFFFF" weight="bold" />
                        <Text style={styles.callActionText}>{d.action || `Call ${d.phone}`}</Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        onPress={() => openExternalLink(d.url)}
                        accessibilityRole="link"
                        accessibilityLabel={d.action}
                        style={({ pressed }) => [
                          styles.linkActionBtn,
                          {
                            borderColor: colors.border,
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            transform: [{ scale: pressed ? 0.96 : 1 }],
                          },
                          Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'all 0.15s ease' } as any),
                        ]}
                      >
                        <Text style={[styles.linkActionText, { color: colors.foreground }]}>{d.action}</Text>
                        <ArrowUpRight size={14} color={colors.primary} weight="bold" />
                      </Pressable>
                    )}
                  </View>
                </View>
              </AnimatedWrapper>
            </View>
          );
        })}
      </View>

      {/* Clubs & Boards Section */}
      <View style={styles.clubsSection}>
        <SectionLabel>Student Organizations</SectionLabel>
        <Text style={[styles.clubsTitle, { color: colors.foreground }]}>Clubs & Boards Directory</Text>
        <Text style={[styles.clubsSubtitle, { color: colors.muted }]}>
          IIT Delhi’s 40+ recognized clubs across cultural arts, technology, sports, social initiatives & student welfare.
        </Text>

        {/* Club Search Bar */}
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
            placeholder="Search clubs by name, handle, or activity (e.g. Debsoc, PFC, Dance)..."
            placeholderTextColor={colors.muted}
            value={clubSearch}
            onChangeText={setClubSearch}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {clubSearch.length > 0 && (
            <Pressable
              onPress={() => setClubSearch('')}
              accessibilityRole="button"
              accessibilityLabel="Clear club search"
              style={styles.clearBtn}
            >
              <X size={16} color={colors.muted} weight="bold" />
            </Pressable>
          )}
        </View>

        {/* Board Category Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {BOARD_TABS.map((tab) => {
            const active = tab === activeBoard;
            const boardColor = BOARD_COLORS[tab] || colors.primary;

            return (
              <Pressable
                key={tab}
                onPress={() => setActiveBoard(tab)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Filter by ${tab}`}
                style={({ pressed }) => [
                  styles.filterChip,
                  {
                    backgroundColor: active ? boardColor : colors.surface,
                    borderColor: active ? boardColor : colors.border,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  },
                  Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'all 0.15s ease' } as any),
                ]}
              >
                <Text style={[styles.filterChipText, { color: active ? '#FFFFFF' : colors.muted }]}>
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Club List */}
        <View style={styles.clubList}>
          {filteredClubs.map((club, index) => {
            const boardColor = BOARD_COLORS[club.parentTag] || colors.primary;

            return (
              <AnimatedWrapper key={club.id} index={index}>
                <Pressable
                  onPress={() => openInstagram(club.handle)}
                  accessibilityRole="link"
                  accessibilityLabel={`${club.name}, Instagram handle ${club.handle}`}
                  style={({ pressed }) => [
                    styles.clubRow,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                    shadows.card,
                    Platform.OS === 'web' && ({
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                    }),
                    pressed && { transform: [{ scale: 0.99 }] },
                  ]}
                >
                  <Image
                    source={{ uri: club.avatar }}
                    style={styles.clubAvatar}
                    onError={(e) => {
                      e.currentTarget.setNativeProps({
                        src: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(club.name) + '&background=8A1538&color=fff',
                      });
                    }}
                  />
                  <View style={styles.clubInfo}>
                    <View style={styles.clubHeader}>
                      <Text style={[styles.clubName, { color: colors.foreground }]} numberOfLines={1}>
                        {club.name}
                      </Text>
                      <View style={[styles.boardBadge, { backgroundColor: boardColor + '20', borderColor: boardColor + '40' }]}>
                        <Text style={[styles.boardBadgeText, { color: boardColor }]}>{club.parentTag}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginVertical: 2 }}>
                      <InstagramLogo size={13} color={colors.primary} weight="bold" />
                      <Text style={[styles.clubHandle, { color: colors.primary }]}>{club.handle}</Text>
                    </View>
                    <Text style={[styles.clubDesc, { color: colors.muted }]} numberOfLines={2}>
                      {club.description}
                    </Text>
                  </View>
                  <View style={[styles.openInstagramBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                    <ArrowUpRight size={16} color={colors.foreground} weight="bold" />
                  </View>
                </Pressable>
              </AnimatedWrapper>
            );
          })}

          {filteredClubs.length === 0 && (
            <View style={[styles.emptyClubsBox, { borderColor: colors.border }]}>
              <Text style={[styles.emptyClubsTitle, { color: colors.foreground }]}>No clubs found</Text>
              <Text style={[styles.emptyClubsSubtitle, { color: colors.muted }]}>
                Try clearing your search or selecting a different board filter.
              </Text>
              <Pressable
                onPress={() => {
                  setClubSearch('');
                  setActiveBoard('All');
                }}
                style={[styles.resetSearchBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: colors.onPrimary, fontWeight: '600', fontSize: 13 }}>Reset Filters</Text>
              </Pressable>
            </View>
          )}
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
    paddingTop: 16,
    paddingBottom: 120,
  },
  heading: {
    ...typography.titleXl,
    fontSize: 26,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.bodyMd,
    marginTop: 6,
    maxWidth: 640,
    lineHeight: 22,
  },
  catPillSection: {
    marginVertical: 18,
  },
  catPillScroll: {
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  catPillText: {
    fontSize: 13,
  },
  grid: {
    flexDirection: 'column',
    gap: 16,
  },
  gridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItemFull: {
    width: '100%',
  },
  gridItemHalf: {
    width: '48.5%',
  },
  gridItemWide: {
    width: '100%',
  },
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardIconWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  cardCategory: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  liveDotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: radii.full,
    backgroundColor: '#34D399',
  },
  liveDotText: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '800',
  },
  cardName: {
    ...typography.labelLg,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 2,
  },
  cardDetail: {
    ...typography.bodySm,
    fontSize: 13,
    lineHeight: 19,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
    gap: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  callActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.full,
  },
  callActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  linkActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  linkActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mapCard: {
    height: 200,
    borderRadius: radii.xl,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
  },
  mapImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  mapGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  mapContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  badgeRow: {
    marginBottom: 6,
  },
  facilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
  },
  facilityBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  mapTitle: {
    ...typography.displayMd,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  mapDetail: {
    ...typography.bodySm,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },
  mapBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubsSection: {
    marginTop: 42,
  },
  clubsTitle: {
    ...typography.titleXl,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  clubsSubtitle: {
    ...typography.bodySm,
    marginTop: 4,
    lineHeight: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginTop: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
  },
  clearBtn: {
    padding: 4,
  },
  filterScroll: {
    gap: 8,
    paddingVertical: 14,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  clubList: {
    gap: 12,
  },
  clubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: 14,
  },
  clubAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#8A1538',
  },
  clubInfo: {
    flex: 1,
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  clubName: {
    ...typography.labelLg,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  boardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  boardBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  clubHandle: {
    fontSize: 12,
    fontWeight: '600',
  },
  clubDesc: {
    ...typography.bodySm,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  openInstagramBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyClubsBox: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: 8,
  },
  emptyClubsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyClubsSubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  resetSearchBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
  },
});
