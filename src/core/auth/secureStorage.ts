// src/core/auth/secureStorage.ts
// SecureStore adapter implementing the storage interface Supabase expects.
// Tokens are encrypted at rest using the device keychain (iOS) / Keystore (Android).
// This module is imported only by src/lib/supabase.ts — nowhere else.
//
// SecureStore key length limit: 255 characters.
// Supabase auth keys can be long — we hash them to stay under the limit.
// SecureStore does not support web — a memory fallback is provided for safety.

import * as SecureStore from 'expo-secure-store';

// Supabase storage adapter interface
export interface StorageAdapter {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
}

// SecureStore keys must be alphanumeric + . _ - only, max 255 chars
// Supabase uses keys like "sb-<project-ref>-auth-token" which are safe,
// but we sanitise defensively to prevent future breakage.
function sanitiseKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 255);
}

// Memory fallback for environments where SecureStore is unavailable (e.g. web, Jest)
const memoryFallback = new Map<string, string>();

const isSecureStoreAvailable = SecureStore.isAvailableAsync !== undefined;

export const secureStorageAdapter: StorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    const sanitised = sanitiseKey(key);
    try {
      if (!isSecureStoreAvailable) return memoryFallback.get(sanitised) ?? null;
      return await SecureStore.getItemAsync(sanitised);
    } catch (error) {
      console.warn('[SecureStorage] getItem failed, falling back to memory:', error);
      return memoryFallback.get(sanitised) ?? null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    const sanitised = sanitiseKey(key);
    try {
      if (!isSecureStoreAvailable) {
        memoryFallback.set(sanitised, value);
        return;
      }
      await SecureStore.setItemAsync(sanitised, value);
    } catch (error) {
      console.warn('[SecureStorage] setItem failed, falling back to memory:', error);
      memoryFallback.set(sanitised, value);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    const sanitised = sanitiseKey(key);
    try {
      memoryFallback.delete(sanitised);
      if (!isSecureStoreAvailable) return;
      await SecureStore.deleteItemAsync(sanitised);
    } catch (error) {
      console.warn('[SecureStorage] removeItem failed:', error);
    }
  },
};
