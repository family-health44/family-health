// src/features/medications/screens/MedicationDetailScreen.tsx
// Medication detail — hero + stat strip + 3-tab control (Log History / Details / Notes).
// Tapping a medication opens this; the ✎ in the header opens the existing edit modal.

import { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableBase } from '@/design-system/components/PressableBase';
import { ErrorState, LoadingState } from '@/design-system/components/EmptyState';
import { Fonts } from '@/design-system/tokens/fonts';

import { useMedicationDetailQuery } from '../queries/medications.queries';
import { usePersonMedications } from '../hooks/usePersonMedications';
import { EditMedicationModal } from '../components/EditMedicationModal';
import { StatCard } from '../components/StatCard';
import { MedicationLogHistoryTab } from '../components/MedicationLogHistoryTab';
import { MedicationDetailsTab } from '../components/MedicationDetailsTab';
import { MedicationNotesTab } from '../components/MedicationNotesTab';

import { useMedicationLogs } from '@/features/medication-logs/hooks/useMedicationLogs';
import { FEELING_CONFIG } from '@/features/medication-logs/domain/medication-logs.domain';
import { MedicationLogSheet } from '@/features/medication-logs/components/MedicationLogSheet';

import type { MedicationLog, MedicationLogFormValues } from '@/features/medication-logs/types/medication-logs.types';

type Tab = 'log' | 'details' | 'notes';

interface MedicationDetailScreenProps {
  personId: string;
  medicationId: string;
  personName?: string;
  familyGroupId: string;
}

export const MedicationDetailScreen = ({
  personId, medicationId, personName, familyGroupId,
}: MedicationDetailScreenProps) => {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('log');
  const [editing, setEditing] = useState(false);
  const [logSheetOpen, setLogSheetOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<MedicationLog | null>(null);

  const { data: medication, isLoading, error } = useMedicationDetailQuery(medicationId);
  const { logs, stats, isLoading: logsLoading, addLog, updateLog, deleteLog, isSubmitting } = useMedicationLogs(medicationId);
  const { updateMedication, isUpdating, deleteMedication } = usePersonMedications(personId);

  const openAddLog = () => { setEditingLog(null); setLogSheetOpen(true); };
  const openEditLog = (log: MedicationLog) => { setEditingLog(log); setLogSheetOpen(true); };

  const handleSaveLog = async (values: MedicationLogFormValues) => {
    if (editingLog) {
      await updateLog(editingLog.id, values);
    } else {
      await addLog({ personId, familyGroupId, values });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete medication',
      `${medication?.name ?? 'This medication'} and all its log entries will be permanently removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => { await deleteMedication(medicationId); router.back(); } },
      ],
    );
  };

  if (isLoading) return <LoadingState message="Loading medication..." />;
  if (error) return <ErrorState message={error.message} />;
  if (!medication) return <ErrorState message="Medication not found." />;

  const mostCommon = stats.mostCommonFeeling ? FEELING_CONFIG[stats.mostCommonFeeling] : null;

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}>
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <PressableBase onPress={() => router.back()} accessibilityRole="button" style={(p) => ({ opacity: p ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4 })}>
          <Text style={{ fontSize: 15, color: '#1F5C41' }}>‹</Text>
          <Text style={{ fontSize: 14, color: '#1F5C41', fontWeight: '500' }}>Back</Text>
        </PressableBase>
        <PressableBase onPress={() => setEditing(true)} accessibilityRole="button" accessibilityLabel="Edit medication" style={(p) => ({ opacity: p ? 0.6 : 1, padding: 4 })}>
          <Text style={{ fontSize: 18, color: '#1F5C41' }}>✎</Text>
        </PressableBase>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 100 }}>
        <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E3E2DB', borderRadius: 16, padding: 16, marginBottom: 14 }}>
          <Text style={{ fontSize: 26, fontWeight: '300', fontFamily: Fonts.serif, color: '#17211C' }}>{medication.name}</Text>
          <Text style={{ fontSize: 13, color: 'rgba(23,33,28,0.65)', marginTop: 2 }}>
            {[medication.reason, personName].filter(Boolean).join(' · ')}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <StatCard value={String(stats.count)} label="Log entries" />
          <StatCard value={mostCommon?.emoji ?? '—'} label="Most common" />
          <StatCard value={stats.weeksOnMed != null ? `${stats.weeksOnMed}w` : '—'} label="On this med" />
        </View>

        <View style={{ flexDirection: 'row', backgroundColor: '#ECEBE5', borderRadius: 10, padding: 3, marginBottom: 16 }}>
          {([['log', 'Log History'], ['details', 'Details'], ['notes', 'Notes']] as [Tab, string][]).map(([key, label]) => {
            const active = tab === key;
            return (
              <PressableBase key={key} onPress={() => setTab(key)} accessibilityRole="button" style={{ flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: active ? '#FFFFFF' : 'transparent', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: active ? '700' : '500', color: active ? '#17211C' : 'rgba(23,33,28,0.65)' }}>{label}</Text>
              </PressableBase>
            );
          })}
        </View>

        {tab === 'log' ? (
          <MedicationLogHistoryTab
            logs={logs}
            isLoading={logsLoading}
            onAddLog={openAddLog}
            onEditLog={openEditLog}
          />
        ) : null}

        {tab === 'details' ? <MedicationDetailsTab medication={medication} personName={personName} /> : null}

        {tab === 'notes' ? <MedicationNotesTab personId={personId} medicationId={medicationId} /> : null}

        <PressableBase onPress={handleDelete} accessibilityRole="button" accessibilityLabel="Delete medication" style={(p) => ({ opacity: p ? 0.6 : 1, alignItems: 'center', paddingVertical: 16, marginTop: 12 })}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#C0392B' }}>Delete medication</Text>
        </PressableBase>
      </ScrollView>

      <EditMedicationModal
        visible={editing}
        isLoading={isUpdating}
        medication={medication}
        onSave={async (params) => { await updateMedication(params); setEditing(false); }}
        onDismiss={() => setEditing(false)}
      />

      <MedicationLogSheet
        visible={logSheetOpen}
        isSubmitting={isSubmitting}
        editingLog={editingLog}
        medicationLabel={[medication.name, medication.dosage].filter(Boolean).join(' ')}
        medicationSubLabel={[personName, medication.frequency].filter(Boolean).join(' · ')}
        onSave={handleSaveLog}
        onDelete={deleteLog}
        onDismiss={() => setLogSheetOpen(false)}
      />
    </View>
  );
};
