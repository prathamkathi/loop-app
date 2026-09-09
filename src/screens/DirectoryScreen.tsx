import React, { useState, useMemo } from 'react';
import {
  View, Text, Image, ScrollView, Pressable, TextInput, StyleSheet, Animated, Easing, Platform, useWindowDimensions, Linking,
} from 'react-native';
import {
  ArrowUpRight, FirstAid, MagnifyingGlass, X, InstagramLogo
} from 'phosphor-react-native';
import { useTheme, typography, radii, shadows, spacing } from '../theme';
import { DIRECTORY } from '../data/directory';
import { CLUBS, type ClubItem } from '../data/clubs';
import { openExternalLink, openInstagram } from '../utils/linking';

const BOARD_TABS = ['All', 'BRCA', 'CAIC', 'BSA', 'BSW', 'BSP', 'NSS', 'Independent'];
const BOARD_COLORS: Record<string, string> = {
  BRCA: '#E11D48', CAIC: '#2563EB', BSA: '#059669', BSW: '#D97706', BSP: '#7C3AED', NSS: '#0D9488', Independent: '#64748B', Official: '#475569',
};

function AnimatedWrapper({ index, children }: { index: number; children: React.ReactNode }) {
  const riseAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(riseAnim, {
      toValue: 1, duration: 450, delay: Math.min(index * 30, 250),
      easing: Easing.bezier(0.22, 1, 0.36, 1), useNativeDriver: true,
    }).start();
  }, [index, riseAnim]);
  const translateY = riseAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  return <Animated.View style={{ opacity: riseAnim, transform: [{ translateY }] }}>{children}</Animated.View>;
}

export default function DirectoryScreen() {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const paddingHorizontal = width < 500 ? spacing.marginMobile : spacing.marginDesktop;

  const [activeBoard, setActiveBoard] = useState<string>('All');
  const [clubSearch, setClubSearch] = useState<string>('');

  const filteredClubs = useMemo(() => {
    let list: ClubItem[] = CLUBS;
    if (activeBoard !== 'All') list = list.filter((c) => c.parentTag === activeBoard);
    if (clubSearch.trim()) {
      const q = clubSearch.toLowerCase().trim();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q)) || c.parentTag.toLowerCase().includes(q));
    }
    return list;
  }, [activeBoard, clubSearch]);

  const emergencyContacts = DIRECTORY.filter(d => d.category === 'Emergency');

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* Refined Header */}
      <View style={{ paddingHorizontal, paddingTop: spacing.xl, paddingBottom: spacing.lg }}>
        <Text style={[typography.caption, { color: colors.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }]}>
          Campus Essentials
        </Text>
        <Text style={[typography.displayLg, { color: colors.foreground, marginBottom: spacing.xs }]}>
          Directory
        </Text>
      </View>

      {/* Elegant Translucent Emergency Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal, gap: spacing.sm, paddingBottom: spacing.lg }}>
        {emergencyContacts.map((em) => (
          <Pressable 
            key={em.id} 
            onPress={() => em.phone ? Linking.openURL(`tel:${em.phone.replace(/[^0-9]/g, '')}`) : openExternalLink(em.url)}
            style={({ pressed }) => [
              styles.emergencyPill, 
              { backgroundColor: isDark ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 59, 48, 0.08)' },
              pressed && { transform: [{ scale: 0.96 }] },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any)
            ]}
          >
            <FirstAid size={18} color={isDark ? '#FF453A' : '#FF3B30'} weight="fill" />
            <Text style={[typography.labelLg, { color: isDark ? '#FF453A' : '#FF3B30' }]}>{em.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Clubs & Organizations */}
      <View style={{ marginBottom: spacing.xl, paddingHorizontal }}>
        <Text style={[typography.titleXl, { color: colors.foreground, marginBottom: spacing.md }]}>
          Student Organizations
        </Text>
        
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
          <MagnifyingGlass size={20} color={colors.muted} />
          <TextInput placeholder="Search clubs, teams, or boards..." placeholderTextColor={colors.muted} value={clubSearch} onChangeText={setClubSearch} style={[styles.searchInput, { color: colors.foreground }]} />
          {clubSearch.length > 0 && <Pressable onPress={() => setClubSearch('')} style={{ padding: spacing.xs }}><X size={16} color={colors.muted} weight="bold" /></Pressable>}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {BOARD_TABS.map((tab) => {
            const active = tab === activeBoard;
            return (
              <Pressable key={tab} onPress={() => setActiveBoard(tab)}
                style={({ pressed }) => [
                  styles.filterChip,
                  { backgroundColor: active ? colors.foreground : 'transparent', borderColor: active ? colors.foreground : colors.borderSubtle },
                  pressed && { transform: [{ scale: 0.96 }] },
                  Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                ]}>
                <Text style={[typography.labelMd, { color: active ? colors.background : colors.muted }]}>{tab}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Elegant List Rows */}
        <View style={styles.listContainer}>
          {filteredClubs.map((club, index) => (
            <AnimatedWrapper key={club.id} index={index}>
              <Pressable
                onPress={() => openInstagram(club.handle)}
                style={({ pressed }) => [
                  styles.clubRow,
                  { borderBottomColor: colors.borderSubtle },
                  pressed && { opacity: 0.7 },
                  Platform.OS === 'web' && ({ cursor: 'pointer' } as any)
                ]}
              >
                <Image
                  source={{ uri: club.avatar }}
                  style={[styles.clubAvatar, { backgroundColor: colors.surfaceElevated }]}
                  onError={(e) => {
                    e.currentTarget.setNativeProps({
                      src: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(club.name) + '&background=E5E5EA&color=1C1C1E',
                    });
                  }}
                />
                <View style={styles.clubInfo}>
                  <Text style={[typography.titleSm, { color: colors.foreground, marginBottom: 2 }]} numberOfLines={1}>
                    {club.name}
                  </Text>
                  <Text style={[typography.bodySm, { color: colors.muted }]} numberOfLines={1}>
                    {club.parentTag} · {club.handle}
                  </Text>
                </View>
                <ArrowUpRight size={18} color={colors.muted} weight="regular" />
              </Pressable>
            </AnimatedWrapper>
          ))}

          {filteredClubs.length === 0 && (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={[typography.bodyMd, { color: colors.muted }]}>No organizations found.</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  emergencyPill: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 14, borderRadius: radii.full },
  searchBar: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: radii.full, borderWidth: 1, paddingHorizontal: spacing.md, marginTop: spacing.xs, gap: spacing.sm },
  searchInput: { flex: 1, height: '100%', fontSize: 16, fontFamily: 'Inter_400Regular' },
  filterScroll: { gap: spacing.sm, paddingVertical: spacing.lg },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radii.full, borderWidth: 1 },
  listContainer: { marginTop: spacing.sm },
  clubRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, gap: 14 },
  clubAvatar: { width: 50, height: 50, borderRadius: radii.full },
  clubInfo: { flex: 1, justifyContent: 'center' },
});
