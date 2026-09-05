import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Animated } from 'react-native';
import { House, Pulse, Compass, SlidersHorizontal, PlusCircle, Stack } from 'phosphor-react-native';
import { useTheme, typography, radii, shadows } from '../theme';
import { BlurView } from 'expo-blur';

export type TabId = 'home' | 'pulse' | 'directory' | 'curate' | 'submit' | 'queue' | 'studio_home' | 'studio_pulse';

type Tab = {
  id: TabId;
  label: string;
  Icon: React.ElementType;
};

export const STUDENT_TABS: Tab[] = [
  { id: 'home', label: 'Home', Icon: House },
  { id: 'pulse', label: 'Pulse', Icon: Pulse },
  { id: 'directory', label: 'Directory', Icon: Compass },
  { id: 'curate', label: 'Curate', Icon: SlidersHorizontal },
];

export const STUDIO_TABS: Tab[] = [
  { id: 'queue', label: 'Queue', Icon: Stack },
  { id: 'submit', label: 'Submit', Icon: PlusCircle },
  { id: 'studio_home', label: 'Live Feed', Icon: House },
  { id: 'studio_pulse', label: 'Pulse', Icon: Pulse },
];

type Props = {
  tabs: Tab[];
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  visible?: boolean;
};

export default function BottomTabBar({ tabs, activeTab, onTabChange, visible = true }: Props) {
  const { colors, isDark } = useTheme();

  if (!visible) return null;

  const glassBg = isDark ? 'rgba(22, 22, 24, 0.88)' : 'rgba(255, 255, 255, 0.90)';
  const glassBorder = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(138, 21, 56, 0.15)';

  const PlatformBlur = ({ children, style }: any) => {
    if (Platform.OS === 'web') {
      return (
        <View style={[style, { backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }]}>
          {children}
        </View>
      );
    }
    return (
      <BlurView intensity={90} tint={isDark ? 'dark' : 'light'} style={style}>
        {children}
      </BlurView>
    );
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <PlatformBlur
        style={[
          styles.navContainer,
          { backgroundColor: glassBg, borderColor: glassBorder },
          shadows.bottomBar,
        ]}
      >
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          const IconComp = tab.Icon;
          return (
            <Pressable
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              style={({ pressed }) => [
                styles.tab,
                Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'all 0.15s ease' } as any),
                { transform: [{ scale: pressed ? 0.92 : 1 }] },
              ]}
              accessibilityLabel={tab.label}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <IconComp
                size={22}
                weight={active ? 'fill' : 'regular'}
                color={active ? colors.primary : colors.muted}
              />
              <Text
                style={[
                  styles.label,
                  { color: active ? colors.primary : colors.muted },
                  active && { fontWeight: '700' },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </PlatformBlur>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '90%',
    maxWidth: 380,
    borderRadius: radii.full,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.22)',
      },
      default: {},
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    gap: 3,
  },
  label: {
    ...typography.labelSm,
    fontSize: 11,
  },
});
