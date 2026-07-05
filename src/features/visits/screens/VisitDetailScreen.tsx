// src/features/visits/screens/VisitDetailScreen.tsx
// Visit detail. Pre/post notes + costs are inline-editable (save on blur).
// Title/date/time/doctor are edited via the ✎ modal.
import { PressableBase } from '@/design-system/components/PressableBase';
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Linking, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingState, ErrorState } from '@/design-system/components/EmptyState';
import { Fonts } from '@/design-system/tokens/fonts';
import { useVisitsListQuery } from '../queries/visits.queries';
import { useUpdateVisitMutation } from '../mutations/visits.mutations';
import { useDoctorsQuery } from '@/features/doctors/queries/doctors.queries';
import { EditVisitModal } from '../components/EditVisitModal';
import { formatDate, formatTime } from '@/shared/utils/dates';
import type { Visit } from '../types/visits.types';

interface VisitDetailScreenProps {
  visitId: string;
}

const parseCost = (raw: string): number | null => {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
};

const costToText = (n: number | null): string => (n == null ? '' : String(n));

export const VisitDetailScreen = ({ visitId }: VisitDetailScreenProps) => {
  const insets = useSafeAreaInsets();
  const { data: groups, isLoading, error } = useVisitsListQuery();
  const { data: doctorGroups } = useDoctorsQuery();
  const updateVisit = useUpdateVisitMutation();
  const [showEditModal, setShowEditModal] = useState(false);
  const doctors = (doctorGroups ?? []).flatMap((g) => g.doctors);

  const visit = groups?.flatMap((g) => g.visits).find((v) => v.id === visitId);

  // Local editable state for the inline fields, seeded from the visit.
  const [preNotes, setPreNotes] = useState('');
  const [postNotes, setPostNotes] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [outOfPocket, setOutOfPocket] = useState('');

  useEffect(() => {
    if (visit) {
      setPreNotes(visit.preNotes ?? '');
      setPostNotes(visit.postNotes ?? '');
      setTotalCost(costToText(visit.totalCost));
      setOutOfPocket(costToText(visit.outOfPocket));
    }
  }, [visit?.id]);

  if (isLoading) return <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}><LoadingState message="Loading visit..." /></View>;
  if (error) return <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}><ErrorState message={error.message} /></View>;
  if (!visit) return <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}><ErrorState message="Visit not found." /></View>;

  const v = visit; // non-null alias

  const today = new Date().toISOString().split('T')[0] ?? '';
  const isUpcoming = v.visitDate >= today;

  // Save a single inline field by sending the full current param set.
  const persist = async (patch: Partial<Pick<Visit, 'preNotes' | 'postNotes' | 'totalCost' | 'outOfPocket'>>) => {
    try {
      await updateVisit.mutateAsync({
        visitId: v.id,
        title: v.title,
        visitDate: v.visitDate,
        visitTime: v.visitTime,
        doctorId: v.doctorId,
        preNotes: patch.preNotes !== undefined ? patch.preNotes : v.preNotes,
        postNotes: patch.postNotes !== undefined ? patch.postNotes : v.postNotes,
        totalCost: patch.totalCost !== undefined ? patch.totalCost : v.totalCost,
        outOfPocket: patch.outOfPocket !== undefined ? patch.outOfPocket : v.outOfPocket,
      });
    } catch {
      Alert.alert('Error', 'Could not save changes.');
    }
  };

  const handleSaveEdit = async (input: {
    title: string;
    visitDate: string;
    visitTime: string | null;
    doctorId: string | null;
    preNotes: string | null;
    postNotes: string | null;
    totalCost: number | null;
    outOfPocket: number | null;
  }) => {
    try {
      await updateVisit.mutateAsync({ visitId: v.id, ...input });
      setShowEditModal(false);
    } catch {
      Alert.alert('Error', 'Could not save changes.');
    }
  };

  const handleAddToCalendar = async () => {
    const url = `webcal://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(v.title)}&dates=${v.visitDate.replace(/-/g, '')}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
    else Alert.alert('Cannot open calendar', 'Unable to open calendar app.');
  };

  const inlineInputStyle = { fontSize: 14, color: '#17211C', padding: 0, margin: 0 } as const;
  const costInputStyle = { fontSize: 13, color: '#17211C', fontWeight: '500' as const, textAlign: 'right' as const, minWidth: 80, padding: 0 };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}>
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <PressableBase onPress={() => router.navigate('/(app)/visits')} accessibilityRole="button" style={(pressed) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4 })}>
          <Text style={{ fontSize: 15, color: '#1F5C41' }}>‹</Text>
          <Text style={{ fontSize: 14, color: '#1F5C41', fontWeight: '500' }}>Back</Text>
        </PressableBase>
        <PressableBase onPress={() => setShowEditModal(true)} accessibilityRole="button" accessibilityLabel="Edit visit" style={(pressed) => ({ width: 32, height: 32, borderRadius: 16, backgroundColor: '#ECEBE5', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
          <Text style={{ fontSize: 14, color: 'rgba(23,33,28,0.65)' }}>✎</Text>
        </PressableBase>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
        {/* Hero card */}
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3E2DB', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <View style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: '#E8EFF8', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Text style={{ fontSize: 24 }}>📅</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '300', fontFamily: Fonts.serif, color: '#17211C', lineHeight: 24 }}>{v.title}</Text>
            <Text style={{ fontSize: 12, color: 'rgba(23,33,28,0.55)', marginTop: 3 }}>
              {formatDate(v.visitDate)}{v.visitTime ? ` at ${formatTime(v.visitTime)}` : ''} · {isUpcoming ? 'Upcoming' : 'Past'}
            </Text>
          </View>
        </View>

        {/* Details */}
        <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(23,33,28,0.55)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Details</Text>
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3E2DB', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F0EFEA' }}>
            <Text style={{ fontSize: 13, color: 'rgba(23,33,28,0.55)', flex: 1 }}>Date</Text>
            <Text style={{ fontSize: 13, color: '#17211C', fontWeight: '500' }}>{formatDate(v.visitDate)}{v.visitTime ? ` at ${formatTime(v.visitTime)}` : ''}</Text>
          </View>
          <View style={{ flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F0EFEA' }}>
            <Text style={{ fontSize: 13, color: 'rgba(23,33,28,0.55)', flex: 1 }}>Person</Text>
            <Text style={{ fontSize: 13, color: '#17211C', fontWeight: '500' }}>{v.personName}</Text>
          </View>
          {v.doctorName ? (
            <View style={{ flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F0EFEA' }}>
              <Text style={{ fontSize: 13, color: 'rgba(23,33,28,0.55)', flex: 1 }}>Doctor</Text>
              <Text style={{ fontSize: 13, color: '#17211C', fontWeight: '500' }}>{v.doctorName}</Text>
            </View>
          ) : null}
          {/* Costs — inline editable */}
          <View style={{ flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F0EFEA', alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: 'rgba(23,33,28,0.55)', flex: 1 }}>Total cost</Text>
            <Text style={{ fontSize: 13, color: 'rgba(23,33,28,0.55)' }}>$</Text>
            <TextInput value={totalCost} onChangeText={setTotalCost} onBlur={() => persist({ totalCost: parseCost(totalCost) })} placeholder="0.00" placeholderTextColor="#C8C4BC" keyboardType="decimal-pad" style={costInputStyle} />
          </View>
          <View style={{ flexDirection: 'row', padding: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: 'rgba(23,33,28,0.55)', flex: 1 }}>Out of pocket</Text>
            <Text style={{ fontSize: 13, color: 'rgba(23,33,28,0.55)' }}>$</Text>
            <TextInput value={outOfPocket} onChangeText={setOutOfPocket} onBlur={() => persist({ outOfPocket: parseCost(outOfPocket) })} placeholder="0.00" placeholderTextColor="#C8C4BC" keyboardType="decimal-pad" style={costInputStyle} />
          </View>
        </View>

        {/* Pre-appointment notes — inline editable */}
        <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(23,33,28,0.55)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Pre-Appointment Notes</Text>
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3E2DB', borderRadius: 12, padding: 14, marginBottom: 16 }}>
          <TextInput value={preNotes} onChangeText={setPreNotes} onBlur={() => persist({ preNotes: preNotes.trim() || null })} placeholder="What to discuss, questions to ask..." placeholderTextColor="#8B928E" multiline style={{ ...inlineInputStyle, lineHeight: 20, minHeight: 40, textAlignVertical: 'top' }} />
        </View>

        {/* Post-appointment notes — inline editable */}
        <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(23,33,28,0.55)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Post-Appointment Notes</Text>
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3E2DB', borderRadius: 12, padding: 14, marginBottom: 16 }}>
          <TextInput value={postNotes} onChangeText={setPostNotes} onBlur={() => persist({ postNotes: postNotes.trim() || null })} placeholder="Outcomes, follow-ups, results..." placeholderTextColor="#8B928E" multiline style={{ ...inlineInputStyle, lineHeight: 20, minHeight: 40, textAlignVertical: 'top' }} />
        </View>

        {/* Actions */}
        <PressableBase onPress={handleAddToCalendar} accessibilityRole="button" style={(pressed) => ({ backgroundColor: pressed ? '#DDE8F5' : '#E8EFF8', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 })}>
          <Text style={{ fontSize: 18 }}>📅</Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#2C5282' }}>Add to Google / iOS Calendar</Text>
        </PressableBase>
        <PressableBase accessibilityRole="button" style={(pressed) => ({ backgroundColor: pressed ? '#DDE8F5' : '#E8EFF8', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 })}>
          <Text style={{ fontSize: 18 }}>📄</Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#2C5282' }}>Add Document</Text>
        </PressableBase>
      </ScrollView>

      {isUpcoming && (
        <View style={{ position: 'absolute', bottom: 24, left: 16, right: 16 }}>
          <PressableBase onPress={() => router.push(`/(app)/appointments?visitId=${v.id}&personId=${v.personId ?? ''}&personName=${encodeURIComponent(v.personName ?? '')}&doctorName=${encodeURIComponent(v.doctorName ?? '')}&visitDate=${v.visitDate}&preNotes=${encodeURIComponent(v.preNotes ?? '')}` as never)} accessibilityRole="button" style={(pressed) => ({ backgroundColor: pressed ? '#17452F' : '#1F5C41', borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 })}>
            <Text style={{ fontSize: 16, color: 'white' }}>▶</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>Start Appointment</Text>
          </PressableBase>
        </View>
      )}

      <EditVisitModal visible={showEditModal} isLoading={updateVisit.isPending} visit={v} doctors={doctors} onSave={handleSaveEdit} onDismiss={() => setShowEditModal(false)} />
    </View>
  );
};
