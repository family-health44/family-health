// src/features/appointments/types/appointments.types.ts
// Types for the Start Appointment flow.
// An active appointment is held in local state — nothing persisted until saved.

import type { MedicalEventType } from '@/features/medical-events/types/medical-events.types';

export interface AppointmentNote {
  id: string;
  content: string;
  capturedAt: number;
}

export interface AppointmentTodo {
  id: string;
  title: string;
  capturedAt: number;
}

export interface AppointmentEvent {
  id: string;
  eventDate: string;
  eventType: MedicalEventType;
  description: string;
  capturedAt: number;
}

export interface ActiveAppointment {
  visitId: string;
  personId: string;
  personName: string;
  doctorId: string | null;
  doctorName: string | null;
  visitDate: string;
  preNotes: string | null;
  notes: AppointmentNote[];
  todos: AppointmentTodo[];
  events: AppointmentEvent[];
  postNotes: string;
}
