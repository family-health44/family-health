// src/shared/types/database.ts
// TypeScript types generated from the existing Supabase schema.
// These are the raw database row shapes — feature layers map these to domain types.
// Only repositories and the Supabase client import from this file.
// Never use these types directly in UI components — use domain types instead.

// ─── Enums ────────────────────────────────────────────────────────────────────

export type MedicationStatus = 'active' | 'inactive' | 'completed';

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
  colour: string | null;
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
  status: MedicationStatus;
  start_date: string | null; // ISO date string
  end_date: string | null;   // ISO date string
  person_id: string;
  prescribed_by: string | null; // doctor_id
  family_group_id: string;
}

export interface DbVisit {
  id: string;
  title: string;
  visit_date: string;      // ISO date string
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
  due_date: string | null; // ISO date string
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
// Used to type the Supabase client in src/lib/supabase.ts

export interface Database {
  public: {
    Tables: {
      family_groups: {
        Row: DbFamilyGroup;
        Insert: Omit<DbFamilyGroup, 'id'>;
        Update: Partial<Omit<DbFamilyGroup, 'id'>>;
      };
      family_group_members: {
        Row: DbFamilyGroupMember;
        Insert: Omit<DbFamilyGroupMember, 'id'>;
        Update: Partial<Omit<DbFamilyGroupMember, 'id'>>;
      };
      people: {
        Row: DbPerson;
        Insert: DbPersonInsert;
        Update: DbPersonUpdate;
      };
      doctor_types: {
        Row: DbDoctorType;
        Insert: Omit<DbDoctorType, 'id'>;
        Update: Partial<Omit<DbDoctorType, 'id'>>;
      };
      doctors: {
        Row: DbDoctor;
        Insert: DbDoctorInsert;
        Update: DbDoctorUpdate;
      };
      people_doctors: {
        Row: DbPeopleDoctor;
        Insert: DbPeopleDoctor;
        Update: Partial<DbPeopleDoctor>;
      };
      medications: {
        Row: DbMedication;
        Insert: DbMedicationInsert;
        Update: DbMedicationUpdate;
      };
      visits: {
        Row: DbVisit;
        Insert: DbVisitInsert;
        Update: DbVisitUpdate;
      };
      notes: {
        Row: DbNote;
        Insert: DbNoteInsert;
        Update: DbNoteUpdate;
      };
      todos: {
        Row: DbTodo;
        Insert: DbTodoInsert;
        Update: DbTodoUpdate;
      };
      documents: {
        Row: DbDocument;
        Insert: DbDocumentInsert;
        Update: DbDocumentUpdate;
      };
    };
    Functions: {
      my_family_group_ids: {
        Args: Record<string, never>;
        Returns: string[];
      };
    };
  };
}
