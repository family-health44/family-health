// src/core/auth/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { getCurrentSession, onAuthStateChange, signOut as signOutFromSession } from './sessionManager';
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
    let settled = false;

    const settle = (newSession: Session | null, err?: AppError) => {
      if (!mounted || settled) return;
      settled = true;
      clearTimeout(timeout);
      if (err) setError(err);
      setSession(newSession);
      setStatus(newSession ? 'authenticated' : 'unauthenticated');
    };

    const timeout = setTimeout(() => {
      settle(null);
    }, 3000);

    getCurrentSession()
      .then((resolvedSession) => settle(resolvedSession))
      .catch((err: unknown) => settle(null, toAppError(err)));

    const unsubscribe = onAuthStateChange(({ session: newSession }) => {
      if (!mounted) return;
      setSession(newSession);
      setStatus(newSession ? 'authenticated' : 'unauthenticated');
      setError(null);
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await signOutFromSession();
    } catch (err) {
      setError(toAppError(err));
    }
  }, []);

  return { session, status, error, signOut };
}
