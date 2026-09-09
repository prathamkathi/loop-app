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
import { useTheme, typography, radii, shadows, spacing } from '../theme';
import PageHeader from '../components/PageHeader';
import SectionLabel from '../components/SectionLabel';
import FloatingField from '../components/FloatingField';
import { enhanceEventDraft } from '../utils/geminiAI';
import { db, auth } from '../config/firebase';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { httpsCallable, apiErrorMessage } from '../utils/vercelClient';
import { onCoordinatorChange } from '../utils/session';
import { getClubAvatar } from '../data/avatars';
import { parseDateAndTimeString } from '../utils/dateParser';
import { CANONICAL_CATEGORIES, type CanonicalCategory } from '../data/categories';
import { normalizeCategory } from '../utils/categoryMeta';

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
  const [geminiCategory, setGeminiCategory] = useState<CanonicalCategory>('Cultural & Arts');
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

  const openDatePicker = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'date';
      input.style.position = 'fixed';
      input.style.opacity = '0';
      input.style.pointerEvents = 'none';
      document.body.appendChild(input);
      input.onchange = (e: any) => {
        const val = e.target.value;
        if (val) {
          const parts = val.split('-');
          if (parts.length === 3) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const day = parseInt(parts[2], 10);
            const monthName = months[parseInt(parts[1], 10) - 1];
            const year = parts[0];
            setDate(`${day} ${monthName} ${year}`);
          }
        }
        try { document.body.removeChild(input); } catch {}
      };
      if ('showPicker' in HTMLInputElement.prototype) {
        try {
          (input as any).showPicker();
        } catch {
          input.click();
        }
      } else {
        input.click();
      }
    } else {
      setShowDatePicker(true);
    }
  };

  const openTimePicker = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'time';
      input.style.position = 'fixed';
      input.style.opacity = '0';
      input.style.pointerEvents = 'none';
      document.body.appendChild(input);
      input.onchange = (e: any) => {
        const val = e.target.value;
        if (val) {
          const [hStr, mStr] = val.split(':');
          let hours = parseInt(hStr, 10);
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12;
          hours = hours ? hours : 12;
          setTime(`${hours}:${mStr} ${ampm}`);
        }
        try { document.body.removeChild(input); } catch {}
      };
      if ('showPicker' in HTMLInputElement.prototype) {
        try {
          (input as any).showPicker();
        } catch {
          input.click();
        }
      } else {
        input.click();
      }
    } else {
      setShowTimePicker(true);
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

          if (typeof parsed.title === 'string') setTitle(parsed.title);
          if (typeof parsed.date === 'string') setDate(parsed.date);
          if (typeof parsed.startTime === 'string') setTime(parsed.startTime);
          if (typeof parsed.venue === 'string') setVenue(parsed.venue);
          if (typeof parsed.summary === 'string') setDesc(parsed.summary);
          const category = normalizeCategory(parsed.category);
          if (category) setGeminiCategory(category);
          setGeminiConfidence(typeof parsed.confidenceScore === 'number' ? Math.min(1, Math.max(0, parsed.confidenceScore)) : 0);
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

    if (!title.trim() || !date.trim() || !time.trim() || !venue.trim()) {
      showAlert('Missing Details', 'Please fill in the Event Name, Date, Time, and Venue.');
      return;
    }

    const parsedDate = parseDateAndTimeString(date, time);
    if (!parsedDate || !parsedDate.hasTime) {
      showAlert('Check date and time', 'Enter a real date and start time, for example 15 Oct 2026 and 18:30.');
      return;
    }
    if (!coordinator) return;
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
      const startsAt = Timestamp.fromDate(parsedDate.date);

      // Read real club identity from claims (F-19)
      let realHost = 'Campus Club';
      let realAvatar = getClubAvatar('iitdelhi');
      try {
        const tokenResult = await auth.currentUser?.getIdTokenResult();
        if (tokenResult?.claims?.clubId) {
          realHost = (tokenResult.claims.clubId as string).replace(/^@+/, '').trim();
          realAvatar = getClubAvatar(realHost);
        }
      } catch (e) {
        console.error('Failed to get club claims', e);
      }

      await addDoc(collection(db, 'events'), {
        title: title.trim(),
        date: date.trim(),
        time: time.trim(),
        venue: venue.trim(),
        blurb: desc || title + ' happening at ' + venue + '.',
        image: downloadURL,
        category: geminiCategory,
        confidence: geminiConfidence <= 1 ? geminiConfidence : geminiConfidence / 100,
        status: 'pending',
        host: realHost.replace(/^@+/, '').trim(),
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
      setGeminiConfidence(0);
      setGeminiCategory('Cultural & Arts');
      
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
    if (!date) return '—';
    try {
      const d = new Date(date);
      if (!isNaN(d.getTime())) return d.toLocaleString('default', { month: 'short' }).toUpperCase();
    } catch (_) {}
    const parts = date.split(/[\s-/]+/);
    const candidate = parts[1]?.slice(0, 3)?.toUpperCase();
    if (candidate && /^[A-Z]{3}$/.test(candidate)) return candidate;
    return '—';
  }, [date]);

  const formattedDay = React.useMemo(() => {
    if (!date) return '—';
    try {
      const d = new Date(date);
      if (!isNaN(d.getTime())) return d.getDate().toString().padStart(2, '0');
    } catch (_) {}
    const match = date.match(/\b\d{1,2}\b/);
    return match ? match[0].padStart(2, '0') : '—';
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Story Creator Background (Active when image uploaded) */}
      {imageUri && (
        <View style={StyleSheet.absoluteFill}>
          <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.mainLayout, isDesktop && styles.desktopLayout]}>
          {/* Left Column: Form Section */}
          <View style={[styles.formColumn, isDesktop && styles.desktopFormColumn]}>
            <Text style={[styles.heading, { color: colors.foreground }]}>CREATE EVENT</Text>
            
            {/* Upload Area (Glassmorphic if background active) */}
            <Pressable
              onPress={handlePickImage}
              disabled={isAnalyzing}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.upload,
                {
                  borderColor: imageUri ? 'rgba(255,255,255,0.2)' : colors.border,
                  backgroundColor: imageUri ? 'rgba(0,0,0,0.3)' : colors.surface,
                },
                pressed && { transform: [{ scale: 0.99 }] },
              ]}
            >
              {imageUri ? (
                <View style={{ flex: 1, width: '100%', height: '100%' }}>
                  <Image source={{ uri: imageUri }} style={[StyleSheet.absoluteFill, { borderRadius: radii.xl }]} />
                  <Pressable onPress={() => { setImageUri(null); setImageBase64(null); }} style={styles.removeUploadBtn}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>✕</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.uploadInner}>
                  <View style={[styles.uploadIconCircle, { backgroundColor: colors.primary }]}>
                    <ImageSquare size={32} color="#000" weight="bold" />
                  </View>
                  <Text style={[typography.labelMd, { color: colors.foreground }]}>UPLOAD FLYER</Text>
                </View>
              )}
            </Pressable>

            {/* Form Fields - Glassmorphic Panels */}
            <View style={styles.formFields}>
              <View style={[styles.glassInputContainer, imageUri && styles.glassActive]}>
                <FloatingField label="EVENT NAME" value={title} onChangeText={setTitle} />
              </View>
              
              <Text style={[typography.labelMd, { color: colors.foreground, marginTop: 12 }]}>CATEGORY</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {CANONICAL_CATEGORIES.map((cat) => (
                  <Pressable key={cat} onPress={() => setGeminiCategory(cat)}
                    style={[styles.glassChip, imageUri && styles.glassActive, geminiCategory === cat && { borderColor: colors.primary }]}>
                    <Text style={[typography.labelSm, { color: geminiCategory === cat ? colors.primary : colors.foreground }]}>{cat}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.row}>
                <View style={[styles.glassInputContainer, imageUri && styles.glassActive, { flex: 1 }]}>
                  <FloatingField label="DATE" value={date} onChangeText={setDate} />
                </View>
                <View style={[styles.glassInputContainer, imageUri && styles.glassActive, { flex: 1 }]}>
                  <FloatingField label="TIME" value={time} onChangeText={setTime} />
                </View>
              </View>

              <View style={[styles.glassInputContainer, imageUri && styles.glassActive]}>
                <FloatingField label="VENUE" value={venue} onChangeText={setVenue} />
              </View>

              <View style={styles.aiCopyRow}>
                <Text style={[typography.labelMd, { color: colors.foreground }]}>COPYWRITING</Text>
                <Pressable onPress={handleAIPolish} disabled={isPolishing || (!title && !desc)}
                  style={({ pressed }) => [
                    styles.aiPolishBtn,
                    { borderColor: colors.accent, backgroundColor: isPolishing ? colors.accent : 'transparent' },
                    pressed && { transform: [{ scale: 0.95 }] },
                  ]}>
                  <Sparkle size={14} color={isPolishing ? '#FFF' : colors.accent} weight="fill" />
                  <Text style={[typography.labelSm, { color: isPolishing ? '#FFF' : colors.accent, fontWeight: 'bold' }]}>
                    {isPolishing ? 'POLISHING...' : 'AI POLISH'}
                  </Text>
                </Pressable>
              </View>
              
              <View style={[styles.glassInputContainer, imageUri && styles.glassActive]}>
                <FloatingField label="DESCRIPTION" value={desc} onChangeText={setDesc} multiline />
              </View>
            </View>

            <Pressable onPress={handleSubmit} disabled={isAnalyzing || isSubmitting}
              style={({ pressed }) => [
                styles.submitBtn,
                { backgroundColor: colors.primary, opacity: isAnalyzing || isSubmitting ? 0.6 : 1 },
                pressed && { transform: [{ scale: 0.97 }] },
              ]}>
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={[typography.titleMd, { color: '#000', fontWeight: '800' }]}>SUBMIT EVENT</Text>
              )}
            </Pressable>
          </View>

          {/* Right Column Preview remains largely the same, but adapted for dark mode */}
          <View style={[styles.previewColumn, isDesktop && styles.desktopPreviewColumn]}>
             <Text style={[typography.labelMd, { color: colors.muted, marginBottom: spacing.md }]}>PREVIEW</Text>
             {/* Simple visual proxy for the card since EventCard logic is complex */}
             <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
               <View style={{ height: 280, backgroundColor: colors.highlight }}>
                 {imageUri ? <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} /> : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.primary }}>No image</Text></View>}
                 {isAnalyzing && (
                   <BlurView intensity={50} tint="dark" style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                     <ActivityIndicator size="large" color={colors.primary} />
                   </BlurView>
                 )}
               </View>
               <View style={{ padding: spacing.md }}>
                 <Text style={[typography.titleXl, { color: colors.foreground, textTransform: 'uppercase' }]}>{title || 'UNTITLED EVENT'}</Text>
                 <Text style={[typography.bodySm, { color: colors.muted, marginTop: 8 }]}>{date || 'Date'} • {time || 'Time'}</Text>
                 <Text style={[typography.bodySm, { color: colors.muted }]}>{venue || 'Venue'}</Text>
               </View>
             </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  gateContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  gateTitle: { ...typography.titleLg, fontSize: 20, textAlign: 'center' },
  gateBody: { ...typography.bodySm, textAlign: 'center', maxWidth: 340, lineHeight: 20 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.marginMobile, paddingTop: spacing.xl, paddingBottom: 120 },
  mainLayout: { flexDirection: 'column', gap: spacing.xl },
  desktopLayout: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xl },
  formColumn: { flex: 1 }, desktopFormColumn: { flex: 1.1, maxWidth: 640 },
  previewColumn: { width: '100%' }, desktopPreviewColumn: { flex: 0.9, maxWidth: 420, position: 'sticky' as any, top: spacing.lg },
  heading: { ...typography.displayMd, marginBottom: spacing.lg },
  upload: { minHeight: 220, borderRadius: radii.xl, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg, overflow: 'hidden' },
  uploadInner: { alignItems: 'center', gap: 12 },
  uploadIconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  removeUploadBtn: { position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  formFields: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm },
  glassInputContainer: { borderRadius: radii.lg, overflow: 'hidden', backgroundColor: 'transparent' },
  glassActive: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  glassChip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderRadius: radii.md, borderWidth: 1, borderColor: 'transparent', backgroundColor: 'rgba(255,255,255,0.05)' },
  aiCopyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  aiPolishBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: radii.full, paddingHorizontal: 12, paddingVertical: 6 },
  submitBtn: { minHeight: 56, borderRadius: radii.full, justifyContent: 'center', alignItems: 'center', marginTop: spacing.xl },
  previewCard: { borderRadius: radii.xl, borderWidth: 1, overflow: 'hidden' },
});
