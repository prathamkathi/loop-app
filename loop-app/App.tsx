import React, { useState, useCallback, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, getDocs, onSnapshot, limit } from "firebase/firestore";
import { db } from './src/config/firebase';
import { useCustomFonts } from "./src/utils/useFonts";
import { ThemeProvider, useTheme } from './src/theme';
import AppNavigator from './src/navigation/AppNavigator';
import { type TabId } from './src/navigation/BottomTabBar';
import TopBar from './src/components/TopBar';
import EventDetailModal from './src/components/EventDetailModal';
import NotificationModal, { INITIAL_NOTIFICATIONS } from './src/components/NotificationModal';
import StudentAuthModal from './src/components/StudentAuthModal';
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
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Load persisted data on mount & fetch events for AI context
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Loop | IIT Delhi Events';
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

  // T-09: Offline persistence for feed
  useEffect(() => {
    import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
      AsyncStorage.getItem('@loop_feed_cache').then((cached) => {
        if (cached && eventsLoading) {
          try {
            setLiveEvents(JSON.parse(cached));
            setEventsLoading(false); // Paint immediately
          } catch {}
        }
      });
    });
  }, []);

  useEffect(() => {
    // F-21, F-22: Live data via onSnapshot
    const q = query(
      collection(db, 'events'), 
      where("status", "==", "approved"), limit(50)
      // Note: we can't use orderBy('startsAt') here easily because of the compound index requirement
      // and we just added the index. The client sorts it anyway in HomeScreen.
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EventItem[];
      setLiveEvents(fetched);
      setEventsLoading(false);
      
      import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
        AsyncStorage.setItem('@loop_feed_cache', JSON.stringify(fetched)).catch(console.warn);
      });
    }, (error) => {
      console.error('Failed to load live events:', error);
      setEventsLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
        return (
          <HomeScreen
            interests={interests}
            saved={saved}
            liveEvents={liveEvents}
            loading={eventsLoading}
            onToggleSave={toggleSave}
            onOpenEvent={setActiveEvent}
            onResetFilters={resetFilters}
            onEditInterests={() => setActiveTab('curate')}
          />
        );
      case 'pulse':
        return <PulseScreen />;
      case 'directory':
        return <DirectoryScreen />;
      case 'curate':
        return (
          <CurateScreen
            interests={interests}
            onToggle={toggleInterest}
            reminder={reminder}
            onReminderChange={handleReminderChange}
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
            onToggleSave={toggleSave}
            onOpenEvent={setActiveEvent}
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
          onClose={() => setActiveEvent(null)}
        />
      )}

      {/* Campus Notifications & Alerts Modal */}
      <NotificationModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAllRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
        onMarkRead={(id) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))}
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
