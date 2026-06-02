// src/features/family/types/person.types.ts
// Person detail types — tab definitions and related data shapes.

export type PersonTab = 'overview' | 'doctors' | 'medications' | 'medical-events';

export interface PersonTabConfig {
  key: PersonTab;
  label: string;
}

export const PERSON_TABS: PersonTabConfig[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'doctors', label: 'Doctors' },
  { key: 'medications', label: 'Medications' },
  { key: 'medical-events', label: 'Events' },
] as const;
