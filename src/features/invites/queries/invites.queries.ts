// src/features/invites/queries/invites.queries.ts
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/core/auth/sessionManager';
import {
  fetchPendingInviteForEmail,
  fetchGroupName,
  fetchInvitesForGroup,
  countGroupMembers,
  fetchOrganisers,
} from '../repository/invites.repository';
import { fetchFamilyGroup } from '@/features/family/repository/family.repository';
import type { PendingInvite, DbInvite, Organiser } from '../types/invites.types';

export const inviteKeys = {
  all: ['invites'] as const,
  pendingForMe: () => [...inviteKeys.all, 'pendingForMe'] as const,
  forGroup: () => [...inviteKeys.all, 'forGroup'] as const,
  seats: () => [...inviteKeys.all, 'seats'] as const,
  organisers: () => [...inviteKeys.all, 'organisers'] as const,
};

// Accepted organisers (with emails), resolved server-side.
export function useOrganisersQuery() {
  return useQuery<Organiser[], Error>({
    queryKey: inviteKeys.organisers(),
    queryFn: fetchOrganisers,
  });
}

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

// Seats used = accepted members + pending invites. Mirrors the DB cap function.
export function useGroupSeatsQuery() {
  return useQuery<number, Error>({
    queryKey: inviteKeys.seats(),
    queryFn: async () => {
      const group = await fetchFamilyGroup();
      if (!group) return 0;
      const [members, invites] = await Promise.all([
        countGroupMembers(group.id),
        fetchInvitesForGroup(group.id),
      ]);
      const pending = invites.filter((i) => !i.accepted).length;
      return members + pending;
    },
  });
}
