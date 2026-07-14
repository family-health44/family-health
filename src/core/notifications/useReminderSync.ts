// src/core/notifications/useReminderSync.ts
// Rebuilds the entire local notification schedule from current data.
// Runs on mount and whenever the app returns to the foreground.
// No notification IDs are persisted — the schedule is always derived.

import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { fetchVisits } from '@/features/visits/repository/visits.repository';
import { fetchTodos } from '@/features/todos/repository/todos.repository';
import { rebuildSchedule, type ScheduledReminder } from './notifications';
import { resolveVisitReminder, resolveTodoReminder } from './reminders.domain';
import { reminderKeys } from './invalidateReminders';

export function useReminderSync(enabled: boolean) {
  // Own cache keys — must NOT collide with the feature queries, which store a
  // different shape (grouped domain objects) under queryKeys.todos.list() /
  // queryKeys.visits.all. Sharing the key corrupts their cache.
  const { data: visits } = useQuery({
    queryKey: reminderKeys.visits,
    queryFn: fetchVisits,
    enabled,
  });

  const { data: todos } = useQuery({
    queryKey: reminderKeys.todos,
    queryFn: fetchTodos,
    enabled,
  });

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!enabled) return;

    const build = () => {
      const reminders: ScheduledReminder[] = [];

      for (const v of visits ?? []) {
        const fireAt = resolveVisitReminder({ reminderAt: v.reminder_at });
        if (!fireAt) continue;
        reminders.push({
          key: `visit:${v.id}`,
          title: v.title,
          body: v.visit_time
            ? `Appointment at ${v.visit_time}`
            : 'Upcoming appointment',
          fireAt,
        });
      }

      for (const t of todos ?? []) {
        if (t.completed) continue;
        const fireAt = resolveTodoReminder({ reminderAt: t.reminder_at });
        if (!fireAt) continue;
        reminders.push({
          key: `todo:${t.id}`,
          title: t.title,
          body: 'To do',
          fireAt,
        });
      }

      void rebuildSchedule(reminders);
    };

    build();

    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        build();
      }
      appState.current = next;
    });

    return () => sub.remove();
  }, [enabled, visits, todos]);
}
