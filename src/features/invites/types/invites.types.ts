// src/features/invites/types/invites.types.ts
// Domain + db row types for the invites feature.

export interface DbInvite {
  id: string;
  family_group_id: string | null;
  invited_email: string;
  invited_by: string | null;
  accepted: boolean | null;
  created_at: string | null;
}

// A pending invite resolved for the current user, with the group name attached.
export interface PendingInvite {
  id: string;
  familyGroupId: string;
  familyGroupName: string;
  invitedEmail: string;
}

// A member of the family group, resolved with their email via list_organisers().
export interface Organiser {
  memberId: string;
  email: string;
  role: 'owner' | 'member';
  createdAt: string | null;
}

// Hard cap: 2 organisers per family group (account holder + 1).
// ENFORCED IN THE DB (trg_enforce_organiser_cap / trg_enforce_invite_cap).
// This constant is for UI only — changing it does not change what is enforced.
// Additional carers are a post-launch Plus feature (an add, never a removal).
export const MAX_ORGANISERS = 2;
