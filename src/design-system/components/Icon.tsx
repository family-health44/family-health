// src/design-system/components/Icon.tsx
// Thin wrapper over expo-symbols. iOS-only (SF Symbols); renders nothing on
// Android until a fallback set is added.
// - Default: monochrome, tinted by `color`.
// - multicolor: uses the symbol's natural colours where one exists.
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

interface IconProps {
  name: SymbolViewProps['name'];
  size?: number;
  color?: string;
  weight?: SymbolViewProps['weight'];
  multicolor?: boolean;
}

export const Icon = ({ name, size = 20, color = '#1F5C41', weight = 'regular', multicolor = false }: IconProps) => (
  <SymbolView
    name={name}
    size={size}
    tintColor={multicolor ? undefined : color}
    weight={weight}
    type={multicolor ? 'multicolor' : 'monochrome'}
    resizeMode="scaleAspectFit"
    style={{ width: size, height: size }}
  />
);
