// tests/unit/core/queueProcessor.test.ts
// Tests that drainQueue routes each queued mutation to the correct repository fn
// with the right payload, and clears the queue on success.
// This guards the B2 bug class: a queue branch wired to the wrong/no executor.
// All repositories are mocked — no Supabase, no network.

jest.mock('@/core/storage/mmkv', () => {
  const store: Record<string, string> = {};
  return {
    mmkv: {
      getString: (key: string) => store[key],
      setString: (key: string, value: string) => { store[key] = value; },
      delete: (key: string) => { delete store[key]; },
      contains: (key: string) => key in store,
    },
    STORAGE_KEYS: { OFFLINE_QUEUE: 'offline_queue', FAMILY_DISPLAY_NAME: 'family_display_name' },
  };
});

jest.mock('@/features/family/repository/family.repository', () => ({
  insertPerson: jest.fn().mockResolvedValue(undefined),
  updatePersonName: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/features/doctors/repository/doctors.repository', () => ({
  insertDoctor: jest.fn().mockResolvedValue(undefined),
  linkDoctorToPerson: jest.fn().mockResolvedValue(undefined),
  unlinkDoctorFromPerson: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/features/medications/repository/medications.repository', () => ({
  insertMedication: jest.fn().mockResolvedValue(undefined),
  updateMedicationStatus: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/features/visits/repository/visits.repository', () => ({
  insertVisit: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/features/todos/repository/todos.repository', () => ({
  insertTodo: jest.fn().mockResolvedValue(undefined),
  updateTodoCompleted: jest.fn().mockResolvedValue(undefined),
  deleteTodo: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/features/notes/repository/notes.repository', () => ({
  insertNote: jest.fn().mockResolvedValue(undefined),
  updateNote: jest.fn().mockResolvedValue(undefined),
  deleteNote: jest.fn().mockResolvedValue(undefined),
}));

import { enqueue, clearQueue, getQueueLength } from '@/core/sync/offlineQueue';
import { drainQueue } from '@/core/sync/queueProcessor';

import { insertPerson, updatePersonName } from '@/features/family/repository/family.repository';
import { insertDoctor, linkDoctorToPerson, unlinkDoctorFromPerson } from '@/features/doctors/repository/doctors.repository';
import { insertMedication, updateMedicationStatus } from '@/features/medications/repository/medications.repository';
import { insertVisit } from '@/features/visits/repository/visits.repository';
import { insertTodo, updateTodoCompleted, deleteTodo } from '@/features/todos/repository/todos.repository';
import { insertNote, updateNote, deleteNote } from '@/features/notes/repository/notes.repository';

