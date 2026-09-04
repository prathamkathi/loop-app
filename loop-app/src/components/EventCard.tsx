import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Animated, Easing, Platform, Linking } from 'react-native';
import { MapPin, WhatsappLogo, ImageSquare, CalendarBlank } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, typography, radii, shadows } from '../theme';
import SaveButton from './SaveButton';
import { getOptimizedImageUrl } from "../utils/cloudinary";
import type { EventItem } from '../data/events';

type Props = {
  event: EventItem;
  saved: boolean;
  onToggleSave: () => void;
  onPress: () => void;
  index: number;
};

function PulseDot({ color }: { color: string }) {
  const anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [anim]);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.75],
  });
  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.6],
  });

  return (
    <Animated.View
      style={[
        styles.pulseDot,
        { backgroundColor: color, transform: [{ scale }], opacity },
      ]}
    />
  );
}

export function openWhatsApp(rawPhone: string, name: string, eventTitle: string) {
  const cleanPhone = rawPhone.replace(/[^\d]/g, '');
  const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  const message = encodeURIComponent(`Hi ${name || 'Organizer'}, I saw "${eventTitle}" on Loop IITD and had a query.`);
  const waUrl = `https://wa.me/${formattedPhone}?text=${message}`;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  } else {
    Linking.openURL(waUrl);
  }
}

export default function EventCard({ event, saved, onToggleSave, onPress, index }: Props) {
  const { colors, isDark } = useTheme();

  const [imgError, setImgError] = React.useState(false);

  const riseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(riseAnim, {
      toValue: 1,
      duration: 450,
      delay: Math.min(index * 40, 240),
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: true,
    }).start();
  }, [index, riseAnim]);

  const translateY = riseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
  });

  // Adaptive aspect ratio: Respect natural image proportions (1:1, 4:5, 4:3, 16:9)
  const computedAspect = event.aspectRatio
    ? Math.max(0.8, Math.min(event.aspectRatio, 1.33))
    : event.aspect === 'tall'
    ? 0.85
    : event.aspect === 'wide'
    ? 1.4
    : 1.0;

  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Animated.View 
      style={[
        { opacity: riseAnim, transform: [{ translateY }], width: '100%' },
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        shadows.card,
        Platform.OS === 'web' && ({
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease',
        } as any),
        Platform.OS === 'web' && isHovered && ({
          transform: [{ translateY: -5 }, { scale: 1.015 }],
          borderColor: colors.primary,
          boxShadow: isDark
            ? '0 16px 36px rgba(196, 77, 106, 0.20)'
            : '0 16px 36px rgba(138, 21, 56, 0.14)',
        } as any),
        isPressed && { transform: [{ scale: 0.985 }] },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        //@ts-ignore - React Native Web hover props
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={[
          Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
        ]}
      >
        {/* Adaptive Dual-Layer Poster Container (Zero Cropping) */}
        <View style={[styles.imageWrap, { aspectRatio: computedAspect, backgroundColor: colors.highlight }]}>
          {!event.image || imgError ? (
            <LinearGradient
              colors={isDark ? ['#2D0B16', '#1A080E', '#100508'] : ['#F8E9ED', '#EED4DC', '#E5C0CB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}
            >
              <CalendarBlank size={48} color={colors.primary} weight="duotone" style={{ opacity: 0.4 }} />
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700', marginTop: 8, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                {event.category || 'Campus Event'}
              </Text>
            </LinearGradient>
          ) : (
            <>
              <Image
                source={{ uri: getOptimizedImageUrl(event.image) }}
                style={StyleSheet.absoluteFill}
                blurRadius={Platform.OS === 'web' ? 14 : 20}
                resizeMode="cover"
                onError={() => setImgError(true)}
              />
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.30)' : 'rgba(255, 255, 255, 0.25)' },
                ]}
              />
              <Image 
                source={{ uri: getOptimizedImageUrl(event.image) }} 
                style={styles.image} 
                resizeMode="contain" 
                onError={() => setImgError(true)} 
              />
            </>
          )}

          <SaveButton saved={saved} onPress={onToggleSave} light />

          {event.fillingFast && (
            <View style={[styles.fillingBadge, { backgroundColor: colors.surface }]}>
              <PulseDot color={colors.primary} />
              <Text style={[styles.fillingText, { color: colors.foreground }]}>Filling Fast</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.dateLine}>
            <Text style={[styles.dateText, { color: colors.primary }]} numberOfLines={1}>
              {event.date || 'Date TBA'}
            </Text>
            <View style={[styles.dotSep, { backgroundColor: colors.primary }]} />
            <Text style={[styles.dateText, { color: colors.primary }]} numberOfLines={1}>
              {event.time || 'Time TBA'}
            </Text>
          </View>

          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2} ellipsizeMode="tail">
            {event.title}
          </Text>

          <View style={styles.venueLine}>
            <Image 
              source={{ uri: event.hostAvatar }} 
              style={styles.hostAvatar} 
              onError={(e) => {
                // F-39 fallback
                e.currentTarget.setNativeProps({
                  src: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(event.host || 'Club') + '&background=8A1538&color=fff'
                });
              }} 
            />
            <Text style={[styles.venue, { color: colors.muted }]} numberOfLines={1}>
              {event.host}
            </Text>
          </View>

          <View style={[styles.venueLine, { marginTop: 4 }]}>
            <MapPin size={15} weight="light" color={colors.muted} />
            <Text style={[styles.venue, { color: colors.muted }]} numberOfLines={1}>
              {event.venue || 'Venue TBA'}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* Adaptive WhatsApp Organizer Contact Buttons - outside the main Pressable (F-29) */}
      {event.contacts && event.contacts.length > 0 && (
        <View style={[styles.content, { paddingTop: 0 }]}>
          <View style={styles.contactsRow}>
            {event.contacts.slice(0, 2).map((contact, i) => (
              <Pressable
                key={i}
                onPress={() => openWhatsApp(contact.phone, contact.name, event.title)}
                style={({ pressed }) => [
                  styles.whatsAppPill,
                  Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'all 0.15s ease' } as any),
                  pressed && { transform: [{ scale: 0.94 }] },
                ]}
                accessibilityLabel={`WhatsApp ${contact.name}`}
              >
                <WhatsappLogo size={14} color="#FFFFFF" weight="fill" />
                <Text style={styles.whatsAppText}>
                  {event.contacts!.length === 1 ? `WhatsApp ${contact.name}` : contact.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
  },
  imageWrap: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fillingBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
    elevation: 3,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  fillingText: {
    ...typography.labelCaps,
    fontSize: 9,
  },
  content: {
    padding: 14,
  },
  dateLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dateText: {
    ...typography.labelCaps,
    fontSize: 10,
  },
  dotSep: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  title: {
    ...typography.titleSm,
    lineHeight: 20,
    marginBottom: 8,
  },
  venueLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hostAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  venue: {
    ...typography.bodySm,
    fontSize: 12,
    flex: 1,
  },
  contactsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  whatsAppPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#25D366',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  whatsAppText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
