// src/features/auth/hooks/useResetPassword.ts
// Hook — exchanges the recovery code (PKCE) for a session, then updates password.

import { useState, useCallback } from 'react';
import { router } from 'expo-router';

import { exchangeRecoveryCode, updatePassword } from '@/core/auth/authRepository';
import { toAppError, isAppError } from '@/shared/types/errors';

import type { ResetPasswordFormValues } from '../types/auth.types';
import type { AppError } from '@/shared/types/errors';

export interface UseResetPasswordReturn {
  isLoading: boolean;
  error: AppError | null;
  sessionReady: boolean;
  hydrateSession: (code: string) => Promise<void>;
  submit: (values: ResetPasswordFormValues) => Promise<void>;
  clearError: () => void;
}

export function useResetPassword(): UseResetPasswordReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  const clearError = useCallback(() => setError(null), []);

  const hydrateSession = useCallback(async (code: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await exchangeRecoveryCode({ code });
      setSessionReady(true);
    } catch (err) {
      setError(isAppError(err) ? err : toAppError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submit = useCallback(async (values: ResetPasswordFormValues): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await updatePassword({ password: values.password });
      router.replace('/');
    } catch (err) {
      setError(isAppError(err) ? err : toAppError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, sessionReady, hydrateSession, submit, clearError };
}
