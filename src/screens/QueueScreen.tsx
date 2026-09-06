import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  RefreshControl,
  Pressable,
  Animated,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  PanResponder,
  Platform,
  Modal,
} from 'react-native';
import { showAlert } from '../utils/alert';
import {
  Camera,
  Clock,
  Cpu,
  Check,
  X,
  CheckCircle,
  ShieldCheck,
  SignOut,
  Sparkle,
  User,
  Key,
  Stack,
  CalendarBlank,
  ArrowCounterClockwise,
  MagnifyingGlassPlus,
  Plus,
  Trash,
  CaretDown,
  LinkSimple,
  Phone,
  Archive,
} from 'phosphor-react-native';
import { getOptimizedImageUrl } from '../utils/cloudinary';
import { useTheme, typography, radii, shadows } from '../theme';
import SectionLabel from '../components/SectionLabel';
import PosterLightboxModal from '../components/PosterLightboxModal';
import { type ScrapedItem } from '../data/queue';
import { type EventContact } from '../data/events';
import { CATEGORIES } from '../data/categories';
import { getCategoryMeta, normalizeCategory } from '../utils/categoryMeta';
import { formatHost } from '../utils/format';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { parseDateTimeStrings, parseEventTimestamp } from '../utils/timestampUtils';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { onCoordinatorChange } from '../utils/session';
import { db, auth } from '../config/firebase';
import { httpsCallable } from '../utils/vercelClient';

