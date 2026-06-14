// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { ENV } from '@/core/config/env';
import { secureStorageAdapter } from '@/core/auth/secureStorage';
import type { Database } from '@/shared/types/database';

export const supabase = createClient<Database>(
  ENV.supabaseUrl.replace(/\/$/, ''),
  ENV.supabaseAnonKey.trim(),
  {
    auth: {
      // Persist the session to encrypted device storage (Keychain/Keystore) so it
      // survives app restarts and force-quits. Without this the session lives only
      // in memory and is lost on quit, causing "Auth session missing!" errors.
      storage: secureStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'implicit',
    },
  }
);

export type SupabaseClient = typeof supabase;

// Untyped alias. C2 in progress: generated types exist at database.generated.ts
// but the hand-written Db* domain types declare several columns non-null that the
// live schema has nullable (family_group_id, medications.status, todos.completed,
// notes.hidden, visits.visit_date, family_groups.name). Resolving that mismatch
// (relax Db* types, or add NOT NULL constraints) is the remaining C2 work.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = supabase as any;
