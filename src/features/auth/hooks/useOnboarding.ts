// src/features/auth/hooks/useOnboarding.ts
// Hook — orchestrates onboarding (create family group) for the OnboardingScreen.
// Called immediately after first sign-in when user has no family group yet.

import { useState, useCallback } from 'react';
import { router } from 'expo-router';

import { createFamilyGroup } from '@/core/auth/authRepository';
import { getCurrentUser } from '@/core/auth/sessionManager';
import { toAppError, isAppError } from '@/shared/types/errors';

import type { OnboardingFormValues } from '../types/auth.types';
import type { AppError } from '@/shared/types/errors';

export interface UseOnboardingReturn {
  isLoading: boolean;
  error: AppError | null;
  createFamily: (values: OnboardingFormValues) => Promise<void>;
  clearError: () => void;
}

export function useOnboarding(): UseOnboardingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const createFamily = useCallback(async (values: OnboardingFormValues): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('No authenticated user found. Please sign in again.');
      }

      await createFamilyGroup({
        userId: user.id,
        familyGroupName: values.familyGroupName,
      });

      router.replace('/(app)/family');
    } catch (err) {
      setError(isAppError(err) ? err : toAppError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, createFamily, clearError };
}
