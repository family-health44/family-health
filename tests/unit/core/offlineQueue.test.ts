// tests/unit/core/offlineQueue.test.ts
// Tests for the offline mutation queue.
// Mocks MMKV so no native module is needed in unit tests.

// Mock the mmkv module before importing queue functions
jest.mock('@/core/storage/mmkv', () => {
  const store: Record<string, string> = {};
  return {
    mmkv: {
      getString: (key: string) => store[key],
      setString: (key: string, value: string) => { store[key] = value; },
      delete: (key: string) => { delete store[key]; },
      contains: (key: string) => key in store,
    },
    STORAGE_KEYS: {
      OFFLINE_QUEUE: 'offline_queue',
      FAMILY_DISPLAY_NAME: 'family_display_name',
    },
  };
});

import {
  enqueue,
  dequeue,
  getQueue,
  clearQueue,
  incrementRetry,
  getQueueLength,
} from '@/core/sync/offlineQueue';

describe('offlineQueue', () => {
  beforeEach(() => {
    clearQueue();
  });

  describe('enqueue', () => {
    it('adds a mutation to the queue', () => {
      enqueue('ADD_TODO', { title: 'Test', personId: 'p1' });
      expect(getQueueLength()).toBe(1);
    });

    it('assigns a unique id', () => {
      const m1 = enqueue('ADD_TODO', {});
      const m2 = enqueue('ADD_TODO', {});
      expect(m1.id).not.toBe(m2.id);
    });

    it('sets retryCount to 0', () => {
      const mutation = enqueue('ADD_TODO', {});
      expect(mutation.retryCount).toBe(0);
    });

    it('adds in order', () => {
      enqueue('ADD_TODO', { title: 'First' });
      enqueue('ADD_NOTE', { content: 'Second' });
      const queue = getQueue();
      expect(queue[0]?.type).toBe('ADD_TODO');
      expect(queue[1]?.type).toBe('ADD_NOTE');
    });
  });

  describe('dequeue', () => {
    it('removes a mutation by id', () => {
      const m = enqueue('ADD_TODO', {});
      dequeue(m.id);
      expect(getQueueLength()).toBe(0);
    });

    it('only removes the specified mutation', () => {
      enqueue('ADD_TODO', {});
      const m2 = enqueue('ADD_NOTE', {});
      dequeue(m2.id);
      expect(getQueueLength()).toBe(1);
      expect(getQueue()[0]?.type).toBe('ADD_TODO');
    });
  });

  describe('incrementRetry', () => {
    it('increments retry count for the specified mutation', () => {
      const m = enqueue('ADD_TODO', {});
      incrementRetry(m.id);
      incrementRetry(m.id);
      const queue = getQueue();
      expect(queue[0]?.retryCount).toBe(2);
    });
  });

  describe('clearQueue', () => {
    it('removes all mutations', () => {
      enqueue('ADD_TODO', {});
      enqueue('ADD_NOTE', {});
      clearQueue();
      expect(getQueueLength()).toBe(0);
    });
  });

  describe('getQueueLength', () => {
    it('returns correct count', () => {
      expect(getQueueLength()).toBe(0);
      enqueue('ADD_TODO', {});
      expect(getQueueLength()).toBe(1);
      enqueue('ADD_TODO', {});
      expect(getQueueLength()).toBe(2);
    });
  });
});
