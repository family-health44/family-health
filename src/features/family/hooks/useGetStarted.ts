// src/features/family/hooks/useGetStarted.ts
// Drives the Family-home "Get started" nudges (medications / doctors / appointments).
//
// A nudge row is visible when BOTH:
//   - it has NOT been dismissed on this device, AND
//   - the underlying thing does not yet exist (count === 0).
//
// Dismissals are persisted on-device (AsyncStorage). We hydrate the dismissed
// set in an effect and keep the whole section hidden until hydration finishes,
// so previously-dismissed rows never flash back on a cold start.

import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFamilyHomeQuery } from '../queries/family.queries';
import { useMedicationsCountQuery } from '@/features/medications/queries/medications.queries';
import { useDoctorsQuery } from '@/features/doctors/queries/doctors.queries';
import { useVisitsListQuery } from '@/features/visits/queries/visits.queries';

export type GetStartedKey = 'medications' | 'doctors' | 'appointments';

// Scoped per family group — dismissing rows for one family (or a test account)
// must not hide them for a different family on the same device.
const storageKey = (familyGroupId: string) => `get_started_dismissed_v1:${familyGroupId}`;
const ALL_KEYS: readonly GetStartedKey[] = ['medications', 'doctors', 'appointments'];

export interface GetStartedRow {
  key: GetStartedKey;
}

export interface UseGetStartedReturn {
  /** Rows to render, in order. Empty array => render nothing. */
  rows: GetStartedRow[];
  /** True once dismissals have loaded — gate rendering on this to avoid flash. */
  hydrated: boolean;
  dismiss: (key: GetStartedKey) => void;
  dismissAll: () => void;
}

function isGetStartedKey(v: unknown): v is GetStartedKey {
  return v === 'medications' || v === 'doctors' || v === 'appointments';
}

export function useGetStarted(): UseGetStartedReturn {
  const [dismissed, setDismissed] = useState<Set<GetStartedKey>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  const familyGroupId = useFamilyHomeQuery().data?.familyGroup.id;

  // Presence checks. Undefined while loading => treat as "unknown", not "empty",
  // so we don't briefly show a nudge for something that actually exists.
  const medsCount = useMedicationsCountQuery();
  const doctors = useDoctorsQuery();
  const visits = useVisitsListQuery();

  useEffect(() => {
    if (!familyGroupId) return; // hydrate once the family is known
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey(familyGroupId));
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        const next = new Set<GetStartedKey>(
          Array.isArray(parsed) ? parsed.filter(isGetStartedKey) : [],
        );
        if (active) setDismissed(next);
      } catch {
        // Corrupt/missing value => start with nothing dismissed.
        if (active) setDismissed(new Set());
      } finally {
        if (active) setHydrated(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [familyGroupId]);

  const persist = useCallback((next: Set<GetStartedKey>) => {
    setDismissed(next);
    if (!familyGroupId) return; // can't persist without a scope; state-only
    AsyncStorage.setItem(storageKey(familyGroupId), JSON.stringify([...next])).catch(() => {
      // Non-fatal: worst case the row reappears next launch.
    });
  }, [familyGroupId]);

  const dismiss = useCallback(
    (key: GetStartedKey) => {
      const next = new Set(dismissed);
      next.add(key);
      persist(next);
    },
    [dismissed, persist],
  );

  const dismissAll = useCallback(() => {
    persist(new Set(ALL_KEYS));
  }, [persist]);

  // "exists" is true only when a count query has resolved with > 0.
  // While a count is still loading (undefined), we DON'T show the row —
  // avoids a flash-then-hide when the thing turns out to exist.
  const doctorCount = doctors.data?.reduce((sum, g) => sum + g.doctors.length, 0);
  const visitCount = visits.data?.reduce((sum, g) => sum + g.visits.length, 0);

  const exists: Record<GetStartedKey, boolean | undefined> = {
    medications: medsCount.data === undefined ? undefined : medsCount.data > 0,
    doctors: doctorCount === undefined ? undefined : doctorCount > 0,
    appointments: visitCount === undefined ? undefined : visitCount > 0,
  };

  const rows: GetStartedRow[] = ALL_KEYS.filter(
    (key) => !dismissed.has(key) && exists[key] === false,
  ).map((key) => ({ key }));

  return { rows, hydrated, dismiss, dismissAll };
}
