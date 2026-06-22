// src/features/medication-logs/components/MedicationLogSheet.tsx
// Slide-up sheet for adding or editing a medication log entry.
// Add mode: editingLog = null. Edit mode: editingLog provided (adds Delete action).

import { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView, TextInput, Alert } from 'react-native';

import { PressableBase } from '@/design-system/components/PressableBase';
import { Button } from '@/design-system/components/Button';
import { toISODateString } from '@/shared/utils/dates';
import { FEELING_CONFIG, FEELINGS } from '../domain/medication-logs.domain';

import type {
  MedicationLog,
  MedicationLogFormValues,
  Feeling,
  DoseStatus,
} from '../types/medication-logs.types';

const PRESET_TAGS = ['Nausea', 'Headache', 'Good sleep', 'More energy', 'Drowsy', 'Dry mouth'];

const DOSE_OPTIONS: { value: DoseStatus; label: string }[] = [
  { value: 'taken',     label: 'Took as prescribed' },
  { value: 'missed',    label: 'Missed dose' },
  { value: 'different', label: 'Took different amount' },
];

function nowTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

interface MedicationLogSheetProps {
  visible: boolean;
  isSubmitting: boolean;
  editingLog: MedicationLog | null;
  medicationLabel: string;
  medicationSubLabel: string;
  onSave: (values: MedicationLogFormValues) => Promise<void>;
  onDelete?: (logId: string) => Promise<void>;
  onDismiss: () => void;
}

