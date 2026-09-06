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
  REMINDER: '@loop/reminder',
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
    return raw ? JSON.parse(raw) : [];
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
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveSavedEvents(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.SAVED_EVENTS, JSON.stringify(ids));
}

export async function loadReminder(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.REMINDER);
    return raw ? parseInt(raw, 10) : 60;
  } catch {
    return 60;
  }
}

export async function saveReminder(value: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.REMINDER, value.toString());
}
