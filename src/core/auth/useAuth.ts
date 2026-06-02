// src/core/auth/useAuth.ts
// React hook — single source of truth for auth state across the app.
// Resolves session on mount, subscribes to auth state changes, exposes
// loading state so layouts can delay rendering until auth is known.
// Imported by root layout and any component that needs session data.

import { useState, useEffect, useCallback } from 'react';

import {
  getCurrentSession,
  onAuthStateChange,
  signOut as signOutFromSession,
} from './sessionManager';
import { toAppError } from '@/shared/types/errors';

import type { Session } from '@supabase/supabase-js';
import type { AppError } from '@/shared/types/errors';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface UseAuthReturn {
  session: Session | null;
  status: AuthStatus;
  error: AppError | null;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    let mounted = true;

    // Step 1 — resolve existing session from SecureStore + validate with server
    getCurrentSession()
      .then((resolvedSession) => {
        if (!mounted) return;
        setSession(resolvedSession);
        setStatus(resolvedSession ? 'authenticated' : 'unauthenticated');
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(toAppError(err));
        setStatus('unauthenticated');
      });

    // Step 2 — subscribe to future auth state changes (sign in, sign out, token refresh)
    const unsubscribe = onAuthStateChange(({ session: newSession }) => {
      if (!mounted) return;
      setSession(newSession);
      setStatus(newSession ? 'authenticated' : 'unauthenticated');
      setError(null);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await signOutFromSession();
      // Auth state listener above will update session + status automatically
    } catch (err) {
      setError(toAppError(err));
    }
  }, []);

  return { session, status, error, signOut };
}
