// src/core/auth/sessionManager.ts
// Pure session management logic — no React imports.
// Wraps Supabase auth methods and exposes clean typed interfaces.
// Imported only by authRepository and useAuth hook.

import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/queryClient';
import { toAppError } from '@/shared/types/errors';

import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';

export type { Session, User };

export interface AuthStateChange {
  event: AuthChangeEvent;
  session: Session | null;
}

// ─── Session queries ──────────────────────────────────────────────────────────

// Fetches the current session from SecureStore + validates with Supabase server.
// Returns null if no session exists or token is expired and cannot be refreshed.
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    throw toAppError(error);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    throw toAppError(error);
  }
}

// ─── Auth state listener ──────────────────────────────────────────────────────

// Subscribe to auth state changes (sign in, sign out, token refresh, etc.)
// Returns an unsubscribe function — call it in useEffect cleanup.
export function onAuthStateChange(
  callback: (change: AuthStateChange) => void,
): () => void {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback({ event, session });
  });
  return () => data.subscription.unsubscribe();
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // Clear all cached query data so the next account never sees the previous
    // account's data (fixes cross-account cache leak on sign-out).
    queryClient.clear();
  } catch (error) {
    throw toAppError(error);
  }
}
