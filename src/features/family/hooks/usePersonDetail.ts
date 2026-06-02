// src/features/family/hooks/usePersonDetail.ts
// Hook — provides person data and sign-out for PersonDetailScreen.
// Thin orchestration only — queries and mutations imported from their layers.

import { usePersonQuery } from '../queries/family.queries';
import { useAuth } from '@/core/auth/useAuth';
import { isAppError, toAppError } from '@/shared/types/errors';

import type { Person } from '../types/family.types';
import type { AppError } from '@/shared/types/errors';

export interface UsePersonDetailReturn {
  person: Person | null | undefined;
  isLoading: boolean;
  error: AppError | null;
  signOut: () => Promise<void>;
}

export function usePersonDetail(personId: string): UsePersonDetailReturn {
  const { data: person, isLoading, error: queryError } = usePersonQuery(personId);
  const { signOut } = useAuth();

  const error = queryError
    ? isAppError(queryError) ? queryError : toAppError(queryError)
    : null;

  return { person, isLoading, error, signOut };
}
