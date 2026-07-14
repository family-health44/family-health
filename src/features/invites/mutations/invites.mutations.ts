// src/features/invites/mutations/invites.mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser } from '@/core/auth/sessionManager';
import { fetchFamilyGroup } from '@/features/family/repository/family.repository';
import {
  insertInvite,
  insertMembership,
  markInviteAccepted,
  deleteInvite,
  removeOrganiser,
} from '../repository/invites.repository';
import { inviteKeys } from '../queries/invites.queries';
import { queryKeys } from '@/lib/queryClient';
import { toAppError } from '@/shared/types/errors';
import type { PendingInvite } from '../types/invites.types';

// Accept an invite: membership row FIRST, then mark accepted.
// Order matters — the RLS UPDATE policy's WITH CHECK requires the caller to be
// a member of the target group, so the membership must exist before the update.
export function useAcceptInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, PendingInvite>({
    mutationFn: async (invite: PendingInvite) => {
      const user = await getCurrentUser();
      if (!user) throw toAppError(new Error('No authenticated user.'));

      await insertMembership(user.id, invite.familyGroupId);
      await markInviteAccepted(invite.id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: inviteKeys.seats() });
      await queryClient.invalidateQueries({ queryKey: inviteKeys.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.family.all });
    },
  });
}

// Create an invite for an email address (Settings UI).
export function useCreateInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (invitedEmail: string) => {
      const user = await getCurrentUser();
      if (!user) throw toAppError(new Error('No authenticated user.'));

      const group = await fetchFamilyGroup();
      if (!group) throw toAppError(new Error('No family group found.'));

      await insertInvite(invitedEmail.trim().toLowerCase(), group.id, user.id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: inviteKeys.forGroup() });
      await queryClient.invalidateQueries({ queryKey: inviteKeys.seats() });
    },
  });
}

// Revoke an invite (Settings UI).
export function useRevokeInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (inviteId: string) => {
      await deleteInvite(inviteId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: inviteKeys.forGroup() });
      await queryClient.invalidateQueries({ queryKey: inviteKeys.seats() });
    },
  });
}

// Remove an accepted organiser (Settings UI). Owner-only, enforced in the RPC.
export function useRemoveOrganiserMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (memberId: string) => {
      await removeOrganiser(memberId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: inviteKeys.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.family.all });
    },
  });
}

// True when the DB organiser-cap trigger rejected the write.
export function isOrganiserCapError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error ?? '');
  return msg.includes('ORGANISER_CAP');
}
