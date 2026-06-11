// src/features/auth/hooks/useSignUp.ts
// Hook — orchestrates sign-up for the SignUpScreen.
// On success with email confirmation ON, surfaces a "check your email" state.
// On success with confirmation OFF, routes through the bootstrap gate.

import { useState, useCallback } from 'react';
import { router } from 'expo-router';

import { signUpWithEmail } from '@/core/auth/authRepository';
import { toAppError, isAppError } from '@/shared/types/errors';

import type { SignUpFormValues } from '../types/auth.types';
import type { AppError } from '@/shared/types/errors';

export interface UseSignUpReturn {
  isLoading: boolean;
  error: AppError | null;
  needsConfirmation: boolean;
  confirmationEmail: string | null;
  signUp: (values: SignUpFormValues) => Promise<void>;
  clearError: () => void;
}

export function useSignUp(): UseSignUpReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const signUp = useCallback(async (values: SignUpFormValues): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const { needsEmailConfirmation } = await signUpWithEmail({
        email: values.email,
        password: values.password,
      });

      if (needsEmailConfirmation) {
        // Show the "check your email" state — they can't sign in until confirmed.
        setConfirmationEmail(values.email.trim().toLowerCase());
        setNeedsConfirmation(true);
      } else {
        // Confirmation off — session is live; let the bootstrap gate route them
        // (to accept-invite if they have a pending invite, else onboarding).
        router.replace('/');
      }
    } catch (err) {
      setError(isAppError(err) ? err : toAppError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, needsConfirmation, confirmationEmail, signUp, clearError };
}
