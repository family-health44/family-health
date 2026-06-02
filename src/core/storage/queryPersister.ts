// src/core/storage/queryPersister.ts
// Disabled for Expo Go — requires native build with MMKV.
// Returns a no-op persister for development testing.

export const mmkvPersister = {
  persistClient: async () => {},
  restoreClient: async () => undefined,
  removeClient: async () => {},
};
