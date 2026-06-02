// src/features/appointments/types/appointments.types.ts
// Types for the Start Appointment flow.
// An active appointment is held in local state — nothing persisted until saved.

import type { MedicalEventType } from '@/features/medical-events/types/medical-events.types';

// A note captured during the appointment (before save)
export interface AppointmentNote {
  id: string; // local uuid
  content: string;
}

// A todo captured during the appointment
export interface AppointmentTodo {
  id: string; // local uuid
  title: string;
}

// A medical event captured during the appointment
export interface AppointmentEvent {
  id: string; // local uuid
  eventDate: string;
  eventType: MedicalEventType;
  description: string;
}

// The full in-progress appointment state
export interface ActiveAppointment {
  visitId: string;
  personId: string;
  personName: string;
  doctorId: string | null;
  doctorName: string | null;
  visitDate: string;
  notes: AppointmentNote[];
  todos: AppointmentTodo[];
  events: AppointmentEvent[];
  postNotes: string;
}
