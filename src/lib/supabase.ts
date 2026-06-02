import { createClient } from '@supabase/supabase-js';
import { ENV } from '@/core/config/env';
import type { Database } from '@/shared/types/database';

const memoryStorage: Record<string, string> = {};

export const supabase = createClient<Database>(
  ENV.supabaseUrl.replace(/\/$/, ''),
  ENV.supabaseAnonKey.trim(),
  {
    auth: {
      storage: {
        getItem: (key: string) => memoryStorage[key] ?? null,
        setItem: (key: string, value: string) => { memoryStorage[key] = value; },
        removeItem: (key: string) => { delete memoryStorage[key]; },
      },
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false,
      flowType: 'implicit',
    },
  }
);

export type SupabaseClient = typeof supabase;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = supabase as any;