export const MedicationLogSheet = ({
  visible, isSubmitting, editingLog, medicationLabel, medicationSubLabel,
  onSave, onDelete, onDismiss,
}: MedicationLogSheetProps) => {
  const [loggedDate, setLoggedDate] = useState('');
  const [loggedTime, setLoggedTime] = useState('');
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [doseStatus, setDoseStatus] = useState<DoseStatus | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!visible) return;
    if (editingLog) {
      setLoggedDate(editingLog.loggedDate);
      setLoggedTime(editingLog.loggedTime ? editingLog.loggedTime.slice(0, 5) : '');
      setFeeling(editingLog.feeling);
      setTags(editingLog.tags);
      setDoseStatus(editingLog.doseStatus);
      setNote(editingLog.note ?? '');
    } else {
      setLoggedDate(toISODateString(new Date()));
      setLoggedTime(nowTime());
      setFeeling(null);
      setTags([]);
      setDoseStatus(null);
      setNote('');
    }
    setCustomTag('');
  }, [visible, editingLog]);

  const toggleTag = (t: string) => {
    setTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };

  const addCustomTag = () => {
    const t = customTag.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setCustomTag('');
  };

  const handleSave = async () => {
    await onSave({
      loggedDate: loggedDate.trim() || toISODateString(new Date()),
      loggedTime: loggedTime.trim() ? `${loggedTime.trim()}:00` : null,
      feeling,
      doseStatus,
      note: note.trim() || null,
      tags,
    });
    onDismiss();
  };

  const handleDelete = () => {
    if (!editingLog || !onDelete) return;
    Alert.alert('Delete entry', 'This log entry will be permanently removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await onDelete(editingLog.id); onDismiss(); } },
    ]);
  };

  const allTagChips = [...PRESET_TAGS, ...tags.filter((t) => !PRESET_TAGS.includes(t))];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={onDismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable>
            <View style={{ backgroundColor: '#F7F5F0', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '92%' }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#D0CCC4', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16 }} />

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 }}>
                <PressableBase onPress={onDismiss} hitSlop={10} style={(p) => ({ opacity: p ? 0.5 : 1 })}>
                  <Text style={{ fontSize: 22, color: '#6B6866' }}>×</Text>
                </PressableBase>
                <Text style={{ fontSize: 17, fontWeight: '700', color: '#1C1917' }}>
                  {editingLog ? 'Edit log entry' : 'Add log entry'}
                </Text>
                <View style={{ width: 22 }} />
              </View>

              <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }} keyboardShouldPersistTaps="handled">
                <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8E4DC', borderRadius: 12, padding: 12, marginBottom: 18 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#1C1917' }}>{medicationLabel}</Text>
                  {medicationSubLabel ? <Text style={{ fontSize: 12, color: '#6B6866', marginTop: 2 }}>{medicationSubLabel}</Text> : null}
                </View>

                <Label text="Date" />
                <TextInput value={loggedDate} onChangeText={setLoggedDate} placeholder="YYYY-MM-DD" placeholderTextColor="#A8A09A" keyboardType="numbers-and-punctuation" style={inputStyle} />
                <Label text="Time" />
                <TextInput value={loggedTime} onChangeText={setLoggedTime} placeholder="HH:MM (optional)" placeholderTextColor="#A8A09A" keyboardType="numbers-and-punctuation" style={inputStyle} />

                <Label text="How did it make you feel?" />
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
                  {FEELINGS.map((f) => {
                    const cfg = FEELING_CONFIG[f];
                    const active = feeling === f;
                    return (
                      <PressableBase key={f} onPress={() => setFeeling(active ? null : f)} accessibilityRole="button" accessibilityLabel={cfg.label} accessibilityState={{ selected: active }}
                        style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: active ? '#2A6049' : '#E8E4DC', backgroundColor: active ? '#E6F0EC' : '#FFFFFF' }}>
                        <Text style={{ fontSize: 22 }}>{cfg.emoji}</Text>
                        <Text style={{ fontSize: 10, color: active ? '#1A4D35' : '#6B6866', marginTop: 3, fontWeight: active ? '700' : '400' }}>{cfg.label}</Text>
                      </PressableBase>
                    );
                  })}
                </View>

                <Label text="Tags (optional)" />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  {allTagChips.map((t) => {
                    const active = tags.includes(t);
                    return (
                      <PressableBase key={t} onPress={() => toggleTag(t)} accessibilityRole="button" accessibilityState={{ selected: active }}
                        style={{ paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: active ? '#2A6049' : '#E3DDD5', backgroundColor: active ? '#E6F0EC' : '#FFFFFF' }}>
                        <Text style={{ fontSize: 13, color: active ? '#1A4D35' : '#3D3D3D', fontWeight: active ? '600' : '400' }}>{t}</Text>
                      </PressableBase>
                    );
                  })}
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
                  <TextInput value={customTag} onChangeText={setCustomTag} placeholder="Add a tag" placeholderTextColor="#A8A09A" onSubmitEditing={addCustomTag} returnKeyType="done" style={[inputStyle, { flex: 1, marginBottom: 0 }]} />
                  <PressableBase onPress={addCustomTag} accessibilityRole="button" accessibilityLabel="Add tag" style={(p) => ({ paddingHorizontal: 16, justifyContent: 'center', borderRadius: 10, backgroundColor: p ? '#1F4D38' : '#2A6049' })}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>Add</Text>
                  </PressableBase>
                </View>

                <Label text="Notes (optional)" />
                <TextInput value={note} onChangeText={setNote} placeholder="How are you feeling on this medication?" placeholderTextColor="#A8A09A" multiline style={[inputStyle, { height: 90, textAlignVertical: 'top', paddingTop: 12 }]} />

                <Label text="Dose" />
                <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8E4DC', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
                  {DOSE_OPTIONS.map((opt, i) => {
                    const active = doseStatus === opt.value;
                    return (
                      <PressableBase key={opt.value} onPress={() => setDoseStatus(active ? null : opt.value)} accessibilityRole="button" accessibilityState={{ selected: active }}
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, paddingHorizontal: 14, borderBottomWidth: i < DOSE_OPTIONS.length - 1 ? 1 : 0, borderBottomColor: '#F0EDE8', backgroundColor: active ? '#E6F0EC' : '#FFFFFF' }}>
                        <Text style={{ fontSize: 14, color: active ? '#1A4D35' : '#1C1917', fontWeight: active ? '600' : '400' }}>{opt.label}</Text>
                        {active ? <Text style={{ fontSize: 14, color: '#2A6049' }}>✓</Text> : null}
                      </PressableBase>
                    );
                  })}
                </View>

                <Button label="Save log entry" variant="primary" size="lg" isFullWidth isLoading={isSubmitting} onPress={handleSave} />
                {editingLog && onDelete ? (
                  <PressableBase onPress={handleDelete} accessibilityRole="button" style={(p) => ({ opacity: p ? 0.6 : 1, alignItems: 'center', paddingVertical: 14 })}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#C0392B' }}>Delete entry</Text>
                  </PressableBase>
                ) : null}
              </ScrollView>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

const Label = ({ text }: { text: string }) => (
  <Text style={{ fontSize: 11, fontWeight: '700', color: '#A8A09A', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>{text}</Text>
);

const inputStyle = {
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E3DDD5',
  borderRadius: 10,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 15,
  color: '#1C1917',
  marginBottom: 18,
} as const;
