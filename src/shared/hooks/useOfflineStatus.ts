// src/shared/hooks/useOfflineStatus.ts
// Shared hook — returns whether the device currently has network connectivity.
// Used by repositories and UI components to handle offline states gracefully.
// Will be extended in Step 12 (offline support) with queued mutation awareness.

import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export interface OfflineStatus {
  isOffline: boolean;
  isConnected: boolean | null; // null means unknown (initial state)
}

export function useOfflineStatus(): OfflineStatus {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return unsubscribe;
  }, []);

  return {
    isOffline: isConnected === false,
    isConnected,
  };
}
