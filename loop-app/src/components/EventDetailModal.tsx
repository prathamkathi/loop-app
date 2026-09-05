import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Animated,
  Easing,
  Share,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import {
  X,
  CalendarBlank,
  Clock,
  MapPin,
  BookmarkSimple,
  CalendarPlus,
  ShareNetwork,
  ArrowUpRight,
  WhatsappLogo,
  Sparkle,
  ArrowSquareOut,
  MagnifyingGlassPlus,
  FileText,
  ClockCounterClockwise,
} from 'phosphor-react-native';
import { BlurView } from 'expo-blur';
import { useTheme, typography, radii, shadows } from '../theme';
import { openGoogleCalendar } from '../utils/calendar';
import { openInstagram } from '../utils/linking';
import { openWhatsApp } from './EventCard';
import { generateEventPitch } from '../utils/geminiAI';
import { CLUBS } from '../data/clubs';
import { getOptimizedImageUrl } from "../utils/cloudinary";
import { getCategoryMeta, formatCardDateLine, formatCardVenue } from '../utils/categoryMeta';
import { getEventTimeMillis } from '../utils/timestampUtils';
import { getClubAvatar } from '../data/avatars';
import PosterLightboxModal from './PosterLightboxModal';
import type { EventItem } from '../data/events';

type Props = {
  event: EventItem;
  saved: boolean;
  onToggleSave: () => void;
  onClose: () => void;
};

