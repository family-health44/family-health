// src/core/notifications/notifications.ts
// Local notification scheduling. Model: cancel-all + rebuild from DB on app open.
// No IDs are persisted — the scheduled set is always derived from current data.

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// iOS allows 64 pending local notifications. Stay well under.
export const MAX_SCHEDULED = 60;

export interface ScheduledReminder {
  key: string;      // stable id (e.g. `visit:<uuid>`)
  title: string;
  body: string;
  fireAt: Date;
}

/** Asks for permission. Call this the first time a user sets a reminder. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return false;
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  if (!existing.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export async function hasNotificationPermission(): Promise<boolean> {
  const s = await Notifications.getPermissionsAsync();
  return s.granted;
}

/** Cancels everything and reschedules from the given list. Idempotent. */
export async function rebuildSchedule(reminders: ScheduledReminder[]): Promise<void> {
  if (!(await hasNotificationPermission())) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = Date.now();
  const upcoming = reminders
    .filter((r) => r.fireAt.getTime() > now)
    .sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime())
    .slice(0, MAX_SCHEDULED);

  for (const r of upcoming) {
    await Notifications.scheduleNotificationAsync({
      identifier: r.key,
      content: { title: r.title, body: r.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: r.fireAt,
      },
    });
  }
}
