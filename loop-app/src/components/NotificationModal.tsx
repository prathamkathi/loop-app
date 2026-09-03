import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, Platform } from 'react-native';
import { X, Bell, CheckCircle, WarningCircle, Sparkle, Calendar } from 'phosphor-react-native';
import { useTheme, typography, radii, shadows } from '../theme';
import { BlurView } from 'expo-blur';

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'urgent' | 'event' | 'system';
  read: boolean;
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Orientation Day: Thesis to Venture',
    body: 'Economics & Finance Club (eDC) orientation starts today at Seminar Hall. Don\'t miss out!',
    time: '15m ago',
    type: 'event',
    read: false,
  },
  {
    id: 'n2',
    title: 'Debutant 11.0 IA/SA Applications',
    body: 'Debating Society has opened adjudication applications for the upcoming tournament.',
    time: '2h ago',
    type: 'event',
    read: false,
  },
  {
    id: 'n3',
    title: 'Add/Drop Course Deadline Tonight',
    body: 'Semester schedule modification window closes strictly at 11:59 PM on eCampus portal.',
    time: '5h ago',
    type: 'urgent',
    read: false,
  },
  {
    id: 'n4',
    title: 'Central Library 24×7 Reading Hall',
    body: 'Air-conditioned study areas extended around the clock for upcoming examination preparations.',
    time: 'Yesterday',
    type: 'system',
    read: true,
  },
];
type Props = {
  visible: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
};

export default function NotificationModal({ visible, onClose, notifications, onMarkAllRead, onMarkRead }: Props) {
  const { colors, isDark } = useTheme();

  const markAllRead = () => {
    onMarkAllRead && onMarkAllRead();
  };

  const markRead = (id: string) => {
    onMarkRead && onMarkRead(id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <WarningCircle size={20} color={colors.primary} weight="fill" />;
      case 'event':
        return <Calendar size={20} color={colors.primary} weight="fill" />;
      default:
        return <Sparkle size={20} color={colors.primary} weight="fill" />;
    }
  };

  if (!visible) return null;

  const bgOverlay = isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.45)';
  const cardBg = isDark ? 'rgba(28, 28, 30, 0.96)' : 'rgba(255, 255, 255, 0.98)';
  const borderCol = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(138, 21, 56, 0.12)';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: bgOverlay }]} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: cardBg,
              borderColor: borderCol,
            },
            shadows.card,
            Platform.OS === 'web' && ({
              maxWidth: 480,
              width: '92%',
              alignSelf: 'center',
            }),
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderCol }]}>
            <View style={styles.titleRow}>
              <Bell size={22} color={colors.primary} weight="fill" />
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>Campus Alerts</Text>
              {notifications.some((n) => !n.read) && (
                <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.unreadCount, { color: colors.onPrimary }]}>
                    {notifications.filter((n) => !n.read).length}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.headerActions}>
              <Pressable
                onPress={markAllRead}
                style={({ pressed }) => [
                  styles.markReadBtn,
                  pressed && { opacity: 0.7 },
                  Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                ]}
              >
                <CheckCircle size={16} color={colors.muted} />
                <Text style={[styles.markReadText, { color: colors.muted }]}>Mark read</Text>
              </Pressable>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeBtn,
                  { backgroundColor: colors.highlight },
                  pressed && { transform: [{ scale: 0.92 }] },
                  Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                ]}
                accessibilityLabel="Close"
              >
                <X size={18} color={colors.foreground} weight="bold" />
              </Pressable>
            </View>
          </View>

          {/* List */}
          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {notifications.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.itemCard,
                  {
                    backgroundColor: item.read ? 'transparent' : colors.highlight,
                    borderColor: item.read ? colors.borderSubtle : borderCol,
                  },
                ]}
              >
                <View style={styles.itemIcon}>{getIcon(item.type)}</View>
                <View style={styles.itemBody}>
                  <View style={styles.itemTop}>
                    <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={[styles.itemTime, { color: colors.muted }]}>{item.time}</Text>
                  </View>
                  <Text style={[styles.itemText, { color: colors.foregroundSecondary }]}>
                    {item.body}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sheet: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: radii.xl,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    ...typography.titleSm,
    fontWeight: '700',
  },
  unreadBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  unreadCount: {
    ...typography.labelSm,
    fontSize: 11,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  markReadText: {
    ...typography.labelSm,
    fontSize: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  itemCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: 12,
  },
  itemIcon: {
    marginTop: 2,
  },
  itemBody: {
    flex: 1,
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    ...typography.labelLg,
    fontWeight: '600',
    flex: 1,
  },
  itemTime: {
    ...typography.caption,
    fontSize: 11,
    marginLeft: 8,
  },
  itemText: {
    ...typography.bodySm,
    lineHeight: 18,
  },
});
