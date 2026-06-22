// src/features/medications/screens/MedicationDetailScreen.tsx
// Medication detail — hero + stat strip + 3-tab control (Log History / Details / Notes).
// Tapping a medication opens this; the ✎ in the header opens the existing edit modal.

import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableBase } from '@/design-system/components/PressableBase';
import { ErrorState, LoadingState, EmptyState } from '@/design-system/components/EmptyState';
import { Fonts } from '@/design-system/tokens/fonts';
import { formatDate, formatTime } from '@/shared/utils/dates';
import { AiTeaser } from '@/design-system/components/AiTeaser';

import { useMedicationDetailQuery } from '../queries/medications.queries';
import { usePersonMedications } from '../hooks/usePersonMedications';
import { statusLabel } from '../domain/medications.domain';
import { EditMedicationModal } from '../components/EditMedicationModal';

import { useMedicationLogs } from '@/features/medication-logs/hooks/useMedicationLogs';
import { FEELING_CONFIG, doseStatusLabel } from '@/features/medication-logs/domain/medication-logs.domain';
import { MedicationLogSheet } from '@/features/medication-logs/components/MedicationLogSheet';

import { usePersonNotesQuery } from '@/features/notes/queries/notes.queries';
import { parseNoteContent } from '@/features/notes/domain/notes.domain';

import type { MedicationLog, MedicationLogFormValues } from '@/features/medication-logs/types/medication-logs.types';
import type { Medication } from '../types/medications.types';

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
  const { updateMedication, isUpdating } = usePersonMedications(personId);

  const openAddLog = () => { setEditingLog(null); setLogSheetOpen(true); };
  const openEditLog = (log: MedicationLog) => { setEditingLog(log); setLogSheetOpen(true); };

  const handleSaveLog = async (values: MedicationLogFormValues) => {
    if (editingLog) {
      await updateLog(editingLog.id, values);
    } else {
      await addLog({ personId, familyGroupId, values });
    }
  };

  if (isLoading) return <LoadingState message="Loading medication..." />;
  if (error) return <ErrorState message={error.message} />;
  if (!medication) return <ErrorState message="Medication not found." />;

  const mostCommon = stats.mostCommonFeeling ? FEELING_CONFIG[stats.mostCommonFeeling] : null;

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <PressableBase onPress={() => router.back()} accessibilityRole="button" style={(p) => ({ opacity: p ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4 })}>
          <Text style={{ fontSize: 15, color: '#2A6049' }}>‹</Text>
          <Text style={{ fontSize: 14, color: '#2A6049', fontWeight: '500' }}>Back</Text>
        </PressableBase>
        <PressableBase onPress={() => setEditing(true)} accessibilityRole="button" accessibilityLabel="Edit medication" style={(p) => ({ opacity: p ? 0.6 : 1, padding: 4 })}>
          <Text style={{ fontSize: 18, color: '#2A6049' }}>✎</Text>
        </PressableBase>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 100 }}>
        <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8E4DC', borderRadius: 16, padding: 16, marginBottom: 14 }}>
          <Text style={{ fontSize: 26, fontWeight: '300', fontFamily: Fonts.serif, color: '#1C1917' }}>{medication.name}</Text>
          <Text style={{ fontSize: 13, color: '#6B6866', marginTop: 2 }}>
            {[medication.reason, personName].filter(Boolean).join(' · ')}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <StatCard value={String(stats.count)} label="Log entries" />
          <StatCard value={mostCommon?.emoji ?? '—'} label="Most common" />
          <StatCard value={stats.weeksOnMed != null ? `${stats.weeksOnMed}w` : '—'} label="On this med" />
        </View>

        <View style={{ flexDirection: 'row', backgroundColor: '#EEEAE3', borderRadius: 10, padding: 3, marginBottom: 16 }}>
          {([['log', 'Log History'], ['details', 'Details'], ['notes', 'Notes']] as [Tab, string][]).map(([key, label]) => {
            const active = tab === key;
            return (
              <PressableBase key={key} onPress={() => setTab(key)} accessibilityRole="button" style={{ flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: active ? '#FFFFFF' : 'transparent', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: active ? '700' : '500', color: active ? '#1C1917' : '#6B6866' }}>{label}</Text>
              </PressableBase>
            );
          })}
        </View>

        {tab === 'log' ? (
          <LogHistoryTab
            logs={logs}
            isLoading={logsLoading}
            onAddLog={openAddLog}
            onEditLog={openEditLog}
          />
        ) : null}

        {tab === 'details' ? <DetailsTab medication={medication} personName={personName} /> : null}

        {tab === 'notes' ? <NotesTab personId={personId} medicationId={medicationId} /> : null}
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

const StatCard = ({ value, label }: { value: string; label: string }) => (
  <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8E4DC', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}>
    <Text style={{ fontSize: 20, fontWeight: '700', color: '#1C1917' }}>{value}</Text>
    <Text style={{ fontSize: 11, color: '#A8A09A', marginTop: 2 }}>{label}</Text>
  </View>
);

