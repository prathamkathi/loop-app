import type { EventItem } from '../data/events';
import { normalizeCategory } from './categoryMeta';
import { getEventTimeMillis } from './timestampUtils';

export type DiscoveryView = 'upcoming' | 'saved' | 'past';
export type TimeHorizon = 'all' | 'today' | 'weekend' | 'week';
const CAMPUS_OFFSET = 330 * 60 * 1000;

/** Calendar boundaries always use IIT Delhi time, including for students travelling abroad. */
export function campusDayStart(now: number): number {
  const d = new Date(now + CAMPUS_OFFSET);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - CAMPUS_OFFSET;
}

export function isPastEvent(event: EventItem, now = Date.now()): boolean {
  const start = getEventTimeMillis(event.startsAt);
  return start !== null && start < campusDayStart(now);
}

export function matchesHorizon(event: EventItem, horizon: TimeHorizon, now: number): boolean {
  if (horizon === 'all') return true;
  const start = getEventTimeMillis(event.startsAt);
  if (start === null) return false;
  const today = campusDayStart(now);
  const day = 86400000;
  if (horizon === 'today') return start >= today && start < today + day;
  if (horizon === 'week') return start >= today && start < today + 7 * day;
  const weekday = new Date(now + CAMPUS_OFFSET).getUTCDay();
  const saturday = today + (weekday === 0 ? -1 : 6 - weekday) * day;
  return start >= Math.max(today, saturday) && start < saturday + 2 * day;
}

export function filterEvents(events: EventItem[], options: {
  view: DiscoveryView; category: string; horizon: TimeHorizon; search: string;
  interests: Set<string>; saved: Set<string>; personalized?: boolean; now: number;
}): EventItem[] {
  const { view, category, horizon, search, interests, saved, personalized, now } = options;
  const words = search.toLocaleLowerCase().trim();
  return events.filter((event) => {
    if (view === 'saved' ? !saved.has(event.id) : isPastEvent(event, now) !== (view === 'past')) return false;
    const canonical = normalizeCategory(event.category);
    if (category !== 'all' && canonical !== category) return false;
    if (personalized && interests.size && canonical && !interests.has(canonical)) return false;
    if (view !== 'past' && !matchesHorizon(event, horizon, now)) return false;
    return !words || [event.title, event.host, event.venue, event.blurb, event.category]
      .some((value) => typeof value === 'string' && value.toLocaleLowerCase().includes(words));
  }).sort((a, b) => {
    const first = getEventTimeMillis(a.startsAt);
    const second = getEventTimeMillis(b.startsAt);
    if (first === null) return second === null ? 0 : 1;
    if (second === null) return -1;
    return view === 'past' ? second - first : first - second;
  });
}

/** Untrusted Firestore/cache data is normalized before it reaches render methods. */
export function normalizeEvent(id: string, value: Record<string, any>): EventItem {
  const string = (v: unknown) => typeof v === 'string' ? v : '';
  return {
    ...value, id,
    title: string(value.title) || 'Campus event', host: string(value.host),
    date: string(value.date), time: string(value.time || value.startTime),
    venue: string(value.venue), image: string(value.image), blurb: string(value.blurb || value.rawCaption),
    category: normalizeCategory(value.category) || 'Campus Notices',
    tags: Array.isArray(value.tags) ? value.tags.filter((tag: unknown) => typeof tag === 'string') : [],
    contacts: Array.isArray(value.contacts) ? value.contacts.filter((contact: any) => contact && typeof contact.phone === 'string').map((contact: any) => ({ ...contact, name: string(contact.name) })) : [],
  };
}
