import AsyncStorage from '@react-native-async-storage/async-storage';
import type { EventItem } from '../data/events';
import { getEventTimeMillis } from './timestampUtils';

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'urgent' | 'event' | 'bazaar' | 'system';
  read: boolean;
  eventId?: string;
  category?: string;
};

const READ_NOTIFICATIONS_KEY = '@loop_read_notifications';

/**
 * Loads stored read notification IDs from AsyncStorage.
 */
export async function getReadNotificationIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(READ_NOTIFICATIONS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

/**
 * Persists read notification IDs to AsyncStorage.
 */
export async function saveReadNotificationIds(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(ids));
  } catch (err) {
    console.warn('Failed to save read notification IDs', err);
  }
}

/**
 * Dynamically generates campus notifications from live Firestore events,
 * saved bookmarks, and student interest categories.
 */
export async function generateCampusNotifications(
  liveEvents: EventItem[],
  savedIds: Set<string>,
  interestCategories: Set<string>
): Promise<NotificationItem[]> {
  const readIds = await getReadNotificationIds();
  const notifications: NotificationItem[] = [];

  // F-55: Pre-filter out past/expired events (>12 hours ago)
  const nowMs = Date.now();
  const upcomingEvents = liveEvents.filter((e) => {
    const timeMs = getEventTimeMillis(e.startsAt);
    if (timeMs === null) return true; // Keep undated notices/announcements
    return timeMs + 12 * 60 * 60 * 1000 >= nowMs;
  });

  // 1. URGENT & OFFICIAL CAMPUS NOTICES
  const noticeEvents = upcomingEvents.filter(
    (e) =>
      e.category === 'Campus Notices' ||
      /notice|circular|survey|deadline|protocol|admissions|guidelines/i.test(e.title)
  );

  for (const event of noticeEvents) {
    const id = `notif_notice_${event.id}`;
    const cleanVenue = (event.venue || '').trim();
    const venueText = cleanVenue && !/^tba$/i.test(cleanVenue) ? ` Venue: ${cleanVenue}.` : '';
    const dateText = event.date ? ` Active on: ${event.date}.` : '';

    notifications.push({
      id,
      title: event.title,
      body: `${event.host}: ${event.blurb?.slice(0, 100) || 'Official circular issued for IIT Delhi campus.'}${dateText}${venueText}`,
      time: event.date || 'Campus Notice',
      type: 'urgent',
      read: readIds.has(id),
      eventId: event.id,
      category: event.category || 'Campus Notices',
    });
  }

  // 2. SAVED EVENT REMINDERS (Bookmarked by student)
  const savedEvents = upcomingEvents.filter((e) => savedIds.has(e.id));
  for (const event of savedEvents) {
    const id = `notif_saved_${event.id}`;
    notifications.push({
      id,
      title: `Saved Event: ${event.title}`,
      body: `Happening at ${event.venue || 'IIT Delhi'} on ${event.date || 'TBA'} (${event.time || 'Time TBA'}). Don't forget your calendar RSVP!`,
      time: event.day || event.date || 'Upcoming',
      type: 'event',
      read: readIds.has(id),
      eventId: event.id,
      category: event.category,
    });
  }

  // 3. CURATED PICKS MATCHING STUDENT INTERESTS
  const interestEvents = upcomingEvents.filter(
    (e) =>
      interestCategories.has(e.category) &&
      !savedIds.has(e.id) &&
      e.category !== 'Campus Notices'
  );

  for (const event of interestEvents.slice(0, 4)) {
    const id = `notif_interest_${event.id}`;
    notifications.push({
      id,
      title: `New in ${event.category}: ${event.title}`,
      body: `Organized by ${event.host} at ${event.venue || 'Campus'}. Matches your curated feed preferences.`,
      time: event.date || 'Curated',
      type: 'event',
      read: readIds.has(id),
      eventId: event.id,
      category: event.category,
    });
  }

  // 4. OFFICIAL SYSTEM ANNOUNCEMENTS (IIT Delhi Campus Life)
  const systemNotices: NotificationItem[] = [
    {
      id: 'notif_system_library',
      title: 'Central Library 24×7 Reading Hall',
      body: 'Air-conditioned study areas extended around the clock for upcoming examination preparations.',
      time: 'Campus Notice',
      type: 'system',
      read: readIds.has('notif_system_library'),
    },
    {
      id: 'notif_system_hospital',
      title: 'IITD Health Center Emergency Support',
      body: 'IIT Hospital emergency ambulance is reachable at 011-2659-6100 and internal ext 6100.',
      time: 'Campus Info',
      type: 'system',
      read: readIds.has('notif_system_hospital'),
    },
  ];

  for (const sys of systemNotices) {
    notifications.push(sys);
  }

  // Sort: unread first, then urgent first
  return notifications.sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    if (a.type === 'urgent' && b.type !== 'urgent') return -1;
    if (b.type === 'urgent' && a.type !== 'urgent') return 1;
    return 0;
  });
}
