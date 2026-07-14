// src/features/appointments/hooks/useActiveAppointment.ts
// Hook — manages the in-progress appointment state.
// All captures (notes, todos, events) are held in local state.
// On save, everything is written to Supabase in a single batch.
// No business logic leaks into the screen.

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { queryKeys } from '@/lib/queryClient';
import { insertNote } from '@/features/notes/repository/notes.repository';
import { insertTodo } from '@/features/todos/repository/todos.repository';
import { updateVisit } from '@/features/visits/repository/visits.repository';
import { fetchFamilyGroup } from '@/features/family/repository/family.repository';
import { buildEventNoteContent } from '@/features/medical-events/domain/medical-events.domain';
import { toAppError, isAppError } from '@/shared/types/errors';

import type { ActiveAppointment, AppointmentNote, AppointmentTodo, AppointmentEvent } from '../types/appointments.types';
import type { MedicalEventType } from '@/features/medical-events/types/medical-events.types';
import type { AppError } from '@/shared/types/errors';

// Simple local id generator — no dependency needed
function localId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export interface UseActiveAppointmentReturn {
  appointment: ActiveAppointment | null;
  isSaving: boolean;
  error: AppError | null;
  startAppointment: (params: Omit<ActiveAppointment, 'notes' | 'todos' | 'events' | 'postNotes'>) => void;
  addNote: (content: string) => void;
  removeNote: (id: string) => void;
  addTodo: (title: string) => void;
  removeTodo: (id: string) => void;
  addEvent: (eventDate: string, eventType: MedicalEventType, description: string) => void;
  removeEvent: (id: string) => void;
  setPostNotes: (text: string) => void;
  saveAppointment: () => Promise<void>;
  cancelAppointment: () => void;
  clearAppointment: () => void;
}

export function useActiveAppointment(): UseActiveAppointmentReturn {
  const queryClient = useQueryClient();
  const [appointment, setAppointment] = useState<ActiveAppointment | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const startAppointment = useCallback((
    params: Omit<ActiveAppointment, 'notes' | 'todos' | 'events' | 'postNotes'>,
  ) => {
    setAppointment({ ...params, notes: [], todos: [], events: [], postNotes: '' });
    setError(null);
  }, []);

  const addNote = useCallback((content: string) => {
    if (!content.trim()) return;
    setAppointment((prev) => prev
      ? { ...prev, notes: [...prev.notes, { id: localId(), content: content.trim(), capturedAt: Date.now() }] }
      : prev);
  }, []);

  const removeNote = useCallback((id: string) => {
    setAppointment((prev) => prev
      ? { ...prev, notes: prev.notes.filter((n) => n.id !== id) }
      : prev);
  }, []);

  const addTodo = useCallback((title: string) => {
    if (!title.trim()) return;
    setAppointment((prev) => prev
      ? { ...prev, todos: [...prev.todos, { id: localId(), title: title.trim(), capturedAt: Date.now() }] }
      : prev);
  }, []);

  const removeTodo = useCallback((id: string) => {
    setAppointment((prev) => prev
      ? { ...prev, todos: prev.todos.filter((t) => t.id !== id) }
      : prev);
  }, []);

  const addEvent = useCallback((
    eventDate: string, eventType: MedicalEventType, description: string,
  ) => {
    setAppointment((prev) => prev
      ? { ...prev, events: [...prev.events, { id: localId(), eventDate, eventType, description, capturedAt: Date.now() }] }
      : prev);
  }, []);

  const removeEvent = useCallback((id: string) => {
    setAppointment((prev) => prev
      ? { ...prev, events: prev.events.filter((e) => e.id !== id) }
      : prev);
  }, []);

  const setPostNotes = useCallback((text: string) => {
    setAppointment((prev) => prev ? { ...prev, postNotes: text } : prev);
  }, []);

  // Save all captured items to Supabase in one go
  const saveAppointment = useCallback(async () => {
    if (!appointment) return;
    setIsSaving(true);
    setError(null);

    try {
      const group = await fetchFamilyGroup();
      if (!group) throw new Error('No family group found.');

      // Save all in parallel
      await Promise.all([
        // Notes
        ...appointment.notes.map((n: AppointmentNote) =>
          insertNote({
            content: n.content,
            personId: appointment.personId,
            doctorId: appointment.doctorId,
            medicationId: null,
            visitId: appointment.visitId,
            familyGroupId: group.id,
            hidden: false,
          }),
        ),
        // Todos
        ...appointment.todos.map((t: AppointmentTodo) =>
          insertTodo({
            title: t.title,
            notes: null,
            dueDate: null,
            personId: appointment.personId,
            familyGroupId: group.id,
            reminderAt: null,
          }),
        ),
        // Medical events (stored as notes)
        ...appointment.events.map((e: AppointmentEvent) =>
          insertNote({
            content: buildEventNoteContent(e.eventDate, e.eventType, e.description),
            personId: appointment.personId,
            doctorId: appointment.doctorId,
            medicationId: null,
            visitId: appointment.visitId,
            familyGroupId: group.id,
            hidden: false,
          }),
        ),
        // Post-visit notes on the visit record itself
        ...(appointment.postNotes.trim()
          ? [updateVisit({
              visitId: appointment.visitId,
              title: '', // preserved from existing
              visitDate: appointment.visitDate,
              visitTime: null,
              doctorId: appointment.doctorId,
              preNotes: null,
              postNotes: appointment.postNotes.trim(),
              totalCost: null,
              outOfPocket: null,
              reminderOffsetMinutes: null,
              reminderAt: null,
            })]
          : []),
      ]);

      // Invalidate everything affected
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.byPersonBase(appointment.personId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.medicalEvents.byPerson(appointment.personId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.visits.all });

      const visitId = appointment.visitId;
      setAppointment(null);
      router.replace(`/(app)/visits/${visitId}` as never);
    } catch (err) {
      setError(isAppError(err) ? err : toAppError(err));
    } finally {
      setIsSaving(false);
    }
  }, [appointment, queryClient]);

  const cancelAppointment = useCallback(() => {
    setAppointment(null);
    router.back();
  }, []);

  const clearAppointment = useCallback(() => {
    setAppointment(null);
  }, []);

  return {
    appointment, isSaving, error,
    startAppointment, addNote, removeNote,
    addTodo, removeTodo, addEvent, removeEvent,
    setPostNotes, saveAppointment, cancelAppointment, clearAppointment,
  };
}
