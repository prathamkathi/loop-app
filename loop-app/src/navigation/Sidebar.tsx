import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { ArrowsLeftRight } from 'phosphor-react-native';
import { useTheme, typography, radii } from '../theme';
import { STUDENT_TABS, STUDIO_TABS, type TabId } from './BottomTabBar';

type Props = {
  mode: 'student' | 'studio';
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onToggleMode: () => void;
};

export default function Sidebar({
  mode,
  activeTab,
  onTabChange,
  onToggleMode,
}: Props) {
  const { colors, isDark } = useTheme();
  const tabs = mode === 'student' ? STUDENT_TABS : STUDIO_TABS;

  return (
    <View style={[styles.sidebar, { backgroundColor: colors.background, borderRightColor: colors.border }]}>
      {/* Wordmark */}
      <View style={styles.wordmark}>
        <Text style={[styles.wordmarkText, { color: colors.primary }]}>
          Loop
          <Text style={{ color: colors.primary }}>.</Text>
        </Text>
        <Text style={[styles.context, { color: colors.muted }]}>
          Campus Concierge
        </Text>
      </View>

      {/* Nav Items */}
      <View style={styles.navItems}>
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          const IconComp = tab.Icon;
          return (
            <Pressable
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.navItem,
                active && [
                  styles.activeNav,
                  {
                    backgroundColor: isDark ? 'rgba(196, 77, 106, 0.18)' : 'rgba(138, 21, 56, 0.08)',
                  },
                ],
                Platform.OS === 'web' && ({
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }),
                pressed && { transform: [{ translateX: 3 }] },
              ]}
            >
              <IconComp
                size={22}
                weight={active ? 'fill' : 'regular'}
                color={active ? colors.primary : colors.muted}
              />
              <Text
                style={[
                  styles.navLabel,
                  {
                    color: active ? colors.primary : colors.foregroundSecondary,
                    fontWeight: active ? '700' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomSection}>
        {/* Mode Toggle */}
        <Pressable
          onPress={onToggleMode}
          accessibilityRole="button"
          accessibilityLabel={`Switch to ${mode === 'student' ? 'Club Studio' : 'Student View'}`}
          style={({ pressed }) => [
            styles.modeToggle,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
        >
          <View style={styles.modeRow}>
            <Text style={[styles.modeLabel, { color: colors.foreground }]}>
              {mode === 'student' ? 'Student View' : 'Club Studio'}
            </Text>
            <ArrowsLeftRight size={16} color={colors.primary} weight="bold" />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 250,
    height: '100%',
    borderRightWidth: 1,
    paddingTop: 36,
    paddingHorizontal: 16,
    paddingBottom: 24,
    justifyContent: 'flex-start',
  },
  wordmark: {
    paddingHorizontal: 12,
    marginBottom: 36,
  },
  wordmarkText: {
    fontFamily: typography.displayMd.fontFamily,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
  },
  context: {
    ...typography.bodySm,
    marginTop: 2,
  },
  navItems: {
    gap: 6,
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.xl,
  },
  activeNav: {
    borderRadius: radii.xl,
  },
  navLabel: {
    ...typography.labelMd,
    fontSize: 14,
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 'auto' as any,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(138, 21, 56, 0.08)',
  },
  modeToggle: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeLabel: {
    ...typography.labelSm,
    fontSize: 12,
    fontWeight: '600',
  },
});
