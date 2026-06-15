// src/features/visits/screens/VisitDetailScreen.tsx
// Visit detail screen — matches PWA design.
import { PressableBase } from '@/design-system/components/PressableBase';
import { useState } from 'react';
import { View, Text, ScrollView, Linking, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingState, ErrorState } from '@/design-system/components/EmptyState';
import { Fonts } from '@/design-system/tokens/fonts';
import { useVisitsListQuery } from '../queries/visits.queries';
import { useUpdateVisitMutation } from '../mutations/visits.mutations';
import { useDoctorsQuery } from '@/features/doctors/queries/doctors.queries';
import { EditVisitModal } from '../components/EditVisitModal';
import { formatDate, formatTime } from '@/shared/utils/dates';

interface VisitDetailScreenProps {
  visitId: string;
}

export const VisitDetailScreen = ({ visitId }: VisitDetailScreenProps) => {
  const insets = useSafeAreaInsets();
  const { data: groups, isLoading, error } = useVisitsListQuery();
  const { data: doctorGroups } = useDoctorsQuery();
  const updateVisit = useUpdateVisitMutation();
  const [showEditModal, setShowEditModal] = useState(false);
  const doctors = (doctorGroups ?? []).flatMap((g) => g.doctors);

  if (isLoading) return <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}><LoadingState message="Loading visit..." /></View>;
  if (error) return <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}><ErrorState message={error.message} /></View>;

  const visit = groups?.flatMap((g) => g.visits).find((v) => v.id === visitId);
  if (!visit) return <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}><ErrorState message="Visit not found." /></View>;

  const today = new Date().toISOString().split('T')[0] ?? '';
  const isUpcoming = visit.visitDate >= today;

  const handleSaveEdit = async (input: {
    title: string;
    visitDate: string;
    visitTime: string | null;
    doctorId: string | null;
    preNotes: string | null;
    postNotes: string | null;
  }) => {
    try {
      await updateVisit.mutateAsync({ visitId: visit.id, ...input });
      setShowEditModal(false);
    } catch {
      Alert.alert('Error', 'Could not save changes.');
    }
  };

  const handleAddToCalendar = async () => {
    const url = `webcal://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(visit.title)}&dates=${visit.visitDate.replace(/-/g, '')}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
    else Alert.alert('Cannot open calendar', 'Unable to open calendar app.');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 4,
        paddingHorizontal: 16,
        paddingBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <PressableBase
          onPress={() => router.navigate('/(app)/visits')}
          accessibilityRole="button"
          style={(pressed) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4 })}
        >
          <Text style={{ fontSize: 15, color: '#2A6049' }}>‹</Text>
          <Text style={{ fontSize: 14, color: '#2A6049', fontWeight: '500' }}>Back</Text>
        </PressableBase>
        <PressableBase
          onPress={() => setShowEditModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Edit visit"
          style={(pressed) => ({ width: 32, height: 32, borderRadius: 16, backgroundColor: '#EEEAE3', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
        >
          <Text style={{ fontSize: 14, color: '#6B6460' }}>✎</Text>
        </PressableBase>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 100 }}>
        {/* Hero card */}
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <View style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: '#E8EFF8', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Text style={{ fontSize: 24 }}>📅</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '300', fontFamily: Fonts.serif, color: '#1C1917', lineHeight: 24 }}>
              {visit.title}
            </Text>
            <Text style={{ fontSize: 12, color: '#A8A09A', marginTop: 3 }}>
              {formatDate(visit.visitDate)}{visit.visitTime ? ` at ${formatTime(visit.visitTime)}` : ''} · {isUpcoming ? 'Upcoming' : 'Past'}
            </Text>
          </View>
        </View>

        {/* Details section */}
        <Text style={{ fontSize: 10, fontWeight: '700', color: '#A8A09A', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
          Details
        </Text>
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F0EDE8' }}>
            <Text style={{ fontSize: 13, color: '#A8A09A', flex: 1 }}>Date</Text>
            <Text style={{ fontSize: 13, color: '#1C1917', fontWeight: '500' }}>
              {formatDate(visit.visitDate)}{visit.visitTime ? ` at ${formatTime(visit.visitTime)}` : ''}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F0EDE8' }}>
            <Text style={{ fontSize: 13, color: '#A8A09A', flex: 1 }}>Person</Text>
            <Text style={{ fontSize: 13, color: '#1C1917', fontWeight: '500' }}>{visit.personName}</Text>
          </View>
          {visit.doctorName ? (
            <View style={{ flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F0EDE8' }}>
              <Text style={{ fontSize: 13, color: '#A8A09A', flex: 1 }}>Doctor</Text>
              <Text style={{ fontSize: 13, color: '#1C1917', fontWeight: '500' }}>{visit.doctorName}</Text>
            </View>
          ) : null}
        </View>

        {/* Pre-appointment notes */}
        {visit.preNotes ? (
          <>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#A8A09A', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
              Pre-Appointment Notes
            </Text>
            <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: '#1C1917', lineHeight: 20 }}>{visit.preNotes}</Text>
            </View>
          </>
        ) : null}

        {/* Post-appointment notes */}
        {visit.postNotes ? (
          <>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#A8A09A', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
              Post-Appointment Notes
            </Text>
            <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: '#1C1917', lineHeight: 20 }}>{visit.postNotes}</Text>
            </View>
          </>
        ) : null}

        {/* Action buttons */}
        <PressableBase
          onPress={handleAddToCalendar}
          accessibilityRole="button"
          style={(pressed) => ({ backgroundColor: pressed ? '#DDE8F5' : '#E8EFF8', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 })}
        >
          <Text style={{ fontSize: 18 }}>📅</Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#2C5282' }}>Add to Google / iOS Calendar</Text>
        </PressableBase>

        <PressableBase
          accessibilityRole="button"
          style={(pressed) => ({ backgroundColor: pressed ? '#DDE8F5' : '#E8EFF8', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 })}
        >
          <Text style={{ fontSize: 18 }}>📄</Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#2C5282' }}>Add Document</Text>
        </PressableBase>
      </ScrollView>

      {/* Start Appointment button */}
      {isUpcoming && (
        <View style={{ position: 'absolute', bottom: 24, left: 16, right: 16 }}>
          <PressableBase
            onPress={() => router.push(`/(app)/appointments?visitId=${visit.id}&personId=${visit.personId ?? ''}&personName=${encodeURIComponent(visit.personName ?? '')}&doctorName=${encodeURIComponent(visit.doctorName ?? '')}&visitDate=${visit.visitDate}&preNotes=${encodeURIComponent(visit.preNotes ?? '')}` as never)}
            accessibilityRole="button"
            style={(pressed) => ({
              backgroundColor: pressed ? '#1A4D35' : '#2A6049',
              borderRadius: 24,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            })}
          >
            <Text style={{ fontSize: 16, color: 'white' }}>▶</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>Start Appointment</Text>
          </PressableBase>
        </View>
      )}

      <EditVisitModal
        visible={showEditModal}
        isLoading={updateVisit.isPending}
        visit={visit}
        doctors={doctors}
        onSave={handleSaveEdit}
        onDismiss={() => setShowEditModal(false)}
      />
    </View>
  );
};
