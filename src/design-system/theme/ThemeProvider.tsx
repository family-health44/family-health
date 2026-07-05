// src/design-system/theme/ThemeProvider.tsx
// Theme context — G2 Phase 0. Single static theme for now; palette switching
// (C Sage / D Dark / I Soft Rounded + AsyncStorage persistence) lands in a later phase.
import { createContext, useContext, type ReactNode } from 'react';
import { themeDefault, type Theme } from './tokens';

const ThemeContext = createContext<Theme>(themeDefault);

export const ThemeProvider = ({ children }: { children: ReactNode }) => (
  <ThemeContext.Provider value={themeDefault}>{children}</ThemeContext.Provider>
);

export const useTheme = (): Theme => useContext(ThemeContext);
