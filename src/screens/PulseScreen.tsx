import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, StyleSheet, Animated, Easing, Platform, ActivityIndicator } from 'react-native';
import { ArrowUpRight } from 'phosphor-react-native';
import { useTheme, typography } from '../theme';
import SectionLabel from '../components/SectionLabel';
import { type PulseItem } from '../data/pulse';
import { openExternalLink } from '../utils/linking';
import { collection, query, orderBy, onSnapshot, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

function AnimatedWrapper({ index, children }: { index: number; children: React.ReactNode }) {
  const riseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(riseAnim, {
      toValue: 1,
      duration: 500,
      delay: Math.min(index * 40, 250),
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: true,
    }).start();
  }, [index, riseAnim]);

  const translateY = riseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
  });

  return (
    <Animated.View style={{ opacity: riseAnim, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

export default function PulseScreen() {
  const { colors, isDark } = useTheme();
  // Initialized to empty array; only verified live notices from Firestore are rendered
  const [pulseItems, setPulseItems] = useState<PulseItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'pulse'), orderBy("createdAt", "desc"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: PulseItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as PulseItem);
      });
      setPulseItems(items);
      setLoading(false);
    }, (error) => {
      console.warn('Live pulse sync fallback to empty state:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getKindDotColor = (kind: string) => {
    switch (kind) {
      case 'Deadline':
        return colors.primary;
      case 'Recruitment':
        return colors.primarySoft;
      case 'Notice':
        return colors.muted;
      case 'Announcement':
      case 'Event':
      default:
        return colors.primary;
    }
  };

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const q = query(collection(db, 'pulse'), orderBy("createdAt", "desc"), limit(50));
      const snapshot = await getDocs(q);
      const items: PulseItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as PulseItem);
      });
      setPulseItems(items);
    } catch (err) {
      console.warn('Failed to refresh pulse notices:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <ScrollView
      style={[
        styles.scroll,
        Platform.OS === 'web' && ({ maxWidth: 1080, width: '100%', alignSelf: 'center' } as any),
      ]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <SectionLabel>Campus Pulse</SectionLabel>
      <Text style={[styles.heading, { color: colors.foreground }]}>The daily brief</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Official notices, deadlines, and recruitment opportunities — tap any update to view details.
      </Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : pulseItems.length === 0 ? (
        <View style={[styles.emptyContainer, { borderColor: colors.borderSubtle, backgroundColor: colors.card }]}>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No active notices</Text>
          <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
            Official notices, academic deadlines, and recruitment announcements will appear here as they are published.
          </Text>
        </View>
      ) : (
      <View style={[styles.listContainer, { borderColor: colors.border }]}>
        {pulseItems.map((p, index) => {
          const dotColor = getKindDotColor(p.kind);
          const isLast = index === pulseItems.length - 1;

          return (
            <AnimatedWrapper key={p.id} index={index}>
              <Pressable
                onPress={() => openExternalLink(p.url)}
                accessibilityRole="link"
                accessibilityLabel={`${p.kind}: ${p.title} from ${p.source}`}
                style={({ pressed }) => [
                  styles.row,
                  !isLast && [styles.rowBorder, { borderBottomColor: colors.borderSubtle }],
                  {
                    backgroundColor: pressed ? colors.highlight : 'transparent',
                  },
                  Platform.OS === 'web' && ({
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  } as any),
                ]}
              >
                <View style={[styles.dot, { backgroundColor: dotColor }]} />
                <View style={styles.content}>
                  <View style={styles.meta}>
                    <Text style={[styles.kind, { color: colors.primary }]}>{p.kind}</Text>
                    <Text style={[styles.time, { color: colors.muted }]}> · {p.time}</Text>
                  </View>
                  <Text style={[styles.title, { color: colors.foreground }]}>{p.title}</Text>
                  {p.body ? (
                    <Text style={[styles.body, { color: colors.foregroundSecondary }]} numberOfLines={2}>
                      {p.body}
                    </Text>
                  ) : null}
                  <Text style={[styles.source, { color: colors.muted }]}>{p.source}</Text>
                </View>
                <View style={[styles.iconWrap, { backgroundColor: colors.highlight }]}>
                  <ArrowUpRight size={18} color={colors.primary} weight="bold" />
                </View>
              </Pressable>
            </AnimatedWrapper>
          );
        })}
      </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 96,
  },
  heading: {
    ...typography.displayMd,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.bodyMd,
    marginBottom: 32,
    maxWidth: 540,
  },
  listContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingBottom: 0,
    marginBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginTop: 7,
  },
  content: {
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kind: {
    ...typography.labelCaps,
    fontSize: 11,
    fontWeight: '700',
  },
  time: {
    ...typography.bodyXs,
  },
  title: {
    ...typography.titleMd,
    marginTop: 4,
  },
  body: {
    ...typography.bodySm,
    marginTop: 4,
    lineHeight: 20,
  },
  source: {
    ...typography.bodyXs,
    marginTop: 4,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  emptyTitle: {
    ...typography.titleMd,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.bodyMd,
    textAlign: 'center',
    maxWidth: 400,
    lineHeight: 22,
  },
});
