import { useState } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
interface HamburgerButtonProps {
  onPress: () => void;
}
export const HamburgerButton = ({ onPress }: HamburgerButtonProps) => {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel="Open menu"
      style={[styles.button, pressed && styles.pressed]}
    >
      <View style={styles.line} />
      <View style={styles.line} />
      <View style={styles.line} />
    </Pressable>
  );
};
const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEEAE3',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pressed: {
    backgroundColor: '#E3DDD5',
  },
  line: {
    width: 16,
    height: 2,
    backgroundColor: '#6B6460',
    borderRadius: 1,
  },
});
