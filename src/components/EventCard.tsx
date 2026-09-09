import React, { useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions, Animated, Platform } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { MapPin, CalendarBlank, ArrowUpRight } from 'phosphor-react-native';
import { useTheme, typography, radii, spacing } from '../theme';
import Poster from './Poster';
import { getOptimizedImageUrl } from '../utils/cloudinary';
import { getCategoryMeta, formatCardDateLine, formatCardVenue } from '../utils/categoryMeta';
import { isPastEvent } from '../utils/eventDiscovery';
import { openExternalLink } from '../utils/linking';
import { formatHost } from '../utils/format';
import type { EventItem } from '../data/events';

type Props = {
  event: EventItem; saved: boolean; onToggleSave: () => void; onPress: () => void;
  index?: number; isPast?: boolean; featured?: boolean;
};

export default function EventCard({ event, saved, onToggleSave, onPress, isPast, featured = false }: Props) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  
  const [failedImage, setFailedImage] = useState('');
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };
  
  const category = getCategoryMeta(event.category);
  const Icon = category.icon;
  const date = formatCardDateLine(event);
  const concluded = isPast ?? isPastEvent(event);
  
  const hasImage = event.image && failedImage !== event.image;

  // For featured Spotlight cards, we make them much taller.
  const cardHeight = featured ? (width > 800 ? 560 : 480) : 340;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }], width: '100%', marginBottom: spacing.lg }]}>
      <Pressable 
        onPress={onPress} 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button" 
        style={({ pressed }) => [
          styles.cardContainer,
          { height: cardHeight },
          Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
        ]}
      >
        {/* Full-bleed background poster */}
        {hasImage ? (
          <Image 
            source={{ uri: getOptimizedImageUrl(event.image) }} 
            style={StyleSheet.absoluteFill} 
            contentFit="cover" 
            cachePolicy="memory-disk"
            accessibilityLabel={event.title + ' event poster'} 
            onError={() => setFailedImage(event.image)} 
            recyclingKey={event.image} 
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface }]}>
            <Poster category={category.label} seed={event.title} />
          </View>
        )}

        {/* Heavy brutalist gradient for readability */}
        <View style={[StyleSheet.absoluteFill, styles.gradientOverlay]} />

        {/* Top Badges */}
        <View style={styles.topBar}>
          <BlurView intensity={30} tint="dark" style={styles.glassBadge}>
            <Icon size={14} color={colors.primary} weight="bold" />
            <Text style={[typography.labelCaps, { color: colors.foreground, fontSize: 10, letterSpacing: 1 }]}>
              {category.label}
            </Text>
          </BlurView>
          {concluded && (
            <BlurView intensity={30} tint="dark" style={styles.glassBadge}>
              <Text style={[typography.labelCaps, { color: colors.muted, fontSize: 10 }]}>Past</Text>
            </BlurView>
          )}
        </View>

        {/* Content pinned to bottom */}
        <View style={styles.content}>
          <Text style={[styles.title, featured && styles.featureTitle, { color: colors.foreground }]} numberOfLines={3}>
            {event.title}
          </Text>
          
          <BlurView intensity={40} tint="dark" style={[styles.glassPanel, { borderColor: colors.borderSubtle }]}>
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={[typography.labelMd, { color: colors.foreground }]}>{formatHost(event.host)}</Text>
              <View style={styles.metaRow}>
                <CalendarBlank size={16} color={colors.primary} weight="bold" />
                <Text style={[typography.bodySm, { color: colors.foregroundSecondary }]} numberOfLines={1}>
                  {date.primary}{date.secondary ? ' · ' + date.secondary : ''}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <MapPin size={16} color={colors.muted} weight="bold" />
                <Text style={[typography.bodySm, { color: colors.muted }]} numberOfLines={1}>
                  {formatCardVenue(event.venue, event.category)}
                </Text>
              </View>
            </View>

            {/* Brutalist Save/Action Button */}
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                if (event.actionUrl) {
                  openExternalLink(event.actionUrl);
                } else {
                  onToggleSave();
                }
              }}
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: colors.primary },
                pressed && { transform: [{ scale: 0.95 }] },
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any)
              ]}
            >
              <Text style={[typography.labelLg, { color: '#000', fontSize: 18, fontWeight: '800', letterSpacing: -0.5 }]}>
                {event.actionUrl ? 'LINK' : (saved ? 'SAVED' : 'SAVE')}
              </Text>
              {event.actionUrl && <ArrowUpRight size={18} color="#000" weight="bold" />}
            </Pressable>
          </BlurView>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: radii.xl,
    // Add slightly squarer brutalist corners
    borderTopLeftRadius: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gradientOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    // Fake gradient by having a darker bottom
    borderBottomWidth: 180,
    borderBottomColor: 'rgba(0, 0, 0, 0.85)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  glassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    gap: spacing.md,
  },
  title: {
    ...typography.displayMd,
    lineHeight: 34,
    textTransform: 'uppercase',
  },
  featureTitle: {
    ...typography.displayXl,
    lineHeight: 52,
  },
  glassPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.lg,
    borderTopLeftRadius: 0,
    borderWidth: 1,
    overflow: 'hidden',
    gap: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    minHeight: 54,
    paddingHorizontal: 24,
    borderRadius: radii.full,
    borderBottomRightRadius: 0, // Brutalist sharp edge
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
