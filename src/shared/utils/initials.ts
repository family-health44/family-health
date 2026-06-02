// src/shared/utils/initials.ts
// Pure utility — derives avatar initials from a name string.
// Domain layer safe — no external imports.

// Returns up to 2 initials from a full name.
// "Jane Smith" → "JS", "Alice" → "AL", "" → "?"
export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';

  const parts = trimmed.split(/\s+/);

  if (parts.length === 1) {
    // Single word — take first two letters
    return trimmed.slice(0, 2).toUpperCase();
  }

  // Multiple words — first letter of first and last word
  const first = parts[0]?.[0] ?? '';
  const last = parts[parts.length - 1]?.[0] ?? '';
  return `${first}${last}`.toUpperCase();
}
