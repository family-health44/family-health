// src/features/invites/queries/invites.queries.ts
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/core/auth/sessionManager';
import {
  fetchPendingInviteForEmail,
  fetchGroupName,
  fetchInvitesForGroup,
} from '../repository/invites.repository';
import { fetchFamilyGroup } from '@/features/family/repository/family.repository';
import type { PendingInvite, DbInvite } from '../types/invites.types';

export const inviteKeys = {
  all: ['invites'] as const,
  pendingForMe: () => [...inviteKeys.all, 'pendingForMe'] as const,
  forGroup: () => [...inviteKeys.all, 'forGroup'] as const,
};

// Resolves the current user's pending invite (if any), with group name attached.
export function usePendingInviteQuery(enabled: boolean) {
  return useQuery<PendingInvite | null, Error>({
    queryKey: inviteKeys.pendingForMe(),
    enabled,
    queryFn: async () => {
      const user = await getCurrentUser();
      const email = user?.email;
      if (!email) return null;

      const invite = await fetchPendingInviteForEmail(email);
      if (!invite || !invite.family_group_id) return null;

      const name = await fetchGroupName(invite.family_group_id);
      return {
        id: invite.id,
        familyGroupId: invite.family_group_id,
        familyGroupName: name ?? 'a family',
        invitedEmail: invite.invited_email,
      };
    },
  });
}

// Lists invites the current user's group has sent (for Settings management UI).
export function useGroupInvitesQuery() {
  return useQuery<DbInvite[], Error>({
    queryKey: inviteKeys.forGroup(),
    queryFn: async () => {
      const group = await fetchFamilyGroup();
      if (!group) return [];
      return fetchInvitesForGroup(group.id);
    },
  });
}
