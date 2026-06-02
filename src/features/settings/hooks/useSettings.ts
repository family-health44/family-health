// src/features/settings/hooks/useSettings.ts
// Hook — manages app settings stored locally in MMKV.
// No Supabase calls — settings are device-local only.

import { useState, useCallback } from 'react';

import { mmkv, STORAGE_KEYS } from '@/core/storage/mmkv';
import { DEFAULT_SETTINGS } from '../types/settings.types';

import type { AppSettings } from '../types/settings.types';

export interface UseSettingsReturn {
  settings: AppSettings;
  updateFamilyDisplayName: (name: string) => void;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<AppSettings>(() => ({
    familyDisplayName:
      mmkv.getString(STORAGE_KEYS.FAMILY_DISPLAY_NAME) ??
      DEFAULT_SETTINGS.familyDisplayName,
  }));

  const updateFamilyDisplayName = useCallback((name: string) => {
    mmkv.setString(STORAGE_KEYS.FAMILY_DISPLAY_NAME, name);
    setSettings((prev) => ({ ...prev, familyDisplayName: name }));
  }, []);

  return { settings, updateFamilyDisplayName };
}
