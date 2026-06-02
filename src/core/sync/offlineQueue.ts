// src/core/sync/offlineQueue.ts
// MMKV-backed offline mutation queue.
// When a mutation fails due to network error, it's serialised and stored here.
// On reconnect, the queue is drained in order.
// Only the queue manager imports from this file — not hooks or components directly.

import { mmkv, STORAGE_KEYS } from '@/core/storage/mmkv';
import { toAppError } from '@/shared/types/errors';

// ─── Types ────────────────────────────────────────────────────────────────────

export type QueuedMutationType =
  | 'ADD_PERSON'
  | 'UPDATE_PERSON'
  | 'ADD_DOCTOR'
  | 'LINK_DOCTOR'
  | 'UNLINK_DOCTOR'
  | 'ADD_MEDICATION'
  | 'UPDATE_MEDICATION_STATUS'
  | 'ADD_VISIT'
  | 'ADD_TODO'
  | 'TOGGLE_TODO'
  | 'DELETE_TODO'
  | 'ADD_NOTE'
  | 'UPDATE_NOTE'
  | 'DELETE_NOTE'
  | 'ADD_MEDICAL_EVENT';

export interface QueuedMutation {
  id: string;
  type: QueuedMutationType;
  payload: unknown;
  timestamp: number;
  retryCount: number;
}

// ─── Queue operations ─────────────────────────────────────────────────────────

function readQueue(): QueuedMutation[] {
  try {
    const raw = mmkv.getString(STORAGE_KEYS.OFFLINE_QUEUE);
    if (!raw) return [];
    return JSON.parse(raw) as QueuedMutation[];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedMutation[]): void {
  mmkv.setString(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
}

export function enqueue(type: QueuedMutationType, payload: unknown): QueuedMutation {
  const mutation: QueuedMutation = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    payload,
    timestamp: Date.now(),
    retryCount: 0,
  };
  const queue = readQueue();
  writeQueue([...queue, mutation]);
  return mutation;
}

export function dequeue(id: string): void {
  const queue = readQueue().filter((m) => m.id !== id);
  writeQueue(queue);
}

export function getQueue(): QueuedMutation[] {
  return readQueue();
}

export function clearQueue(): void {
  mmkv.delete(STORAGE_KEYS.OFFLINE_QUEUE);
}

export function incrementRetry(id: string): void {
  const queue = readQueue().map((m) =>
    m.id === id ? { ...m, retryCount: m.retryCount + 1 } : m,
  );
  writeQueue(queue);
}

export function getQueueLength(): number {
  return readQueue().length;
}

// Max retries before a mutation is dropped to avoid infinite loops
export const MAX_RETRIES = 3;

// ─── Network error detection ──────────────────────────────────────────────────

// Returns true if the error is a network connectivity failure
// (as opposed to a validation or auth error that shouldn't be retried)
export function isNetworkError(error: unknown): boolean {
  const appError = toAppError(error);
  return appError.code === 'NETWORK_ERROR';
}
