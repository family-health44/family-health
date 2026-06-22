// src/features/medications/types/medications.types.ts
// Domain types for the medications feature.

export type MedicationStatus = 'active' | 'as_needed' | 'inactive';

export interface Medication {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  reason: string | null;
  status: MedicationStatus;
  startDate: string | null;
  endDate: string | null;
  personId: string;
  prescribedBy: string | null; // doctor id
  prescribedByName: string | null; // doctor name — joined at query layer
  familyGroupId: string;
  form: string | null;
  timeOfDay: string | null;
  withFood: string | null;
  repeatsLeft: number | null;
  nextRefill: string | null;
  pharmacy: string | null;
}

// Grouped by status for display
export interface MedicationGroup {
  status: MedicationStatus;
  label: string;
  medications: Medication[];
}
