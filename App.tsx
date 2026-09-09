import React, { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc } from 'firebase/firestore';
import { useEventFeed } from './src/hooks/useEventFeed';
import { normalizeEvent } from './src/utils/eventDiscovery';
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
import { scheduleEventReminder, cancelEventReminder } from './src/utils/pushNotifications';
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
} from './src/utils/storage';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import PWAInstallBanner from './src/components/PWAInstallBanner';

function AppContent() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { profile, signIn, signOut } = useStudentAuth();

  // Navigation state
  const [fontsLoaded, fontError] = useCustomFonts();
  const [mode, setMode] = useState<'student' | 'studio'>('student');
  const [activeTab, setActiveTab] = useState<TabId>('home');

  // Data state
  const [interests, setInterests] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAIConcierge, setShowAIConcierge] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Load persisted data on mount & fetch events for AI context
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Loop | IIT Delhi Events';
    }
    (async () => {
      const [storedInterests, interestsSet, storedSaved] = await Promise.all([
        loadInterests(),
        hasSetInterests(),
        loadSavedEvents(),
      ]);
      if (interestsSet) {
        setInterests(new Set(storedInterests));
      } else {
        // Default to everything selected for first time users
        setInterests(new Set(CATEGORIES.filter((c: string) => c !== 'All')));
      }
      if (storedSaved.length > 0) setSaved(new Set(storedSaved));
    })();
  }, []);

  const { events: liveEvents, loading: eventsLoading, error: feedError, refresh: refetchEvents } = useEventFeed(saved);

  useEffect(() => { ensureSignedIn().catch(() => {}); }, []);

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
      if (next.has(id)) {
        next.delete(id);
        cancelEventReminder(id);
      } else {
        next.add(id);
        const event = liveEvents.find(e => e.id === id);
        if (event) scheduleEventReminder(event);
      }
      saveSavedEvents([...next]);
      return next;
    });
  }, [liveEvents]);

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
            onOpenAI={() => setShowAIConcierge(true)}
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
            onOpenAI={() => setShowAIConcierge(true)}
          />
        );
    }
  };

  if (!fontsLoaded && !fontError) return null;

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
          onToggleMode={toggleMode}
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

      {/* PWA Home Screen Install Banner */}
      <PWAInstallBanner />
    </SafeAreaView>
  );
}

import * as Sentry from '@sentry/react-native';
import { initSentry } from './src/config/sentry';

initSentry();

function App() {
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

export default Sentry.wrap(App);
