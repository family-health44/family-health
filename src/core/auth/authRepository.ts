// src/core/auth/authRepository.ts
import { db } from '@/lib/supabase';
import { toAppError } from '@/shared/types/errors';
import { ENV } from '@/core/config/env';

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

  console.log('[Auth] URL:', ENV.supabaseUrl);
  console.log('[Auth] Signing in:', email);

  try {
    const { data, error } = await db.auth.signInWithPassword({ 
      email: email.trim(), 
      password 
    });

    console.log('[Auth] Error:', JSON.stringify(error));
    console.log('[Auth] Data:', data?.session ? 'session exists' : 'no session');

    if (error) throw toAppError(error);
    if (!data.session) throw toAppError(new Error('No session returned.'));

    return { session: data.session };
  } catch (err) {
    console.log('[Auth] Caught error:', JSON.stringify(err));
    throw toAppError(err);
  }
}

export interface CreateFamilyGroupParams {
  userId: string;
  familyGroupName: string;
}

export async function createFamilyGroup(params: CreateFamilyGroupParams): Promise<string> {
  const { userId, familyGroupName } = params;

  const { data: group, error: groupError } = await db
    .from('family_groups')
    .insert({ name: familyGroupName })
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
