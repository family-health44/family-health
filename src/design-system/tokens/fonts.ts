// src/design-system/tokens/fonts.ts
// Font family tokens — single source of truth.
// 'Fraunces' is loaded in app/_layout.tsx via expo-font.

export const Fonts = {
  serif: 'Fraunces',
  sans: undefined, // system default (DM Sans not loaded natively — use system sans)
} as const;
