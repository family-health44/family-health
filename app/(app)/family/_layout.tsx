// app/(app)/family/_layout.tsx
import { Stack } from 'expo-router';

export default function FamilyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[personId]/index" />
      <Stack.Screen name="[personId]/doctors" />
      <Stack.Screen name="[personId]/medications" />
      <Stack.Screen name="[personId]/medical-events" />
      <Stack.Screen name="[personId]/info-card" />
      <Stack.Screen name="[personId]/documents" />
      <Stack.Screen name="[personId]/doctor/[doctorId]" />
    </Stack>
  );
}
