// src/features/invites/repository/invites.repository.ts
// Raw Supabase access for invites. No domain mapping here beyond shaping rows.
import { db } from '@/lib/supabase';
import { handleNetworkError } from '@/core/network/errorHandler';
import type { DbInvite } from '../types/invites.types';

// Fetch the first pending (not accepted) invite addressed to the given email.
export async function fetchPendingInviteForEmail(email: string): Promise<DbInvite | null> {
  try {
    const { data, error } = await db
      .from('invites')
      .select('id, family_group_id, invited_email, invited_by, accepted, created_at')
      .eq('invited_email', email)
      .eq('accepted', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) { handleNetworkError(error); }
}

// Fetch the family group name for an invite (invite row has no name).
export async function fetchGroupName(familyGroupId: string): Promise<string | null> {
  try {
    const { data, error } = await db
      .from('family_groups')
      .select('name')
      .eq('id', familyGroupId)
      .maybeSingle();
    if (error) throw error;
    return data?.name ?? null;
  } catch (error) { handleNetworkError(error); }
}

// List invites the current user's group has sent (for Settings UI).
export async function fetchInvitesForGroup(familyGroupId: string): Promise<DbInvite[]> {
  try {
    const { data, error } = await db
      .from('invites')
      .select('id, family_group_id, invited_email, invited_by, accepted, created_at')
      .eq('family_group_id', familyGroupId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (error) { handleNetworkError(error); }
}

// Create an invite for a given email + group, attributed to the inviter.
export async function insertInvite(
  invitedEmail: string,
  familyGroupId: string,
  invitedBy: string,
): Promise<DbInvite> {
  try {
    const { data, error } = await db
      .from('invites')
      .insert({
        invited_email: invitedEmail,
        family_group_id: familyGroupId,
        invited_by: invitedBy,
      })
      .select('id, family_group_id, invited_email, invited_by, accepted, created_at')
      .single();
    if (error) throw error;
    if (!data) throw new Error('Invite insert returned no data.');
    return data;
  } catch (error) { handleNetworkError(error); }
}

// Add the current user to a family group (membership-first — see accept flow).
export async function insertMembership(userId: string, familyGroupId: string): Promise<void> {
  try {
    const { error } = await db
      .from('family_group_members')
      .insert({ user_id: userId, family_group_id: familyGroupId });
    if (error) throw error;
  } catch (error) { handleNetworkError(error); }
}

// Mark an invite accepted. Runs AFTER membership insert so the RLS WITH CHECK
// (which requires the caller to be a member of the target group) passes.
export async function markInviteAccepted(inviteId: string): Promise<void> {
  try {
    const { error } = await db
      .from('invites')
      .update({ accepted: true })
      .eq('id', inviteId);
    if (error) throw error;
  } catch (error) { handleNetworkError(error); }
}

// Revoke (delete) an invite — group members only, enforced by RLS.
export async function deleteInvite(inviteId: string): Promise<void> {
  try {
    const { error } = await db.from('invites').delete().eq('id', inviteId);
    if (error) throw error;
  } catch (error) { handleNetworkError(error); }
}
