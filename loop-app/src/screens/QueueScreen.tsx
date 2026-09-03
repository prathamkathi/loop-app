import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView, RefreshControl,
  Pressable,
  Animated,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  PanResponder,
  Platform,
  Alert,
} from 'react-native';
import {
  Lock,
  Camera,
  Clock,
  Cpu,
  Check,
  X,
  ArrowsClockwise,
  CheckCircle,
  ShieldCheck,
  SignOut,
  Sparkle,
  User,
  Key,
} from 'phosphor-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, typography, radii, shadows, spacing } from '../theme';
import SectionLabel from '../components/SectionLabel';
import { type ScrapedItem } from '../data/queue';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  deleteDoc,
  limit,
} from 'firebase/firestore';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { httpsCallable } from '../utils/vercelClient';

export default function QueueScreen() {
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [queue, setQueue] = useState<ScrapedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editableItem, setEditableItem] = useState<ScrapedItem | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [studioUser, setStudioUser] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Restore authenticated coordinator session via Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setStudioUser(user.email);
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
        setStudioUser('');
      }
    });
    return unsubscribe;
  }, []);

  const fetchQueue = useCallback(async () => {
    if (!authenticated) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'events'), where("status", "==", "pending"), limit(50));
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          image: data.image,
          title: data.title || '',
          venue: data.venue || '',
          date: data.date || '',
          startTime: data.time || '',
          endTime: '',
          eventType: data.category || '',
          confidence: data.confidence || 0,
          tags: [],
          rawCaption: data.blurb || '',
          sourceHandle: data.host || 'Submitted via App',
          sourceTimestamp: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Just now',
        };
      }) as ScrapedItem[];
      setQueue(fetched);
      if (fetched.length > 0) {
        setEditableItem({ ...fetched[0] });
      }
    } catch (err) {
      console.error('Error fetching queue:', err);
    } finally {
      setLoading(false);
    }
  }, [authenticated]);

  useEffect(() => {
    fetchQueue();
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
      await updateDoc(doc(db, 'events', editableItem.id), {
        status: 'approved',
        title: editableItem.title,
        venue: editableItem.venue,
        date: editableItem.date,
        time: editableItem.startTime,
        endTime: editableItem.endTime || '',
        category: editableItem.eventType,
        blurb: editableItem.rawCaption,
        approvedAt: serverTimestamp(),
      });
      handleNext();
    } catch (err) {
      console.error('Approve error:', err);
      Alert.alert('Action Failed', 'Could not approve this event. Please try again or check your permissions.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (isProcessing || !editableItem) return;
    setIsProcessing(true);
    try {
      // F-25: Delete rejected events entirely to prevent DB bloat
      await deleteDoc(doc(db, 'events', editableItem.id));
      handleNext();
    } catch (err) {
      console.error('Reject error:', err);
      Alert.alert('Action Failed', 'Could not reject this event. Please try again or check your permissions.');
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
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (e, gesture) => {
        if (gesture.dx > 120) {
          // Swipe Right - Approve
          Animated.spring(pan, {
            toValue: { x: width + 100, y: 0 },
            useNativeDriver: false,
            bounciness: 10,
          }).start(() => {
            handleApprove();
          });
        } else if (gesture.dx < -120) {
          // Swipe Left - Reject
          Animated.spring(pan, {
            toValue: { x: -width - 100, y: 0 },
            useNativeDriver: false,
            bounciness: 10,
          }).start(() => {
            handleReject();
          });
        } else {
          // Spring back
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            bounciness: 12,
          }).start();
        }
      },
    })
  ).current;

  const updateField = (field: keyof ScrapedItem, value: string) => {
    if (editableItem) {
      setEditableItem({ ...editableItem, [field]: value });
    }
  };

  const handleReAnalyze = async () => {
    if (!editableItem) return;
    setIsAnalyzing(true);
    try {
      // Fetch image to base64 and send to Cloud Function
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

  const item = editableItem;

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
                placeholder="e.g. brca@iitd.ac.in"
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

  if (!item || remaining <= 0) {
    return (
      <View style={[styles.centerContainer, Platform.OS === 'web' && ({ maxWidth: 600, width: '100%', alignSelf: 'center' } as any)]}>
        <View style={[styles.zeroCircle, { backgroundColor: isDark ? 'rgba(138, 21, 56, 0.2)' : 'rgba(138, 21, 56, 0.08)' }]}>
          <CheckCircle size={52} weight="duotone" color={colors.primary} />
        </View>
        <Text style={[styles.authTitle, { color: colors.foreground, marginTop: 20, textAlign: 'center' }]}>All Caught Up</Text>
        <Text style={[styles.authSub, { color: colors.muted, maxWidth: 340 }]}>
          The staging queue is completely cleared. All pending event submissions have been processed.
        </Text>
        <Pressable
          onPress={fetchQueue}
          style={({ pressed }) => [
            { marginTop: 24, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
            Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
            pressed && { transform: [{ scale: 0.95 }] }
          ]}
        >
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Check for New Items</Text>
        </Pressable>
      </View>
    );
  }


  return (
    <ScrollView
      style={[
        styles.scroll,
        Platform.OS === 'web' && ({ maxWidth: 600, width: '100%', alignSelf: 'center' } as any),
      ]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <View>
          <SectionLabel style={{ marginBottom: 0 }}>Staging Queue</SectionLabel>
          <Text style={[styles.coordinatorTag, { color: colors.muted }]}>
            Verified: <Text style={{ color: colors.primary, fontWeight: '700' }}>{studioUser}</Text>
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={[styles.counterBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.pulseDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.counterText, { color: colors.muted }]}>
              {remaining} Pending
            </Text>
          </View>

          <Pressable
            onPress={handleStudioSignOut}
            style={({ pressed }) => [
              styles.studioSignOutBtn,
              { borderColor: colors.border, backgroundColor: colors.surface },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
              pressed && { transform: [{ scale: 0.94 }] },
            ]}
            accessibilityLabel="Sign out of Studio"
          >
            <SignOut size={16} color={colors.error} weight="bold" />
          </Pressable>
        </View>
      </View>

      {/* Main cockpit card */}
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
        {/* Image Panel */}
        <View style={[styles.imagePanel, { backgroundColor: colors.highlight }]}>
          <Image source={{ uri: item.image }} style={styles.sourceImage} />
          {/* Overlay Chips */}
          <View style={styles.imageOverlay}>
            <View style={styles.sourceChip}>
              <Camera size={14} weight="regular" color="#FFFFFF" />
              <Text style={styles.sourceHandle}>{item.sourceHandle}</Text>
            </View>
            <View style={styles.sourceChip}>
              <Clock size={12} weight="regular" color="#FFFFFF" />
              <Text style={styles.sourceTime}>{item.sourceTimestamp}</Text>
            </View>
          </View>
        </View>

        {/* Editing Panel */}
        <View style={styles.editPanel}>
          <View style={styles.editHeader}>
            <View style={styles.editHeaderLeft}>
              <Cpu size={20} weight="regular" color={colors.muted} />
              <Text style={[styles.editTitle, { color: colors.foreground }]}>Gemini Parsing</Text>
            </View>
            <View style={styles.editHeaderRight}>
              <Pressable
                onPress={handleReAnalyze}
                disabled={isAnalyzing}
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
                  Confidence: {Math.round(item.confidence * 100)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Editable Fields */}
          <View style={styles.fields}>
            <FieldRow label="Event Title" colors={colors}>
              <TextInput
                value={item.title}
                onChangeText={(v) => updateField('title', v)}
                style={[styles.fieldInput, { color: colors.foreground, borderColor: colors.border }]}
              />
            </FieldRow>
            <FieldRow label="Location" colors={colors}>
              <TextInput
                value={item.venue}
                onChangeText={(v) => updateField('venue', v)}
                style={[styles.fieldInput, { color: colors.foreground, borderColor: colors.border }]}
              />
            </FieldRow>

            {/* Date/Time Grid */}
            <View style={[styles.dateTimeGrid, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <FieldRow label="Date" colors={colors} compact>
                <TextInput
                  value={item.date}
                  onChangeText={(v) => updateField('date', v)}
                  style={[styles.fieldInputCompact, { color: colors.foreground, borderColor: colors.border }]}
                />
              </FieldRow>
              <FieldRow label="Start" colors={colors} compact>
                <TextInput
                  value={item.startTime}
                  onChangeText={(v) => updateField('startTime', v)}
                  style={[styles.fieldInputCompact, { color: colors.foreground, borderColor: colors.border }]}
                />
              </FieldRow>
              <FieldRow label="End" colors={colors} compact>
                <TextInput
                  value={item.endTime}
                  onChangeText={(v) => updateField('endTime', v)}
                  style={[styles.fieldInputCompact, { color: colors.foreground, borderColor: colors.border }]}
                />
              </FieldRow>
              <FieldRow label="Type" colors={colors} compact>
                <Text style={[styles.typeValue, { color: colors.foreground }]}>{item.eventType}</Text>
              </FieldRow>
            </View>

            {/* Tags */}
            <View style={styles.tagsSection}>
              <Text style={[styles.fieldLabel, { color: colors.muted }]}>Extracted Tags</Text>
              <View style={styles.tagsRow}>
                {item.tags.map((tag) => (
                  <View key={tag} style={[styles.tag, { backgroundColor: colors.highlight }]}>
                    <Check size={12} weight="bold" color={colors.primary} />
                    <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
                  </View>
                ))}
                <Pressable
                  style={[styles.addTag, { borderColor: colors.border }]}
                >
                  <Text style={[styles.addTagText, { color: colors.muted }]}>+ Add Tag</Text>
                </Pressable>
              </View>
            </View>

            {/* Raw Caption */}
            <View>
              <Text style={[styles.fieldLabel, { color: colors.muted }]}>Raw OCR / Caption</Text>
              <TextInput
                value={item.rawCaption}
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

          {/* Action Buttons */}
          <View style={[styles.actions, { borderTopColor: colors.border }]}>
            <Pressable
              onPress={triggerReject}
              disabled={isProcessing}
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

      {/* Stacked Next Card */}
      {remaining > 1 && (
        <View style={[styles.nextCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ArrowsClockwise size={28} weight="regular" color={colors.muted} />
          <Text style={[styles.nextText, { color: colors.muted }]}>Loading Next...</Text>
        </View>
      )}
    </ScrollView>
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
    minHeight: 450,
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
  authDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  divLine: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontSize: 11,
    fontWeight: '600',
  },
  rejectBtn: {
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  rejectText: {
    fontSize: 15,
    fontWeight: '600',
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
    marginBottom: 20,
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  counterText: {
    ...typography.labelMd,
    fontSize: 13,
  },
  cockpit: {
    borderRadius: radii.xxl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imagePanel: {
    width: '100%',
    height: 260,
    position: 'relative',
  },
  sourceImage: {
    ...StyleSheet.absoluteFill,
    resizeMode: 'cover',
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
    backgroundColor: 'rgba(0,0,0,0.45)',
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
  typeValue: {
    ...typography.bodyMd,
    paddingVertical: 6,
  },
  dateTimeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: 12,
  },
  tagsSection: {
    gap: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.md,
  },
  tagText: {
    ...typography.bodySm,
    fontSize: 12,
  },
  addTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addTagText: {
    ...typography.bodySm,
    fontSize: 12,
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
  nextCard: {
    marginTop: -20,
    marginHorizontal: 16,
    height: 80,
    borderRadius: radii.xxl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
    transform: [{ scale: 0.95 }],
    zIndex: -1,
    gap: 8,
    marginBottom: 40,
  },
  nextText: {
    ...typography.labelCaps,
    fontSize: 11,
  },
});
