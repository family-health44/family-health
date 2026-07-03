// src/features/family/hooks/useWelcomeTour.ts
// Shows the welcome tour exactly once: the flag is set by useOnboarding when a
// family group is created, read here on Family-home mount, and cleared when the
// tour is closed (finish or skip).

import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { WELCOME_TOUR_PENDING_KEY } from '@/features/auth/hooks/useOnboarding';

export interface UseWelcomeTourReturn {
  showTour: boolean;
  /** Close the tour and clear the pending flag so it never shows again. */
  closeTour: () => void;
}

export function useWelcomeTour(): UseWelcomeTourReturn {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(WELCOME_TOUR_PENDING_KEY)
      .then((v) => {
        if (active && v === '1') setShowTour(true);
      })
      .catch(() => {
        // Non-fatal: tour simply doesn't show.
      });
    return () => {
      active = false;
    };
  }, []);

  const closeTour = useCallback(() => {
    setShowTour(false);
    AsyncStorage.removeItem(WELCOME_TOUR_PENDING_KEY).catch(() => {
      // Non-fatal: flag lingers; tour may reappear next launch.
    });
  }, []);

  return { showTour, closeTour };
}
