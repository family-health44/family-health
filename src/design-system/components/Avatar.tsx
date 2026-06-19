// src/design-system/components/Avatar.tsx
// Avatar primitive — displays person initials in their assigned colour.
// Sizes: sm (32), md (44), lg (64).
// No business logic — initials are passed in, not computed here.
import { View, Text } from 'react-native';
import type { PersonColourSet } from '@/design-system/tokens/colours';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  initials: string;
  colourSet: PersonColourSet;
  size?: AvatarSize;
}

const sizePx: Record<AvatarSize, number> = {
  sm: 32,
  md: 44,
  lg: 64,
};

const fontSizePx: Record<AvatarSize, number> = {
  sm: 12,
  md: 16,
  lg: 24,
};

export const Avatar = ({ initials, colourSet, size = 'md' }: AvatarProps) => {
  const dimension = sizePx[size];
  const fontSize = fontSizePx[size];
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`Avatar for ${initials}`}
      style={{
        width: dimension,
        height: dimension,
        borderRadius: dimension * 0.22,
        backgroundColor: colourSet.dot,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize,
          fontWeight: '700',
          letterSpacing: 0.5,
        }}
      >
        {initials.toUpperCase().slice(0, 2)}
      </Text>
    </View>
  );
};