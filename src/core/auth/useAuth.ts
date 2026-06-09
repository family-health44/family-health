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

    // Timeout — if session resolution takes more than 5 seconds, treat as unauthenticated
    const timeout = setTimeout(() => {
      if (mounted && status === 'loading') {
        setStatus('unauthenticated');
      }
    }, 5000);

    getCurrentSession()
      .then((resolvedSession) => {
        if (!mounted) return;
        clearTimeout(timeout);
        setSession(resolvedSession);
        setStatus(resolvedSession ? 'authenticated' : 'unauthenticated');
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        clearTimeout(timeout);
        setError(toAppError(err));
        setStatus('unauthenticated');
      });

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
