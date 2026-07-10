// src/features/auth/hooks/useForgotPassword.ts
// Hook — orchestrates the "request reset email" step for ForgotPasswordScreen.

import { useState, useCallback } from 'react';

import { requestPasswordReset } from '@/core/auth/authRepository';
import { toAppError, isAppError } from '@/shared/types/errors';

import type { ForgotPasswordFormValues } from '../types/auth.types';
import type { AppError } from '@/shared/types/errors';

export interface UseForgotPasswordReturn {
  isLoading: boolean;
  error: AppError | null;
  isSent: boolean;
  submit: (values: ForgotPasswordFormValues) => Promise<void>;
  clearError: () => void;
}

export function useForgotPassword(): UseForgotPasswordReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [isSent, setIsSent] = useState(false);

  const clearError = useCallback(() => setError(null), []);

  const submit = useCallback(async (values: ForgotPasswordFormValues): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await requestPasswordReset({ email: values.email });
      setIsSent(true);
    } catch (err) {
      setError(isAppError(err) ? err : toAppError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, isSent, submit, clearError };
}
