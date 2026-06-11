// src/features/auth/types/auth.types.ts
// Auth feature types — Zod schemas and derived TypeScript types.
// Zod schemas are the single source of truth for form validation.
// These types are used by the sign-in form, onboarding form, and auth hooks.

import { z } from 'zod';

// ─── Sign in ──────────────────────────────────────────────────────────────────

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

// ─── Onboarding ───────────────────────────────────────────────────────────────

export const onboardingSchema = z.object({
  familyGroupName: z
    .string()
    .min(1, 'Family name is required')
    .min(2, 'Family name must be at least 2 characters')
    .max(50, 'Family name must be under 50 characters'),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;

// ─── Sign up ──────────────────────────────────────────────────────────────────

export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;
