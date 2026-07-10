// src/core/auth/authRepository.ts
import { db } from '@/lib/supabase';
import { toAppError } from '@/shared/types/errors';

import type { Session } from '@supabase/supabase-js';

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignInResult {
  session: Session;
}

export async function signInWithEmail(credentials: SignInCredentials): Promise<SignInResult> {
  const { email, password } = credentials;

  try {
    const { data, error } = await db.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) throw toAppError(error);
    if (!data.session) throw toAppError(new Error('No session returned.'));

    return { session: data.session };
  } catch (err) {
    throw toAppError(err);
  }
}

export interface SignUpCredentials {
  email: string;
  password: string;
}

export interface SignUpResult {
  // When email confirmation is ON, Supabase returns a user but no session —
  // the user must confirm via the emailed link before they can sign in.
  needsEmailConfirmation: boolean;
}

export async function signUpWithEmail(credentials: SignUpCredentials): Promise<SignUpResult> {
  const { email, password } = credentials;

  try {
    const { data, error } = await db.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) throw toAppError(error);

    // No session means email confirmation is required.
    return { needsEmailConfirmation: !data.session };
  } catch (err) {
    throw toAppError(err);
  }
}

export interface CreateFamilyGroupParams {
  userId: string;
  familyGroupName: string;
}

export async function createFamilyGroup(params: CreateFamilyGroupParams): Promise<string> {
  const { userId, familyGroupName } = params;

  // Guard: if this user already belongs to a group, do NOT create another.
  // Prevents duplicate-group creation when onboarding is re-submitted off a
  // stale "no membership" cache (the 2026-07-02 double-create incident).
  const { data: existing, error: existingError } = await db
    .from('family_group_members')
    .select('family_group_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  if (existingError) throw toAppError(existingError);
  if (existing?.family_group_id) return existing.family_group_id;

  const { data: group, error: groupError } = await db
    .from('family_groups')
    .insert({ name: familyGroupName, owner_id: userId })
    .select('id')
    .single();

  if (groupError) throw toAppError(groupError);
  if (!group) throw toAppError(new Error('Family group creation returned no data.'));

  const { error: memberError } = await db
    .from('family_group_members')
    .insert({ user_id: userId, family_group_id: group.id });

  if (memberError) throw toAppError(memberError);

  return group.id;
}

export interface RequestPasswordResetParams {
  email: string;
}

export async function requestPasswordReset(params: RequestPasswordResetParams): Promise<void> {
  try {
    const { error } = await db.auth.resetPasswordForEmail(params.email.trim().toLowerCase(), {
      redirectTo: 'family-health://reset-password',
    });
    if (error) throw toAppError(error);
  } catch (err) {
    throw toAppError(err);
  }
}

export interface ExchangeRecoveryCodeParams {
  code: string;
}

export async function exchangeRecoveryCode(params: ExchangeRecoveryCodeParams): Promise<void> {
  try {
    const { error } = await db.auth.exchangeCodeForSession(params.code);
    if (error) throw toAppError(error);
  } catch (err) {
    throw toAppError(err);
  }
}

export interface UpdatePasswordParams {
  password: string;
}

export async function updatePassword(params: UpdatePasswordParams): Promise<void> {
  try {
    const { error } = await db.auth.updateUser({ password: params.password });
    if (error) throw toAppError(error);
  } catch (err) {
    throw toAppError(err);
  }
}
