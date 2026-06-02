// src/features/settings/types/settings.types.ts
// Settings types — preferences stored locally via MMKV.

export interface AppSettings {
  familyDisplayName: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  familyDisplayName: '',
};
