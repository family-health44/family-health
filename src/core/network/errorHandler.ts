// src/core/network/errorHandler.ts
// Centralised network error handler used by all repositories.
// Catches Supabase PostgREST errors, auth errors, and network failures
// and maps them to typed AppError instances.
// No React imports — pure TypeScript only.

import { AppError, toAppError } from '@/shared/types/errors';
import type { AppErrorCode } from '@/shared/types/errors';

// Supabase PostgREST error shape
interface PostgrestError {
  code: string;
  message: string;
  details: string | null;
  hint: string | null;
}

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

// Maps Supabase/PostgREST error codes to AppErrorCode
function postgrestCodeToAppCode(code: string): AppErrorCode {
  switch (code) {
    case '42501': // insufficient_privilege
    case 'PGRST301': // JWT expired
      return 'AUTH_ERROR';
    case 'PGRST116': // not found
      return 'NOT_FOUND';
    case '23505': // unique_violation
    case '23503': // foreign_key_violation
      return 'VALIDATION_ERROR';
    default:
      return 'SERVER_ERROR';
  }
}

// Primary handler — call this in every repository catch block
export function handleNetworkError(error: unknown): never {
  if (error instanceof AppError) throw error;

  // Network failures (RN throws `TypeError: Network request failed`, sometimes as a
  // plain object not an Error) can also satisfy the loose PostgREST shape check, so
  // classify them FIRST. Match on message regardless of the object's prototype.
  {
    const m = (error as { message?: unknown })?.message;
    if (typeof m === 'string' && /network request failed|fetch|network|timeout/i.test(m)) {
      throw new AppError('You\u2019re offline. Connect to save.', 'NETWORK_ERROR', error);
    }
  }

  if (isPostgrestError(error)) {
    const code = postgrestCodeToAppCode(error.code);
    throw new AppError(error.message, code, error);
  }

  throw toAppError(error);
}

// Wraps an async repository function with consistent error handling.
// Usage: return withErrorHandling(() => supabase.from('table').select())
export async function withErrorHandling<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    handleNetworkError(error);
  }
}
