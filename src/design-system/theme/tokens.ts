// src/design-system/theme/tokens.ts
// Semantic theme tokens — G2 Phase 0.
// G Colour Block values (G2 Phase 1). Palette variants (C/D/I) land later.

export interface Theme {
  colours: {
    primary: string;        // brand green — buttons, active states, FAB
    primaryDark: string;    // darker green — emphasis text on primary-soft
    primarySoft: string;    // pale green — selected/active backgrounds
    background: string;     // screen background
    surface: string;        // cards
    surfaceAlt: string;     // inset rows, subtle fills
    surfaceMuted: string;   // toggles-off, pills
    ink: string;            // primary text
    textSecondary: string;  // secondary text
    textMuted: string;      // muted/placeholder text
    border: string;         // card/input borders
    borderSoft: string;     // internal row dividers
    danger: string;         // destructive text/actions
    headerBg: string;       // screen header block (Phase 1: green; today: background)
    headerText: string;     // header title (Phase 1: white; today: ink)
    headerTextSub: string;  // header subtitle
    tabBarBg: string;
    overlay: string;        // modal scrim
  };
  radius: { sm: number; md: number; lg: number; header: number };
  shadowCard: object;
}

export const themeDefault: Theme = {
  colours: {
    primary: '#1F5C41',
    primaryDark: '#17452F',
    primarySoft: '#E4EFE9',
    background: '#F7F7F4',
    surface: '#FFFFFF',
    surfaceAlt: '#F0EFEA',
    surfaceMuted: '#ECEBE5',
    ink: '#17211C',
    textSecondary: 'rgba(23,33,28,0.65)',
    textMuted: 'rgba(23,33,28,0.55)',
    border: '#E3E2DB',
    borderSoft: 'rgba(23,33,28,0.08)',
    danger: '#B33A4A',
    headerBg: '#1F5C41',
    headerText: '#FFFFFF',
    headerTextSub: 'rgba(255,255,255,0.7)',
    tabBarBg: '#FFFFFF',
    overlay: 'rgba(0,0,0,0.4)',
  },
  radius: { sm: 8, md: 12, lg: 16, header: 26 },
  shadowCard: {
    shadowColor: '#17211C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;