export default function QueueScreen() {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState<'pending' | 'rejected'>('pending');
  const [refreshing, setRefreshing] = useState(false);

  const [queue, setQueue] = useState<ScrapedItem[]>([]);
  const [rejectedList, setRejectedList] = useState<ScrapedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editableItem, setEditableItem] = useState<ScrapedItem | null>(null);

  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [studioUser, setStudioUser] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  // Inspection & Category Picker state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');
  const [lightboxTitle, setLightboxTitle] = useState('');
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [editableItem?.id]);

  // Restore coordinator session
  useEffect(() => {
    const unsubscribe = onCoordinatorChange(({ isCoordinator }) => {
      const user = auth.currentUser;
      if (user && isCoordinator) {
        setStudioUser(user.email || 'coordinator');
        setAuthenticated(true);
        setAuthError('');
      } else {
        setAuthenticated(false);
        setStudioUser('');
        if (user && !user.isAnonymous) {
          setAuthError('This account is not registered as a club coordinator.');
        }
      }
    });
    return unsubscribe;
  }, []);

  const fetchQueue = useCallback(async () => {
    if (!authenticated) return;
    setLoading(true);
    try {
      // 1. Fetch pending
      const qPending = query(collection(db, 'events'), where("status", "==", "pending"), limit(50));
      const snapshotPending = await getDocs(qPending);
      const fetchedPending = snapshotPending.docs.map(docSnap => {
        const data = docSnap.data();
        const cat = normalizeCategory(data.category) || 'Cultural & Arts';
        return {
          id: docSnap.id,
          image: data.image,
          title: data.title || '',
          venue: data.venue || '',
          date: data.date || '',
          time: data.time || '',
          startTime: data.time || '',
          endTime: data.endTime || '',
          category: cat,
          eventType: cat,
          confidence: data.confidence || 0,
          tags: data.tags || [],
          blurb: data.blurb || '',
          rawCaption: data.blurb || '',
          host: data.host || '',
          sourceHandle: data.host ? formatHost(data.host) : 'Submitted via App',
          sourceTimestamp: parseEventTimestamp(data.createdAt)?.toLocaleDateString() || 'Just now',
          contacts: data.contacts || [],
          actionUrl: data.actionUrl || '',
          status: 'pending' as const,
        };
      }) as ScrapedItem[];
      setQueue(fetchedPending);
      if (fetchedPending.length > 0) {
        setEditableItem({ ...fetchedPending[0] });
      } else {
        setEditableItem(null);
      }

      // 2. Fetch rejected archive
      const qRejected = query(collection(db, 'events'), where("status", "==", "rejected"), limit(50));
      const snapshotRejected = await getDocs(qRejected);
      const fetchedRejected = snapshotRejected.docs.map(docSnap => {
        const data = docSnap.data();
        const cat = normalizeCategory(data.category) || 'Cultural & Arts';
        return {
          id: docSnap.id,
          image: data.image,
          title: data.title || '',
          venue: data.venue || '',
          date: data.date || '',
          time: data.time || '',
          startTime: data.time || '',
          endTime: data.endTime || '',
          category: cat,
          eventType: cat,
          confidence: data.confidence || 0,
          tags: data.tags || [],
          blurb: data.blurb || '',
          rawCaption: data.blurb || '',
          host: data.host || '',
          sourceHandle: data.host ? formatHost(data.host) : 'Submitted via App',
          sourceTimestamp: parseEventTimestamp(data.createdAt)?.toLocaleDateString() || 'Just now',
          contacts: data.contacts || [],
          actionUrl: data.actionUrl || '',
          status: 'rejected' as const,
          rejectedAt: data.rejectedAt,
        };
      }) as ScrapedItem[];
      setRejectedList(fetchedRejected);
    } catch (err) {
      console.error('Error fetching queue & rejected:', err);
    } finally {
      setLoading(false);
    }
  }, [authenticated]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchQueue();
    setRefreshing(false);
  }, [fetchQueue]);

  const pan = React.useRef(new Animated.ValueXY()).current;
  const resetPan = useCallback(() => {
    pan.setValue({ x: 0, y: 0 });
  }, [pan]);

  const remaining = queue.length;

  const handleNext = useCallback(() => {
    setQueue((prev) => {
      const nextQueue = prev.slice(1);
      if (nextQueue.length > 0) {
        setEditableItem({ ...nextQueue[0] });
      } else {
        setEditableItem(null);
      }
      return nextQueue;
    });
    resetPan();
  }, [resetPan]);

  const handleApprove = async () => {
    if (isProcessing || !editableItem) return;
    setIsProcessing(true);
    try {
      const approvedCategory = normalizeCategory(editableItem.category || editableItem.eventType);
      if (!approvedCategory) {
        showAlert('Category Required', 'Please select a valid event category before approving.');
        resetPan();
        setIsProcessing(false);
        return;
      }

      const updateData: any = {
        status: 'approved',
        title: editableItem.title,
        venue: editableItem.venue,
        date: editableItem.date,
        time: editableItem.time || editableItem.startTime || '',
        endTime: editableItem.endTime || '',
        category: approvedCategory,
        blurb: editableItem.blurb || editableItem.rawCaption || '',
        contacts: editableItem.contacts || [],
        actionUrl: editableItem.actionUrl || '',
        approvedAt: serverTimestamp(),
      };

      // F-56: Calculate startsAt on approval to preserve chronological feed order
      const startsAtDate = parseDateTimeStrings(editableItem.date, editableItem.time || editableItem.startTime);
      if (startsAtDate) {
        updateData.startsAt = Timestamp.fromDate(startsAtDate);
      }

      await updateDoc(doc(db, 'events', editableItem.id), updateData);
      handleNext();
    } catch (err) {
      console.error('Approve error:', err);
      resetPan();
      showAlert('Action Failed', 'Could not approve this event. Please check your permissions.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (isProcessing || !editableItem) return;
    setIsProcessing(true);
    try {
      // Soft-delete: update status to 'rejected' for auditability & undo capability
      await updateDoc(doc(db, 'events', editableItem.id), {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
      });
      // Move to rejected archive
      const rejectedItem = { ...editableItem, status: 'rejected' as const };
      setRejectedList((prev) => [rejectedItem, ...prev]);
      handleNext();
    } catch (err) {
      console.error('Reject error:', err);
      showAlert('Action Failed', 'Could not reject this event.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreRejected = async (itemToRestore: ScrapedItem) => {
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'events', itemToRestore.id), {
        status: 'pending',
      });
      // Move from rejected list back to pending queue
      setRejectedList((prev) => prev.filter((i) => i.id !== itemToRestore.id));
      const restored = { ...itemToRestore, status: 'pending' as const };
      setQueue((prev) => [restored, ...prev]);
      if (!editableItem) {
        setEditableItem(restored);
      }
      showAlert('Event Restored', `"${itemToRestore.title || 'Event'}" has been moved back to Pending Review.`);
    } catch (err) {
      console.error('Error restoring event:', err);
      showAlert('Action Failed', 'Could not restore this event.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveRejected = async (itemToApprove: ScrapedItem) => {
    setIsProcessing(true);
    try {
      const cat = normalizeCategory(itemToApprove.category || itemToApprove.eventType);
      const updateData: any = {
        status: 'approved',
        approvedAt: serverTimestamp(),
      };
      if (cat) {
        updateData.category = cat;
      }
      const startsAtDate = parseDateTimeStrings(itemToApprove.date, itemToApprove.time || itemToApprove.startTime);
      if (startsAtDate) {
        updateData.startsAt = Timestamp.fromDate(startsAtDate);
      }

      await updateDoc(doc(db, 'events', itemToApprove.id), updateData);
      setRejectedList((prev) => prev.filter((i) => i.id !== itemToApprove.id));
      showAlert('Event Approved', `"${itemToApprove.title || 'Event'}" is now live on the campus feed!`);
    } catch (err) {
      console.error('Error approving rejected event:', err);
      showAlert('Action Failed', 'Could not approve this event.');
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerApprove = () => {
    if (isProcessing || !editableItem) return;
    Animated.timing(pan, {
      toValue: { x: width + 100, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      handleApprove();
    });
  };

  const triggerReject = () => {
    if (isProcessing || !editableItem) return;
    Animated.timing(pan, {
      toValue: { x: -width - 100, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      handleReject();
    });
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (e, gestureState) => {
        return Math.abs(gestureState.dx) > 25;
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (e, gesture) => {
        if (gesture.dx > 120) {
          Animated.spring(pan, {
            toValue: { x: width + 100, y: 0 },
            useNativeDriver: false,
            bounciness: 10,
          }).start(() => {
            handleApprove();
          });
        } else if (gesture.dx < -120) {
          Animated.spring(pan, {
            toValue: { x: -width - 100, y: 0 },
            useNativeDriver: false,
            bounciness: 10,
          }).start(() => {
            handleReject();
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            bounciness: 12,
          }).start();
        }
      },
    })
  ).current;

  const updateField = (field: keyof ScrapedItem, value: any) => {
    if (editableItem) {
      setEditableItem({ ...editableItem, [field]: value });
    }
  };

  const addContact = () => {
    if (editableItem) {
      const currentContacts = editableItem.contacts || [];
      updateField('contacts', [...currentContacts, { name: '', phone: '', role: 'Coordinator' }]);
    }
  };

  const updateContact = (index: number, field: keyof EventContact, val: string) => {
    if (editableItem && editableItem.contacts) {
      const updated = [...editableItem.contacts];
      updated[index] = { ...updated[index], [field]: val };
      updateField('contacts', updated);
    }
  };

  const removeContact = (index: number) => {
    if (editableItem && editableItem.contacts) {
      const updated = editableItem.contacts.filter((_, i) => i !== index);
      updateField('contacts', updated);
    }
  };

  const openLightbox = (image: string, title: string) => {
    setLightboxImage(image);
    setLightboxTitle(title);
    setLightboxVisible(true);
  };

  const handleReAnalyze = async () => {
    if (!editableItem) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch(editableItem.image);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const parseRemote = httpsCallable('parseEventPoster');
      const { data: parsed }: any = await parseRemote({
        imageB64: base64,
        mimeType: response.headers.get('content-type') || 'image/jpeg',
        caption: editableItem.rawCaption,
      });
      
      setEditableItem((prev) => prev ? ({
        ...prev,
        title: parsed.title || prev.title,
        venue: parsed.venue || prev.venue,
        date: parsed.date || prev.date,
        startTime: parsed.startTime || prev.startTime,
        endTime: parsed.endTime || prev.endTime,
        eventType: parsed.category || prev.eventType,
        confidence: (parsed.confidenceScore) || prev.confidence,
      }) : null);
    } catch (err) {
      console.error('Gemini re-analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStudioLogin = async () => {
    setAuthError('');
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password.trim()) {
      setAuthError('Please enter both Club ID / Email and password.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleStudioSignOut = async () => {
    try {
      await signOut(auth);
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Sign out error', err);
    }
  };

  // Auth gate
  if (!authenticated) {
    return (
      <View style={[styles.authContainer, Platform.OS === 'web' && ({ maxWidth: 500, width: '100%', alignSelf: 'center' } as any)]}>
        <View style={[styles.shieldBadge, { backgroundColor: colors.highlight }]}>
          <ShieldCheck size={38} weight="fill" color={colors.primary} />
        </View>
        <Text style={[styles.authTitle, { color: colors.foreground }]}>Club Studio Portal</Text>
        <Text style={[styles.authSub, { color: colors.muted }]}>
          Restricted access for verified SAC student club coordinators & festival convenors.
        </Text>

        {authError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        ) : null}

        <View style={styles.authForm}>
          <View>
            <Text style={[styles.fieldLabelText, { color: colors.foreground }]}>Club ID / Official Email</Text>
            <View style={[styles.authInputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <User size={18} color={colors.muted} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                placeholder="e.g. admin@loop.com"
                placeholderTextColor={colors.muted}
                style={[styles.authInput, { color: colors.foreground }]}
              />
            </View>
          </View>

          <View>
            <Text style={[styles.fieldLabelText, { color: colors.foreground }]}>Coordinator Password</Text>
            <View style={[styles.authInputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Key size={18} color={colors.muted} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Enter password"
                placeholderTextColor={colors.muted}
                style={[styles.authInput, { color: colors.foreground }]}
                onSubmitEditing={handleStudioLogin}
              />
            </View>
          </View>

          <Pressable
            onPress={handleStudioLogin}
            accessibilityRole="button"
            accessibilityLabel="Sign In to Studio"
            style={({ pressed }) => [
              styles.authBtn,
              { backgroundColor: colors.primary, transform: [{ scale: pressed ? 0.98 : 1 }] },
              Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'all 0.15s ease' } as any),
            ]}
          >
            <Text style={[styles.authBtnText, { color: colors.onPrimary }]}>Sign In to Studio</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.centerContainer, Platform.OS === 'web' && ({ maxWidth: 600, width: '100%', alignSelf: 'center' } as any)]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const catMeta = getCategoryMeta(editableItem?.eventType);
  const CategoryIcon = catMeta.icon;
  const nextItem = queue.length > 1 ? queue[1] : null;
  const thirdItem = queue.length > 2 ? queue[2] : null;

  return (
    <>
      <ScrollView
        style={[
          styles.scroll,
          Platform.OS === 'web' && ({ maxWidth: 640, width: '100%', alignSelf: 'center' } as any),
        ]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <SectionLabel style={{ marginBottom: 0 }}>Curator Cockpit</SectionLabel>
            <Text style={[styles.coordinatorTag, { color: colors.muted }]}>
              Verified: <Text style={{ color: colors.primary, fontWeight: '700' }}>{studioUser}</Text>
            </Text>
          </View>

          <Pressable
            onPress={handleStudioSignOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out of Studio"
            style={({ pressed }) => [
              styles.studioSignOutBtn,
              { borderColor: colors.border, backgroundColor: colors.surface },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
              pressed && { transform: [{ scale: 0.94 }] },
            ]}
          >
            <SignOut size={16} color={colors.error} weight="bold" />
          </Pressable>
        </View>

        {/* View Switcher: Pending Review vs Rejected Archive */}
        <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable
            onPress={() => setActiveTab('pending')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'pending' }}
            accessibilityLabel={`Pending reviews, ${queue.length} items`}
            style={[
              styles.tabBtn,
              activeTab === 'pending' && { backgroundColor: colors.primary },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
            ]}
          >
            <Stack size={16} color={activeTab === 'pending' ? colors.onPrimary : colors.muted} weight="bold" />
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === 'pending' ? colors.onPrimary : colors.muted },
              ]}
            >
              Pending ({queue.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('rejected')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'rejected' }}
            accessibilityLabel={`Rejected archive, ${rejectedList.length} items`}
            style={[
              styles.tabBtn,
              activeTab === 'rejected' && { backgroundColor: colors.primary },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
            ]}
          >
            <Archive size={16} color={activeTab === 'rejected' ? colors.onPrimary : colors.muted} weight="bold" />
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === 'rejected' ? colors.onPrimary : colors.muted },
              ]}
            >
              Rejected ({rejectedList.length})
            </Text>
          </Pressable>
        </View>

        {/* TAB 1: PENDING REVIEW COCKPIT */}
        {activeTab === 'pending' && (
          <>
            {queue.length === 0 || !editableItem ? (
              <View style={styles.centerContainer}>
                <View style={[styles.zeroCircle, { backgroundColor: isDark ? 'rgba(138, 21, 56, 0.2)' : 'rgba(138, 21, 56, 0.08)' }]}>
                  <CheckCircle size={52} weight="duotone" color={colors.primary} />
                </View>
                <Text style={[styles.authTitle, { color: colors.foreground, marginTop: 20, textAlign: 'center' }]}>All Caught Up</Text>
                <Text style={[styles.authSub, { color: colors.muted, maxWidth: 340 }]}>
                  The staging queue is completely cleared. All pending event submissions have been processed.
                </Text>
                <Pressable
                  onPress={fetchQueue}
                  accessibilityRole="button"
                  accessibilityLabel="Check for New Items"
                  style={({ pressed }) => [
                    { marginTop: 24, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                    Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                    pressed && { transform: [{ scale: 0.95 }] }
                  ]}
                >
                  <Text style={{ color: colors.primary, fontWeight: '600' }}>Check for New Items</Text>
                </Pressable>
              </View>
            ) : (
              <>
                {/* Meta Bar */}
                <View style={styles.queueMetaBar}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Stack size={14} color={colors.primary} weight="bold" />
                    <Text style={[styles.queueProgressText, { color: colors.muted }]}>
                      Reviewing Card <Text style={{ color: colors.foreground, fontWeight: '700' }}>1</Text> of {remaining}
                    </Text>
                  </View>
                  <Text style={[styles.queueSwipeHint, { color: colors.muted }]}>
                    Swipe right to approve →
                  </Text>
                </View>

                {/* Main Cockpit Card */}
                <Animated.View
                  {...panResponder.panHandlers}
                  style={[
                    styles.cockpit,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    shadows.card,
                    {
                      transform: [
                        { translateX: pan.x },
                        {
                          rotate: pan.x.interpolate({
                            inputRange: [-width / 2, 0, width / 2],
                            outputRange: ['-10deg', '0deg', '10deg'],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {/* Image Panel — Adaptive Dual-Layer with High-Res Inspector Trigger */}
                  <Pressable
                    onPress={() => openLightbox(editableItem.image, editableItem.title)}
                    accessibilityRole="button"
                    accessibilityLabel="Inspect flyer image in full resolution"
                    style={[styles.imagePanel, { backgroundColor: colors.highlight }]}
                  >
                    {editableItem.image && !imageError ? (
                      <>
                        <Image
                          source={{ uri: getOptimizedImageUrl(editableItem.image, 600) }}
                          style={styles.imageBg}
                          blurRadius={14}
                          resizeMode="cover"
                          onError={() => setImageError(true)}
                        />
                        <Image
                          source={{ uri: getOptimizedImageUrl(editableItem.image, 600) }}
                          style={styles.sourceImage}
                          resizeMode="contain"
                          onError={() => setImageError(true)}
                        />
                      </>
                    ) : (
                      <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#1C1917' : '#F5ECEE' }]}>
                        <CalendarBlank size={48} color={colors.primary} weight="duotone" style={{ opacity: 0.5 }} />
                        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700', marginTop: 8, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                          {editableItem.eventType || 'Campus Event'}
                        </Text>
                      </View>
                    )}

                    {/* Overlay Chips */}
                    <View style={styles.imageOverlay}>
                      <View style={styles.sourceChip}>
                        <Camera size={14} weight="regular" color="#FFFFFF" />
                        <Text style={styles.sourceHandle}>{editableItem.sourceHandle}</Text>
                      </View>
                      <View style={styles.sourceChip}>
                        <Clock size={12} weight="regular" color="#FFFFFF" />
                        <Text style={styles.sourceTime}>{editableItem.sourceTimestamp}</Text>
                      </View>
                    </View>

                    {/* Inspect High-Res Flyer Overlay Button */}
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        openLightbox(editableItem.image, editableItem.title);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Inspect flyer in full resolution"
                      style={({ pressed }) => [
                        styles.inspectBadge,
                        Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                        pressed && { transform: [{ scale: 0.94 }] },
                      ]}
                    >
                      <MagnifyingGlassPlus size={14} color="#FFFFFF" weight="bold" />
                      <Text style={styles.inspectBadgeText}>Inspect Flyer</Text>
                    </Pressable>
                  </Pressable>

                  {/* Editing Panel */}
                  <View style={styles.editPanel}>
                    <View style={styles.editHeader}>
                      <View style={styles.editHeaderLeft}>
                        <Cpu size={20} weight="regular" color={colors.muted} />
                        <Text style={[styles.editTitle, { color: colors.foreground }]}>Curator Review</Text>
                      </View>
                      <View style={styles.editHeaderRight}>
                        <Pressable
                          onPress={handleReAnalyze}
                          disabled={isAnalyzing}
                          accessibilityRole="button"
                          accessibilityLabel={isAnalyzing ? "Analyzing flyer with Gemini" : "Re-analyze flyer with Gemini"}
                          style={({ pressed }) => [
                            styles.reAnalyzeBtn,
                            {
                              backgroundColor: isAnalyzing ? colors.surface : colors.highlight,
                              borderColor: colors.border,
                              transform: [{ scale: pressed ? 0.95 : 1 }],
                              opacity: isAnalyzing ? 0.7 : 1,
                            },
                            Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                          ]}
                        >
                          <Sparkle size={14} weight={isAnalyzing ? "fill" : "regular"} color={colors.primary} />
                          <Text style={[styles.reAnalyzeText, { color: colors.primary }]}>
                            {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
                          </Text>
                        </Pressable>

                        <View style={[styles.confidenceBadge, { backgroundColor: colors.highlight, borderColor: colors.border }]}>
                          <Text style={[styles.confidenceText, { color: colors.foreground }]}>
                            {Math.round((editableItem.confidence ?? 0) * 100)}%
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Editable Fields */}
                    <View style={styles.fields}>
                      <FieldRow label="Event Title" colors={colors}>
                        <TextInput
                          value={editableItem.title}
                          onChangeText={(v) => updateField('title', v)}
                          placeholder="Event Title"
                          placeholderTextColor={colors.muted}
                          style={[styles.fieldInput, { color: colors.foreground, borderColor: colors.border }]}
                        />
                      </FieldRow>

                      {/* Interactive Category Selector Pill */}
                      <View>
                        <Text style={[fieldStyles.label, { color: colors.muted }]}>CANONICAL CATEGORY</Text>
                        <Pressable
                          onPress={() => setCategoryPickerVisible(true)}
                          accessibilityRole="button"
                          accessibilityLabel={`Category, currently ${catMeta.label}. Tap to change`}
                          style={({ pressed }) => [
                            styles.categorySelectBtn,
                            {
                              borderColor: catMeta.color,
                              backgroundColor: isDark ? catMeta.bgDark : catMeta.bgLight,
                            },
                            Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                            pressed && { opacity: 0.8 },
                          ]}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <CategoryIcon size={16} color={catMeta.color} weight="bold" />
                            <Text style={[styles.categorySelectText, { color: catMeta.color }]}>
                              {catMeta.label}
                            </Text>
                          </View>
                          <CaretDown size={16} color={catMeta.color} weight="bold" />
                        </Pressable>
                      </View>

                      <FieldRow label="Location / Venue" colors={colors}>
                        <TextInput
                          value={editableItem.venue}
                          onChangeText={(v) => updateField('venue', v)}
                          placeholder="e.g. Seminar Hall / Dogra Hall"
                          placeholderTextColor={colors.muted}
                          style={[styles.fieldInput, { color: colors.foreground, borderColor: colors.border }]}
                        />
                      </FieldRow>

                      {/* Date/Time Grid */}
                      <View style={[styles.dateTimeGrid, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <FieldRow label="Date / Deadline" colors={colors} compact>
                          <TextInput
                            value={editableItem.date}
                            onChangeText={(v) => updateField('date', v)}
                            placeholder="e.g. 15 Sep"
                            placeholderTextColor={colors.muted}
                            style={[styles.fieldInputCompact, { color: colors.foreground, borderColor: colors.border }]}
                          />
                        </FieldRow>
                        <FieldRow label="Start Time" colors={colors} compact>
                          <TextInput
                            value={editableItem.startTime}
                            onChangeText={(v) => updateField('startTime', v)}
                            placeholder="e.g. 6:00 PM"
                            placeholderTextColor={colors.muted}
                            style={[styles.fieldInputCompact, { color: colors.foreground, borderColor: colors.border }]}
                          />
                        </FieldRow>
                        <FieldRow label="End Time" colors={colors} compact>
                          <TextInput
                            value={editableItem.endTime}
                            onChangeText={(v) => updateField('endTime', v)}
                            placeholder="e.g. 9:00 PM"
                            placeholderTextColor={colors.muted}
                            style={[styles.fieldInputCompact, { color: colors.foreground, borderColor: colors.border }]}
                          />
                        </FieldRow>
                      </View>

                      {/* Action / Registration URL Field */}
                      <FieldRow label="Action URL / Registration Form (Optional)" colors={colors}>
                        <View style={[styles.urlInputWrap, { borderColor: colors.border, backgroundColor: colors.background }]}>
                          <LinkSimple size={16} color={colors.muted} />
                          <TextInput
                            value={editableItem.actionUrl || ''}
                            onChangeText={(v) => updateField('actionUrl', v)}
                            placeholder="https://forms.gle/... or official link"
                            placeholderTextColor={colors.muted}
                            autoCapitalize="none"
                            style={[styles.urlInput, { color: colors.foreground }]}
                          />
                        </View>
                      </FieldRow>

                      {/* Organizer Contacts Editor */}
                      <View style={styles.contactsSection}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={[fieldStyles.label, { color: colors.muted }]}>COORDINATOR CONTACTS (WHATSAPP)</Text>
                          <Pressable
                            onPress={addContact}
                            accessibilityRole="button"
                            accessibilityLabel="Add coordinator contact"
                            style={({ pressed }) => [
                              styles.addContactBtn,
                              { backgroundColor: colors.highlight },
                              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                              pressed && { opacity: 0.7 },
                            ]}
                          >
                            <Plus size={13} color={colors.primary} weight="bold" />
                            <Text style={[styles.addContactText, { color: colors.primary }]}>Add Contact</Text>
                          </Pressable>
                        </View>

                        {editableItem.contacts && editableItem.contacts.length > 0 ? (
                          editableItem.contacts.map((contact, idx) => (
                            <View key={idx} style={[styles.contactRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
                              <TextInput
                                value={contact.name}
                                onChangeText={(val) => updateContact(idx, 'name', val)}
                                placeholder="Name (e.g. Rahul)"
                                placeholderTextColor={colors.muted}
                                style={[styles.contactNameInput, { color: colors.foreground }]}
                              />
                              <TextInput
                                value={contact.phone}
                                onChangeText={(val) => updateContact(idx, 'phone', val)}
                                placeholder="10-digit Phone"
                                placeholderTextColor={colors.muted}
                                keyboardType="phone-pad"
                                style={[styles.contactPhoneInput, { color: colors.foreground }]}
                              />
                              <Pressable
                                onPress={() => removeContact(idx)}
                                accessibilityRole="button"
                                accessibilityLabel={`Remove contact ${contact.name || idx + 1}`}
                                style={({ pressed }) => [
                                  styles.contactRemoveBtn,
                                  Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                                  pressed && { opacity: 0.5 },
                                ]}
                              >
                                <Trash size={15} color={colors.error} />
                              </Pressable>
                            </View>
                          ))
                        ) : (
                          <Text style={{ ...typography.caption, color: colors.muted, fontStyle: 'italic' }}>
                            No contacts attached. Click "Add Contact" to provide direct WhatsApp chat buttons.
                          </Text>
                        )}
                      </View>

                      {/* Raw OCR / Blurb */}
                      <View>
                        <Text style={[styles.fieldLabel, { color: colors.muted }]}>Description & OCR Caption</Text>
                        <TextInput
                          value={editableItem.rawCaption}
                          onChangeText={(v) => updateField('rawCaption', v)}
                          multiline
                          numberOfLines={3}
                          style={[
                            styles.rawInput,
                            { color: colors.foregroundSecondary, backgroundColor: colors.background, borderColor: colors.border },
                          ]}
                        />
                      </View>
                    </View>

                    {/* Action Buttons: Soft Reject & Approve */}
                    <View style={[styles.actions, { borderTopColor: colors.border }]}>
                      <Pressable
                        onPress={triggerReject}
                        disabled={isProcessing}
                        accessibilityRole="button"
                        accessibilityLabel="Reject event submission"
                        style={({ pressed }) => [
                          styles.actionBtn,
                          {
                            borderColor: colors.error,
                            transform: [{ scale: pressed ? 0.95 : 1 }],
                            opacity: isProcessing ? 0.5 : 1,
                          },
                          Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                        ]}
                      >
                        <X size={20} weight="bold" color={colors.error} />
                        <Text style={[styles.actionBtnText, { color: colors.error }]}>Reject</Text>
                      </Pressable>

                      <Pressable
                        onPress={triggerApprove}
                        disabled={isProcessing}
                        accessibilityRole="button"
                        accessibilityLabel={isProcessing ? "Approving event" : "Approve and publish event"}
                        style={({ pressed }) => [
                          styles.actionBtn,
                          styles.approveBtn,
                          {
                            backgroundColor: colors.accent,
                            borderColor: colors.accent,
                            transform: [{ scale: pressed ? 0.95 : 1 }],
                            opacity: isProcessing ? 0.5 : 1,
                          },
                          Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                        ]}
                      >
                        {isProcessing ? (
                          <ActivityIndicator size="small" color={colors.onAccent} />
                        ) : (
                          <>
                            <Check size={20} weight="bold" color={colors.onAccent} />
                            <Text style={[styles.actionBtnText, { color: colors.onAccent }]}>Approve</Text>
                          </>
                        )}
                      </Pressable>
                    </View>
                  </View>
                </Animated.View>

                {/* Stacked Card Deck Below Cockpit */}
                {nextItem && (
                  <View style={styles.deckContainer}>
                    {thirdItem && (
                      <View style={[styles.deckLayer3, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.deckLayer3Text, { color: colors.muted }]} numberOfLines={1}>
                          +{remaining - 2} more: "{thirdItem.title || 'Untitled'}" · {thirdItem.sourceHandle}
                        </Text>
                      </View>
                    )}

                    <View style={[styles.deckCard, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.card]}>
                      <View style={styles.deckCardHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Stack size={16} color={colors.primary} weight="bold" />
                          <Text style={[styles.deckLabel, { color: colors.primary }]}>UP NEXT IN STACK</Text>
                        </View>
                        <Text style={[styles.deckCounter, { color: colors.muted }]}>#{remaining - 1} remaining</Text>
                      </View>

                      <View style={styles.deckContent}>
                        {nextItem.image ? (
                          <Image source={{ uri: getOptimizedImageUrl(nextItem.image, 200) }} style={styles.deckThumb} resizeMode="cover" />
                        ) : (
                          <View style={[styles.deckThumb, { backgroundColor: colors.highlight, justifyContent: 'center', alignItems: 'center' }]}>
                            <CalendarBlank size={22} color={colors.muted} />
                          </View>
                        )}
                        <View style={{ flex: 1, gap: 4 }}>
                          <Text style={[styles.deckTitle, { color: colors.foreground }]} numberOfLines={1}>
                            {nextItem.title || 'Untitled Event'}
                          </Text>
                          <Text style={[styles.deckMeta, { color: colors.muted }]} numberOfLines={1}>
                            {nextItem.sourceHandle} · {nextItem.date || 'Date TBA'} · {nextItem.venue || 'Venue TBA'}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() => {
                            setQueue((prev) => [prev[1], prev[0], ...prev.slice(2)]);
                            setEditableItem({ ...nextItem });
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`Review next event, ${nextItem.title || 'Untitled'}`}
                          style={({ pressed }) => [
                            styles.deckSwitchBtn,
                            { backgroundColor: colors.highlight, borderColor: colors.border },
                            Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                            pressed && { opacity: 0.7 },
                          ]}
                        >
                          <Text style={[styles.deckSwitchText, { color: colors.foreground }]}>Review</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                )}
              </>
            )}
          </>
        )}

        {/* TAB 2: REJECTED ARCHIVE WITH FULL UNDO & RESTORE */}
        {activeTab === 'rejected' && (
          <View style={styles.rejectedContainer}>
            {rejectedList.length === 0 ? (
              <View style={styles.centerContainer}>
                <View style={[styles.zeroCircle, { backgroundColor: colors.highlight }]}>
                  <Archive size={44} color={colors.primary} weight="duotone" />
                </View>
                <Text style={[styles.authTitle, { color: colors.foreground, marginTop: 16, textAlign: 'center' }]}>
                  No Rejected Items
                </Text>
                <Text style={[styles.authSub, { color: colors.muted, maxWidth: 320 }]}>
                  Events rejected during review are safely stored here. You can undo and restore them back to the active queue at any time.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 14 }}>
                <Text style={[styles.queueProgressText, { color: colors.muted, marginBottom: 4 }]}>
                  {rejectedList.length} soft-deleted items in archive. Tap Undo to restore to Pending Review.
                </Text>

                {rejectedList.map((item) => {
                  const itemCatMeta = getCategoryMeta(item.eventType);
                  const ItemCatIcon = itemCatMeta.icon;

                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.rejectedCard,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        shadows.card,
                      ]}
                    >
                      {/* Left: Thumbnail (tappable to view high-res lightbox) */}
                      <Pressable
                        onPress={() => openLightbox(item.image, item.title)}
                        accessibilityRole="button"
                        accessibilityLabel={`Inspect flyer for ${item.title || 'Untitled event'}`}
                        style={[styles.rejectedThumbWrap, { backgroundColor: colors.highlight }]}
                      >
                        {item.image ? (
                          <Image
                            source={{ uri: getOptimizedImageUrl(item.image, 200) }}
                            style={styles.rejectedThumb}
                            resizeMode="cover"
                          />
                        ) : (
                          <CalendarBlank size={24} color={colors.muted} />
                        )}
                        <View style={styles.rejectedZoomOverlay}>
                          <MagnifyingGlassPlus size={14} color="#FFFFFF" weight="bold" />
                        </View>
                      </Pressable>

                      {/* Right: Info & Actions */}
                      <View style={{ flex: 1, gap: 6 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <View style={[styles.categoryMiniBadge, { backgroundColor: itemCatMeta.color }]}>
                            <ItemCatIcon size={10} color="#FFFFFF" weight="bold" />
                            <Text style={styles.categoryMiniBadgeText}>{itemCatMeta.tag}</Text>
                          </View>
                          <Text style={[styles.sourceHandle, { color: colors.muted }]} numberOfLines={1}>
                            {item.sourceHandle}
                          </Text>
                        </View>

                        <Text style={[styles.rejectedTitle, { color: colors.foreground }]} numberOfLines={2}>
                          {item.title || 'Untitled Event'}
                        </Text>

                        <Text style={[styles.rejectedMeta, { color: colors.muted }]} numberOfLines={1}>
                          {item.venue || 'Venue TBA'} · {item.date || 'Date TBA'}
                        </Text>

                        {/* Action Buttons: Undo Restore & Direct Approve */}
                        <View style={styles.rejectedActionsRow}>
                          <Pressable
                            onPress={() => handleRestoreRejected(item)}
                            disabled={isProcessing}
                            accessibilityRole="button"
                            accessibilityLabel={`Restore ${item.title || 'event'} to pending review`}
                            style={({ pressed }) => [
                              styles.restoreBtn,
                              { backgroundColor: colors.highlight, borderColor: colors.border },
                              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                              pressed && { opacity: 0.7 },
                            ]}
                          >
                            <ArrowCounterClockwise size={14} color={colors.primary} weight="bold" />
                            <Text style={[styles.restoreBtnText, { color: colors.primary }]}>Undo / Restore</Text>
                          </Pressable>

                          <Pressable
                            onPress={() => handleApproveRejected(item)}
                            disabled={isProcessing}
                            accessibilityRole="button"
                            accessibilityLabel={`Approve and publish ${item.title || 'event'}`}
                            style={({ pressed }) => [
                              styles.restoreApproveBtn,
                              { backgroundColor: colors.accent },
                              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                              pressed && { opacity: 0.8 },
                            ]}
                          >
                            <CheckCircle size={14} color={colors.onAccent} weight="bold" />
                            <Text style={[styles.restoreApproveText, { color: colors.onAccent }]}>Approve Now</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Category Selector Modal */}
      <Modal
        visible={categoryPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryPickerVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setCategoryPickerVisible(false)}
          accessibilityRole="button"
          accessibilityLabel="Close category picker"
        >
          <Pressable
            accessibilityRole="none"
            accessibilityLabel="Category selector modal sheet"
            style={[
              styles.pickerSheet,
              { backgroundColor: colors.surface, borderColor: colors.border },
              shadows.card,
              Platform.OS === 'web' && ({ maxWidth: 440, width: '90%', alignSelf: 'center' } as any),
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, { color: colors.foreground }]}>Select Category</Text>
              <Pressable
                onPress={() => setCategoryPickerVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close category picker"
              >
                <X size={18} color={colors.foreground} weight="bold" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ gap: 8, padding: 16 }}>
              {CATEGORIES.filter((c) => c !== 'All').map((cat) => {
                const meta = getCategoryMeta(cat);
                const Icon = meta.icon;
                const isSelected = editableItem?.eventType === cat;

                return (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      updateField('eventType', cat);
                      setCategoryPickerVisible(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Select category ${meta.label}`}
                    style={({ pressed }) => [
                      styles.categoryOption,
                      {
                        backgroundColor: isSelected ? meta.color : colors.background,
                        borderColor: isSelected ? meta.color : colors.border,
                      },
                      Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                      pressed && { opacity: 0.75 },
                    ]}
                  >
                    <Icon size={18} color={isSelected ? '#FFFFFF' : meta.color} weight="bold" />
                    <Text
                      style={[
                        styles.categoryOptionText,
                        { color: isSelected ? '#FFFFFF' : colors.foreground, fontWeight: isSelected ? '700' : '500' },
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* High-Resolution Poster Lightbox Modal */}
      <PosterLightboxModal
        visible={lightboxVisible}
        imageUri={lightboxImage}
        title={lightboxTitle}
        subtitle="Curator High-Res Flyer Inspector"
        onClose={() => setLightboxVisible(false)}
      />
    </>
  );
}

function FieldRow({
  label,
  children,
  colors,
  compact,
}: {
  label: string;
  children: React.ReactNode;
  colors: any;
  compact?: boolean;
}) {
  return (
    <View style={compact ? fieldStyles.compactWrap : fieldStyles.wrap}>
      <Text style={[fieldStyles.label, { color: colors.muted }]}>{label}</Text>
      {children}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: {
    gap: 4,
  },
  compactWrap: {
    gap: 4,
    flex: 1,
  },
  label: {
    ...typography.labelCaps,
    fontSize: 10,
    letterSpacing: 1.2,
  },
});

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 400,
  },
  zeroCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  authContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  authTitle: {
    ...typography.displayMd,
    marginTop: 24,
    marginBottom: 8,
  },
  authSub: {
    ...typography.bodyMd,
    textAlign: 'center',
    marginBottom: 32,
  },
  shieldBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  authForm: {
    width: '100%',
    gap: 14,
  },
  fieldLabelText: {
    ...typography.labelSm,
    fontWeight: '600',
    marginBottom: 6,
  },
  authInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
  },
  authInput: {
    flex: 1,
    fontSize: 14,
    outlineStyle: 'none' as any,
  },
  authBtn: {
    width: '100%',
    height: 50,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  authBtnText: {
    ...typography.labelMd,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: radii.md,
    padding: 10,
    width: '100%',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#DC2626',
  },
  coordinatorTag: {
    ...typography.caption,
    fontSize: 11,
    marginTop: 2,
  },
  studioSignOutBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: radii.full,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: radii.full,
  },
  tabBtnText: {
    ...typography.labelSm,
    fontWeight: '700',
  },
  queueMetaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  queueProgressText: {
    ...typography.labelSm,
    fontSize: 12,
  },
  queueSwipeHint: {
    ...typography.labelSm,
    fontSize: 11,
    opacity: 0.7,
  },
  cockpit: {
    borderRadius: radii.xxl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imagePanel: {
    width: '100%',
    height: 270,
    position: 'relative',
  },
  imageBg: {
    ...StyleSheet.absoluteFill,
    opacity: 0.45,
  },
  sourceImage: {
    ...StyleSheet.absoluteFill,
    resizeMode: 'contain',
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sourceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sourceHandle: {
    ...typography.labelMd,
    color: '#FFFFFF',
    fontSize: 12,
  },
  sourceTime: {
    ...typography.labelSm,
    color: '#FFFFFF',
    fontSize: 10,
  },
  inspectBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  inspectBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  editPanel: {
    padding: 20,
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  editHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editTitle: {
    ...typography.titleXl,
  },
  editHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reAnalyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  reAnalyzeText: {
    ...typography.labelCaps,
    fontSize: 10,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  confidenceText: {
    ...typography.labelCaps,
    fontSize: 10,
  },
  fields: {
    gap: 16,
  },
  fieldLabel: {
    ...typography.labelCaps,
    fontSize: 10,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  fieldInput: {
    ...typography.bodyMd,
    borderBottomWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  fieldInputCompact: {
    ...typography.labelMd,
    borderBottomWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  categorySelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 4,
  },
  categorySelectText: {
    ...typography.labelMd,
    fontWeight: '700',
  },
  dateTimeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: 12,
  },
  urlInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 10,
    height: 42,
  },
  urlInput: {
    flex: 1,
    fontSize: 13,
  },
  contactsSection: {
    gap: 8,
  },
  addContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  addContactText: {
    fontSize: 11,
    fontWeight: '700',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  contactNameInput: {
    flex: 1,
    fontSize: 13,
  },
  contactPhoneInput: {
    flex: 1,
    fontSize: 13,
  },
  contactRemoveBtn: {
    padding: 4,
  },
  rawInput: {
    ...typography.labelMd,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 10,
    fontSize: 12,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: radii.xl,
    borderWidth: 1,
  },
  approveBtn: {
    borderWidth: 0,
  },
  actionBtnText: {
    ...typography.labelMd,
    fontWeight: '700',
  },
  deckContainer: {
    marginTop: 20,
    width: '100%',
    position: 'relative',
    marginBottom: 40,
  },
  deckLayer3: {
    marginHorizontal: 16,
    marginBottom: -18,
    paddingTop: 8,
    paddingBottom: 26,
    paddingHorizontal: 16,
    borderRadius: radii.xl,
    borderWidth: 1,
    opacity: 0.6,
    transform: [{ scale: 0.95 }],
  },
  deckLayer3Text: {
    ...typography.labelSm,
    fontSize: 11,
    textAlign: 'center',
  },
  deckCard: {
    borderRadius: radii.xxl,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  deckCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deckLabel: {
    ...typography.labelCaps,
    fontSize: 10,
    letterSpacing: 1.1,
    fontWeight: '800',
  },
  deckCounter: {
    ...typography.labelSm,
    fontSize: 11,
  },
  deckContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deckThumb: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  deckTitle: {
    ...typography.titleSm,
    fontSize: 14,
    fontWeight: '700',
  },
  deckMeta: {
    ...typography.bodySm,
    fontSize: 12,
  },
  deckSwitchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  deckSwitchText: {
    ...typography.labelSm,
    fontSize: 11,
    fontWeight: '600',
  },
  rejectedContainer: {
    marginTop: 8,
    marginBottom: 40,
  },
  rejectedCard: {
    flexDirection: 'row',
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    alignItems: 'center',
  },
  rejectedThumbWrap: {
    width: 80,
    height: 80,
    borderRadius: radii.lg,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectedThumb: {
    width: '100%',
    height: '100%',
  },
  rejectedZoomOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radii.full,
    padding: 4,
  },
  categoryMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  categoryMiniBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  rejectedTitle: {
    ...typography.titleSm,
    fontSize: 14,
    lineHeight: 18,
  },
  rejectedMeta: {
    ...typography.caption,
    fontSize: 11,
  },
  rejectedActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  restoreBtnText: {
    ...typography.labelSm,
    fontSize: 11,
    fontWeight: '700',
  },
  restoreApproveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  restoreApproveText: {
    ...typography.labelSm,
    fontSize: 11,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  pickerSheet: {
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  pickerTitle: {
    ...typography.titleSm,
    fontSize: 15,
    fontWeight: '700',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  categoryOptionText: {
    fontSize: 13,
  },
});
