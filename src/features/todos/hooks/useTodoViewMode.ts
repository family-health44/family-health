// src/features/todos/hooks/useTodoViewMode.ts
// Persisted To Do grouping lens: 'person' (default) or 'date'.
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TodoViewMode = 'person' | 'date';
const KEY = 'todo_view_mode';

export function useTodoViewMode() {
  const [mode, setMode] = useState<TodoViewMode>('person');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => { if (v === 'date' || v === 'person') setMode(v); })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  const update = (next: TodoViewMode) => {
    setMode(next);
    AsyncStorage.setItem(KEY, next).catch(() => {});
  };

  return { mode, setMode: update, hydrated };
}
