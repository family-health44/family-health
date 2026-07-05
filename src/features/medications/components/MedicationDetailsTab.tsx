// src/features/medications/components/MedicationDetailsTab.tsx
import { View, Text } from 'react-native';
import { formatDate } from '@/shared/utils/dates';
import { statusLabel } from '../domain/medications.domain';
import type { Medication } from '../types/medications.types';

export const MedicationDetailsTab = ({ medication, personName }: { medication: Medication; personName?: string }) => {
  const Row = ({ label, value }: { label: string; value: string | null }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E3E2DB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8 }}>
      <Text style={{ fontSize: 14, color: 'rgba(23,33,28,0.65)' }}>{label}</Text>
      <Text style={{ fontSize: 14, color: value ? '#17211C' : 'rgba(23,33,28,0.55)', fontWeight: value ? '600' : '400', flexShrink: 1, textAlign: 'right' }}>
        {value ?? 'Not set'}
      </Text>
    </View>
  );
  const SectionLabel = ({ text }: { text: string }) => (
    <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(23,33,28,0.55)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 8 }}>{text}</Text>
  );
  return (
    <View>
      <SectionLabel text="Prescription" />
      <Row label="Dosage" value={medication.dosage} />
      <Row label="Form" value={medication.form} />
      <Row label="Frequency" value={medication.frequency} />
      <Row label="Time of day" value={medication.timeOfDay} />
      <Row label="With food" value={medication.withFood} />

      <SectionLabel text="Reason & care" />
      <Row label="Reason" value={medication.reason} />
      <Row label="Prescribed by" value={medication.prescribedByName} />
      <Row label="Person" value={personName ?? null} />

      <SectionLabel text="Status & dates" />
      <Row label="Status" value={statusLabel(medication.status)} />
      <Row label="Start date" value={medication.startDate ? formatDate(medication.startDate) : null} />
      <Row label="End date" value={medication.endDate ? formatDate(medication.endDate) : null} />

      <SectionLabel text="Refill" />
      <Row label="Repeats left" value={medication.repeatsLeft != null ? String(medication.repeatsLeft) : null} />
      <Row label="Next refill" value={medication.nextRefill ? formatDate(medication.nextRefill) : null} />
      <Row label="Pharmacy" value={medication.pharmacy} />
    </View>
  );
};
