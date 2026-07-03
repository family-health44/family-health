// src/core/sync/withOfflineQueue.ts
// Guards a mutation against being run offline.
// Option 3 (decided 2026-07-03): offline writes FAIL CLEANLY rather than
// silently queue. Cold-start offline is unsupported (no query-cache persister),
// so a write queue delivered little value and carried data-loss risk.
// See PROJECT_KNOWLEDGE.md §10.

import NetInfo from '@react-native-community/netinfo';
import { AppError } from '@/shared/types/errors';
import type { QueuedMutationType } from './offlineQueue';

interface WithOfflineQueueOptions {
  type: QueuedMutationType;
  payload: unknown;
}

// Signature preserved so existing call sites need no change.
// `options` is retained for a future re-introduction of queuing if ever wanted.
export async function withOfflineQueue<T>(
  mutationFn: () => Promise<T>,
  _options: WithOfflineQueueOptions,
): Promise<T | null> {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    throw new AppError('You\u2019re offline. Connect to save.', 'NETWORK_ERROR');
  }
  return await mutationFn();
}
