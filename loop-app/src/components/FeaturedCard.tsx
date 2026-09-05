import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Platform, useWindowDimensions, Linking } from 'react-native';
import { CalendarBlank, ArrowUpRight, WhatsappLogo, MagnifyingGlassPlus, ArrowSquareOut } from 'phosphor-react-native';
import { useTheme, typography, radii } from '../theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import SaveButton from './SaveButton';
import PosterLightboxModal from './PosterLightboxModal';
import { openGoogleCalendar } from '../utils/calendar';
import { openWhatsApp } from './EventCard';
import { getOptimizedImageUrl } from "../utils/cloudinary";
import { getCategoryMeta, formatCardDateLine, formatCardVenue } from '../utils/categoryMeta';
import { getClubAvatar } from '../data/avatars';
import { formatHost } from '../utils/format';
import type { EventItem } from '../data/events';

type Props = {
  event: EventItem;
  saved: boolean;
  onToggleSave: () => void;
  onPress: () => void;
};

export default function FeaturedCard({ event, saved, onToggleSave, onPress }: Props) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  const hostAvatarUri = !avatarError && event.hostAvatar ? event.hostAvatar : getClubAvatar(event.host);

  const catMeta = getCategoryMeta(event.category);
  const CategoryIcon = catMeta.icon;
  const { primary: datePrimary, secondary: dateSecondary, isNotice } = formatCardDateLine(event);
  const venueDisplay = formatCardVenue(event.venue, event.category);

  const firstContact = event.contacts && event.contacts.length > 0 ? event.contacts[0] : null;

  return (
    <>
      <View
        style={[
          styles.card,
          {
            aspectRatio: isDesktop ? 16 / 9 : 16 / 10,
          },
          Platform.OS === 'web' && ({
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease',
          } as any),
        ]}
      >
        {/* F-29: Dedicated background card press target */}
        <Pressable
          onPress={onPress}
          style={StyleSheet.absoluteFill}
          accessibilityLabel={`View details for ${event.title}`}
          accessibilityRole="button"
        />

        {/* Ambient background + contained foreground */}
        {!event.image || imgError ? (
          <LinearGradient
            colors={isDark ? ['#3A0E1A', '#1F0B12', '#14070B'] : ['#8A1538', '#5A0D23', '#2D0611']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          >
            <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', opacity: 0.14 }]}>
              <CategoryIcon size={160} color="#FFFFFF" weight="duotone" />
            </View>
          </LinearGradient>
        ) : (
          <>
            <Image
              source={{ uri: getOptimizedImageUrl(event.image) }}
              style={styles.imageBg}
              blurRadius={12}
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
            <Image
              source={{ uri: getOptimizedImageUrl(event.image) }}
              style={styles.image}
              resizeMode="contain"
              onError={() => setImgError(true)}
            />
          </>
        )}

        {/* Gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(16,16,18,0.30)', 'rgba(16,16,18,0.94)']}
          locations={[0, 0.40, 1]}
          style={styles.gradient}
        />

        {/* Top Actions: Lightbox Inspect + Save */}
        <View style={styles.topActions}>
          {event.image && (
            <Pressable
              onPress={(e) => {
                e?.stopPropagation?.();
                setShowLightbox(true);
              }}
              style={({ pressed }) => [
                styles.inspectBtn,
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                pressed && { transform: [{ scale: 0.92 }] },
              ]}
              accessibilityLabel="Inspect high-res poster"
            >
              <MagnifyingGlassPlus size={16} color="#FFFFFF" weight="bold" />
              <Text style={styles.inspectText}>Inspect Flyer</Text>
            </Pressable>
          )}
          <SaveButton saved={saved} onPress={onToggleSave} light />
        </View>

        <View style={styles.overlay}>
          <View style={styles.meta}>
            {/* Category Adaptive Badge */}
            <View style={[styles.categoryBadge, { backgroundColor: catMeta.color }]}>
              <CategoryIcon size={12} color="#FFFFFF" weight="bold" />
              <Text style={styles.categoryText}>{catMeta.tag}</Text>
            </View>

            <View style={styles.hostBadge}>
              <Image 
                source={{ uri: hostAvatarUri }} 
                style={styles.featuredAvatar} 
                onError={() => setAvatarError(true)} 
              />
              <Text style={styles.hostName} numberOfLines={1}>{formatHost(event.host)}</Text>
            </View>

            <CalendarBlank size={15} weight="light" color="rgba(255,255,255,0.85)" />
            <Text style={styles.metaText} numberOfLines={1}>
              {datePrimary} · {dateSecondary}
            </Text>
          </View>

          <Text style={styles.title} numberOfLines={2}>{event.title}</Text>

          <View style={styles.buttonRow}>
            {/* If event has actionUrl, prioritize opening official link */}
            {event.actionUrl ? (
              <Pressable
                onPress={(e) => {
                  e?.stopPropagation?.();
                  if (Platform.OS === 'web' && typeof window !== 'undefined') {
                    window.open(event.actionUrl, '_blank', 'noopener,noreferrer');
                  } else {
                    Linking.openURL(event.actionUrl!);
                  }
                }}
                accessibilityRole="link"
                accessibilityLabel={catMeta.actionText || 'Open Official Link'}
                style={({ pressed }) => [
                  styles.actionBtn,
                  { backgroundColor: catMeta.color },
                  Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                  pressed && { transform: [{ scale: 0.96 }] },
                ]}
              >
                <ArrowSquareOut size={16} weight="bold" color="#FFFFFF" />
                <Text style={styles.actionBtnText}>{catMeta.actionText || 'Open Official Link'}</Text>
              </Pressable>
            ) : null}

            {/* Google Calendar RSVP */}
            <Pressable
              onPress={(e) => {
                e?.stopPropagation?.();
                openGoogleCalendar({
                  title: event.title,
                  date: event.date,
                  time: event.time,
                  venue: venueDisplay,
                  description: event.blurb,
                });
              }}
              accessibilityRole="button"
              accessibilityLabel={isNotice ? 'Add Reminder to Google Calendar' : 'RSVP to Google Calendar'}
              style={({ pressed }) => [
                styles.rsvp,
                { backgroundColor: event.actionUrl ? 'rgba(255, 255, 255, 0.15)' : colors.accent },
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                pressed && { transform: [{ scale: 0.96 }] },
              ]}
            >
              <Text style={[styles.rsvpText, { color: event.actionUrl ? '#FFFFFF' : colors.onAccent }]}>
                {isNotice ? 'Add Reminder' : 'RSVP to Calendar'}
              </Text>
              <ArrowUpRight size={16} weight="bold" color={event.actionUrl ? '#FFFFFF' : colors.onAccent} />
            </Pressable>

            {firstContact && (
              <Pressable
                onPress={(e) => {
                  e?.stopPropagation?.();
                  openWhatsApp(firstContact.phone, firstContact.name, event.title);
                }}
                accessibilityRole="button"
                accessibilityLabel="WhatsApp queries"
                style={({ pressed }) => [
                  styles.whatsappBtn,
                  Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                  pressed && { transform: [{ scale: 0.96 }] },
                ]}
              >
                <WhatsappLogo size={16} color="#FFFFFF" weight="fill" />
                <Text style={styles.whatsappText}>WhatsApp Queries</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* High-Resolution Poster Lightbox Modal */}
      {event.image && (
        <PosterLightboxModal
          visible={showLightbox}
          imageUri={event.image}
          title={event.title}
          subtitle={`${formatHost(event.host)} · ${catMeta.label}`}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1C1917',
  },
  imageBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.65,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  topActions: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  inspectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  inspectText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  categoryText: {
    ...typography.labelCaps,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  hostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  featuredAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  hostName: {
    ...typography.labelSm,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
  },
  metaText: {
    ...typography.labelSm,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
  },
  title: {
    ...typography.titleXl,
    fontSize: 22,
    lineHeight: 28,
    color: '#FFFFFF',
    marginBottom: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.full,
  },
  actionBtnText: {
    ...typography.labelSm,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  rsvp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.full,
  },
  rsvpText: {
    ...typography.labelSm,
    fontWeight: '700',
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#25D366',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.full,
  },
  whatsappText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
