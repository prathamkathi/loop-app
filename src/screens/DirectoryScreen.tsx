import React, { useState, useMemo } from 'react';
import {
  View, Text, Image, ScrollView, Pressable, TextInput, StyleSheet, Animated, Easing, Platform, useWindowDimensions, Linking,
} from 'react-native';
import {
  ArrowRight, ArrowUpRight, FirstAid, Heartbeat, BookOpen, Trophy, Buildings, MapPin, PhoneCall, MagnifyingGlass, X, InstagramLogo, ShieldCheck
} from 'phosphor-react-native';
import { useTheme, typography, radii, shadows, spacing } from '../theme';
import { DIRECTORY, type DirectoryItem } from '../data/directory';
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
  const isDesktop = width >= 768;

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
  const otherFacilities = DIRECTORY.filter(d => d.category !== 'Emergency');

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={[typography.displayXl, { color: colors.foreground, textTransform: 'uppercase', marginBottom: spacing.md }]}>
        DIRECTORY
      </Text>
      
      {/* Docked Emergency Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.lg }}>
        {emergencyContacts.map((em) => (
          <Pressable 
            key={em.id} 
            onPress={() => em.phone ? Linking.openURL(`tel:${em.phone.replace(/[^0-9]/g, '')}`) : openExternalLink(em.url)}
            style={({ pressed }) => [
              styles.emergencyPill, 
              { backgroundColor: '#FF3366' },
              pressed && { transform: [{ scale: 0.95 }] },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any)
            ]}
          >
            <FirstAid size={16} color="#FFF" weight="bold" />
            <Text style={[typography.labelLg, { color: '#FFF', fontWeight: '800' }]}>{em.name.toUpperCase()}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Clubs Roster */}
      <View style={{ marginBottom: spacing.xl }}>
        <Text style={[typography.titleXl, { color: colors.foreground, textTransform: 'uppercase', marginBottom: spacing.md }]}>
          ROSTER
        </Text>
        
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MagnifyingGlass size={18} color={colors.muted} />
          <TextInput placeholder="Search lineup..." placeholderTextColor={colors.muted} value={clubSearch} onChangeText={setClubSearch} style={[styles.searchInput, { color: colors.foreground }]} />
          {clubSearch.length > 0 && <Pressable onPress={() => setClubSearch('')} style={{ padding: spacing.xs }}><X size={16} color={colors.muted} weight="bold" /></Pressable>}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {BOARD_TABS.map((tab) => {
            const active = tab === activeBoard;
            return (
              <Pressable key={tab} onPress={() => setActiveBoard(tab)}
                style={({ pressed }) => [
                  styles.filterChip,
                  { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border, transform: [{ scale: pressed ? 0.96 : 1 }] },
                  Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                ]}>
                <Text style={[typography.labelMd, { color: active ? '#000' : colors.muted, textTransform: 'uppercase' }]}>{tab}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Staggered Roster Blocks */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {filteredClubs.map((club, index) => (
            <AnimatedWrapper key={club.id} index={index}>
              <Pressable
                onPress={() => openInstagram(club.handle)}
                style={({ pressed }) => [
                  styles.rosterBlock,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  pressed && { transform: [{ scale: 0.98 }] },
                  Platform.OS === 'web' && ({ cursor: 'pointer' } as any)
                ]}
              >
                <Text style={[typography.displayMd, { color: colors.foreground, fontSize: 24, lineHeight: 28, textTransform: 'uppercase' }]} numberOfLines={2}>
                  {club.name}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12 }}>
                  <Text style={[typography.labelCaps, { color: colors.primary }]}>{club.parentTag}</Text>
                  <InstagramLogo size={20} color={colors.muted} />
                </View>
              </Pressable>
            </AnimatedWrapper>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.marginMobile, paddingTop: spacing.xl, paddingBottom: 120 },
  emergencyPill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: radii.full, borderBottomRightRadius: 0 },
  searchBar: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 0, borderWidth: 1, paddingHorizontal: spacing.md, marginTop: spacing.md, gap: spacing.sm },
  searchInput: { flex: 1, height: '100%', fontSize: 16, fontFamily: 'Inter_500Medium' },
  filterScroll: { gap: spacing.sm, paddingVertical: spacing.md },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radii.full, borderWidth: 1 },
  rosterBlock: { width: 160, height: 160, padding: 16, borderRadius: 0, borderWidth: 1, justifyContent: 'space-between', backgroundColor: '#111' },
});
