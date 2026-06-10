// src/design-system/components/PressableBase.tsx
// Drop-in replacement for Pressable that fixes the New Architecture bug
// where style={({ pressed }) => ...} doesn't apply on initial render.
// Use this everywhere instead of Pressable when using pressed-state styles.
import { useState } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

export interface PressableBaseProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle> | ((pressed: boolean) => StyleProp<ViewStyle>);
  children?: React.ReactNode;
}

export const PressableBase = ({ style, children, onPressIn, onPressOut, ...props }: PressableBaseProps) => {
  const [pressed, setPressed] = useState(false);
  const resolvedStyle = typeof style === 'function' ? style(pressed) : style;
  return (
    <Pressable
      {...props}
      onPressIn={(e) => { setPressed(true); onPressIn?.(e); }}
      onPressOut={(e) => { setPressed(false); onPressOut?.(e); }}
      style={resolvedStyle}
    >
      {children}
    </Pressable>
  );
};
