import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, getDocs, onSnapshot, limit, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from './src/config/firebase';
import { ensureSignedIn } from './src/utils/session';
import { useCustomFonts } from "./src/utils/useFonts";
import { ThemeProvider, useTheme } from './src/theme';
import AppNavigator from './src/navigation/AppNavigator';
import { type TabId } from './src/navigation/BottomTabBar';
import TopBar from './src/components/TopBar';
import EventDetailModal from './src/components/EventDetailModal';
import NotificationModal from './src/components/NotificationModal';
import StudentAuthModal from './src/components/StudentAuthModal';
import {
  generateCampusNotifications,
  saveReadNotificationIds,
  type NotificationItem,
} from './src/utils/notifications';
import AICampusConcierge from './src/components/AICampusConcierge';
import HomeScreen from './src/screens/HomeScreen';
import PulseScreen from './src/screens/PulseScreen';
import DirectoryScreen from './src/screens/DirectoryScreen';
import CurateScreen from './src/screens/CurateScreen';
import SubmitScreen from './src/screens/SubmitScreen';
import QueueScreen from './src/screens/QueueScreen';
import { CATEGORIES } from './src/data/categories';
import { type EventItem } from './src/data/events';
import { useStudentAuth } from './src/utils/auth';
import {
  hasSetInterests,
  loadInterests,
  saveInterests,
  loadSavedEvents,
  saveSavedEvents,
  loadReminder,
  saveReminder,
} from './src/utils/storage';
import { ErrorBoundary } from './src/components/ErrorBoundary';

