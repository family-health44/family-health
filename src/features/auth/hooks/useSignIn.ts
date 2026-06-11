// src/features/auth/hooks/useSignIn.ts
// Hook — orchestrates sign-in for the SignInScreen.
// Calls authRepository, handles loading/error state, navigates on success.
// No UI logic — returns state and handlers only.

import { useState, useCallback } from 'react';
import { router } from 'expo-router';

import { signInWithEmail } from '@/core/auth/authRepository';
import { toAppError, isAppError } from '@/shared/types/errors';

import type { SignInFormValues } from '../types/auth.types';
import type { AppError } from '@/shared/types/errors';

export interface UseSignInReturn {
  isLoading: boolean;
  error: AppError | null;
  signIn: (values: SignInFormValues) => Promise<void>;
  clearError: () => void;
}

export function useSignIn(): UseSignInReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const signIn = useCallback(async (values: SignInFormValues): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmail({ email: values.email, password: values.password });
      // Route to the root index, which runs the bootstrap gate to decide
      // between the main app, the accept-invite screen, or onboarding.
      router.replace('/');
    } catch (err) {
      setError(isAppError(err) ? err : toAppError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, signIn, clearError };
}
