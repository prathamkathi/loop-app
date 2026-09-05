import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, Platform } from 'react-native';
import { X, Bell, CheckCircle, WarningCircle, Sparkle, Calendar, ArrowRight } from 'phosphor-react-native';
import { useTheme, typography, radii, shadows } from '../theme';
import type { NotificationItem } from '../utils/notifications';

export { NotificationItem };

type Props = {
  visible: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onSelectNotification?: (item: NotificationItem) => void;
};

export default function NotificationModal({
  visible,
  onClose,
  notifications,
  onMarkAllRead,
  onMarkRead,
  onSelectNotification,
}: Props) {
  const { colors, isDark } = useTheme();

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
  const cardBg = isDark ? 'rgba(28, 28, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)';
  const borderCol = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(138, 21, 56, 0.12)';

  const handleItemPress = (item: NotificationItem) => {
    onMarkRead(item.id);
    if (onSelectNotification) {
      onSelectNotification(item);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[styles.backdrop, { backgroundColor: bgOverlay }]}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close alerts modal"
      >
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: cardBg,
              borderColor: borderCol,
            },
            shadows.card,
            Platform.OS === 'web' && ({
              maxWidth: 500,
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
                onPress={onMarkAllRead}
                accessibilityRole="button"
                accessibilityLabel="Mark all alerts as read"
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
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={({ pressed }) => [
                  styles.closeBtn,
                  { backgroundColor: colors.highlight },
                  pressed && { transform: [{ scale: 0.92 }] },
                  Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                ]}
              >
                <X size={18} color={colors.foreground} weight="bold" />
              </Pressable>
            </View>
          </View>

          {/* List */}
          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Bell size={36} color={colors.muted} weight="light" />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Campus Alerts</Text>
                <Text style={[styles.emptySub, { color: colors.muted }]}>
                  You're all caught up with urgent notices and event updates.
                </Text>
              </View>
            ) : (
              notifications.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleItemPress(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.read ? '' : 'Unread alert: '}${item.title}. ${item.body}`}
                  style={({ pressed }) => [
                    styles.itemCard,
                    {
                      backgroundColor: item.read ? 'transparent' : colors.highlight,
                      borderColor: item.read ? colors.borderSubtle : borderCol,
                    },
                    Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'all 0.15s ease' } as any),
                    pressed && { transform: [{ scale: 0.98 }] },
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
                    <Text style={[styles.itemText, { color: colors.foregroundSecondary }]} numberOfLines={3}>
                      {item.body}
                    </Text>
                    {item.eventId ? (
                      <View style={styles.viewEventRow}>
                        <Text style={[styles.viewEventText, { color: colors.primary }]}>Tap to view event</Text>
                        <ArrowRight size={12} color={colors.primary} weight="bold" />
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              ))
            )}
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
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        } as any)
      : {}),
  },
  sheet: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: radii.xl,
    borderWidth: 1.5,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        } as any)
      : {}),
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
  viewEventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  viewEventText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyTitle: {
    ...typography.titleSm,
    fontSize: 15,
    fontWeight: '700',
  },
  emptySub: {
    ...typography.bodySm,
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 260,
  },
});
