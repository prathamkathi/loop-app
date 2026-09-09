import React, { useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions, Animated, Platform } from 'react-native';
import { Image } from 'expo-image';
import { MapPin, CalendarBlank, BookmarkSimple, CaretRight } from 'phosphor-react-native';
import { useTheme, typography, radii, spacing, shadows } from '../theme';
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
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, speed: 20, bounciness: 10 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }).start();
  };
  
  const category = getCategoryMeta(event.category);
  const Icon = category.icon;
  const date = formatCardDateLine(event);
  const concluded = isPast ?? isPastEvent(event);
  const hasImage = event.image && failedImage !== event.image;

  // Apple-style sizing
  const cardHeight = featured ? (width > 800 ? 560 : 440) : 340;
  const imageHeight = featured ? (width > 800 ? 420 : 320) : 220;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }], width: '100%', marginBottom: spacing.lg }, shadows.card]}>
      <Pressable 
        onPress={onPress} 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button" 
        style={({ pressed }) => [
          styles.cardContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
          Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'box-shadow 0.2s ease' } as any),
        ]}
      >
        {/* Top Image Section */}
        <View style={[{ height: imageHeight, width: '100%', overflow: 'hidden' }]}>
          {hasImage ? (
            <Image 
              source={{ uri: getOptimizedImageUrl(event.image) }} 
              style={StyleSheet.absoluteFill} 
              contentFit="cover" 
              cachePolicy="memory-disk"
              onError={() => setFailedImage(event.image)} 
              recyclingKey={event.image} 
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
              <Poster category={category.label} seed={event.title} />
            </View>
          )}
          
          {/* Top Badges overlaying image faintly */}
          <View style={styles.topBar}>
            <View style={[styles.glassBadge, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)' }]}>
              <Icon size={12} color={colors.foreground} weight="regular" />
              <Text style={[typography.labelCaps, { color: colors.foreground, fontSize: 10 }]}>
                {category.label}
              </Text>
            </View>
            {concluded && (
              <View style={[styles.glassBadge, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)' }]}>
                <Text style={[typography.labelCaps, { color: colors.muted, fontSize: 10 }]}>Past</Text>
              </View>
            )}
          </View>
        </View>

        {/* Content Section below image */}
        <View style={styles.content}>
          <View style={styles.contentHeader}>
            <Text style={[typography.caption, { color: colors.accent, fontWeight: '600', marginBottom: 4 }]} numberOfLines={1}>
              {formatHost(event.host)}
            </Text>
            <Text style={[featured ? typography.titleXl : typography.titleLg, { color: colors.foreground }]} numberOfLines={2}>
              {event.title}
            </Text>
          </View>

          <View style={styles.footer}>
            <View style={{ flex: 1, gap: 4 }}>
              <View style={styles.metaRow}>
                <CalendarBlank size={14} color={colors.muted} weight="regular" />
                <Text style={[typography.bodyXs, { color: colors.foregroundSecondary }]} numberOfLines={1}>
                  {date.primary}{date.secondary ? ' · ' + date.secondary : ''}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <MapPin size={14} color={colors.muted} weight="regular" />
                <Text style={[typography.bodyXs, { color: colors.muted }]} numberOfLines={1}>
                  {formatCardVenue(event.venue, event.category)}
                </Text>
              </View>
            </View>

            {/* Elegant Save Button */}
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
                { backgroundColor: event.actionUrl ? colors.foreground : (saved ? colors.accent : colors.surfaceElevated) },
                pressed && { transform: [{ scale: 0.95 }] },
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any)
              ]}
            >
              {event.actionUrl ? (
                <CaretRight size={16} color={colors.background} weight="bold" />
              ) : (
                <BookmarkSimple size={16} color={saved ? '#FFF' : colors.foreground} weight={saved ? 'fill' : 'regular'} />
              )}
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
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
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  content: {
    padding: spacing.md,
    flex: 1,
    justifyContent: 'space-between',
  },
  contentHeader: {
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
