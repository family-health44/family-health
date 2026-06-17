// src/shared/types/database.ts
// TypeScript types generated from the existing Supabase schema.
// These are the raw database row shapes — feature layers map these to domain types.
// Only repositories and the Supabase client import from this file.
// Never use these types directly in UI components — use domain types instead.

// ─── Enums ────────────────────────────────────────────────────────────────────

export type MedicationStatus = 'active' | 'as_needed' | 'inactive';

// ─── Table row types ──────────────────────────────────────────────────────────

export interface DbFamilyGroup {
  id: string;
  name: string;
}

export interface DbFamilyGroupMember {
  id: string;
  user_id: string;
  family_group_id: string;
}

export interface DbPerson {
  id: string;
  name: string;
  family_group_id: string;
  created_at: string | null;
  // Note: no colour column in database — colour is assigned by index in domain layer
  // Info Card fields — all nullable; columns already exist in DB schema.
  dob: string | null;
  medicare_number: string | null;
  blood_type: string | null;
  immunisations_current: boolean | null;
  allergies: string | null;
  diagnoses: string | null;
  health_fund: string | null;
  health_fund_number: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  notes: string | null;
}

export interface DbDoctorType {
  id: string;
  name: string;
  family_group_id: string;
}

export interface DbDoctor {
  id: string;
  name: string;
  type: string | null;
  address: string | null;
  phone: string | null;
  family_group_id: string;
}

export interface DbPeopleDoctor {
  person_id: string;
  doctor_id: string;
}

export interface DbMedication {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  reason: string | null;
  status: string; // raw DB value; narrowed via normaliseMedicationStatus in domain layer
  start_date: string | null;
  end_date: string | null;
  person_id: string;
  prescribed_by: string | null;
  family_group_id: string;
}

export interface DbVisit {
  id: string;
  title: string;
  visit_date: string;
  visit_time: string | null;
  doctor_id: string | null;
  person_id: string;
  family_group_id: string;
  pre_notes: string | null;
  post_notes: string | null;
}

export interface DbNote {
  id: string;
  content: string;
  person_id: string | null;
  doctor_id: string | null;
  medication_id: string | null;
  visit_id: string | null;
  family_group_id: string;
  hidden: boolean;
}

export interface DbTodo {
  id: string;
  title: string;
  notes: string | null;
  due_date: string | null;
  completed: boolean;
  person_id: string | null;
  doctor_id: string | null;
  visit_id: string | null;
  family_group_id: string;
}

export interface DbDocument {
  id: string;
  name: string;
  file_url: string;
  person_id: string | null;
  visit_id: string | null;
  family_group_id: string;
}

// ─── Insert types (id and defaults omitted) ───────────────────────────────────

export type DbPersonInsert = Omit<DbPerson, 'id'>;
export type DbDoctorInsert = Omit<DbDoctor, 'id'>;
export type DbMedicationInsert = Omit<DbMedication, 'id'>;
export type DbVisitInsert = Omit<DbVisit, 'id'>;
export type DbNoteInsert = Omit<DbNote, 'id'>;
export type DbTodoInsert = Omit<DbTodo, 'id'>;
export type DbDocumentInsert = Omit<DbDocument, 'id'>;

// ─── Update types (all fields optional except id) ─────────────────────────────

export type DbPersonUpdate = Partial<Omit<DbPerson, 'id'>>;
export type DbDoctorUpdate = Partial<Omit<DbDoctor, 'id'>>;
export type DbMedicationUpdate = Partial<Omit<DbMedication, 'id'>>;
export type DbVisitUpdate = Partial<Omit<DbVisit, 'id'>>;
export type DbNoteUpdate = Partial<Omit<DbNote, 'id'>>;
export type DbTodoUpdate = Partial<Omit<DbTodo, 'id'>>;
export type DbDocumentUpdate = Partial<Omit<DbDocument, 'id'>>;

// ─── Supabase database type map ───────────────────────────────────────────────
// The Database type is generated from the live schema via:
//   npx supabase gen types --linked --schema public > database.generated.ts
// It is re-exported here so existing imports (`@/shared/types/database`) are
// unchanged. The generated type is structurally what supabase-js's generics
// expect, which resolves the `never` insert/update errors the hand-written
// type produced. The Db* domain row types above are kept as-is — the domain
// layer depends on their shape (e.g. DbVisit.visit_time, narrowed MedicationStatus).
export type { Database } from './database.generated';
