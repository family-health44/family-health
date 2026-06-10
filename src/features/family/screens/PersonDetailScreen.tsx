// src/features/family/screens/PersonDetailScreen.tsx
// Person detail screen — single scrollable page with menu layout.
// Matches index.html design: plain header above coloured hero block,
// 3 quick action buttons, then menu list navigating to sub-screens.
import { PressableBase } from '@/design-system/components/PressableBase';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingState, ErrorState } from '@/design-system/components/EmptyState';
import { usePersonDetail } from '../hooks/usePersonDetail';

export const PersonDetailScreen = () => {
  const { personId } = useLocalSearchParams<{ personId: string }>();
  const insets = useSafeAreaInsets();
  const { person, isLoading, error } = usePersonDetail(personId ?? '');

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
        <LoadingState message="Loading..." />
      </View>
    );
  }

  if (error || !person) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
        <ErrorState
          message={error?.message ?? 'Person not found.'}
          onRetry={() => router.back()}
        />
      </View>
    );
  }

  const { colourSet } = person;

  const menuItems = [
    { key: 'doctors', label: 'Doctors', emoji: '👨‍⚕️', bg: '#E8EFF8', route: `/(app)/family/${person.id}/doctors` },
    { key: 'medications', label: 'Medications', emoji: '💊', bg: '#E6F0EC', route: `/(app)/family/${person.id}/medications` },
    { key: 'medical-events', label: 'Medical Events', emoji: '🏥', bg: '#F5E8EB', route: `/(app)/family/${person.id}/medical-events` },
    { key: 'info-card', label: 'Info Card', emoji: '🪪', bg: '#F5EBE0', route: null },
    { key: 'documents', label: 'Documents', emoji: '📄', bg: '#EEE8F7', route: null },
  ] as const;

  const quickActions = [
    { key: 'note', label: 'Add Note', emoji: '📝' },
    { key: 'todo', label: 'Add To Do', emoji: '✅' },
    { key: 'visit', label: 'Add Visit', emoji: '📅' },
  ] as const;

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
      {/* Plain header — back + edit — ABOVE the coloured block */}
      <View style={{
        paddingTop: insets.top + 4,
        paddingHorizontal: 16,
        paddingBottom: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F7F5F0',
      }}>
        <PressableBase
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={(pressed) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4 })}
        >
          <Text style={{ fontSize: 15, color: '#2A6049' }}>‹</Text>
          <Text style={{ fontSize: 14, color: '#2A6049', fontWeight: '500' }}>Family</Text>
        </PressableBase>
        <PressableBase
          accessibilityRole="button"
          accessibilityLabel="Edit person"
          style={(pressed) => ({
            width: 32, height: 32, borderRadius: 16,
            backgroundColor: '#EEEAE3',
            alignItems: 'center', justifyContent: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text style={{ fontSize: 14, color: '#6B6460' }}>✎</Text>
        </PressableBase>
      </View>

      {/* Coloured hero block */}
      <View style={{ backgroundColor: colourSet.dot, paddingHorizontal: 16, paddingVertical: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{
            width: 52, height: 52, borderRadius: 26,
            backgroundColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: 'white', fontSize: 17, fontWeight: '700' }}>
              {person.initials}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: 'white' }}>
              {person.name}
            </Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
              Health Records
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14 }}>
        {/* Quick action buttons */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {quickActions.map((action) => (
            <PressableBase
              key={action.key}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              style={(pressed) => ({
                flex: 1,
                backgroundColor: pressed ? '#F0EDE8' : 'white',
                borderWidth: 1,
                borderColor: '#E3DDD5',
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: 'center',
                gap: 5,
              })}
            >
              <Text style={{ fontSize: 22 }}>{action.emoji}</Text>
              <Text style={{ fontSize: 10, fontWeight: '600', color: '#1C1917' }}>
                {action.label}
              </Text>
            </PressableBase>
          ))}
        </View>

        {/* Menu list */}
        <View style={{
          backgroundColor: 'white',
          borderWidth: 1,
          borderColor: '#E3DDD5',
          borderRadius: 14,
          overflow: 'hidden',
        }}>
          {menuItems.map((item, index) => (
            <PressableBase
              key={item.key}
              onPress={() => item.route ? router.push(item.route as never) : null}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              style={(pressed) => ({
                flexDirection: 'row',
                alignItems: 'center',
                padding: 14,
                borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                borderBottomColor: '#F0EDE8',
                backgroundColor: pressed ? '#F7F5F0' : 'white',
                gap: 12,
              })}
            >
              <View style={{
                width: 34, height: 34, borderRadius: 9,
                backgroundColor: item.bg,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
              </View>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: '#1C1917' }}>
                {item.label}
              </Text>
              <Text style={{ color: '#A8A09A', fontSize: 14 }}>›</Text>
            </PressableBase>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};