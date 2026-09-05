import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { showAlert } from '../utils/alert';
import { ImageSquare, Clock, MapPin, Sparkle, ShieldWarning, CalendarBlank } from 'phosphor-react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import { useTheme, typography, radii, shadows } from '../theme';
import SectionLabel from '../components/SectionLabel';
import FloatingField from '../components/FloatingField';
import { enhanceEventDraft } from '../utils/geminiAI';
import { db, auth } from '../config/firebase';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { httpsCallable, apiErrorMessage } from '../utils/vercelClient';
import { onCoordinatorChange } from '../utils/session';
import { getClubAvatar } from '../data/avatars';

type Props = {
  onNavigate?: (tab: string) => void;
};

export default function SubmitScreen(props: Props) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [desc, setDesc] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [geminiCategory, setGeminiCategory] = useState<string>('Independent');
  const [geminiConfidence, setGeminiConfidence] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<number>(0.8);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (event.type === 'set' && selectedDate) {
      const day = selectedDate.getDate();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[selectedDate.getMonth()];
      const year = selectedDate.getFullYear();
      setDate(`${day} ${month} ${year}`);
    }
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (event.type === 'set' && selectedTime) {
      let hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
      setTime(`${hours}:${minStr} ${ampm}`);
    }
  };

  const [coordinator, setCoordinator] = useState<boolean | null>(null);

  // F-34: Submit writes to Firestore under rules that require the coordinator
  // claim. Check up front so an unverified user gets an explanation instead of
  // a permission error after filling in the whole form.
  React.useEffect(
    () => onCoordinatorChange(({ isCoordinator }) => setCoordinator(isCoordinator)),
    [],
  );

  const handleAIPolish = async () => {
    if (!title && !desc) return;
    setIsPolishing(true);
    try {
      const enhanced = await enhanceEventDraft(title, desc);
      if (enhanced.polishedTitle) setTitle(enhanced.polishedTitle);
      if (enhanced.polishedBlurb) setDesc(enhanced.polishedBlurb);
    } catch (error) {
      showAlert('AI Polish Unavailable', apiErrorMessage(error));
    } finally {
      setIsPolishing(false);
    }
  };

  const handlePickImage = async () => {
    if (isAnalyzing || isSubmitting) return;
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        showAlert('Permission required', 'You need to grant camera roll permissions to upload a poster.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Let users upload any aspect ratio
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const base64Str = asset.base64 || '';
        setImageUri(asset.uri);
        setImageBase64(base64Str || null);
        const ratio = asset.width && asset.height ? asset.width / asset.height : 0.8;
        setAspectRatio(ratio);

        // Send to Gemini Vision via Cloud Function (F—05: key stays server-side)
        setIsAnalyzing(true);
        try {
          const mimeType = asset.mimeType || 'image/jpeg';
          const parseRemote = httpsCallable('parseEventPoster');
          const { data: parsed }: any = await parseRemote({ imageB64: base64Str, mimeType });

          if (parsed.title) setTitle(parsed.title);
          if (parsed.date) setDate(parsed.date);
          if (parsed.startTime) setTime(parsed.startTime);
          if (parsed.venue) setVenue(parsed.venue);
          if (parsed.summary) setDesc(parsed.summary);
          if (parsed.category) setGeminiCategory(parsed.category);
          if (parsed.confidenceScore) setGeminiConfidence(parsed.confidenceScore);
        } catch (err) {
          console.error('Gemini extraction error:', err);
          showAlert('Note', 'Poster uploaded. Could not parse all fields automatically — please fill details manually.');
        } finally {
          setIsAnalyzing(false);
        }
      }
    } catch (err) {
      console.error('Image picker error:', err);
    }
  };

  const uploadToCloudinary = async (base64Image: string): Promise<string> => {
    // F-06: signed upload. The API mints a short-lived signature server-side,
    // so no unsigned preset is exposed in the client bundle.
    const { data: sig } = await httpsCallable('getCloudinarySignature')({});
    if (!sig?.signature) throw new Error('Could not authorise the upload.');

    const dataUri = base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`;
    const formData = new FormData();
    formData.append('file', dataUri);
    formData.append('folder', 'loop_events');
    formData.append('timestamp', String(sig.timestamp));
    formData.append('signature', sig.signature);
    formData.append('api_key', sig.apiKey);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Cloudinary upload failed: ${res.statusText}`);
    }

    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async () => {
    if (isSubmitting || isAnalyzing) return;

    if (!title || !date || !time || !venue) {
      showAlert('Missing Details', 'Please fill in the Event Name, Date, Time, and Venue.');
      return;
    }

    setIsSubmitting(true);
    try {
      let downloadURL = '';
      if (imageBase64) {
        try {
          downloadURL = await uploadToCloudinary(imageBase64);
        } catch (e) {
          console.error('Image upload error:', e);
          showAlert('Upload Error', 'Could not upload the poster image. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      if (!downloadURL) {
        showAlert('Missing Poster', 'Please upload an event poster before submitting.');
        setIsSubmitting(false);
        return;
      }

      // Parse date+time into a Firestore Timestamp for sorting/expiry (F-14, F-15)
      let startsAt: Timestamp | null = null;
      try {
        const combined = new Date(date + ' ' + time);
        if (!isNaN(combined.getTime())) {
          startsAt = Timestamp.fromDate(combined);
        }
      } catch { /* startsAt stays null — will be filled by backfill or coordinator */ }

      // Read real club identity from claims (F-19)
      let realHost = 'Campus Club';
      let realAvatar = getClubAvatar('iitdelhi');
      try {
        const tokenResult = await auth.currentUser?.getIdTokenResult();
        if (tokenResult?.claims?.clubId) {
          realHost = tokenResult.claims.clubId as string;
          realAvatar = getClubAvatar(realHost);
        }
      } catch (e) {
        console.error('Failed to get club claims', e);
      }

      await addDoc(collection(db, 'events'), {
        title,
        date,
        time,
        venue,
        blurb: desc || title + ' happening at ' + venue + '.',
        image: downloadURL,
        category: geminiCategory,
        confidence: geminiConfidence <= 1 ? geminiConfidence : geminiConfidence / 100,
        status: 'pending',
        host: realHost,
        hostAvatar: realAvatar,
        aspectRatio: aspectRatio,
        createdAt: serverTimestamp(),
        ...(startsAt ? { startsAt } : {}),
      });

      showAlert('Success', 'Event submitted successfully! It is now pending verification in the Staging Queue.');
      setTitle('');
      setDate('');
      setTime('');
      setVenue('');
      setDesc('');
      setImageUri(null);
      setImageBase64(null);
      
      if (props.onNavigate) {
        props.onNavigate('queue');
      }
    } catch (error) {
      console.error('Submit Error:', error);
      showAlert('Submission Failed', 'An error occurred while submitting the event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedMonth = React.useMemo(() => {
    if (!date) return 'DATE';
    try {
      const d = new Date(date);
      if (!isNaN(d.getTime())) return d.toLocaleString('default', { month: 'short' }).toUpperCase();
    } catch (_) {}
    const parts = date.split(/[\s-/]+/);
    return parts[1]?.slice(0, 3)?.toUpperCase() || 'OCT';
  }, [date]);

  const formattedDay = React.useMemo(() => {
    if (!date) return '00';
    try {
      const d = new Date(date);
      if (!isNaN(d.getTime())) return d.getDate().toString().padStart(2, '0');
    } catch (_) {}
    const match = date.match(/\d{1,2}/);
    return match ? match[0].padStart(2, '0') : '01';
  }, [date]);

  if (coordinator === false) {
    return (
      <View style={styles.gateContainer}>
        <ShieldWarning size={44} color={colors.primary} weight="duotone" />
        <Text style={[styles.gateTitle, { color: colors.foreground }]}>Coordinator access required</Text>
        <Text style={[styles.gateBody, { color: colors.muted }]}>
          Publishing events is limited to verified club coordinators. Sign in from the
          Queue tab with your club account to create an event.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.mainLayout, isDesktop && styles.desktopLayout]}>
        {/* Left Column: Form Section */}
        <View style={[styles.formColumn, isDesktop && styles.desktopFormColumn]}>
          <SectionLabel>Creator Portal</SectionLabel>
          <Text style={[styles.heading, { color: colors.foreground }]}>Create Event</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Craft an exclusive experience for the IIT Delhi community.
          </Text>

          {/* Upload Area */}
          <Pressable
            onPress={handlePickImage}
            disabled={isAnalyzing}
            style={({ pressed }) => [
              styles.upload,
              {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : colors.border,
                backgroundColor: isDark ? colors.surface : 'rgba(138, 21, 56, 0.02)',
                opacity: isAnalyzing ? 0.6 : 1,
              },
              Platform.OS === 'web' && ({
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }),
              pressed && { transform: [{ scale: 0.99 }] },
            ]}
          >
            {imageUri ? (
              <View style={{ flex: 1, width: '100%', height: '100%' }}>
                <Image source={{ uri: imageUri }} style={[StyleSheet.absoluteFill, { borderRadius: radii.xl }]} />
                <Pressable
                  onPress={() => {
                    setImageUri(null);
                    setImageBase64(null);
                  }}
                  style={({ pressed }) => [
                    {
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    },
                    pressed && { opacity: 0.7 },
                    Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                  ]}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>✕</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.uploadInner}>
                <View style={[styles.uploadIconCircle, { backgroundColor: colors.highlight }]}>
                  <ImageSquare size={32} color={colors.primary} weight="regular" />
                </View>
                <Text style={[styles.uploadText, { color: colors.foreground }]}>
                  Tap or click to upload cover poster
                </Text>
                <Text style={[styles.uploadHint, { color: colors.muted }]}>
                  High-res vertical image recommended (4:5)
                </Text>
              </View>
            )}
          </Pressable>

          {/* Form Fields */}
          <View style={styles.formFields}>
            <FloatingField label="Event Name" value={title} onChangeText={setTitle} />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
                  <View style={{ flex: 1 }}>
                    <FloatingField label="Date (e.g. 15 Oct)" value={date} onChangeText={setDate} />
                  </View>
                  <Pressable
                    onPress={() => setShowDatePicker(true)}
                    style={({ pressed }) => [
                      styles.pickerBtn,
                      { borderColor: colors.border, backgroundColor: colors.surface },
                      pressed && { opacity: 0.7 },
                    ]}
                    accessibilityLabel="Pick date from calendar"
                    accessibilityRole="button"
                  >
                    <CalendarBlank size={18} color={colors.primary} weight="bold" />
                  </Pressable>
                </View>
                {showDatePicker && (
                  <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                  />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
                  <View style={{ flex: 1 }}>
                    <FloatingField label="Time (e.g. 6:30 PM)" value={time} onChangeText={setTime} />
                  </View>
                  <Pressable
                    onPress={() => setShowTimePicker(true)}
                    style={({ pressed }) => [
                      styles.pickerBtn,
                      { borderColor: colors.border, backgroundColor: colors.surface },
                      pressed && { opacity: 0.7 },
                    ]}
                    accessibilityLabel="Pick time"
                    accessibilityRole="button"
                  >
                    <Clock size={18} color={colors.primary} weight="bold" />
                  </Pressable>
                </View>
                {showTimePicker && (
                  <DateTimePicker
                    value={new Date()}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                  />
                )}
              </View>
            </View>
            <FloatingField label="Venue Location" value={venue} onChangeText={setVenue} />
            <View style={styles.aiCopyRow}>
              <Text style={[styles.fieldSectionLabel, { color: colors.muted }]}>Description & Copywriting</Text>
              <Pressable
                onPress={handleAIPolish}
                disabled={isPolishing || (!title && !desc)}
                style={({ pressed }) => [
                  styles.aiPolishBtn,
                  { backgroundColor: colors.highlight, borderColor: colors.border },
                  Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'all 0.15s ease' } as any),
                  pressed && { transform: [{ scale: 0.95 }] },
                ]}
              >
                <Sparkle size={14} color={colors.primary} weight="fill" />
                <Text style={[styles.aiPolishBtnText, { color: colors.primary }]}>
                  {isPolishing ? 'Polishing...' : '✨ AI Polish Copy'}
                </Text>
              </Pressable>
            </View>
            <FloatingField label="Brief Description" value={desc} onChangeText={setDesc} multiline />
          </View>

          {/* Submit Action */}
          <View style={[styles.submitRow, { borderTopColor: colors.border }]}>
            <Pressable
              onPress={handleSubmit}
              disabled={isAnalyzing || isSubmitting}
              style={({ pressed }) => [
                styles.submitBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: isAnalyzing || isSubmitting ? 0.6 : 1,
                },
                Platform.OS === 'web' && ({
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 14px rgba(138, 21, 56, 0.2)',
                }),
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={colors.onPrimary} />
              ) : (
                <Text style={[styles.submitText, { color: colors.onPrimary }]}>Create Event</Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Right Column: Sticky Live Preview */}
        <View style={[styles.previewColumn, isDesktop && styles.desktopPreviewColumn]}>
          <SectionLabel>Live Preview</SectionLabel>
          <Text style={[styles.previewHeading, { color: colors.foreground }]}>Preview Card</Text>

          <View
            style={[
              styles.previewCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              shadows.card,
            ]}
          >
            <View style={[styles.previewImage, { backgroundColor: colors.accent }]}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : (
                <View style={[styles.placeholderArt, { backgroundColor: isDark ? colors.accent : '#F7EBF0' }]}>
                  <ImageSquare size={32} color={colors.primary} weight="duotone" />
                  <Text style={[styles.placeholderText, { color: colors.primary }]}>Image Preview</Text>
                </View>
              )}
              <View style={styles.previewGradient} />

              {/* Status Badge */}
              <View style={[styles.draftBadge, { backgroundColor: isDark ? 'rgba(24, 24, 27, 0.85)' : 'rgba(255, 255, 255, 0.85)' }]}>
                <View style={[styles.draftDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.draftText, { color: colors.foreground }]}>Draft</Text>
              </View>

              {/* Date Badge */}
              <View style={[styles.dateBadge, { backgroundColor: isDark ? 'rgba(24, 24, 27, 0.9)' : '#FFFFFF' }]}>
                <Text style={[styles.monthText, { color: colors.primary }]}>{formattedMonth}</Text>
                <Text style={[styles.dayNum, { color: colors.foreground }]}>{formattedDay}</Text>
              </View>

              {/* Analyzing Overlay */}
              {isAnalyzing && (
                <BlurView intensity={50} tint={isDark ? 'dark' : 'light'} style={styles.analyzingOverlay}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <View style={[styles.analyzingBadge, { backgroundColor: isDark ? 'rgba(24,24,27,0.9)' : 'rgba(255,255,255,0.9)' }]}>
                    <Sparkle size={16} color={colors.primary} weight="fill" />
                    <Text style={[styles.analyzingText, { color: colors.foreground }]}>
                      Gemini Vision extracting details...
                    </Text>
                  </View>
                </BlurView>
              )}
            </View>

            <View style={styles.previewContent}>
              <Text style={[styles.previewTitle, { color: colors.foreground }]} numberOfLines={2}>
                {title || 'Untitled Event'}
              </Text>

              <View style={styles.previewRow}>
                <Clock size={16} color={colors.primary} weight="regular" />
                <Text style={[styles.previewText, { color: colors.muted }]}>
                  {time || 'Select Time'}
                </Text>
              </View>

              <View style={styles.previewRow}>
                <MapPin size={16} color={colors.primary} weight="regular" />
                <Text style={[styles.previewText, { color: colors.muted }]} numberOfLines={1}>
                  {venue || 'TBD Location'}
                </Text>
              </View>

              <Text style={[styles.previewDesc, { color: colors.muted }]} numberOfLines={3}>
                {desc || 'Add a brief description to see how it will appear on the student feed.'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  gateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  gateTitle: {
    ...typography.titleLg,
    fontSize: 20,
    textAlign: 'center',
  },
  gateBody: {
    ...typography.bodySm,
    textAlign: 'center',
    maxWidth: 340,
    lineHeight: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 64,
  },
  mainLayout: {
    flexDirection: 'column',
    gap: 36,
  },
  desktopLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 48,
  },
  formColumn: {
    flex: 1,
  },
  desktopFormColumn: {
    flex: 1.1,
    maxWidth: 640,
  },
  previewColumn: {
    width: '100%',
  },
  desktopPreviewColumn: {
    flex: 0.9,
    maxWidth: 420,
    position: 'sticky' as any,
    top: 24,
  },
  heading: {
    ...typography.displayMd,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.bodyMd,
    marginBottom: 24,
  },
  previewHeading: {
    ...typography.titleLg,
    marginBottom: 16,
  },
  upload: {
    minHeight: 180,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
    padding: 20,
  },
  uploadInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  uploadIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    ...typography.labelMd,
    fontSize: 15,
  },
  uploadHint: {
    ...typography.bodyXs,
  },
  formFields: {
    gap: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  // Preview Card
  previewCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewImage: {
    height: 220,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderArt: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    ...typography.labelSm,
    fontWeight: '500',
  },
  previewGradient: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  draftBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  draftDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  draftText: {
    ...typography.labelCaps,
    fontSize: 11,
    letterSpacing: 1,
  },
  dateBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
    alignItems: 'center',
    minWidth: 50,
  },
  monthText: {
    ...typography.labelCaps,
    fontSize: 10,
  },
  dayNum: {
    ...typography.displayMd,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  previewContent: {
    padding: 20,
    gap: 10,
  },
  previewTitle: {
    ...typography.titleLg,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewText: {
    ...typography.bodySm,
  },
  previewDesc: {
    ...typography.bodySm,
    marginTop: 4,
    lineHeight: 20,
  },
  aiCopyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 4,
  },
  fieldSectionLabel: {
    ...typography.labelSm,
    fontSize: 12,
    fontWeight: '600',
  },
  aiPolishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  pickerBtn: {
    height: 48,
    width: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  aiPolishBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  submitRow: {
    borderTopWidth: 1,
    paddingTop: 24,
    marginTop: 28,
    alignItems: 'flex-end',
  },
  submitBtn: {
    paddingHorizontal: 32,
    paddingVertical: 15,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    ...typography.labelMd,
    fontSize: 15,
    fontWeight: '600',
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        })
      : {}),
  },
  analyzingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
  },
  analyzingText: {
    ...typography.labelMd,
    fontSize: 13,
  },
});
