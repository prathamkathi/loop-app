import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, StyleSheet, Platform, KeyboardAvoidingView
} from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import {
  ImageSquare, CalendarBlank, Clock, MapPin, Sparkle
} from 'phosphor-react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme, typography, radii, shadows, spacing } from '../theme';
import PageHeader from '../components/PageHeader';
import { enhanceEventDraft } from '../utils/geminiAI';
import { CANONICAL_CATEGORIES } from '../data/categories';

function MinimalField({ label, value, onChangeText, multiline = false, icon: Icon }: any) {
  const { colors } = useTheme();
  return (
    <View style={styles.minimalField}>
      <Text style={[typography.labelSm, { color: colors.muted, marginBottom: 8 }]}>{label}</Text>
      <View style={[styles.minimalInputContainer, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
        {Icon && <Icon size={18} color={colors.muted} style={{ marginRight: 8 }} />}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={colors.muted}
          multiline={multiline}
          style={[styles.minimalInput, { color: colors.foreground, minHeight: multiline ? 100 : 44 }]}
        />
      </View>
    </View>
  );
}

export default function SubmitScreen({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { colors, isDark } = useTheme();
  
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [geminiCategory, setGeminiCategory] = useState<string>('Other');
  
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || null);
    }
  };

  const handleAIPolish = async () => {
    setIsPolishing(true);
    try {
      const res = await enhanceEventDraft(title, desc);
      if (res.polishedTitle) setTitle(res.polishedTitle);
      if (res.polishedBlurb) setDesc(res.polishedBlurb);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setTitle(''); setDesc(''); setDate(''); setTime(''); setVenue(''); setImageUri(null); setImageBase64(null);
      alert('Event successfully submitted for review.');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={{ marginBottom: spacing.xl }}>
          <PageHeader
            sectionLabel="Creator Portal"
            title="New Event"
            subtitle="Publish to the campus feed seamlessly."
          />
        </View>

        <View style={styles.formContainer}>
          {/* Elegant Image Uploader */}
          <Pressable
            onPress={handlePickImage}
            style={({ pressed }) => [
              styles.uploader,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
              pressed && { opacity: 0.8 },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any)
            ]}
          >
            {imageUri ? (
              <View style={{ flex: 1, width: '100%' }}>
                <Image source={{ uri: imageUri }} style={[StyleSheet.absoluteFill, { borderRadius: radii.xl }]} contentFit="cover" />
                <Pressable onPress={() => { setImageUri(null); setImageBase64(null); }} style={styles.removeBtn}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>✕</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.uploaderInner}>
                <View style={[styles.iconCircle, { backgroundColor: colors.background }]}>
                  <ImageSquare size={28} color={colors.primary} weight="regular" />
                </View>
                <Text style={[typography.labelMd, { color: colors.foreground, marginTop: 12 }]}>Upload Poster</Text>
                <Text style={[typography.caption, { color: colors.muted, marginTop: 4 }]}>4:5 ratio recommended</Text>
              </View>
            )}
          </Pressable>

          <MinimalField label="Event Title" value={title} onChangeText={setTitle} />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <MinimalField label="Date" value={date} onChangeText={setDate} icon={CalendarBlank} />
            </View>
            <View style={{ flex: 1 }}>
              <MinimalField label="Time" value={time} onChangeText={setTime} icon={Clock} />
            </View>
          </View>

          <MinimalField label="Venue" value={venue} onChangeText={setVenue} icon={MapPin} />

          <View style={styles.categorySection}>
            <Text style={[typography.labelSm, { color: colors.muted, marginBottom: 8 }]}>Category</Text>
            <View style={styles.chipRow}>
              {CANONICAL_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setGeminiCategory(cat)}
                  style={[
                    styles.chip,
                    { backgroundColor: geminiCategory === cat ? colors.foreground : colors.surfaceElevated, borderColor: geminiCategory === cat ? colors.foreground : colors.borderSubtle }
                  ]}
                >
                  <Text style={[typography.bodyXs, { color: geminiCategory === cat ? colors.background : colors.foreground }]}>{cat}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.polishRow}>
            <Text style={[typography.labelSm, { color: colors.muted }]}>Description</Text>
            <Pressable
              onPress={handleAIPolish}
              disabled={isPolishing}
              style={({ pressed }) => [
                styles.polishBtn,
                { backgroundColor: colors.surfaceElevated },
                pressed && { opacity: 0.7 },
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any)
              ]}
            >
              <Sparkle size={14} color={colors.accent} weight="fill" />
              <Text style={[typography.labelSm, { color: colors.accent, marginLeft: 6 }]}>
                {isPolishing ? 'Polishing...' : 'AI Polish'}
              </Text>
            </Pressable>
          </View>
          
          <View style={[styles.minimalInputContainer, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
            <TextInput
              value={desc}
              onChangeText={setDesc}
              placeholderTextColor={colors.muted}
              multiline
              style={[styles.minimalInput, { color: colors.foreground, minHeight: 120, paddingTop: 12 }]}
            />
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.submitBtn,
              { backgroundColor: colors.foreground },
              pressed && { opacity: 0.9 },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any)
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={[typography.labelLg, { color: colors.background }]}>Submit Event</Text>
            )}
          </Pressable>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.marginDesktop, paddingTop: spacing.xl, paddingBottom: 120, maxWidth: 640, alignSelf: 'center', width: '100%' },
  formContainer: { gap: spacing.lg },
  minimalField: { width: '100%' },
  minimalInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radii.lg, paddingHorizontal: 16 },
  minimalInput: { flex: 1, ...typography.bodyMd },
  row: { flexDirection: 'row', gap: spacing.md },
  uploader: { height: 280, borderRadius: radii.xl, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  uploaderInner: { alignItems: 'center' },
  iconCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  removeBtn: { position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  categorySection: { width: '100%' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radii.full, borderWidth: 1 },
  polishRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: -10 },
  polishBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.full },
  submitBtn: { height: 56, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl },
});
