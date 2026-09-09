import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions, Animated } from 'react-native';
import { Bell, Sun, Moon, Sparkle, User, ArrowsLeftRight } from 'phosphor-react-native';
import { useTheme, typography, radii } from '../theme';
import type { StudentProfile } from '../utils/auth';

type Props = {
  mode: 'student' | 'studio'; onNotification?: () => void; isDark: boolean;
  onToggleTheme: () => void; onToggleMode?: () => void;
  studentProfile: StudentProfile | null; onOpenAuth: () => void;
  onOpenAI?: () => void; notificationCount?: number;
};

export default function TopBar({ mode, onNotification, isDark, onToggleTheme, onToggleMode, studentProfile, onOpenAuth, onOpenAI, notificationCount }: Props) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const desktop = width >= 1024;
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={[styles.bar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.brand}>
        <Text style={[styles.wordmark, { color: desktop ? colors.foreground : colors.primary }]}>{desktop ? mode === 'studio' ? 'Club Studio' : 'The campus bulletin' : 'Loop.'}</Text>
        {!desktop && (
          <View style={styles.liveContainer}>
            <Animated.View style={[styles.liveDot, { backgroundColor: colors.olive, opacity: pulseAnim }]} />
            <Text style={[typography.labelSm, { color: colors.muted }]}>{mode === 'studio' ? 'Club Studio' : 'IIT Delhi'}</Text>
          </View>
        )}
      </View>
      <View style={styles.actions}>
        {desktop && onOpenAI && <Pressable onPress={onOpenAI} accessibilityRole="button" accessibilityLabel="Ask Campus AI" style={[styles.pill, { backgroundColor: colors.highlight }]}>
          <Sparkle size={18} color={colors.primary} /><Text style={[typography.labelSm, { color: colors.primary }]}>Ask Loop</Text>
        </Pressable>}
        {onNotification && <Pressable onPress={onNotification} accessibilityRole="button" accessibilityLabel={'Campus notifications' + (notificationCount ? ', ' + notificationCount + ' unread' : '')} style={styles.icon}>
          <Bell size={21} color={colors.foregroundSecondary} />{Boolean(notificationCount) && <View style={[styles.badge, { backgroundColor: colors.primary }]} />}
        </Pressable>}
        <Pressable onPress={onToggleTheme} accessibilityRole="button" accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'} style={styles.icon}>
          {isDark ? <Sun size={21} color={colors.foregroundSecondary} /> : <Moon size={21} color={colors.foregroundSecondary} />}
        </Pressable>
        {mode === 'studio' && !desktop && onToggleMode
          ? <Pressable onPress={onToggleMode} accessibilityRole="button" accessibilityLabel="Return to student view" style={styles.icon}><ArrowsLeftRight size={22} color={colors.primary} /></Pressable>
          : <Pressable onPress={onOpenAuth} accessibilityRole="button" accessibilityLabel={studentProfile ? 'View profile' : 'Set up campus profile'}
              style={[styles.profile, { backgroundColor: colors.highlight, borderColor: colors.border }]}>
              {studentProfile?.firstName ? <Text style={[typography.labelMd, { color: colors.primary }]}>{studentProfile.firstName[0].toUpperCase()}</Text> : <User size={20} color={colors.primary} />}
            </Pressable>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { minHeight: 80, paddingHorizontal: 24, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, gap: 12 },
  brand: { flex: 1, minWidth: 0, gap: 2 },
  wordmark: { ...typography.titleXl, fontSize: 23, letterSpacing: -0.8 },
  liveContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  icon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  profile: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
  pill: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, borderRadius: radii.full, marginRight: 8 },
  badge: { position: 'absolute', top: 8, right: 9, width: 6, height: 6, borderRadius: 3 },
});