const LogHistoryTab = ({
  logs, isLoading, onAddLog, onEditLog,
}: {
  logs: MedicationLog[];
  isLoading: boolean;
  onAddLog: () => void;
  onEditLog: (log: MedicationLog) => void;
}) => (
  <View>
    <AiTeaser
      storageKey="med_ai_summary_dismissed_at"
      title="AI summary"
      body="Pattern detection, trends, and a plain-English summary of how this medication is working — across all your logs."
    />

    {isLoading ? (
      <Text style={{ fontSize: 13, color: '#A8A09A', textAlign: 'center', paddingVertical: 20 }}>Loading entries...</Text>
    ) : logs.length === 0 ? (
      <EmptyState title="No log entries yet" message="Tap Add log entry to record how this medication is going." />
    ) : (
      <View style={{ gap: 10, marginBottom: 16 }}>
        {logs.map((log) => (
          <PressableBase key={log.id} onPress={() => onEditLog(log)} accessibilityRole="button" style={(p) => ({ opacity: p ? 0.7 : 1 })}>
            <LogEntryCard log={log} />
          </PressableBase>
        ))}
      </View>
    )}

    <PressableBase
      onPress={onAddLog}
      accessibilityRole="button"
      style={(p) => ({ backgroundColor: p ? '#1F4D38' : '#2A6049', borderRadius: 12, paddingVertical: 14, alignItems: 'center' })}
    >
      <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>+ Add log entry</Text>
    </PressableBase>
  </View>
);

const LogEntryCard = ({ log }: { log: MedicationLog }) => {
  const feeling = log.feeling ? FEELING_CONFIG[log.feeling] : null;
  const when = `${formatDate(log.loggedDate)}${log.loggedTime ? ` · ${formatTime(log.loggedTime)}` : ''}`;
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <View style={{ width: 10, alignItems: 'center', paddingTop: 16 }}>
        <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: feeling?.colour ?? '#D0CCC4' }} />
      </View>
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8E4DC', borderRadius: 12, padding: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#A8A09A', textTransform: 'uppercase', letterSpacing: 0.6 }}>{when}</Text>
          {feeling ? <Text style={{ fontSize: 16 }}>{feeling.emoji}</Text> : null}
        </View>
        {log.note ? <Text style={{ fontSize: 14, color: '#1A1A1A', lineHeight: 20 }}>{log.note}</Text> : null}
        {log.doseStatus ? (
          <Text style={{ fontSize: 12, color: '#6B6866', marginTop: 4 }}>{doseStatusLabel(log.doseStatus)}</Text>
        ) : null}
        {log.tags.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {log.tags.map((t) => (
              <View key={t} style={{ backgroundColor: '#F0EDE8', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }}>
                <Text style={{ fontSize: 11, color: '#6B6866' }}>{t}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
};

const DetailsTab = ({ medication, personName }: { medication: Medication; personName?: string }) => {
  const Row = ({ label, value }: { label: string; value: string | null }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8E4DC', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8 }}>
      <Text style={{ fontSize: 14, color: '#6B6866' }}>{label}</Text>
      <Text style={{ fontSize: 14, color: value ? '#1C1917' : '#A8A09A', fontWeight: value ? '600' : '400', flexShrink: 1, textAlign: 'right' }}>
        {value ?? 'Not set'}
      </Text>
    </View>
  );
  const SectionLabel = ({ text }: { text: string }) => (
    <Text style={{ fontSize: 10, fontWeight: '700', color: '#A8A09A', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 8 }}>{text}</Text>
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

const NotesTab = ({ personId, medicationId }: { personId: string; medicationId: string }) => {
  const { data: allNotes = [], isLoading } = usePersonNotesQuery(personId);
  const notes = allNotes.filter((n) => n.medicationId === medicationId);

  if (isLoading) return <Text style={{ fontSize: 13, color: '#A8A09A', textAlign: 'center', paddingVertical: 20 }}>Loading notes...</Text>;
  if (notes.length === 0) return <EmptyState title="No notes" message="Notes linked to this medication will appear here." />;

  return (
    <View style={{ gap: 10 }}>
      {notes.map((note) => {
        const segments = parseNoteContent(note.content);
        return (
          <View key={note.id} style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8E4DC', borderRadius: 12, padding: 12 }}>
            {note.noteDate ? (
              <Text style={{ fontSize: 12, color: '#6B6866', fontWeight: '600', marginBottom: 6 }}>{formatDate(note.noteDate)}</Text>
            ) : null}
            {segments.map((seg, i) => (
              <Text key={i} style={{ fontSize: 14, color: '#1A1A1A', lineHeight: 20 }}>{seg.content}</Text>
            ))}
          </View>
        );
      })}
    </View>
  );
};
