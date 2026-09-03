import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';

export type StudentProfile = {
  name: string;
  firstName: string;
  kerberosId: string;
  department?: string;
  hostel?: string;
  year?: string;
};

const STUDENT_PROFILE_KEY = '@loop_student_profile_v1';

export async function getStoredStudentProfile(): Promise<StudentProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(STUDENT_PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StudentProfile;
  } catch {
    return null;
  }
}

export async function saveStudentProfile(profile: StudentProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save student profile:', err);
  }
}

export async function clearStudentProfile(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STUDENT_PROFILE_KEY);
  } catch (err) {
    console.error('Failed to clear student profile:', err);
  }
}

// React hook for component access
export function useStudentAuth() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const p = await getStoredStudentProfile();
    setProfile(p);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const signIn = async (newProfile: StudentProfile) => {
    await saveStudentProfile(newProfile);
    setProfile(newProfile);
  };

  const signOut = async () => {
    await clearStudentProfile();
    setProfile(null);
  };

  return {
    profile,
    isSignedIn: profile !== null,
    loading,
    signIn,
    signOut,
    refresh: loadProfile,
  };
}
