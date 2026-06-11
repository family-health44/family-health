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
