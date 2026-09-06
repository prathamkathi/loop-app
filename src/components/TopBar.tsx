import React from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { Bell, Sun, Moon, Sparkle, User } from 'phosphor-react-native';
import { useTheme, typography, radii } from '../theme';
import type { StudentProfile } from '../utils/auth';

type Props = {
  mode: 'student' | 'studio';
  onNotification?: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleMode?: () => void;
  studentProfile: StudentProfile | null;
  onOpenAuth: () => void;
  onOpenAI?: () => void;
  notificationCount?: number;
};

export default function TopBar({
  mode,
  onNotification,
  isDark,
  onToggleTheme,
  onToggleMode,
  studentProfile,
  onOpenAuth,
  onOpenAI,
  notificationCount,
}: Props) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Dynamic greeting: show student name if signed in, otherwise campus greeting
  const greetingText =
    mode === 'studio'
      ? 'Club Studio'
      : studentProfile
      ? `${greeting}, ${studentProfile.firstName}`
      : `${greeting}, Campus`;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
        Platform.OS === 'web' && ({ maxWidth: 1280, width: '100%', alignSelf: 'center' } as any),
      ]}
    >
      <View style={styles.branding}>
        {!isDesktop && (
          <Text style={[styles.wordmark, { color: colors.primary }]}>
            Loop<Text style={{ color: colors.primary }}>.</Text>
          </Text>
        )}

        <View style={styles.greetingRow}>
          <Text
            style={[
              isDesktop ? styles.desktopTitle : styles.subtitle,
              { color: isDesktop ? colors.foreground : colors.muted },
            ]}
          >
            {greetingText}
          </Text>

          {/* Student Profile / Sign-in Pill */}
          {mode === 'student' && (
            <Pressable
              onPress={onOpenAuth}
              style={({ pressed }) => [
                styles.authPill,
                {
                  backgroundColor: studentProfile ? colors.highlight : colors.primary,
                  borderColor: studentProfile ? colors.border : colors.primary,
                },
                Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'all 0.15s ease' } as any),
                pressed && { transform: [{ scale: 0.95 }] },
              ]}
              accessibilityRole="button"
              accessibilityLabel={studentProfile ? 'View Profile' : 'Sign In'}
            >
              {studentProfile ? (
                <>
                  <View style={[styles.avatarMini, { backgroundColor: colors.primary }]}>
                    <Text style={styles.avatarMiniText}>{studentProfile.firstName[0]}</Text>
                  </View>
                  <Text style={[styles.authPillText, { color: colors.foreground }]}>
                    {studentProfile.firstName}
                  </Text>
                </>
              ) : (
                <>
                  <User size={14} color={colors.onPrimary} weight="bold" />
                  <Text style={[styles.authPillText, { color: colors.onPrimary }]}>Sign In</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        {/* Ask Loop AI Button */}
        {onOpenAI && (
          <Pressable
            onPress={onOpenAI}
            style={({ pressed }) => [
              styles.aiBtn,
              {
                backgroundColor: isDark ? 'rgba(196, 77, 106, 0.15)' : 'rgba(138, 21, 56, 0.08)',
                borderColor: colors.primary,
              },
              Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'all 0.15s ease' } as any),
              pressed && { transform: [{ scale: 0.95 }] },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Ask Campus AI"
          >
            <Sparkle size={15} color={colors.primary} weight="fill" />
            <Text style={[styles.aiBtnText, { color: colors.primary }]}>Ask AI</Text>
          </Pressable>
        )}

        {/* Relocated Student / Studio Mode Toggle */}
        {onToggleMode && (
          <Pressable
            onPress={onToggleMode}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${mode === 'student' ? 'Club Studio mode' : 'Student View'}`}
            style={({ pressed }) => [
              styles.modePill,
              {
                backgroundColor: mode === 'studio' ? colors.primary : colors.surface,
                borderColor: mode === 'studio' ? colors.primary : colors.border,
              },
              Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'all 0.15s ease' } as any),
              pressed && { transform: [{ scale: 0.95 }] },
            ]}
          >
            <Text
              style={[
                styles.modePillText,
                { color: mode === 'studio' ? colors.onPrimary : colors.foreground },
              ]}
            >
              {mode === 'student' ? '🎓 Studio' : '⚡ Student'}
            </Text>
          </Pressable>
        )}

        {/* Notification Bell */}
        {onNotification && (
          <Pressable
            onPress={onNotification}
            accessibilityRole="button"
            accessibilityLabel={`Campus Notifications${notificationCount ? `, ${notificationCount} unread` : ''}`}
            style={({ pressed }) => [
              styles.iconBtn,
              { borderColor: colors.border, backgroundColor: colors.surface },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
              pressed && { transform: [{ scale: 0.92 }] },
            ]}
          >
            <Bell size={20} color={colors.foreground} weight="regular" />
            {notificationCount && notificationCount > 0 ? (
              <View style={[styles.notifBadge, { backgroundColor: colors.primary }]} />
            ) : null}
          </Pressable>
        )}

        {/* Single Theme Toggle */}
        <Pressable
          onPress={onToggleTheme}
          accessibilityRole="button"
          accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={({ pressed }) => [
            styles.iconBtn,
            { borderColor: colors.border, backgroundColor: colors.surface },
            Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
            pressed && { transform: [{ scale: 0.92 }] },
          ]}
        >
          {isDark ? (
            <Sun size={20} color={colors.primary} weight="bold" />
          ) : (
            <Moon size={20} color={colors.foreground} weight="bold" />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    zIndex: 10,
    width: '100%',
  },
  branding: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wordmark: {
    fontFamily: typography.displayMd.fontFamily,
    fontWeight: '700',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  desktopTitle: {
    fontFamily: typography.displayMd.fontFamily,
    fontWeight: '600',
    fontSize: 22,
    letterSpacing: -0.3,
  },
  subtitle: {
    ...typography.bodySm,
    fontSize: 13,
  },
  authPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  authPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  avatarMini: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  aiBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  modePillText: {
    ...typography.labelSm,
    fontSize: 12,
    fontWeight: '700',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
