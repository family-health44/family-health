// src/core/storage/mmkv.ts
// Temporary AsyncStorage fallback for Expo Go testing.
// Replace with MMKV when building with EAS (development build).

import AsyncStorage from '@react-native-async-storage/async-storage';

// Synchronous in-memory store for values needed immediately
const memoryStore: Record<string, string> = {};

export const mmkv = {
  getString: (key: string): string | undefined => {
    return memoryStore[key];
  },
  setString: (key: string, value: string): void => {
    memoryStore[key] = value;
    // Also persist to AsyncStorage asynchronously
    AsyncStorage.setItem(key, value).catch(console.warn);
  },
  getBoolean: (key: string): boolean | undefined => {
    const val = memoryStore[key];
    if (val === undefined) return undefined;
    return val === 'true';
  },
  setBoolean: (key: string, value: boolean): void => {
    memoryStore[key] = String(value);
    AsyncStorage.setItem(key, String(value)).catch(console.warn);
  },
  delete: (key: string): void => {
    delete memoryStore[key];
    AsyncStorage.removeItem(key).catch(console.warn);
  },
  contains: (key: string): boolean => key in memoryStore,
};

export const STORAGE_KEYS = {
  FAMILY_DISPLAY_NAME: 'family_display_name',
  OFFLINE_QUEUE: 'offline_queue',
} as const;
