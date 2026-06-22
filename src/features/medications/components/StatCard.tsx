// src/features/medications/components/StatCard.tsx
import { View, Text } from 'react-native';

export const StatCard = ({ value, label }: { value: string; label: string }) => (
  <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8E4DC', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}>
    <Text style={{ fontSize: 20, fontWeight: '700', color: '#1C1917' }}>{value}</Text>
    <Text style={{ fontSize: 11, color: '#A8A09A', marginTop: 2 }}>{label}</Text>
  </View>
);
