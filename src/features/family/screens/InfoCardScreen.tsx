// src/features/family/screens/InfoCardScreen.tsx
import { PressableBase } from '@/design-system/components/PressableBase';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '@/design-system/tokens/fonts';

interface InfoCardScreenProps { personName: string; }

export const InfoCardScreen = ({ personName }: InfoCardScreenProps) => {
  const insets = useSafeAreaInsets();
  const fields = ['Date of Birth', 'Medicare Number', 'Blood Type', 'Allergies', 'Emergency Contact', 'Private Health Fund', 'Health Fund Number'];
  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 16, paddingBottom: 8 }}>
        <PressableBase onPress={() => router.back()} accessibilityRole="button" style={(pressed) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 })}>
          <Text style={{ fontSize: 15, color: '#2A6049' }}>‹</Text>
          <Text style={{ fontSize: 14, color: '#2A6049', fontWeight: '500' }}>Back</Text>
        </PressableBase>
        <Text style={{ fontSize: 28, fontWeight: '300', fontFamily: Fonts.serif, color: '#1C1917', lineHeight: 32 }}>Info Card</Text>
        <Text style={{ fontSize: 12, color: '#A8A09A', marginTop: 2 }}>{personName}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 14, overflow: 'hidden' }}>
          {fields.map((label, index) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: index < fields.length - 1 ? 1 : 0, borderBottomColor: '#F0EDE8' }}>
              <Text style={{ fontSize: 13, color: '#A8A09A', flex: 1 }}>{label}</Text>
              <Text style={{ fontSize: 13, color: '#C8C4BC' }}>Not set</Text>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 16, backgroundColor: '#E6F0EC', borderRadius: 12, padding: 14 }}>
          <Text style={{ fontSize: 13, color: '#1A4D35', lineHeight: 20 }}>Editing info card details is coming in a future update.</Text>
        </View>
      </ScrollView>
    </View>
  );
};
