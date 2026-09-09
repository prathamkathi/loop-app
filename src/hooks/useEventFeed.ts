import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { EventItem } from '../data/events';
import { campusDayStart, normalizeEvent } from '../utils/eventDiscovery';

const CACHE_KEY = '@loop_feed_cache';
function feedQueries() {
  const events = collection(db, 'events');
  const approved = where('status', '==', 'approved');
  const midnight = Timestamp.fromMillis(campusDayStart(Date.now()));
  return [
    query(events, approved, where('startsAt', '>=', midnight), orderBy('startsAt', 'asc'), limit(100)),
    query(events, approved, where('startsAt', '<', midnight), orderBy('startsAt', 'desc'), limit(60)),
    query(events, approved, where('startsAt', '==', null), limit(40)),
  ];
}

export function useEventFeed(saved: Set<string>) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [savedEvents, setSavedEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const liveLoaded = useRef(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(CACHE_KEY).then((cached) => {
      if (!active || liveLoaded.current || !cached) return;
      try {
        const data = JSON.parse(cached);
        if (!Array.isArray(data)) return;
        setEvents(data.filter((item) => item && typeof item.id === 'string' && item.status === 'approved')
          .map((item) => normalizeEvent(item.id, item)));
        setLoading(false);
      } catch { /* A damaged cache must never prevent a fresh read. */ }
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    let fallback = false;
    const parts = new Map<number, EventItem[]>();
    const unsubscribe: Array<() => void> = [];
    const slowTimer = setTimeout(() => {
      if (active && !liveLoaded.current) {
        setLoading(false);
        setError('Connection is taking longer than usual. You can retry below.');
      }
    }, 12000);
    const receive = (index: number, snapshot: any) => {
      if (!active) return;
      parts.set(index, snapshot.docs.map((item: any) => normalizeEvent(item.id, item.data())));
      if (!fallback && parts.size < 3) return;
      clearTimeout(slowTimer);
      liveLoaded.current = !snapshot.metadata.fromCache;
      const result = [...new Map([...parts.values()].flat().map((item) => [item.id, item])).values()];
      setEvents(result);
      setLoading(false);
      setError(snapshot.metadata.fromCache ? 'Showing cached events. Reconnecting to campus updates…' : null);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(result)).catch(() => {});
    };
    const fail = () => {
      if (!active) return;
      clearTimeout(slowTimer);
      setLoading(false);
      setError('Could not refresh events. Check your connection and try again.');
    };
    const useFallback = () => {
      if (!active || fallback) return;
      fallback = true;
      unsubscribe.forEach((stop) => stop());
      parts.clear();
      unsubscribe.push(onSnapshot(query(collection(db, 'events'), where('status', '==', 'approved'), limit(200)),
        (snapshot) => receive(0, snapshot), fail));
    };
    feedQueries().forEach((q, index) => {
      unsubscribe.push(onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
        if (!fallback) receive(index, snapshot);
      }, useFallback));
    });
    const dayTimer = setInterval(() => {
      if (campusDayStart(Date.now()) !== day) setRevision((value) => value + 1);
    }, 60000);
    const day = campusDayStart(Date.now());
    return () => { active = false; clearTimeout(slowTimer); clearInterval(dayTimer); unsubscribe.forEach((stop) => stop()); };
  }, [revision]);

  // A bounded discovery query is not evidence that an older bookmark was deleted.
  useEffect(() => {
    let active = true;
    const missing = [...saved].filter((id) => !events.some((event) => event.id === id));
    Promise.all(missing.map(async (id) => {
      try {
        const snapshot = await getDoc(doc(db, 'events', id));
        return snapshot.exists() && snapshot.data().status === 'approved' ? normalizeEvent(id, snapshot.data()) : null;
      } catch { return null; }
    })).then((items) => {
      if (active) setSavedEvents(items.filter((item): item is EventItem => item !== null));
    });
    return () => { active = false; };
  }, [saved, events]);

  const refresh = useCallback(async () => {
    setRevision((value) => value + 1);
    try {
      const snapshots = await Promise.all(feedQueries().map((q) => getDocs(q)));
      const result = snapshots.flatMap((snapshot) => snapshot.docs.map((item) => normalizeEvent(item.id, item.data())));
      liveLoaded.current = true;
      setEvents(result);
      setError(null);
    } catch { setError('Could not refresh events. Check your connection and try again.'); }
    finally { setLoading(false); }
  }, []);

  const allEvents = useMemo(() => [...new Map([...savedEvents, ...events].map((item) => [item.id, item])).values()], [savedEvents, events]);
  return { events: allEvents, loading, error, refresh };
}
