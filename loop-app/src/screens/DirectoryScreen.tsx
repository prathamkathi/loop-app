import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { ArrowRight, ArrowUpRight } from 'phosphor-react-native';
import { useTheme, typography, radii, shadows } from '../theme';
import SectionLabel from '../components/SectionLabel';
import { DIRECTORY } from '../data/directory';
import { CLUBS } from '../data/clubs';
import { openExternalLink, openInstagram } from '../utils/linking';

function AnimatedWrapper({ index, children }: { index: number; children: React.ReactNode }) {
  const riseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(riseAnim, {
      toValue: 1,
      duration: 500,
      delay: Math.min(index * 35, 300),
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: true,
    }).start();
  }, [index, riseAnim]);

  const translateY = riseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
  });

  return (
    <Animated.View style={{ opacity: riseAnim, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

const FILTER_TABS = [
  'All',
  'BRCA',
  'CAIC',
  'BSA',
  'BSW',
  'BSP',
  'NSS',
  'Independent',
  'Official',
];

export default function DirectoryScreen() {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredClubs = React.useMemo(() => {
    if (activeFilter === 'All') return CLUBS;
    return CLUBS.filter((c) => c.parentTag === activeFilter);
  }, [activeFilter]);

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
        Everything within reach
      </Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Discover essential services, wellness resources, campus facilities, and student organizations.
      </Text>

      {/* Facilities Grid */}
      <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
        {DIRECTORY.map((d, index) => {
          const isHero = d.span === 'hero';
          const isMap = d.span === 'map';
          const isCrimson = d.tone === 'crimson';
          const isCalm = d.tone === 'calm';

          const bgColor = isCrimson
            ? colors.primary
            : isCalm
              ? isDark ? colors.surfaceElevated : '#EEF3F0'
              : colors.surface;

          const textColor = isCrimson ? colors.onPrimary : colors.foreground;
          const detailColor = isCrimson ? 'rgba(255, 255, 255, 0.85)' : colors.muted;
          const actionColor = isCrimson ? colors.onPrimary : colors.primary;

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
            <View key={d.id} style={isDesktop ? (isHero ? styles.gridItemWide : styles.gridItemHalf) : styles.gridItemFull}>
              <AnimatedWrapper index={index}>
                <Pressable
                  onPress={() => openExternalLink(d.url)}
                  accessibilityRole="link"
                  accessibilityLabel={`${d.name}, ${d.detail}`}
                  style={({ pressed }) => [
                    styles.card,
                    {
                      backgroundColor: bgColor,
                      borderColor: isCrimson ? 'transparent' : colors.border,
                      minHeight: isHero ? 180 : 156,
                    },
                    shadows.card,
                    Platform.OS === 'web' && ({
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    } as any),
                    pressed && { transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <View style={styles.cardTop}>
                    <Text style={[styles.cardName, { color: textColor }]} numberOfLines={2}>
                      {d.name}
                    </Text>
                    {/* Removed static status badge (F-37) to prevent showing incorrect Open/Closed states */}
                  </View>
                  <View>
                    <Text style={[styles.cardDetail, { color: detailColor }]} numberOfLines={2}>
                      {d.detail}
                    </Text>
                    <View style={styles.actionRow}>
                      <Text style={[styles.actionText, { color: actionColor }]}>{d.action}</Text>
                      <ArrowRight size={15} color={actionColor} weight="bold" />
                    </View>
                  </View>
                </Pressable>
              </AnimatedWrapper>
            </View>
          );
        })}
      </View>

      {/* Clubs & Boards Section */}
      <View style={styles.clubsSection}>
        <SectionLabel>Student Organizations</SectionLabel>
        <Text style={[styles.clubsTitle, { color: colors.foreground }]}>Clubs & Boards</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTER_TABS.map((tab) => {
            const active = tab === activeFilter;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveFilter(tab)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Filter by ${tab}`}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
                  Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                ]}
              >
                <Text style={[styles.filterChipText, { color: active ? colors.onPrimary : colors.muted }]}>
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.clubList}>
          {filteredClubs.map((club, index) => (
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
                    transition: 'all 0.2s ease',
                  }),
                  pressed && { transform: [{ scale: 0.99 }] },
                ]}
              >
                <Image
                  source={{ uri: club.avatar }}
                  style={styles.clubAvatar}
                  onError={(e) => {
                    e.currentTarget.setNativeProps({
                      src: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(club.name) + '&background=8A1538&color=fff'
                    });
                  }}
                />
                <View style={styles.clubInfo}>
                  <View style={styles.clubHeader}>
                    <Text style={[styles.clubName, { color: colors.foreground }]} numberOfLines={1}>
                      {club.name}
                    </Text>
                    <Text style={[styles.clubTag, { color: colors.primary }]}>{club.parentTag}</Text>
                  </View>
                  <Text style={[styles.clubHandle, { color: colors.primary }]}>{club.handle}</Text>
                  <Text style={[styles.clubDesc, { color: colors.muted }]} numberOfLines={2}>
                    {club.description}
                  </Text>
                </View>
                <ArrowUpRight size={20} color={colors.primary} weight="bold" style={{ marginLeft: 12 }} />
              </Pressable>
            </AnimatedWrapper>
          ))}
          {filteredClubs.length === 0 && (
            <Text style={[styles.noClubs, { color: colors.muted }]}>No organizations found in this category.</Text>
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
    paddingBottom: 96,
  },
  heading: {
    ...typography.displayMd,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.bodyMd,
    maxWidth: 500,
    marginBottom: 28,
  },
  grid: {
    gap: 16,
    paddingBottom: 24,
  },
  gridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
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
    padding: 20,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardName: {
    ...typography.titleLg,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...typography.labelSm,
    fontSize: 12,
  },
  cardDetail: {
    ...typography.bodySm,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  actionText: {
    ...typography.labelMd,
    fontSize: 13,
    fontWeight: '600',
  },
  mapCard: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    height: 190,
    position: 'relative',
  },
  mapImage: {
    ...StyleSheet.absoluteFill,
  },
  mapGradient: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 10, 12, 0.55)',
  },
  mapContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  mapTitle: {
    ...typography.titleXl,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  mapDetail: {
    ...typography.bodySm,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  mapBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubsSection: {
    paddingTop: 24,
  },
  clubsTitle: {
    ...typography.displayMd,
    marginBottom: 16,
  },
  filterScroll: {
    paddingVertical: 8,
    gap: 10,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  filterChipText: {
    ...typography.labelMd,
    fontSize: 13,
  },
  clubList: {
    gap: 12,
  },
  clubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  clubAvatar: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    marginRight: 14,
  },
  clubIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  clubIconText: {
    ...typography.titleMd,
    fontWeight: '700',
  },
  clubInfo: {
    flex: 1,
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  clubName: {
    ...typography.titleMd,
    flex: 1,
  },
  clubTag: {
    ...typography.labelCaps,
    fontSize: 10,
    marginLeft: 8,
  },
  clubHandle: {
    ...typography.labelSm,
    marginBottom: 4,
    fontWeight: '500',
  },
  clubDesc: {
    ...typography.bodySm,
    fontSize: 13,
    lineHeight: 18,
  },
  noClubs: {
    ...typography.bodyMd,
    textAlign: 'center',
    marginTop: 24,
  },
});
