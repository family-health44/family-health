// src/features/family/screens/DocumentsScreen.tsx
import { PressableBase } from '@/design-system/components/PressableBase';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '@/design-system/tokens/fonts';

interface DocumentsScreenProps { personName: string; }

export const DocumentsScreen = ({ personName }: DocumentsScreenProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 16, paddingBottom: 8 }}>
        <PressableBase onPress={() => router.back()} accessibilityRole="button" style={(pressed) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 })}>
          <Text style={{ fontSize: 15, color: '#2A6049' }}>‹</Text>
          <Text style={{ fontSize: 14, color: '#2A6049', fontWeight: '500' }}>Back</Text>
        </PressableBase>
        <Text style={{ fontSize: 28, fontWeight: '300', fontFamily: Fonts.serif, color: '#1C1917', lineHeight: 32 }}>Documents</Text>
        <Text style={{ fontSize: 12, color: '#A8A09A', marginTop: 2 }}>{personName}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 40, marginBottom: 16 }}>📄</Text>
        <Text style={{ fontSize: 17, fontWeight: '600', color: '#1C1917', marginBottom: 8 }}>No documents yet</Text>
        <Text style={{ fontSize: 14, color: '#A8A09A', textAlign: 'center', lineHeight: 20 }}>Document upload is coming soon.</Text>
      </ScrollView>
    </View>
  );
};