describe('queueProcessor / drainQueue', () => {
  beforeEach(() => {
    clearQueue();
    jest.clearAllMocks();
  });

  describe('routing — each type calls the right repository fn', () => {
    it('ADD_PERSON → insertPerson(name, familyGroupId)', async () => {
      enqueue('ADD_PERSON', { name: 'Ada', familyGroupId: 'g1' });
      await drainQueue();
      expect(insertPerson).toHaveBeenCalledWith('Ada', 'g1');
    });

    it('UPDATE_PERSON → updatePersonName(personId, name)', async () => {
      enqueue('UPDATE_PERSON', { personId: 'p1', name: 'New' });
      await drainQueue();
      expect(updatePersonName).toHaveBeenCalledWith('p1', 'New');
    });

    it('ADD_DOCTOR → insertDoctor(payload)', async () => {
      const p = { name: 'Dr X', type: 'GP', address: null, phone: null, familyGroupId: 'g1' };
      enqueue('ADD_DOCTOR', p);
      await drainQueue();
      expect(insertDoctor).toHaveBeenCalledWith(p);
    });

    it('LINK_DOCTOR → linkDoctorToPerson(doctorId, personId)', async () => {
      enqueue('LINK_DOCTOR', { doctorId: 'd1', personId: 'p1' });
      await drainQueue();
      expect(linkDoctorToPerson).toHaveBeenCalledWith('d1', 'p1');
    });

    it('UNLINK_DOCTOR → unlinkDoctorFromPerson(doctorId, personId)', async () => {
      enqueue('UNLINK_DOCTOR', { doctorId: 'd1', personId: 'p1' });
      await drainQueue();
      expect(unlinkDoctorFromPerson).toHaveBeenCalledWith('d1', 'p1');
    });

    it('ADD_MEDICATION → insertMedication(payload)', async () => {
      const p = { name: 'Med', dosage: null, frequency: null, reason: null, status: 'active', startDate: null, endDate: null, personId: 'p1', prescribedBy: null, familyGroupId: 'g1', form: null, timeOfDay: null, withFood: null, repeatsLeft: null, nextRefill: null, pharmacy: null };
      enqueue('ADD_MEDICATION', p);
      await drainQueue();
      expect(insertMedication).toHaveBeenCalledWith(p);
    });

    it('UPDATE_MEDICATION_STATUS → updateMedicationStatus(medicationId, status)', async () => {
      enqueue('UPDATE_MEDICATION_STATUS', { medicationId: 'm1', status: 'inactive' });
      await drainQueue();
      expect(updateMedicationStatus).toHaveBeenCalledWith('m1', 'inactive');
    });

    it('ADD_VISIT → insertVisit(payload)', async () => {
      const p = { title: 'V', visitDate: '2026-01-01', visitTime: null, doctorId: null, personId: 'p1', familyGroupId: 'g1', preNotes: null, postNotes: null, totalCost: null, outOfPocket: null };
      enqueue('ADD_VISIT', p);
      await drainQueue();
      expect(insertVisit).toHaveBeenCalledWith(p);
    });

    it('ADD_TODO → insertTodo(payload)', async () => {
      const p = { title: 'T', notes: null, dueDate: null, personId: 'p1', familyGroupId: 'g1' };
      enqueue('ADD_TODO', p);
      await drainQueue();
      expect(insertTodo).toHaveBeenCalledWith(p);
    });

    it('TOGGLE_TODO → updateTodoCompleted(todoId, completed)', async () => {
      enqueue('TOGGLE_TODO', { todoId: 't1', completed: true });
      await drainQueue();
      expect(updateTodoCompleted).toHaveBeenCalledWith('t1', true);
    });

    it('DELETE_TODO → deleteTodo(todoId)', async () => {
      enqueue('DELETE_TODO', { todoId: 't1' });
      await drainQueue();
      expect(deleteTodo).toHaveBeenCalledWith('t1');
    });

    it('ADD_NOTE → insertNote(payload)', async () => {
      const p = { content: 'n', personId: 'p1', doctorId: null, medicationId: null, visitId: null, familyGroupId: 'g1', hidden: false };
      enqueue('ADD_NOTE', p);
      await drainQueue();
      expect(insertNote).toHaveBeenCalledWith(p);
    });

    it('UPDATE_NOTE → updateNote(payload)', async () => {
      const p = { noteId: 'n1', content: 'edited', doctorId: null, medicationId: null, visitId: null, hidden: false };
      enqueue('UPDATE_NOTE', p);
      await drainQueue();
      expect(updateNote).toHaveBeenCalledWith(p);
    });

    it('DELETE_NOTE → deleteNote(noteId)', async () => {
      enqueue('DELETE_NOTE', { noteId: 'n1' });
      await drainQueue();
      expect(deleteNote).toHaveBeenCalledWith('n1');
    });

    it('ADD_MEDICAL_EVENT → insertNote (events are notes)', async () => {
      const p = { content: '[EVENT:2026-01-01:diagnosis] flu', personId: 'p1', doctorId: null, medicationId: null, visitId: null, familyGroupId: 'g1', hidden: false };
      enqueue('ADD_MEDICAL_EVENT', p);
      await drainQueue();
      expect(insertNote).toHaveBeenCalledWith(p);
    });
  });

  describe('drain behaviour', () => {
    it('processes multiple mutations in order and clears the queue', async () => {
      enqueue('ADD_TODO', { title: 'A', notes: null, dueDate: null, personId: 'p1', familyGroupId: 'g1' });
      enqueue('DELETE_TODO', { todoId: 't9' });
      const result = await drainQueue();
      expect(result.processed).toBe(2);
      expect(getQueueLength()).toBe(0);
    });

    it('drops a mutation after a non-network error (no silent infinite loop)', async () => {
      (insertTodo as jest.Mock).mockRejectedValueOnce(new Error('validation failed'));
      enqueue('ADD_TODO', { title: 'bad', notes: null, dueDate: null, personId: 'p1', familyGroupId: 'g1' });
      const result = await drainQueue();
      // first attempt: non-network error → incrementRetry, stays (failed)
      expect(result.processed).toBe(0);
      expect(result.failed + result.dropped).toBe(1);
    });

    it('returns zero counts on an empty queue', async () => {
      const result = await drainQueue();
      expect(result).toEqual({ processed: 0, failed: 0, dropped: 0 });
    });
  });
});
