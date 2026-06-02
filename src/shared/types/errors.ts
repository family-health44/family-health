// src/shared/types/errors.ts
// Shared error types used across all feature layers.
// Repositories catch Supabase errors and map them to these types.
// Hooks and components only ever see AppError — never raw Supabase errors.

export type AppErrorCode =
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly originalError?: unknown;

  constructor(message: string, code: AppErrorCode, originalError?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.originalError = originalError;
  }
}

// Type guard — use in catch blocks
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

// Maps raw Supabase/network errors to AppError
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error;

  if (error instanceof Error) {
    // Supabase auth errors
    if (error.message.includes('Invalid login credentials')) {
      return new AppError('Invalid email or password.', 'AUTH_ERROR', error);
    }
    if (error.message.includes('Email not confirmed')) {
      return new AppError('Please confirm your email before signing in.', 'AUTH_ERROR', error);
    }
    if (error.message.includes('JWT')) {
      return new AppError('Your session has expired. Please sign in again.', 'AUTH_ERROR', error);
    }
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return new AppError('Network error. Please check your connection.', 'NETWORK_ERROR', error);
    }
    return new AppError(error.message, 'UNKNOWN', error);
  }

  return new AppError('An unexpected error occurred.', 'UNKNOWN', error);
}
