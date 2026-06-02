// src/core/sync/withOfflineQueue.ts
// Higher-order function that wraps any async mutation.
// If the mutation fails with a network error, it's queued for later.
// If the device is already known to be offline, it's queued immediately.
// Used by mutation hooks to add offline support transparently.

import NetInfo from '@react-native-community/netinfo';
import { enqueue, isNetworkError } from './offlineQueue';
import type { QueuedMutationType } from './offlineQueue';

interface WithOfflineQueueOptions {
  type: QueuedMutationType;
  payload: unknown;
}

// Wraps a mutation function with offline queue fallback.
// Usage in a mutation hook:
//   await withOfflineQueue(
//     () => insertTodo(params),
//     { type: 'ADD_TODO', payload: params }
//   );
export async function withOfflineQueue<T>(
  mutationFn: () => Promise<T>,
  options: WithOfflineQueueOptions,
): Promise<T | null> {
  // Check connectivity first — queue immediately if offline
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    enqueue(options.type, options.payload);
    return null;
  }

  try {
    return await mutationFn();
  } catch (error) {
    if (isNetworkError(error)) {
      enqueue(options.type, options.payload);
      return null;
    }
    // Non-network error — rethrow for normal error handling
    throw error;
  }
}
