// src/features/family/screens/InfoCardScreen.tsx
// Info Card — read-only display of a person's Important Info, with Edit + Share.
// Editing happens here (not the person header) — intentional deviation from the
// PWA, which edits these inside the person form. Flagged for A9.

import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableBase } from '@/design-system/components/PressableBase';
import { Button } from '@/design-system/components/Button';
import { Fonts } from '@/design-system/tokens/fonts';
import { isoToDisplayDate } from '@/shared/utils/dates';
import { shareInfoCardPdf } from '@/shared/utils/pdfShare';
import { EditInfoCardModal } from '@/features/family/components/EditInfoCardModal';
import { useUpdatePersonInfoMutation } from '@/features/family/mutations/family.mutations';
import type { Person, PersonInfoCard } from '@/features/family/types/family.types';
import type { UpdatePersonInfoParams } from '@/features/family/repository/family.repository';

interface InfoCardScreenProps { person: Person; }

const NOT_SET = 'Not set';

const immunLabel = (v: boolean | null): string =>
  v === null ? NOT_SET : v ? 'Up to date' : 'Outstanding';

// Ordered rows for both the on-screen display and the shared text.
const buildRows = (i: PersonInfoCard): { label: string; value: string }[] => [
  { label: 'Date of Birth', value: i.dob ? isoToDisplayDate(i.dob) : NOT_SET },
  { label: 'Medicare Number', value: i.medicareNumber ?? NOT_SET },
  { label: 'Blood Type', value: i.bloodType ?? NOT_SET },
  { label: 'Immunisations', value: immunLabel(i.immunisationsCurrent) },
  { label: 'Allergies', value: i.allergies ?? NOT_SET },
  { label: 'Diagnoses', value: i.diagnoses ?? NOT_SET },
  { label: 'Health Fund', value: i.healthFund ?? NOT_SET },
  { label: 'Health Fund Number', value: i.healthFundNumber ?? NOT_SET },
  { label: 'Emergency Contact', value: i.emergencyContact ?? NOT_SET },
  { label: 'Emergency Phone', value: i.emergencyPhone ?? NOT_SET },
  { label: 'Notes', value: i.notes ?? NOT_SET },
];

export const InfoCardScreen = ({ person }: InfoCardScreenProps) => {
  const insets = useSafeAreaInsets();
  const [editing, setEditing] = useState(false);
  const updateInfo = useUpdatePersonInfoMutation();

  const rows = buildRows(person.infoCard);

  const handleSave = async (fields: UpdatePersonInfoParams) => {
    await updateInfo.mutateAsync({ personId: person.id, fields });
  };

  const handleShare = async () => {
    // Only include fields that are set — a card full of "Not set" isn't useful.
    const setRows = rows.filter((r) => r.value !== NOT_SET);
    const body = setRows.length > 0
      ? `${person.name} — Info Card\n\n${setRows.map((r) => `${r.label}: ${r.value}`).join('\n')}`
      : `${person.name} — Info Card\n\nNo details recorded yet.`;
    await shareInfoCardPdf(person.name, setRows, body);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 16, paddingBottom: 8 }}>
        <PressableBase onPress={() => router.back()} accessibilityRole="button" style={(pressed) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 })}>
          <Text style={{ fontSize: 15, color: '#2A6049' }}>‹</Text>
          <Text style={{ fontSize: 14, color: '#2A6049', fontWeight: '500' }}>Back</Text>
        </PressableBase>
        <Text style={{ fontSize: 28, fontWeight: '300', fontFamily: Fonts.serif, color: '#1C1917', lineHeight: 32 }}>Info Card</Text>
        <Text style={{ fontSize: 12, color: '#A8A09A', marginTop: 2 }}>{person.name}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 14, overflow: 'hidden' }}>
          {rows.map((row, index) => (
            <View key={row.label} style={{ flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderBottomWidth: index < rows.length - 1 ? 1 : 0, borderBottomColor: '#F0EDE8' }}>
              <Text style={{ fontSize: 13, color: '#A8A09A', flex: 1 }}>{row.label}</Text>
              <Text style={{ fontSize: 13, color: row.value === NOT_SET ? '#C8C4BC' : '#1C1917', fontWeight: row.value === NOT_SET ? '400' : '500', flex: 1.4, textAlign: 'right' }}>{row.value}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 16, gap: 12 }}>
          <Button label="Edit info card" variant="primary" size="lg" isFullWidth onPress={() => setEditing(true)} />
          <Button label="Share info card" variant="secondary" size="lg" isFullWidth onPress={handleShare} />
        </View>
      </ScrollView>

      <EditInfoCardModal
        visible={editing}
        isLoading={updateInfo.isPending}
        personName={person.name}
        initial={person.infoCard}
        onSave={handleSave}
        onDismiss={() => setEditing(false)}
      />
    </View>
  );
};
