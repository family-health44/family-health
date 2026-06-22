// src/features/medication-logs/types/medication-logs.types.ts
// Domain types for the medication logs feature.

// 1–5 feeling scale (😣 Bad / 😕 Off / 😐 Neutral / 😊 Good / 😄 Great)
export type Feeling = 1 | 2 | 3 | 4 | 5;

export type DoseStatus = 'taken' | 'missed' | 'different';

export interface MedicationLog {
  id: string;
  medicationId: string;
  personId: string;
  familyGroupId: string;
  loggedDate: string;            // YYYY-MM-DD
  loggedTime: string | null;     // HH:MM[:SS]
  feeling: Feeling | null;
  doseStatus: DoseStatus | null;
  note: string | null;
  tags: string[];
  createdAt: string | null;
}

// Form values from the Add/Edit Log sheet.
export interface MedicationLogFormValues {
  loggedDate: string;
  loggedTime: string | null;
  feeling: Feeling | null;
  doseStatus: DoseStatus | null;
  note: string | null;
  tags: string[];
}

// Derived stats for the detail-screen stat strip.
export interface MedicationLogStats {
  count: number;
  mostCommonFeeling: Feeling | null;
  weeksOnMed: number | null;
}
