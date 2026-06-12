// src/core/auth/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { getCurrentSession, onAuthStateChange, signOut as signOutFromSession } from './sessionManager';
import { toAppError } from '@/shared/types/errors';
import type { Session } from '@supabase/supabase-js';
import type { AppError } from '@/shared/types/errors';
import { db, supabase } from '@/lib/supabase';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface UseAuthReturn {
  session: Session | null;
  status: AuthStatus;
  error: AppError | null;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
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

  // Account deletion is handled entirely server-side by the 'delete-user' edge
  // function, which runs with the service-role key. It verifies the caller's JWT,
  // then deletes the family group (if sole member — cascades to all data) or just
  // the membership (if others remain), then deletes the auth user.
  const deleteAccount = useCallback(async (): Promise<void> => {
    try {
      // Fetch a fresh session and attach its token explicitly. Relying on
      // functions.invoke's auto-attach can be rejected by the gateway with the
      // implicit-flow / untyped client, so we pass the Authorization header here.
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('No active session.');

      const { error: fnError } = await db.functions.invoke('delete-user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (fnError) throw fnError;
      await signOutFromSession();
    } catch (err) {
      throw toAppError(err);
    }
  }, []);

  return { session, status, error, signOut, deleteAccount };
}
