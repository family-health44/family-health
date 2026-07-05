// src/features/medications/components/StatCard.tsx
import { View, Text } from 'react-native';

export const StatCard = ({ value, label }: { value: string; label: string }) => (
  <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E3E2DB', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}>
    <Text style={{ fontSize: 20, fontWeight: '700', color: '#17211C' }}>{value}</Text>
    <Text style={{ fontSize: 11, color: 'rgba(23,33,28,0.55)', marginTop: 2 }}>{label}</Text>
  </View>
);
