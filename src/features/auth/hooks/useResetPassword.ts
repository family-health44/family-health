// src/features/auth/hooks/useResetPassword.ts
// Hook — verifies the recovery token_hash (OTP) for a session, then updates password.

import { useState, useCallback } from 'react';
import { router } from 'expo-router';

import { verifyRecoveryToken, updatePassword } from '@/core/auth/authRepository';
import { toAppError, isAppError } from '@/shared/types/errors';

import type { ResetPasswordFormValues } from '../types/auth.types';
import type { AppError } from '@/shared/types/errors';

export interface UseResetPasswordReturn {
  isLoading: boolean;
  error: AppError | null;
  sessionReady: boolean;
  hydrateSession: (tokenHash: string) => Promise<void>;
  submit: (values: ResetPasswordFormValues) => Promise<void>;
  clearError: () => void;
}

export function useResetPassword(): UseResetPasswordReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  const clearError = useCallback(() => setError(null), []);

  const hydrateSession = useCallback(async (tokenHash: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await verifyRecoveryToken({ tokenHash });
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
