// src/core/sync/useSyncManager.ts
// React hook — watches network connectivity and drains the offline queue
// when the device reconnects. Mounted once in the root layout.
// Also exposes queue state for the offline banner UI.

import { useEffect, useState, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';

import { drainQueue } from './queueProcessor';
import { getQueueLength } from './offlineQueue';

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: Date | null;
}

export function useSyncManager(): SyncState {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(getQueueLength());
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const sync = useCallback(async () => {
    if (isSyncing) return;
    const count = getQueueLength();
    if (count === 0) return;

    setIsSyncing(true);
    setPendingCount(count);

    try {
      const result = await drainQueue();

      if (result.processed > 0) {
        // Refetch all active queries to reflect server state after sync
        await queryClient.invalidateQueries();
        setLastSyncedAt(new Date());
      }

      setPendingCount(getQueueLength());
    } catch (error) {
      console.warn('[SyncManager] Queue drain failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, queryClient]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected === true;
      setIsOnline(online);

      if (online) {
        // Small delay to let connection stabilise before syncing
        setTimeout(() => { sync(); }, 1500);
      }
    });

    return unsubscribe;
  }, [sync]);

  return { isOnline, isSyncing, pendingCount, lastSyncedAt };
}
