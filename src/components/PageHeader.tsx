import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, typography, spacing } from '../theme';

interface PageHeaderProps {
  sectionLabel: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  rightElement?: React.ReactNode;
  isDesktop?: boolean;
}

export default function PageHeader({ sectionLabel, title, subtitle, rightElement, isDesktop }: PageHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>{sectionLabel}</Text>
      
      {/* Title */}
      <Text accessibilityRole="header" style={[
        isDesktop ? typography.displayXl : typography.displayLg, 
        { color: colors.foreground }
      ]}>
        {title}
      </Text>
      
      {/* Subtitle Row */}
      { (subtitle || rightElement) && (
        <View style={styles.introBottom}>
          {subtitle && (
            <Text style={[typography.bodyMd, { color: colors.muted, flex: 1 }]}>
              {subtitle}
            </Text>
          )}
          {rightElement && (
            <View style={styles.rightElementContainer}>
              {rightElement}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    paddingBottom: spacing.xxl - spacing.xl, // roughly 32px or 28px depending on grid
    borderBottomWidth: 1,
  },
  eyebrow: { 
    ...typography.labelCaps, 
    fontSize: 11, 
    letterSpacing: 2, 
    marginBottom: spacing.md 
  },
  introBottom: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end', 
    gap: spacing.lg, 
    marginTop: spacing.md + spacing.xs 
  },
  rightElementContainer: {
    alignItems: 'flex-end',
    gap: spacing.sm - spacing.xs, // 6px
  }
});
