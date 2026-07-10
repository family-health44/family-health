// src/design-system/components/Icon.tsx
// Thin wrapper over expo-symbols. iOS-only (SF Symbols); renders nothing on
// Android until a fallback set is added. Monochrome, green by default.
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

interface IconProps {
  name: SymbolViewProps['name'];
  size?: number;
  color?: string;
  weight?: SymbolViewProps['weight'];
}

export const Icon = ({ name, size = 20, color = '#1F5C41', weight = 'regular' }: IconProps) => (
  <SymbolView
    name={name}
    size={size}
    tintColor={color}
    weight={weight}
    type="monochrome"
    resizeMode="scaleAspectFit"
    style={{ width: size, height: size }}
  />
);
