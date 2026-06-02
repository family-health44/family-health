// src/core/config/env.ts
// Validates required environment variables at startup.
// App will throw immediately if any are missing — fail fast, never silently.
// This is the ONLY place process.env is read; all other files import from here.

import Constants from 'expo-constants';

interface EnvConfig {
  readonly supabaseUrl: string;
  readonly supabaseAnonKey: string;
}

function getEnvConfig(): EnvConfig {
  // expo-constants exposes extra from app.config.ts
  const extra = Constants.expoConfig?.extra as Record<string, unknown> | undefined;

  const supabaseUrl =
    (extra?.['supabaseUrl'] as string | undefined) ??
    process.env['EXPO_PUBLIC_SUPABASE_URL'];

  const supabaseAnonKey =
    (extra?.['supabaseAnonKey'] as string | undefined) ??
    process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'];

  if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
    throw new Error(
      '[Config] EXPO_PUBLIC_SUPABASE_URL is not set. Copy .env.example to .env.local and fill in your values.',
    );
  }

  if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
    throw new Error(
      '[Config] EXPO_PUBLIC_SUPABASE_ANON_KEY is not set. Copy .env.example to .env.local and fill in your values.',
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

// Evaluated once at module load — crash early if config is invalid
export const ENV: EnvConfig = getEnvConfig();
