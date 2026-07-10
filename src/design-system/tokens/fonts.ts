// src/design-system/tokens/fonts.ts
// Font family tokens — single source of truth.
// serif retired (was 'Fraunces'); both roles now resolve to system sans.
export const Fonts = {
  serif: undefined, // retired — kept as key so existing fontFamily refs compile
  sans: undefined,  // system default
} as const;
