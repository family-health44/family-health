// src/features/invites/hooks/useAcceptInvite.ts
import { useCallback } from 'react';
import { router } from 'expo-router';
import { usePendingInviteQuery } from '../queries/invites.queries';
import { useAcceptInviteMutation } from '../mutations/invites.mutations';
import { toAppError } from '@/shared/types/errors';
import type { AppError } from '@/shared/types/errors';

export interface UseAcceptInviteReturn {
  isLoading: boolean;
  isAccepting: boolean;
  error: AppError | null;
  familyGroupName: string | null;
  hasInvite: boolean;
  accept: () => Promise<void>;
}

export function useAcceptInvite(): UseAcceptInviteReturn {
  const { data: invite, isLoading, error: queryError } = usePendingInviteQuery(true);
  const mutation = useAcceptInviteMutation();

  const accept = useCallback(async (): Promise<void> => {
    if (!invite) return;
    await mutation.mutateAsync(invite);
    router.replace('/(app)/family');
  }, [invite, mutation]);

  return {
    isLoading,
    isAccepting: mutation.isPending,
    error: (queryError ? toAppError(queryError) : null) ?? (mutation.error ? toAppError(mutation.error) : null),
    familyGroupName: invite?.familyGroupName ?? null,
    hasInvite: !!invite,
    accept,
  };
}
