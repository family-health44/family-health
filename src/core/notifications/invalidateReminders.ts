// src/core/notifications/invalidateReminders.ts
// useReminderSync reads todos/visits under its OWN cache keys (they must not
// collide with the feature queries — see bbb3d3d). Feature mutations therefore
// have to invalidate this namespace explicitly or the schedule rebuilds from
// stale data and silently drops the reminder that was just saved.

import type { QueryClient } from '@tanstack/react-query';

export const reminderKeys = {
  todos: ['reminders', 'todos'] as const,
  visits: ['reminders', 'visits'] as const,
};

export function invalidateReminderQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: reminderKeys.todos });
  void queryClient.invalidateQueries({ queryKey: reminderKeys.visits });
}