function AppContent() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { profile, signIn, signOut } = useStudentAuth();

  // Navigation state
  const [fontsLoaded] = useCustomFonts();
  const [mode, setMode] = useState<'student' | 'studio'>('student');
  const [activeTab, setActiveTab] = useState<TabId>('home');

  // Data state
  const [interests, setInterests] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [reminder, setReminder] = useState(60);
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAIConcierge, setShowAIConcierge] = useState(false);
  const [liveEvents, setLiveEvents] = useState<EventItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Load persisted data on mount & fetch events for AI context
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Loop | IIT Delhi Events';
      if (!document.getElementById('loop-fonts-stylesheet')) {
        const link = document.createElement('link');
        link.id = 'loop-fonts-stylesheet';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap';
        document.head.appendChild(link);
      }
    }
    (async () => {
      const [storedInterests, interestsSet, storedSaved, storedReminder] = await Promise.all([
        loadInterests(),
        hasSetInterests(),
        loadSavedEvents(),
        loadReminder(),
      ]);
      if (interestsSet) {
        setInterests(new Set(storedInterests));
      } else {
        // Default to everything selected for first time users
        setInterests(new Set(CATEGORIES.filter((c: string) => c !== 'All')));
      }
      if (storedSaved.length > 0) setSaved(new Set(storedSaved));
      setReminder(storedReminder);
    })();
  }, []);

  const [eventsLoading, setEventsLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const isLiveLoadedRef = useRef(false);

  // T-09: Offline persistence for feed (U15: prevent race condition with live snapshot)
  useEffect(() => {
    import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
      AsyncStorage.getItem('@loop_feed_cache').then((cached) => {
        if (cached && !isLiveLoadedRef.current) {
          try {
            setLiveEvents(JSON.parse(cached));
            setEventsLoading(false); // Paint immediately
          } catch {}
        }
      });
    });
  }, []);

  useEffect(() => {
    // Every read and API call needs a Firebase identity; students get one
    // anonymously. Fire-and-forget: the snapshot listener below retries on
    // auth state change, and a failure surfaces through feedError.
    ensureSignedIn().catch(() => setFeedError('Could not connect to campus servers.'));
  }, []);

  useEffect(() => {
    // B-03 & D-1: Live events query with orderBy('startsAt', 'asc') and graceful fallback
    const qOrdered = query(
      collection(db, 'events'), 
      where("status", "==", "approved"),
      orderBy("startsAt", "asc"),
      limit(50)
    );
    const qFallback = query(
      collection(db, 'events'), 
      where("status", "==", "approved"),
      limit(50)
    );

    let activeUnsubscribe: (() => void) | null = null;

    const handleSnapshot = (snapshot: any) => {
      isLiveLoadedRef.current = true;
      const fetched = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as EventItem[];
      setLiveEvents(fetched);
      setEventsLoading(false);
      setFeedError(null);
      
      import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
        AsyncStorage.setItem('@loop_feed_cache', JSON.stringify(fetched)).catch(console.warn);
      });
    };

    activeUnsubscribe = onSnapshot(
      qOrdered,
      handleSnapshot,
      (err) => {
        console.warn('Ordered query failed (index may still be deploying), falling back to unordered feed:', err);
        // Fall back to unordered query so a missing/deploying index never blanks the feed
        if (activeUnsubscribe) activeUnsubscribe();
        activeUnsubscribe = onSnapshot(
          qFallback,
          handleSnapshot,
          (fallbackErr) => {
            console.error('Failed to load live events even on fallback:', fallbackErr);
            setFeedError("Couldn't load events. Pull to refresh or try again shortly.");
            setEventsLoading(false);
          }
        );
      }
    );

    return () => {
      if (activeUnsubscribe) activeUnsubscribe();
    };
  }, []);

  const refetchEvents = useCallback(async () => {
    try {
      const qOrdered = query(
        collection(db, 'events'),
        where("status", "==", "approved"),
        orderBy("startsAt", "asc"),
        limit(50)
      );
      const snap = await getDocs(qOrdered);
      isLiveLoadedRef.current = true;
      const fetched = snap.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as EventItem[];
      setLiveEvents(fetched);
      setFeedError(null);
    } catch (err) {
      try {
        const qFallback = query(
          collection(db, 'events'),
          where("status", "==", "approved"),
          limit(50)
        );
        const snap = await getDocs(qFallback);
        isLiveLoadedRef.current = true;
        const fetched = snap.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        })) as EventItem[];
        setLiveEvents(fetched);
        setFeedError(null);
      } catch (fallbackErr) {
        console.error('Refetch failed on both paths:', fallbackErr);
        setFeedError("Couldn't refresh events. Check connection.");
      }
    }
  }, []);

  // Notifications generation
  useEffect(() => {
    generateCampusNotifications(liveEvents, saved, interests).then((items) => {
      setNotifications(items);
    });
  }, [liveEvents, saved, interests]);

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveReadNotificationIds(updated.map((n) => n.id));
      return updated;
    });
  }, []);

  const handleMarkRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveReadNotificationIds(updated.filter((n) => n.read).map((n) => n.id));
      return updated;
    });
  }, []);

  // Event modal open & close with hash sync (X6)
  const openEvent = useCallback((event: EventItem) => {
    setActiveEvent(event);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.hash = `event/${event.id}`;
    }
  }, []);

  const closeEvent = useCallback(() => {
    setActiveEvent(null);
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hash) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  // X6: Web hash routing (/#event/<id>) — handles direct links, refresh, browser back/forward
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleHash = async () => {
      const hash = window.location.hash || '';
      const match = hash.match(/^#\/?event\/([a-zA-Z0-9_-]+)$/);
      if (match) {
        const eventId = match[1];
        const existing = liveEvents.find((e) => e.id === eventId);
        if (existing) {
          setActiveEvent(existing);
        } else {
          try {
            const docSnap = await getDoc(doc(db, 'events', eventId));
            if (docSnap.exists()) {
              setActiveEvent({ id: docSnap.id, ...docSnap.data() } as EventItem);
            }
          } catch (err) {
            console.warn('Could not load deep-linked event:', err);
          }
        }
      } else if (!hash || hash === '#') {
        setActiveEvent(null);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('popstate', handleHash);

    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('popstate', handleHash);
    };
  }, [liveEvents]);

  const handleSelectNotification = useCallback(
    (item: NotificationItem) => {
      if (item.eventId) {
        const matched = liveEvents.find((e) => e.id === item.eventId);
        if (matched) {
          setShowNotifications(false);
          openEvent(matched);
        }
      }
    },
    [liveEvents, openEvent]
  );

  // Toggle mode
  const toggleMode = useCallback(() => {
    setMode((m) => {
      const nextMode = m === 'student' ? 'studio' : 'student';
      setActiveTab(nextMode === 'studio' ? 'queue' : 'home');
      return nextMode;
    });
  }, []);

  // Toggle save
  const toggleSave = useCallback((id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveSavedEvents([...next]);
      return next;
    });
  }, []);

  // Toggle interest
  const toggleInterest = useCallback((cat: string) => {
    setInterests((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      saveInterests([...next]);
      return next;
    });
  }, []);

  // Reminder
  const handleReminderChange = useCallback((v: number) => {
    setReminder(v);
    saveReminder(v);
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setInterests(new Set());
    saveInterests([]);
  }, []);

  // Render active screen
  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
      case 'studio_home':
        return (
          <HomeScreen
            interests={interests}
            saved={saved}
            liveEvents={liveEvents}
            loading={eventsLoading}
            error={feedError}
            onRefresh={refetchEvents}
            onToggleSave={toggleSave}
            onOpenEvent={openEvent}
            onResetFilters={resetFilters}
            onEditInterests={() => setActiveTab(mode === 'studio' ? 'studio_home' : 'curate')}
          />
        );
      case 'pulse':
      case 'studio_pulse':
        return <PulseScreen />;
      case 'directory':
        return <DirectoryScreen />;
      case 'curate':
        return (
          <CurateScreen
            interests={interests}
            onToggle={toggleInterest}
          />
        );
      case 'submit':
        return <SubmitScreen onNavigate={(tab) => setActiveTab(tab as any)} />;
      case 'queue':
        return <QueueScreen />;
      default:
        return (
          <HomeScreen
            interests={interests}
            saved={saved}
            liveEvents={liveEvents}
            loading={eventsLoading}
            error={feedError}
            onRefresh={refetchEvents}
            onToggleSave={toggleSave}
            onOpenEvent={openEvent}
            onResetFilters={resetFilters}
            onEditInterests={() => setActiveTab('curate')}
          />
        );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator
        mode={mode}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onToggleMode={toggleMode}
        hideTabBar={activeEvent !== null || showNotifications || showAuthModal || showAIConcierge}
      >
        <TopBar
          mode={mode}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onNotification={() => setShowNotifications(true)}
          notificationCount={unreadCount}
          studentProfile={profile}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenAI={() => setShowAIConcierge(true)}
        />
        {renderScreen()}
      </AppNavigator>

      {/* Event Detail Modal Overlay */}
      {activeEvent && (
        <EventDetailModal
          event={activeEvent}
          saved={saved.has(activeEvent.id)}
          onToggleSave={() => toggleSave(activeEvent.id)}
          onClose={closeEvent}
        />
      )}

      {/* Campus Notifications & Alerts Modal */}
      <NotificationModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onMarkRead={handleMarkRead}
        onSelectNotification={handleSelectNotification}
      />

      {/* Student Authentication & Profile Modal */}
      <StudentAuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentProfile={profile}
        onSignIn={signIn}
        onSignOut={signOut}
        onToggleMode={toggleMode}
        mode={mode}
      />

      {/* Loop AI Campus Concierge Assistant */}
      <AICampusConcierge
        visible={showAIConcierge}
        onClose={() => setShowAIConcierge(false)}
        events={liveEvents}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
