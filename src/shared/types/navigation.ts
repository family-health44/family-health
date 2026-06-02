// src/shared/types/navigation.ts
// Typed route parameters for Expo Router.
// Import these wherever useLocalSearchParams or router.push is used
// to ensure route params are typed end-to-end.

export interface PersonRouteParams {
  personId: string;
}

export interface VisitRouteParams {
  visitId: string;
}

// Route path constants — use these instead of raw strings to catch typos at compile time
export const Routes = {
  // Auth
  signIn: '/(auth)/sign-in' as const,
  onboarding: '/(auth)/onboarding' as const,

  // App
  family: '/(app)/family' as const,
  personDetail: (personId: string) => `/(app)/family/${personId}` as const,
  personDoctors: (personId: string) => `/(app)/family/${personId}/doctors` as const,
  personMedications: (personId: string) => `/(app)/family/${personId}/medications` as const,
  personMedicalEvents: (personId: string) => `/(app)/family/${personId}/medical-events` as const,

  visits: '/(app)/visits' as const,
  visitDetail: (visitId: string) => `/(app)/visits/${visitId}` as const,

  todos: '/(app)/todos' as const,
  settings: '/(app)/settings' as const,
} as const;
