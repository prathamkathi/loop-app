import React, { useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions, Animated } from 'react-native';
import { Image } from 'expo-image';
import { MapPin, CalendarBlank, MagnifyingGlassPlus, ArrowUpRight, WhatsappLogo } from 'phosphor-react-native';
import { useTheme, typography, radii } from '../theme';
import SaveButton from './SaveButton';
import PosterLightboxModal from './PosterLightboxModal';
import Poster from './Poster';
import { getOptimizedImageUrl } from '../utils/cloudinary';
import { getCategoryMeta, formatCardDateLine, formatCardVenue } from '../utils/categoryMeta';
import { isPastEvent } from '../utils/eventDiscovery';
import { openExternalLink, openWhatsApp } from '../utils/linking';
import { formatHost } from '../utils/format';
import type { EventItem } from '../data/events';

type Props = {
  event: EventItem; saved: boolean; onToggleSave: () => void; onPress: () => void;
  index?: number; isPast?: boolean; featured?: boolean;
};

export default function EventCard({ event, saved, onToggleSave, onPress, isPast, featured = false }: Props) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const horizontal = featured && width >= 850;
  
  const [failedImage, setFailedImage] = useState('');
  const [showLightbox, setShowLightbox] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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
  const contact = event.contacts?.[0];
  
  const hasImage = event.image && failedImage !== event.image;
  
  const poster = (
    <View style={[styles.poster, { backgroundColor: colors.highlight }, horizontal ? styles.posterHorizontal : { aspectRatio: featured ? 1.45 : 1.3 }]}>
      {hasImage ? (
        <Image 
          source={{ uri: getOptimizedImageUrl(event.image) }} 
          style={StyleSheet.absoluteFill} 
          contentFit="contain" 
          cachePolicy="memory-disk"
          accessibilityLabel={event.title + ' event poster'} 
          onError={() => setFailedImage(event.image)} 
          recyclingKey={event.image} 
        />
      ) : (
        <Poster category={category.label} seed={event.title} />
      )}
    </View>
  );

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Pressable 
          onPress={onPress} 
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button" 
          accessibilityLabel={'View details for ' + event.title}
          style={({ pressed }) => [styles.main, horizontal && styles.horizontal, pressed && { opacity: 0.82 }]}
        >
          {poster}
          <View style={[styles.body, horizontal && styles.featureBody]}>
            <View style={styles.categoryRow}>
              <Icon size={16} color={colors.primary} weight="duotone" />
              <Text style={[styles.category, { color: colors.primary }]}>{category.label}</Text>
              {concluded && <Text style={[typography.labelSm, { color: colors.muted }]}>Past event</Text>}
            </View>
            <Text style={[styles.title, { color: colors.foreground }, featured && styles.featureTitle]} numberOfLines={featured ? 3 : 2}>{event.title}</Text>
            <Text style={[typography.bodySm, { color: colors.muted }]} numberOfLines={1}>{formatHost(event.host)}</Text>
            <View style={styles.metadata}>
              <View style={styles.metaRow}><CalendarBlank size={18} color={colors.primary} /><Text style={[typography.labelMd, { color: colors.foreground, flex: 1 }]}>{date.primary}{date.secondary ? ' · ' + date.secondary : ''}</Text></View>
              <View style={styles.metaRow}><MapPin size={18} color={colors.muted} /><Text style={[typography.bodySm, { color: colors.muted, flex: 1 }]} numberOfLines={2}>{formatCardVenue(event.venue, event.category)}</Text></View>
            </View>
            {featured && event.blurb ? <Text style={[typography.bodySm, { color: colors.foregroundSecondary, lineHeight: 22 }]} numberOfLines={3}>{event.blurb}</Text> : null}
            {featured && <View style={[styles.discover, { backgroundColor: colors.primary }]}><Text style={[typography.labelMd, { color: colors.onPrimary }]}>Explore event</Text><ArrowUpRight size={18} color={colors.onPrimary} /></View>}
          </View>
        </Pressable>
        <View style={[styles.actions, { borderTopColor: colors.border }]}>
          <View style={styles.actionLinks}>
            {hasImage ? (
              <Pressable onPress={() => setShowLightbox(true)} accessibilityRole="button" accessibilityLabel={'View full poster for ' + event.title} style={styles.action}>
                <MagnifyingGlassPlus size={18} color={colors.foregroundSecondary} /><Text style={[typography.labelSm, { color: colors.foregroundSecondary }]}>Poster</Text>
              </Pressable>
            ) : null}
            {event.actionUrl ? (
              <Pressable onPress={() => openExternalLink(event.actionUrl!)} accessibilityRole="link" accessibilityLabel={'Open official link for ' + event.title} style={styles.action}>
                <ArrowUpRight size={18} color={colors.primary} /><Text style={[typography.labelSm, { color: colors.primary }]}>Official link</Text>
              </Pressable>
            ) : contact ? (
              <Pressable onPress={() => openWhatsApp(contact.phone, contact.name, event.title)} accessibilityRole="link" accessibilityLabel={'Contact ' + (contact.name || 'organizer') + ' on WhatsApp'} style={styles.action}>
                <WhatsappLogo size={18} color={colors.primary} /><Text style={[typography.labelSm, { color: colors.primary }]}>Contact</Text>
              </Pressable>
            ) : null}
          </View>
          <SaveButton saved={saved} onPress={onToggleSave} inline />
        </View>
      </View>
      {showLightbox && event.image && <PosterLightboxModal visible imageUri={event.image} title={event.title} subtitle={formatHost(event.host)} onClose={() => setShowLightbox(false)} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', borderRadius: radii.xl, borderWidth: 1, overflow: 'hidden' },
  main: { width: '100%' }, horizontal: { flexDirection: 'row' },
  poster: { width: '100%', overflow: 'hidden', position: 'relative' },
  posterHorizontal: { width: '43%', minHeight: 340 },
  body: { padding: 20, gap: 10, flex: 1 }, featureBody: { padding: 28, gap: 14, justifyContent: 'center' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 7 },
  category: { ...typography.labelSm, fontSize: 12 },
  title: { ...typography.titleXl, fontSize: 22, lineHeight: 28, letterSpacing: -0.6 },
  featureTitle: { fontSize: 30, lineHeight: 36, letterSpacing: -0.9 },
  metadata: { gap: 10, paddingVertical: 6 }, metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  discover: { minHeight: 46, paddingHorizontal: 18, borderRadius: radii.full, flexDirection: 'row', gap: 12, alignItems: 'center', alignSelf: 'flex-start', marginTop: 6 },
  actions: { paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  actionLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, flex: 1 }, action: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6 },
});
