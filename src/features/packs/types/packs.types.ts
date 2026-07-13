// src/features/packs/types/packs.types.ts
// Domain types for Appointment Packs.
//
// GUARDRAIL: a Pack contains only records the user entered, filtered and
// reordered. No synthesis, no trends, no flags, no recommendations.
// Never title the output "Health Summary" or "Report".

export type PackSectionKey =
  | 'info'
  | 'prenotes'
  | 'medications'
  | 'events'
  | 'doctors'
  | 'visits'
  | 'todos'
  | 'questions'
  | 'documents';

export interface PackSectionConfig {
  key: PackSectionKey;
  label: string;
  hint: string;
}

export const PACK_SECTIONS: PackSectionConfig[] = [
  { key: 'info', label: 'Person details', hint: 'DOB, Medicare, allergies, health fund' },
  { key: 'prenotes', label: 'Pre-appointment notes', hint: 'What you saved on this visit' },
  { key: 'medications', label: 'Current medications', hint: 'Active and as-needed' },
  { key: 'events', label: 'Conditions & events', hint: 'Diagnoses, procedures, illnesses' },
  { key: 'doctors', label: 'Doctors & providers', hint: 'Contact details' },
  { key: 'visits', label: 'Recent visits', hint: 'Last 5 past appointments' },
  { key: 'todos', label: 'Open to dos', hint: 'Outstanding follow-ups' },
  { key: 'questions', label: 'Notes & questions', hint: 'Typed now, not saved' },
  { key: 'documents', label: 'Attached documents', hint: 'Visit files, added to the end of the pack' },
];

export type PackSelection = Record<PackSectionKey, boolean>;

export const DEFAULT_PACK_SELECTION: PackSelection = {
  info: true,
  prenotes: true,
  medications: true,
  events: true,
  doctors: false,
  visits: true,
  todos: true,
  questions: true,
  documents: true,
};
