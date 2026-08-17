// src/lib/supabase.ts
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { ENV } from '@/core/config/env';
import { secureStorageAdapter } from '@/core/auth/secureStorage';
import type { Database } from '@/shared/types/database';

// During Netlify/Expo static web export the app is prerendered under Node. Node < 22
// has no native WebSocket, so the Supabase realtime client crashes when it builds its
// socket ("Node.js 20 detected without native WebSocket support"). The app does not
// use realtime, but the client constructs it regardless. Supplying the `ws` transport
// only in the Node build environment lets the export complete on any Node version.
// On device (native) and in the browser, the platform WebSocket is used as normal.
const isNodeBuild =
  Platform.OS === 'web' &&
  typeof window === 'undefined' &&
  typeof WebSocket === 'undefined';

const realtimeOptions = isNodeBuild
  ? { transport: require('ws') }
  : undefined;

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
      flowType: 'pkce',
    },
    ...(realtimeOptions ? { realtime: realtimeOptions } : {}),
  }
);
export type SupabaseClient = typeof supabase;
// Typed Supabase client. C2 resolved: NOT NULL constraints added to the live
// schema so it matches the Db* domain types, and Database is the generated type
// (re-exported from database.generated.ts). The `as any` cast is no longer needed.
export const db = supabase;
