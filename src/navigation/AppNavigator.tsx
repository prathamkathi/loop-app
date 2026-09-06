import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import BottomTabBar, { STUDENT_TABS, STUDIO_TABS, type TabId } from './BottomTabBar';
import Sidebar from './Sidebar';
import { useTheme } from '../theme';

type Props = {
  mode: 'student' | 'studio';
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onToggleMode: () => void;
  hideTabBar?: boolean;
  children: React.ReactNode;
};

export default function AppNavigator({
  mode,
  activeTab,
  onTabChange,
  onToggleMode,
  hideTabBar = false,
  children,
}: Props) {
  const { width } = useWindowDimensions();
  const { colors, isDark, toggleTheme } = useTheme();
  const isDesktop = width >= 768;
  const tabs = mode === 'student' ? STUDENT_TABS : STUDIO_TABS;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {isDesktop && (
        <Sidebar
          mode={mode}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onToggleMode={onToggleMode}
        />
      )}

      <View style={[styles.content, isDesktop && styles.contentDesktop]}>
        {children}
      </View>

      {!isDesktop && (
        <BottomTabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
          visible={!hideTabBar}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  content: {
    flex: 1,
    paddingBottom: 0, // Truly floating bottom bar - zero background bar gap
    width: '100%',
  },
  contentDesktop: {
    paddingBottom: 0,
    maxWidth: 1320,
    marginLeft: 0,
  },
});
