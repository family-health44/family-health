// src/core/sync/queueProcessor.ts
// Processes the offline mutation queue when connectivity is restored.
// Maps each QueuedMutationType to its repository function and executes in order.
// Imported only by useSyncManager — not by hooks or components.

import { insertPerson, updatePersonName } from '@/features/family/repository/family.repository';
import { insertDoctor, linkDoctorToPerson, unlinkDoctorFromPerson } from '@/features/doctors/repository/doctors.repository';
import { insertMedication, updateMedicationStatus } from '@/features/medications/repository/medications.repository';
import { insertVisit } from '@/features/visits/repository/visits.repository';
import { insertTodo, updateTodoCompleted, deleteTodo } from '@/features/todos/repository/todos.repository';
import { insertNote, updateNote, deleteNote } from '@/features/notes/repository/notes.repository';
import {
  getQueue,
  dequeue,
  incrementRetry,
  isNetworkError,
  MAX_RETRIES,
  type QueuedMutation,
} from './offlineQueue';

// ─── Type-safe payload interfaces ─────────────────────────────────────────────

interface AddPersonPayload { name: string; familyGroupId: string }
interface UpdatePersonPayload { personId: string; name: string }
interface AddDoctorPayload { name: string; type: string | null; address: string | null; phone: string | null; familyGroupId: string }
interface LinkDoctorPayload { doctorId: string; personId: string }
interface AddMedicationPayload { name: string; dosage: string | null; frequency: string | null; reason: string | null; status: 'active' | 'as_needed' | 'inactive'; startDate: string | null; endDate: string | null; personId: string; prescribedBy: string | null; familyGroupId: string }
interface UpdateMedicationStatusPayload { medicationId: string; status: 'active' | 'as_needed' | 'inactive' }
interface AddVisitPayload { title: string; visitDate: string; visitTime: string | null; doctorId: string | null; personId: string; familyGroupId: string; preNotes: string | null; postNotes: string | null; totalCost: number | null; outOfPocket: number | null }
interface AddTodoPayload { title: string; notes: string | null; dueDate: string | null; personId: string | null; familyGroupId: string }
interface ToggleTodoPayload { todoId: string; completed: boolean }
interface DeleteTodoPayload { todoId: string }
interface AddNotePayload { content: string; personId: string | null; doctorId: string | null; medicationId: string | null; visitId: string | null; familyGroupId: string; hidden: boolean }
interface UpdateNotePayload { noteId: string; content: string; doctorId: string | null; medicationId: string | null; visitId: string | null; hidden: boolean }
interface DeleteNotePayload { noteId: string }

// ─── Executor ─────────────────────────────────────────────────────────────────

async function executeMutation(mutation: QueuedMutation): Promise<void> {
  const { type, payload } = mutation;

  switch (type) {
    case 'ADD_PERSON': {
      const p = payload as AddPersonPayload;
      await insertPerson(p.name, p.familyGroupId);
      break;
    }
    case 'UPDATE_PERSON': {
      const p = payload as UpdatePersonPayload;
      await updatePersonName(p.personId, p.name);
      break;
    }
    case 'ADD_DOCTOR': {
      const p = payload as AddDoctorPayload;
      await insertDoctor(p);
      break;
    }
    case 'LINK_DOCTOR': {
      const p = payload as LinkDoctorPayload;
      await linkDoctorToPerson(p.doctorId, p.personId);
      break;
    }
    case 'UNLINK_DOCTOR': {
      const p = payload as LinkDoctorPayload;
      await unlinkDoctorFromPerson(p.doctorId, p.personId);
      break;
    }
    case 'ADD_MEDICATION': {
      const p = payload as AddMedicationPayload;
      await insertMedication(p);
      break;
    }
    case 'UPDATE_MEDICATION_STATUS': {
      const p = payload as UpdateMedicationStatusPayload;
      await updateMedicationStatus(p.medicationId, p.status);
      break;
    }
    case 'ADD_VISIT': {
      const p = payload as AddVisitPayload;
      await insertVisit(p);
      break;
    }
    case 'ADD_TODO': {
      const p = payload as AddTodoPayload;
      await insertTodo(p);
      break;
    }
    case 'TOGGLE_TODO': {
      const p = payload as ToggleTodoPayload;
      await updateTodoCompleted(p.todoId, p.completed);
      break;
    }
    case 'DELETE_TODO': {
      const p = payload as DeleteTodoPayload;
      await deleteTodo(p.todoId);
      break;
    }
    case 'ADD_NOTE': {
      const p = payload as AddNotePayload;
      await insertNote(p);
      break;
    }
    case 'UPDATE_NOTE': {
      const p = payload as UpdateNotePayload;
      await updateNote(p);
      break;
    }
    case 'DELETE_NOTE': {
      const p = payload as DeleteNotePayload;
      await deleteNote(p.noteId);
      break;
    }
    case 'ADD_MEDICAL_EVENT': {
      // Medical events are stored as notes
      const p = payload as AddNotePayload;
      await insertNote(p);
      break;
    }
    default:
      console.warn('[QueueProcessor] Unknown mutation type:', type);
  }
}

// ─── Drain ────────────────────────────────────────────────────────────────────

export interface DrainResult {
  processed: number;
  failed: number;
  dropped: number;
}

// Processes all queued mutations in order.
// Network errors increment retry count and keep the item in queue.
// Non-network errors (validation, auth) are dropped after MAX_RETRIES.
export async function drainQueue(): Promise<DrainResult> {
  const queue = getQueue();
  if (queue.length === 0) return { processed: 0, failed: 0, dropped: 0 };

  const result: DrainResult = { processed: 0, failed: 0, dropped: 0 };

  for (const mutation of queue) {
    try {
      await executeMutation(mutation);
      dequeue(mutation.id);
      result.processed++;
    } catch (error) {
      if (isNetworkError(error)) {
        // Keep in queue — will retry on next reconnect
        result.failed++;
        return result; // Stop processing — still offline
      }

      // Non-network error — increment retry count
      incrementRetry(mutation.id);

      if (mutation.retryCount >= MAX_RETRIES) {
        // Drop after too many failures to avoid blocking the queue
        console.error('[QueueProcessor] Dropping mutation after max retries:', mutation.type, error);
        dequeue(mutation.id);
        result.dropped++;
      } else {
        result.failed++;
      }
    }
  }

  return result;
}
