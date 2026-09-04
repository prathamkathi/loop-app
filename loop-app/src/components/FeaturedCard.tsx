import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { CalendarBlank, ArrowUpRight, WhatsappLogo, ImageSquare } from 'phosphor-react-native';
import { useTheme, typography, radii } from '../theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import SaveButton from './SaveButton';
import { openGoogleCalendar } from '../utils/calendar';
import { openWhatsApp } from './EventCard';
import { getOptimizedImageUrl } from "../utils/cloudinary";
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

  const firstContact = event.contacts && event.contacts.length > 0 ? event.contacts[0] : null;
  const [imgError, setImgError] = React.useState(false);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        styles.card,
        {
          aspectRatio: isDesktop ? 16 / 9 : 16 / 10,
        },
        Platform.OS === 'web' && ({
          cursor: 'pointer',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease',
        } as any),
        Platform.OS === 'web' && hovered && ({
          transform: [{ translateY: -4 }, { scale: 1.01 }],
          boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.5)' : '0 20px 40px rgba(138,21,56,0.18)',
        } as any),
        pressed && { transform: [{ scale: 0.99 }] },
      ]}
    >
      {/* Ambient background + contained foreground */}
      {!event.image || imgError ? (
        <LinearGradient
          colors={isDark ? ['#3A0E1A', '#1F0B12', '#14070B'] : ['#8A1538', '#5A0D23', '#2D0611']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        >
          <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', opacity: 0.14 }]}>
            <CalendarBlank size={160} color="#FFFFFF" weight="duotone" />
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
        colors={['transparent', 'rgba(16,16,18,0.25)', 'rgba(16,16,18,0.92)']}
        locations={[0, 0.45, 1]}
        style={styles.gradient}
      />

      <SaveButton saved={saved} onPress={onToggleSave} light />

      <View style={styles.overlay}>
        <View style={styles.meta}>
          <BlurView intensity={30} tint="light" style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </BlurView>
          <View style={styles.hostBadge}>
            <Image source={{ uri: event.hostAvatar }} style={styles.featuredAvatar} />
            <Text style={styles.hostName} numberOfLines={1}>{event.host}</Text>
          </View>
          <CalendarBlank size={15} weight="light" color="rgba(255,255,255,0.85)" />
          <Text style={styles.metaText} numberOfLines={1}>
            {event.day ? `${event.day}, ` : ''}{event.date || 'Date TBA'} · {event.time || 'Time TBA'}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>

        <View style={styles.buttonRow}>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              openGoogleCalendar({
                title: event.title,
                date: event.date,
                time: event.time,
                venue: event.venue,
                description: event.blurb,
              });
            }}
            style={({ pressed }) => [
              styles.rsvp,
              { backgroundColor: colors.accent },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
              pressed && { transform: [{ scale: 0.96 }] },
            ]}
          >
            <Text style={[styles.rsvpText, { color: colors.onAccent }]}>RSVP to Calendar</Text>
            <ArrowUpRight size={17} weight="bold" color={colors.onAccent} />
          </Pressable>

          {firstContact && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                openWhatsApp(firstContact.phone, firstContact.name, event.title);
              }}
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
    </Pressable>
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  categoryText: {
    ...typography.labelCaps,
    color: '#FFFFFF',
    fontSize: 10,
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
    fontFamily: 'Fraunces_600SemiBold',
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
