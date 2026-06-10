import { useState } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
interface FABProps {
  onPress: () => void;
  accessibilityLabel?: string;
}
export const FAB = ({ onPress, accessibilityLabel = 'Add' }: FABProps) => {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.fab, pressed && styles.pressed]}
    >
      <Text style={styles.plus}>+</Text>
    </Pressable>
  );
};
const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#2A6049',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2A6049',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 50,
  },
  pressed: {
    transform: [{ scale: 0.92 }],
  },
  plus: {
    color: 'white',
    fontSize: 29,
    lineHeight: 32,
    fontWeight: '300',
  },
});
