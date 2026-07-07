// src/features/settings/screens/DisclaimerScreen.tsx
import { PressableBase } from '@/design-system/components/PressableBase';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '@/design-system/tokens/fonts';

export const DisclaimerScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}>
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <PressableBase onPress={() => router.back()} accessibilityRole="button" style={(pressed) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4 })}>
          <Text style={{ fontSize: 15, color: '#1F5C41' }}>‹</Text>
          <Text style={{ fontSize: 14, color: '#1F5C41', fontWeight: '500' }}>Back</Text>
        </PressableBase>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4 }}>
        <Text style={{ fontSize: 28, fontWeight: '300', fontFamily: Fonts.serif, color: '#17211C', lineHeight: 32, marginBottom: 16 }}>Medical disclaimer</Text>

        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3E2DB', borderRadius: 12, padding: 16 }}>
          <Text style={{ fontSize: 14, color: '#17211C', lineHeight: 22, marginBottom: 12 }}>
            This app helps you store and organise your family's medical information.
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(23,33,28,0.75)', lineHeight: 22 }}>
            It does not provide medical advice, diagnosis, or treatment, and is not a medical device. Always consult a qualified health professional before making any medical decisions.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};
