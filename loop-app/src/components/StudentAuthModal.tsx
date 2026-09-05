import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { showAlert } from '../utils/alert';
import { X, User, IdentificationBadge, Buildings, SignOut, CheckCircle, Sparkle } from 'phosphor-react-native';
import { useTheme, typography, radii } from '../theme';
import { StudentProfile } from '../utils/auth';

type Props = {
  visible: boolean;
  onClose: () => void;
  currentProfile: StudentProfile | null;
  onSignIn: (profile: StudentProfile) => void;
  onSignOut: () => void;
  onToggleMode?: () => void;
  mode?: 'student' | 'studio';
};

const HOSTELS = [
  'Karakoram', 'Nilgiri', 'Aravali', 'Jwalamukhi',
  'Kumaon', 'Vindhyachal', 'Shivalik', 'Zanskar',
  'Girnar', 'Udaigiri', 'Satpura', 'Kailash', 'Himadri'
];

export default function StudentAuthModal({
  visible,
  onClose,
  currentProfile,
  onSignIn,
  onSignOut,
  onToggleMode,
  mode = 'student',
}: Props) {
  const { colors } = useTheme();

  const [name, setName] = useState('');
  const [kerberos, setKerberos] = useState('');
  const [hostel, setHostel] = useState('Nilgiri');
  const [year, setYear] = useState('UG 2026');

  if (!visible) return null;

  const handleManualSignIn = () => {
    if (!name.trim()) {
      showAlert('Name Required', 'Please enter your full name.');
      return;
    }
    const cleanName = name.trim();
    const firstName = cleanName.split(' ')[0];
    let cleanKerberos = kerberos.trim().toLowerCase();
    if (cleanKerberos && !cleanKerberos.includes('@')) {
      cleanKerberos = `${cleanKerberos}@iitd.ac.in`;
    }

    if (!/^[a-z]{2,4}\d{5,8}@iitd\.ac\.in$/.test(cleanKerberos)) {
      showAlert('Invalid Kerberos ID', 'Please enter a valid IITD email or ID (e.g. cs1210123 or cs1210123@iitd.ac.in).');
      return;
    }

    const profile: StudentProfile = {
      name: cleanName,
      firstName,
      kerberosId: cleanKerberos,
      hostel,
      year,
    };

    onSignIn(profile);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.foreground }]}>
                {currentProfile ? 'Student Profile' : 'Sign In to Loop'}
              </Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                {currentProfile
                  ? 'Your verified IIT Delhi campus profile'
                  : 'Personalize your greeting, reminders & saved events'}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeBtn,
                { backgroundColor: colors.highlight },
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                pressed && { transform: [{ scale: 0.9 }] },
              ]}
            >
              <X size={18} color={colors.foreground} weight="bold" />
            </Pressable>
          </View>

          {currentProfile ? (
            /* Signed In View */
            <View style={styles.profileSection}>
              <View style={[styles.profileCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarInitial}>{currentProfile.firstName[0]}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[styles.profileName, { color: colors.foreground }]}>{currentProfile.name}</Text>
                  <Text style={[styles.profileKerberos, { color: colors.muted }]}>
                    {currentProfile.kerberosId}
                  </Text>
                  <View style={styles.badgeRow}>
                    {currentProfile.hostel && (
                      <View style={[styles.miniBadge, { backgroundColor: colors.highlight }]}>
                        <Buildings size={12} color={colors.primary} />
                        <Text style={[styles.miniBadgeText, { color: colors.primary }]}>
                          {currentProfile.hostel}
                        </Text>
                      </View>
                    )}
                    {currentProfile.year && (
                      <View style={[styles.miniBadge, { backgroundColor: colors.highlight }]}>
                        <CheckCircle size={12} color={colors.primary} />
                        <Text style={[styles.miniBadgeText, { color: colors.primary }]}>
                          {currentProfile.year}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {onToggleMode && (
                <Pressable
                  onPress={() => {
                    onToggleMode();
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.signOutBtn,
                    { borderColor: colors.primary, marginTop: -4 },
                    Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                    pressed && { transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <Sparkle size={16} color={colors.primary} weight="bold" />
                  <Text style={[styles.signOutText, { color: colors.primary }]}>
                    Switch to {mode === 'student' ? 'Club Studio' : 'Student Mode'}
                  </Text>
                </Pressable>
              )}

              <Pressable
                onPress={() => {
                  onSignOut();
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.signOutBtn,
                  { borderColor: colors.border },
                  Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
              >
                <SignOut size={16} color="#DC2626" weight="bold" />
                <Text style={styles.signOutText}>Sign Out from Device</Text>
              </Pressable>
            </View>
          ) : (
            /* Form Sign In View */
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }} keyboardShouldPersistTaps="handled">
              <View>
                <Text style={[styles.inputLabel, { color: colors.foreground }]}>Full Name</Text>
                <View style={[styles.inputWrap, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <User size={18} color={colors.muted} />
                  <TextInput
                    placeholder="Your full name"
                    placeholderTextColor={colors.muted}
                    value={name}
                    onChangeText={setName}
                    style={[styles.input, { color: colors.foreground }]}
                  />
                </View>
              </View>

              <View>
                <Text style={[styles.inputLabel, { color: colors.foreground }]}>Kerberos / Email ID</Text>
                <View style={[styles.inputWrap, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <IdentificationBadge size={18} color={colors.muted} />
                  <TextInput
                    placeholder="e.g. cs1230456@iitd.ac.in"
                    placeholderTextColor={colors.muted}
                    value={kerberos}
                    onChangeText={setKerberos}
                    autoCapitalize="none"
                    style={[styles.input, { color: colors.foreground }]}
                  />
                </View>
              </View>

              <View>
                <Text style={[styles.inputLabel, { color: colors.foreground }]}>Hostel</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hostelRow}>
                  {HOSTELS.map((h) => {
                    const isSelected = hostel === h;
                    return (
                      <Pressable
                        key={h}
                        onPress={() => setHostel(h)}
                        style={[
                          styles.hostelChip,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.background,
                            borderColor: isSelected ? colors.primary : colors.border,
                          },
                          Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                        ]}
                      >
                        <Text
                          style={[
                            styles.hostelChipText,
                            { color: isSelected ? colors.onPrimary : colors.foreground },
                          ]}
                        >
                          {h}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              <Pressable
                onPress={handleManualSignIn}
                style={({ pressed }) => [
                  styles.submitBtn,
                  { backgroundColor: colors.primary },
                  Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
              >
                <Text style={[styles.submitBtnText, { color: colors.onPrimary }]}>Sign In</Text>
              </Pressable>
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 100,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderRadius: radii.xxl,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    ...typography.titleSm,
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.bodySm,
    fontSize: 12,
    marginTop: 4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    ...typography.labelSm,
    marginBottom: 6,
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 46,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    outlineStyle: 'none' as any,
  },
  hostelRow: {
    gap: 6,
    paddingVertical: 4,
  },
  hostelChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  hostelChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    height: 48,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    ...typography.labelMd,
    fontWeight: '700',
  },
  orDivider: {
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
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  demoBtnText: {
    ...typography.labelSm,
    fontWeight: '700',
  },
  profileSection: {
    gap: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: radii.xl,
    borderWidth: 1,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  profileName: {
    ...typography.titleSm,
    fontWeight: '700',
  },
  profileKerberos: {
    ...typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  miniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  miniBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  signOutText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#DC2626' + '1A',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: radii.md,
    padding: 10,
    width: '100%',
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
