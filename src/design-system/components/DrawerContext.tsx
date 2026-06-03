// src/design-system/components/DrawerContext.tsx
// Global drawer state — allows any screen to open the hamburger menu.
import { createContext, useContext, useState, type ReactNode } from 'react';
import { DrawerMenu } from './DrawerMenu';

interface DrawerContextValue {
  openDrawer: () => void;
  closeDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextValue>({
  openDrawer: () => {},
  closeDrawer: () => {},
});

export const useDrawer = () => useContext(DrawerContext);

export const DrawerProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  return (
    <DrawerContext.Provider value={{ openDrawer: () => setVisible(true), closeDrawer: () => setVisible(false) }}>
      {children}
      <DrawerMenu visible={visible} onClose={() => setVisible(false)} />
    </DrawerContext.Provider>
  );
};
