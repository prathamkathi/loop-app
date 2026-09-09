import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { EventItem } from '../data/events';
import { getEventTimeMillis } from './timestampUtils';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function scheduleEventReminder(event: EventItem) {
  if (Platform.OS === 'web') return;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const eventTimeMs = getEventTimeMillis(event.startsAt);
  if (!eventTimeMs) return;

  // Schedule 1 hour before
  const triggerTime = new Date(eventTimeMs - 60 * 60 * 1000);
  
  if (triggerTime.getTime() > Date.now()) {
    await Notifications.scheduleNotificationAsync({
      identifier: `event-${event.id}`,
      content: {
        title: `Upcoming: ${event.title}`,
        body: `Starting in 1 hour at ${event.venue || 'Campus'}.`,
        data: { eventId: event.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerTime,
      },
    });
  }
}

export async function cancelEventReminder(eventId: string) {
  if (Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(`event-${eventId}`);
}
