import { useState } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
interface HamburgerButtonProps {
  onPress: () => void;
  /** 'onColour' = translucent white treatment for use on coloured header blocks */
  variant?: 'default' | 'onColour';
}
export const HamburgerButton = ({ onPress, variant = 'default' }: HamburgerButtonProps) => {
  const [pressed, setPressed] = useState(false);
  const onColour = variant === 'onColour';
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel="Open menu"
      style={[
        styles.button,
        onColour && { backgroundColor: 'rgba(255,255,255,0.18)' },
        pressed && (onColour ? { backgroundColor: 'rgba(255,255,255,0.3)' } : styles.pressed),
      ]}
    >
      <View style={[styles.line, onColour && { backgroundColor: '#FFFFFF' }]} />
      <View style={[styles.line, onColour && { backgroundColor: '#FFFFFF' }]} />
      <View style={[styles.line, onColour && { backgroundColor: '#FFFFFF' }]} />
    </Pressable>
  );
};
const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECEBE5',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pressed: {
    backgroundColor: '#E3E2DB',
  },
  line: {
    width: 16,
    height: 2,
    backgroundColor: 'rgba(23,33,28,0.65)',
    borderRadius: 1,
  },
});
