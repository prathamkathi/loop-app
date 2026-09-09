/**
 * Local Persistence — AsyncStorage helpers
 *
 * Persists guest tag selections (interests) and theme mode.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  INTERESTS: '@loop/interests',
  INTERESTS_SET: '@loop/interests_set',
  SAVED_EVENTS: '@loop/saved-events',
} as const;

export async function hasSetInterests(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.INTERESTS_SET);
    return raw === 'true';
  } catch {
    return false;
  }
}

export async function loadInterests(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.INTERESTS);
    const values = raw ? JSON.parse(raw) : [];
    return Array.isArray(values) ? values.filter((value) => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

export async function saveInterests(interests: string[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.INTERESTS, JSON.stringify(interests));
  await AsyncStorage.setItem(KEYS.INTERESTS_SET, 'true');
}

export async function loadSavedEvents(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SAVED_EVENTS);
    const values = raw ? JSON.parse(raw) : [];
    return Array.isArray(values) ? values.filter((value) => typeof value === 'string' && value.length > 0 && !value.includes('/')) : [];
  } catch {
    return [];
  }
}

export async function saveSavedEvents(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.SAVED_EVENTS, JSON.stringify(ids));
}