export default function EventDetailModal({ event, saved, onToggleSave, onClose }: Props) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // Animations
  const animValue = useRef(new Animated.Value(0)).current;

  const [aiPitch, setAiPitch] = useState<string>('');
  const [showLightbox, setShowLightbox] = useState<boolean>(false);
  const [avatarError, setAvatarError] = useState<boolean>(false);

  const catMeta = getCategoryMeta(event.category);
  const CategoryIcon = catMeta.icon;
  const { primary: datePrimary, secondary: dateSecondary, isNotice } = formatCardDateLine(event);
  const venueDisplay = formatCardVenue(event.venue, event.category);

  const hostAvatarUri = !avatarError && event.hostAvatar ? event.hostAvatar : getClubAvatar(event.host);
  const eventTimeMs = getEventTimeMillis(event.startsAt);
  const isConcluded = eventTimeMs !== null && eventTimeMs + 12 * 60 * 60 * 1000 < Date.now();

  useEffect(() => {
    let isMounted = true;
    generateEventPitch(event.title, event.category, event.blurb).then((res) => {
      if (isMounted) setAiPitch(res);
    });
    return () => {
      isMounted = false;
    };
  }, [event.id, event.title, event.category, event.blurb]);

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 350,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: true,
    }).start();
  }, [animValue]);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  });

  const backdropOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const handleClose = () => {
    Animated.timing(animValue, {
      toValue: 0,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const handleCalendar = () => {
    openGoogleCalendar({
      title: event.title,
      date: event.date,
      time: event.time,
      venue: venueDisplay,
      description: event.blurb,
    });
  };

  const handleShare = async () => {
    const shareMessage = `Check out "${event.title}" happening at ${venueDisplay} on ${event.date || 'Campus'}! Curated on Loop.`;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareMessage);
        Alert.alert('Link Copied', 'Event invitation copied to clipboard!');
        return;
      }
      await Share.share({ message: shareMessage });
    } catch (error) {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareMessage);
        Alert.alert('Link Copied', 'Event invitation copied to clipboard!');
      }
    }
  };

  // Find club profile for host
  const matchedClub = React.useMemo(() => {
    if (!event.host) return null;
    return CLUBS.find((c) =>
      c.name.toLowerCase().includes(event.host.toLowerCase()) ||
      event.host.toLowerCase().includes(c.name.toLowerCase())
    );
  }, [event.host]);

  const handleHostPress = () => {
    if (matchedClub) {
      openInstagram(matchedClub.handle);
    } else {
      openInstagram(event.host);
    }
  };

  return (
    <>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <Animated.View
          onStartShouldSetResponder={() => true}
          style={[
            styles.modal,
            {
              backgroundColor: colors.background,
              maxWidth: isDesktop ? 540 : '100%',
              borderTopLeftRadius: radii.xxxl,
              borderTopRightRadius: radii.xxxl,
              borderBottomLeftRadius: isDesktop ? radii.xxxl : 0,
              borderBottomRightRadius: isDesktop ? radii.xxxl : 0,
              transform: [{ translateY }],
            },
            isDesktop && shadows.cardHover,
          ]}
        >
          {/* Hero Image Container (Tap to open full uncropped flyer) */}
          <Pressable
            onPress={() => setShowLightbox(true)}
            style={[styles.hero, { backgroundColor: colors.highlight }]}
          >
            <Image source={{ uri: getOptimizedImageUrl(event.image) }} style={styles.heroImage} />
            <View style={styles.heroGradient} />

            {/* Close Button */}
            <Pressable
              onPress={(e) => {
                e?.stopPropagation?.();
                handleClose();
              }}
              accessibilityLabel="Close"
              style={({ pressed }) => [
                styles.closeBtnWrap,
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                pressed && { transform: [{ scale: 0.92 }] },
              ]}
            >
              <BlurView intensity={40} tint="dark" style={styles.closeBtn}>
                <X size={20} color="#FFFFFF" weight="bold" />
              </BlurView>
            </Pressable>

            {/* Category Adaptive Overlay Badge */}
            <View style={[styles.categoryOverlay, { backgroundColor: isConcluded ? (isDark ? 'rgba(30, 30, 35, 0.9)' : 'rgba(240, 240, 245, 0.95)') : catMeta.color }]}>
              {isConcluded ? (
                <ClockCounterClockwise size={13} color={isDark ? '#FFFFFF' : '#18181B'} weight="bold" />
              ) : (
                <CategoryIcon size={13} color="#FFFFFF" weight="bold" />
              )}
              <Text style={[styles.categoryText, isConcluded && { color: isDark ? '#FFFFFF' : '#18181B' }]} numberOfLines={1} ellipsizeMode="tail">
                {isConcluded ? `Concluded · ${catMeta.label}` : catMeta.label}
              </Text>
            </View>

            {/* Tap to inspect badge */}
            <View style={styles.inspectOverlayBadge}>
              <MagnifyingGlassPlus size={14} color="#FFFFFF" weight="bold" />
              <Text style={styles.inspectOverlayText}>Tap to inspect full flyer</Text>
            </View>
          </Pressable>

          {/* Content */}
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {isConcluded && (
              <View
                style={[
                  styles.concludedNoticeBanner,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                    borderColor: colors.border,
                  },
                ]}
              >
                <ClockCounterClockwise size={18} color={colors.primary} weight="duotone" />
                <Text style={[styles.concludedNoticeText, { color: colors.muted }]}>
                  This event has concluded. Details, poster, and organizer contacts are preserved for reference.
                </Text>
              </View>
            )}

            <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={3} ellipsizeMode="tail">
              {event.title}
            </Text>

            {/* Host Card */}
            <Pressable
              onPress={handleHostPress}
              style={({ pressed }) => [
                styles.hostCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                pressed && { opacity: 0.8 },
              ]}
            >
              <Image 
                source={{ uri: hostAvatarUri }} 
                style={styles.avatar} 
                onError={() => setAvatarError(true)} 
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.hostName, { color: colors.foreground }]} numberOfLines={1} ellipsizeMode="tail">
                  {event.host}
                </Text>
                <Text style={[styles.hostedBy, { color: colors.muted }]}>
                  {matchedClub ? `@${matchedClub.handle}` : 'Campus Organization'}
                </Text>
              </View>
              <ArrowSquareOut size={16} color={colors.muted} />
            </Pressable>

            {/* Action Link Banner (If notice or event has registration / survey link) */}
            {event.actionUrl && (
              <Pressable
                onPress={() => {
                  if (Platform.OS === 'web' && typeof window !== 'undefined') {
                    window.open(event.actionUrl, '_blank', 'noopener,noreferrer');
                  } else {
                    Linking.openURL(event.actionUrl!);
                  }
                }}
                style={({ pressed }) => [
                  styles.actionBanner,
                  { backgroundColor: catMeta.color },
                  Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                  pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
                ]}
              >
                <ArrowSquareOut size={18} color="#FFFFFF" weight="bold" />
                <Text style={styles.actionBannerText}>
                  {catMeta.actionText || 'Open Official Notice / Form'}
                </Text>
              </Pressable>
            )}

            {/* AI Campus Pitch */}
            {aiPitch ? (
              <View style={[styles.aiPitchCard, { backgroundColor: isDark ? 'rgba(196, 77, 106, 0.12)' : 'rgba(138, 21, 56, 0.06)', borderColor: colors.primary }]}>
                <Sparkle size={18} color={colors.primary} weight="fill" />
                <Text style={[styles.aiPitchText, { color: colors.foreground }]}>
                  <Text style={{ fontWeight: '700', color: colors.primary }}>Why Attend: </Text>
                  {aiPitch}
                </Text>
              </View>
            ) : (
              <Animated.View style={[styles.aiPitchCard, { backgroundColor: isDark ? 'rgba(196, 77, 106, 0.05)' : 'rgba(138, 21, 56, 0.03)', borderColor: 'transparent', opacity: animValue }]}>
                 <Sparkle size={18} color={colors.muted} weight="regular" />
                 <View style={{ flex: 1, gap: 6, marginLeft: 8, justifyContent: 'center' }}>
                   <View style={{ height: 12, width: '90%', backgroundColor: colors.border, borderRadius: 4 }} />
                   <View style={{ height: 12, width: '60%', backgroundColor: colors.border, borderRadius: 4 }} />
                 </View>
              </Animated.View>
            )}

            {/* Adaptive Details Card */}
            <View style={[styles.detailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {isNotice ? (
                <>
                  <DetailRow icon={FileText} label="Notice Date" colors={colors}>
                    {event.date || 'Active Notice'}
                  </DetailRow>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <DetailRow icon={Clock} label="Action / Deadline" colors={colors}>
                    {event.deadline || event.time || 'Official Circular'}
                  </DetailRow>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <DetailRow icon={MapPin} label="Scope" colors={colors}>
                    {venueDisplay}
                  </DetailRow>
                </>
              ) : (
                <>
                  <DetailRow icon={CalendarBlank} label="Date" colors={colors}>
                    {event.day ? `${event.day}, ` : ''}{event.date || 'Date TBA'}
                  </DetailRow>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <DetailRow icon={Clock} label="Time" colors={colors}>
                    {event.time || 'Time TBA'}
                  </DetailRow>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <DetailRow icon={MapPin} label="Venue" colors={colors}>
                    {venueDisplay}
                  </DetailRow>
                </>
              )}
            </View>

            {/* WhatsApp Organizer Queries Section */}
            {event.contacts && event.contacts.length > 0 && (
              <View style={[styles.contactsSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.contactsHeader}>
                  <WhatsappLogo size={20} color="#25D366" weight="fill" />
                  <Text style={[styles.contactsTitle, { color: colors.foreground }]}>Event Coordinators</Text>
                </View>
                {event.contacts.map((contact, i) => (
                  <View key={i} style={[styles.contactCard, i > 0 && { borderTopWidth: 1, borderTopColor: colors.borderSubtle }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.contactName, { color: colors.foreground }]}>{contact.name}</Text>
                      <Text style={[styles.contactRole, { color: colors.muted }]}>
                        {contact.role || 'Organizer'} · +91 {contact.phone}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => openWhatsApp(contact.phone, contact.name, event.title)}
                      style={({ pressed }) => [
                        styles.waChatBtn,
                        Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                        pressed && { transform: [{ scale: 0.95 }] },
                      ]}
                    >
                      <WhatsappLogo size={16} color="#FFFFFF" weight="fill" />
                      <Text style={styles.waChatText}>Chat</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* Blurb */}
            <Text style={[styles.blurb, { color: colors.foregroundSecondary }]}>
              {event.blurb}
            </Text>
          </ScrollView>

          {/* Action Bar */}
          <View style={[styles.actionBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <Pressable
              onPress={onToggleSave}
              style={({ pressed }) => [
                styles.iconBtn,
                {
                  borderColor: saved ? colors.primary : colors.border,
                  backgroundColor: saved ? colors.primary : 'transparent',
                },
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                pressed && { transform: [{ scale: 0.92 }] },
              ]}
              accessibilityLabel={saved ? "Remove from bookmarks" : "Save event"}
            >
              <BookmarkSimple
                weight={saved ? 'fill' : 'regular'}
                size={20}
                color={saved ? colors.onPrimary : colors.primary}
              />
            </Pressable>

            <Pressable
              onPress={isConcluded ? undefined : handleCalendar}
              disabled={isConcluded}
              style={({ pressed }) => [
                styles.calBtn,
                {
                  backgroundColor: isConcluded ? (isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)') : colors.primary,
                  borderColor: isConcluded ? colors.border : 'transparent',
                  borderWidth: isConcluded ? 1 : 0,
                },
                Platform.OS === 'web' && ({ cursor: isConcluded ? 'default' : 'pointer' } as any),
                pressed && !isConcluded && { transform: [{ scale: 0.98 }] },
              ]}
            >
              {isConcluded ? (
                <ClockCounterClockwise size={18} color={colors.muted} weight="bold" />
              ) : (
                <CalendarPlus size={19} color={colors.onPrimary} weight="bold" />
              )}
              <Text style={[styles.calText, { color: isConcluded ? colors.muted : colors.onPrimary }]}>
                {isConcluded ? 'Event Concluded' : isNotice ? 'Add Notice Reminder' : 'Add to Google Calendar'}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleShare}
              style={({ pressed }) => [
                styles.iconBtn,
                {
                  borderColor: colors.border,
                },
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                pressed && { transform: [{ scale: 0.92 }] },
              ]}
              accessibilityLabel="Share event"
            >
              <ShareNetwork size={20} color={colors.primary} weight="regular" />
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>

      {/* High-Resolution Poster Lightbox Modal */}
      {event.image && (
        <PosterLightboxModal
          visible={showLightbox}
          imageUri={event.image}
          title={event.title}
          subtitle={`${event.host} · ${catMeta.label}`}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </>
  );
}

function DetailRow({ icon: IconComponent, label, children, colors }: any) {
  return (
    <View style={detailStyles.row}>
      <IconComponent size={20} color={colors.primary} weight="regular" />
      <View style={{ flex: 1, marginLeft: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={[detailStyles.label, { color: colors.muted }]}>{label}</Text>
        <Text style={[detailStyles.value, { color: colors.foreground }]}>{children}</Text>
      </View>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  label: {
    ...typography.bodySm,
  },
  value: {
    ...typography.bodySm,
    fontWeight: '600',
    textAlign: 'right',
  },
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 10, 12, 0.65)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 50,
  },
  modal: {
    width: '100%',
    maxHeight: '92%',
    overflow: 'hidden',
  },
  hero: {
    width: '100%',
    height: 260,
    position: 'relative',
    cursor: 'pointer' as any,
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
    resizeMode: 'cover',
  },
  heroGradient: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 10, 12, 0.35)',
  },
  closeBtnWrap: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        })
      : {}),
  },
  categoryOverlay: {
    position: 'absolute',
    left: 16,
    top: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.full,
    elevation: 4,
  },
  categoryText: {
    ...typography.labelSm,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  inspectOverlayBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  inspectOverlayText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  concludedNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: 14,
  },
  concludedNoticeText: {
    ...typography.bodySm,
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  title: {
    ...typography.displayMd,
    marginBottom: 4,
  },
  scroll: {
    flex: 1,
    padding: 24,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 12,
    marginTop: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  hostedBy: {
    ...typography.labelSm,
    fontSize: 11,
  },
  hostName: {
    ...typography.bodySm,
    fontWeight: '600',
  },
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radii.lg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  actionBannerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  detailCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    marginTop: 16,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  blurb: {
    ...typography.bodyMd,
    lineHeight: 24,
    marginTop: 20,
    marginBottom: 32,
  },
  contactsSection: {
    borderRadius: radii.lg,
    borderWidth: 1,
    marginTop: 18,
    padding: 14,
  },
  contactsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  contactsTitle: {
    ...typography.titleSm,
    fontSize: 15,
    fontWeight: '700',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 12,
  },
  contactName: {
    ...typography.labelLg,
    fontWeight: '600',
  },
  contactRole: {
    ...typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
  waChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#25D366',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.full,
  },
  waChatText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  aiPitchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginTop: 14,
  },
  aiPitchText: {
    ...typography.bodySm,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: radii.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calBtn: {
    flex: 1,
    height: 46,
    borderRadius: radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  calText: {
    ...typography.labelMd,
    fontSize: 14,
    fontWeight: '600',
  },
});
