// src/shared/utils/personOrder.ts
// Single source of truth for person ordering → colour-index assignment.
// Creation order (created_at, then id as a stable tiebreak for null/equal).
// Pure — no external imports beyond the row shape.
interface OrderablePerson {
  id: string;
  created_at?: string | null;
}
export function sortPeopleByCreation<T extends OrderablePerson>(people: T[]): T[] {
  return [...people].sort((a, b) => {
    const ca = a.created_at ?? '';
    const cb = b.created_at ?? '';
    if (ca !== cb) return ca.localeCompare(cb);
    return a.id.localeCompare(b.id);
  });
}
