#!/bin/bash
set -e
mkdir -p "$(dirname 'src/features/notes/types/notes.types.ts')"
cat > 'src/features/notes/types/notes.types.ts' << 'FHEOF'
// src/features/notes/types/notes.types.ts
// Domain types for the notes feature.
// Notes use a special content format from the proof-of-concept:
//   [EVENT:date:type] text  — marks a medical event embedded in a note
//   [SECTION:name] text     — section divider within a note
// These are parsed by the domain layer for display.

export interface Note {
  id: string;
  content: string;
  personId: string | null;
  doctorId: string | null;
  doctorName: string | null;
  medicationId: string | null;
  medicationName: string | null;
  visitId: string | null;
  visitName: string | null;
  familyGroupId: string;
  hidden: boolean;
  noteDate: string | null;
}

// Parsed segment of a note's content
export type NoteSegmentType = 'text' | 'event' | 'section';

export interface NoteSegment {
  type: NoteSegmentType;
  content: string;
  // For 'event' segments
  eventDate?: string;
  eventType?: string;
}

export interface NoteFormValues {
  content: string;
  doctorId: string | null;
  medicationId: string | null;
  visitId: string | null;
  hidden: boolean;
  noteDate: string | null;
}
FHEOF
mkdir -p "$(dirname 'src/features/notes/domain/notes.domain.ts')"
cat > 'src/features/notes/domain/notes.domain.ts' << 'FHEOF'
// src/features/notes/domain/notes.domain.ts
// Pure domain logic — zero external imports.
// Parses the special note content format used in the proof-of-concept.
//
// Content format:
//   Plain text — displayed as-is
//   [EVENT:2024-01-15:diagnosis] text — medical event marker
//   [SECTION:Results] text — section header divider

import type { DbNote } from '@/shared/types/database';
import type { Note, NoteSegment } from '../types/notes.types';

// ─── Mapping ──────────────────────────────────────────────────────────────────

export function mapDbNoteToNote(
  db: DbNote,
  doctorName: string | null = null,
  medicationName: string | null = null,
  visitName: string | null = null,
): Note {
  return {
    id: db.id,
    content: db.content,
    personId: db.person_id,
    doctorId: db.doctor_id,
    doctorName,
    medicationId: db.medication_id,
    medicationName,
    visitId: db.visit_id,
    visitName,
    familyGroupId: db.family_group_id,
    hidden: db.hidden,
    noteDate: db.note_date,
  };
}

// ─── Content parsing ──────────────────────────────────────────────────────────

// Parses note content into typed segments for rich display.
// [EVENT:date:type] text → event segment
// [SECTION:name] text → section segment
// Everything else → text segment
export function parseNoteContent(content: string): NoteSegment[] {
  if (!content.trim()) return [];

  const segments: NoteSegment[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Match [EVENT:date:type]
    const eventMatch = trimmed.match(/^\[EVENT:([^:]+):([^\]]+)\]\s*(.*)/);
    if (eventMatch) {
      segments.push({
        type: 'event',
        eventDate: eventMatch[1] ?? '',
        eventType: eventMatch[2] ?? '',
        content: eventMatch[3] ?? '',
      });
      continue;
    }

    // Match [S:name] (short section marker — appointment-saved notes use this)
    const shortSectionMatch = trimmed.match(/^\[S:([^\]]+)\]\s*(.*)/);
    if (shortSectionMatch) {
      segments.push({ type: 'section', content: shortSectionMatch[1] ?? '' });
      if (shortSectionMatch[2]?.trim()) {
        segments.push({ type: 'text', content: shortSectionMatch[2].trim() });
      }
      continue;
    }
    // Match [SECTION:name]
    const sectionMatch = trimmed.match(/^\[SECTION:([^\]]+)\]\s*(.*)/);
    if (sectionMatch) {
      segments.push({
        type: 'section',
        content: sectionMatch[1] ?? '',
      });
      if (sectionMatch[2]?.trim()) {
        segments.push({ type: 'text', content: sectionMatch[2].trim() });
      }
      continue;
    }

    segments.push({ type: 'text', content: trimmed });
  }

  return segments;
}

// Returns a short preview of note content (first 100 chars, stripped of markers)
export function getNotePreview(content: string, maxLength = 100): string {
  const stripped = content
    .replace(/\[EVENT:[^\]]+\]\s*/g, '')
    .replace(/\[SECTION:[^\]]+\]\s*/g, '')
    .replace(/\[S:[^\]]+\]\s*/g, '')
    .trim();

  if (stripped.length <= maxLength) return stripped;
  return `${stripped.slice(0, maxLength)}…`;
}

// Sorts notes — most recent visit notes first, then by content length descending
export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    // Pinned to visit first
    if (a.visitId && !b.visitId) return -1;
    if (!a.visitId && b.visitId) return 1;
    return b.content.length - a.content.length;
  });
}
FHEOF
mkdir -p "$(dirname 'src/features/notes/repository/notes.repository.ts')"
cat > 'src/features/notes/repository/notes.repository.ts' << 'FHEOF'
// src/features/notes/repository/notes.repository.ts
// Notes repository — only place Supabase is called for note data.

import { db } from '@/lib/supabase';
import { handleNetworkError } from '@/core/network/errorHandler';

import type { DbNote } from '@/shared/types/database';

export async function fetchNotesByPerson(personId: string): Promise<DbNote[]> {
  try {
    const { data, error } = await db
      .from('notes')
      .select('id, content, person_id, doctor_id, medication_id, visit_id, family_group_id, hidden, note_date')
      .eq('person_id', personId)
      .eq('hidden', false)
      .order('id', { ascending: false });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function fetchNotesByVisit(visitId: string): Promise<DbNote[]> {
  try {
    const { data, error } = await db
      .from('notes')
      .select('id, content, person_id, doctor_id, medication_id, visit_id, family_group_id, hidden, note_date')
      .eq('visit_id', visitId)
      .eq('hidden', false)
      .order('id', { ascending: false });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function fetchNotesByDoctor(doctorId: string): Promise<DbNote[]> {
  try {
    const { data, error } = await db
      .from('notes')
      .select('id, content, person_id, doctor_id, medication_id, visit_id, family_group_id, hidden, note_date')
      .eq('doctor_id', doctorId)
      .eq('hidden', false)
      .order('id', { ascending: false });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    handleNetworkError(error);
  }
}

export interface InsertNoteParams {
  content: string;
  personId: string | null;
  doctorId: string | null;
  medicationId: string | null;
  visitId: string | null;
  familyGroupId: string;
  hidden: boolean;
  noteDate?: string | null;
}

export async function insertNote(params: InsertNoteParams): Promise<DbNote> {
  try {
    const { data, error } = await db
      .from('notes')
      .insert({
        content: params.content,
        person_id: params.personId,
        doctor_id: params.doctorId,
        medication_id: params.medicationId,
        visit_id: params.visitId,
        family_group_id: params.familyGroupId,
        hidden: params.hidden,
        note_date: params.noteDate ?? null,
      })
      .select('id, content, person_id, doctor_id, medication_id, visit_id, family_group_id, hidden, note_date')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Insert returned no data.');
    return data;
  } catch (error) {
    handleNetworkError(error);
  }
}

export interface UpdateNoteParams {
  noteId: string;
  content: string;
  doctorId: string | null;
  medicationId: string | null;
  visitId: string | null;
  hidden: boolean;
  noteDate?: string | null;
}

export async function updateNote(params: UpdateNoteParams): Promise<DbNote> {
  try {
    const { data, error } = await db
      .from('notes')
      .update({
        content: params.content,
        doctor_id: params.doctorId,
        medication_id: params.medicationId,
        visit_id: params.visitId,
        hidden: params.hidden,
        note_date: params.noteDate ?? null,
      })
      .eq('id', params.noteId)
      .select('id, content, person_id, doctor_id, medication_id, visit_id, family_group_id, hidden, note_date')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Update returned no data.');
    return data;
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function deleteNote(noteId: string): Promise<void> {
  try {
    const { error } = await db
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;
  } catch (error) {
    handleNetworkError(error);
  }
}
FHEOF
mkdir -p "$(dirname 'src/features/notes/queries/notes.queries.ts')"
cat > 'src/features/notes/queries/notes.queries.ts' << 'FHEOF'
// src/features/notes/queries/notes.queries.ts
// TanStack Query wrappers for note data.
// Joins doctor and medication names at the query layer.

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import { fetchNotesByPerson, fetchNotesByVisit } from '../repository/notes.repository';
import { fetchDoctors } from '@/features/doctors/repository/doctors.repository';
import { fetchMedicationsByPerson } from '@/features/medications/repository/medications.repository';
import { fetchVisitsByPerson } from '@/features/visits/repository/visits.repository';
import { formatDate } from '@/shared/utils/dates';
import { mapDbNoteToNote, sortNotes } from '../domain/notes.domain';

import type { Note } from '../types/notes.types';

// Shared helper — builds name lookup maps from doctor and medication arrays
async function buildNameMaps(personId: string) {
  const [dbDoctors, dbMeds, dbVisits] = await Promise.all([
    fetchDoctors(),
    fetchMedicationsByPerson(personId),
    fetchVisitsByPerson(personId),
  ]);
  const doctorMap = new Map(dbDoctors.map((d) => [d.id, d.name]));
  const medMap = new Map(dbMeds.map((m) => [m.id, m.name]));
  const visitMap = new Map(
    dbVisits.map((v) => [v.id, `${v.title} — ${formatDate(v.visit_date)}`]),
  );
  return { doctorMap, medMap, visitMap };
}

export function usePersonNotesQuery(personId: string) {
  return useQuery<Note[], Error>({
    queryKey: queryKeys.notes.byPerson(personId),
    queryFn: async () => {
      const [dbNotes, { doctorMap, medMap, visitMap }] = await Promise.all([
        fetchNotesByPerson(personId),
        buildNameMaps(personId),
      ]);

      const notes = dbNotes.map((db) =>
        mapDbNoteToNote(
          db,
          db.doctor_id ? (doctorMap.get(db.doctor_id) ?? null) : null,
          db.medication_id ? (medMap.get(db.medication_id) ?? null) : null,
          db.visit_id ? (visitMap.get(db.visit_id) ?? null) : null,
        ),
      );

      return sortNotes(notes);
    },
    enabled: Boolean(personId),
  });
}

export function useVisitNotesQuery(visitId: string, personId: string) {
  return useQuery<Note[], Error>({
    queryKey: queryKeys.notes.byVisit(visitId),
    queryFn: async () => {
      const [dbNotes, { doctorMap, medMap, visitMap }] = await Promise.all([
        fetchNotesByVisit(visitId),
        buildNameMaps(personId),
      ]);

      return dbNotes.map((db) =>
        mapDbNoteToNote(
          db,
          db.doctor_id ? (doctorMap.get(db.doctor_id) ?? null) : null,
          db.medication_id ? (medMap.get(db.medication_id) ?? null) : null,
          db.visit_id ? (visitMap.get(db.visit_id) ?? null) : null,
        ),
      );
    },
    enabled: Boolean(visitId),
  });
}
FHEOF
mkdir -p "$(dirname 'src/features/notes/hooks/usePersonNotes.ts')"
cat > 'src/features/notes/hooks/usePersonNotes.ts' << 'FHEOF'
// src/features/notes/hooks/usePersonNotes.ts
// Hook — composes notes queries and mutations for the person notes section.

import { useCallback, useState } from 'react';

import { usePersonNotesQuery } from '../queries/notes.queries';
import {
  useAddNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} from '../mutations/notes.mutations';
import { isAppError, toAppError } from '@/shared/types/errors';

import type { Note, NoteFormValues } from '../types/notes.types';
import type { AppError } from '@/shared/types/errors';

export interface UsePersonNotesReturn {
  notes: Note[];
  isLoading: boolean;
  error: AppError | null;
  editingNote: Note | null;
  setEditingNote: (note: Note | null) => void;
  addNote: (values: NoteFormValues) => Promise<void>;
  updateNote: (noteId: string, values: NoteFormValues) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  isSubmitting: boolean;
}

export function usePersonNotes(personId: string): UsePersonNotesReturn {
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { data: notes = [], isLoading, error: queryError } = usePersonNotesQuery(personId);
  const addMutation = useAddNoteMutation(personId);
  const updateMutation = useUpdateNoteMutation(personId);
  const deleteMutation = useDeleteNoteMutation(personId);

  const addNote = useCallback(async (values: NoteFormValues) => {
    await addMutation.mutateAsync({
      content: values.content,
      personId,
      doctorId: values.doctorId,
      medicationId: values.medicationId,
      visitId: values.visitId,
      hidden: values.hidden,
      noteDate: values.noteDate,
    });
  }, [addMutation, personId]);

  const updateNote = useCallback(async (noteId: string, values: NoteFormValues) => {
    await updateMutation.mutateAsync({
      noteId,
      content: values.content,
      doctorId: values.doctorId,
      medicationId: values.medicationId,
      visitId: values.visitId,
      hidden: values.hidden,
      noteDate: values.noteDate,
    });
    setEditingNote(null);
  }, [updateMutation]);

  const deleteNote = useCallback(async (noteId: string) => {
    await deleteMutation.mutateAsync(noteId);
    setEditingNote(null);
  }, [deleteMutation]);

  const error = queryError
    ? isAppError(queryError) ? queryError : toAppError(queryError)
    : null;

  return {
    notes,
    isLoading,
    error,
    editingNote,
    setEditingNote,
    addNote,
    updateNote,
    deleteNote,
    isSubmitting: addMutation.isPending || updateMutation.isPending,
  };
}
FHEOF
mkdir -p "$(dirname 'src/features/notes/components/NoteModal.tsx')"
cat > 'src/features/notes/components/NoteModal.tsx' << 'FHEOF'
// src/features/notes/components/NoteModal.tsx
import { InlinePicker } from '@/design-system/components/InlinePicker';
import { useEffect, useState } from 'react';
import { View, Text, Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView, Switch } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';
import { toISODateString } from '@/shared/utils/dates';
import type { Note, NoteFormValues } from '../types/notes.types';
import type { Doctor } from '@/features/doctors/types/doctors.types';
import type { Medication } from '@/features/medications/types/medications.types';
import type { Visit } from '@/features/visits/types/visits.types';
import { formatDate } from '@/shared/utils/dates';

const schema = z.object({
  content: z.string().min(1, 'Note content is required').max(5000),
  doctorId: z.string().nullable(),
  medicationId: z.string().nullable(),
  visitId: z.string().nullable(),
  noteDate: z.string().nullable(),
  hidden: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

interface NoteModalProps {
  visible: boolean;
  isLoading: boolean;
  editingNote: Note | null;
  doctors: Doctor[];
  medications: Medication[];
  visits?: Visit[];
  defaultVisitId?: string | null;
  onSave: (values: NoteFormValues) => Promise<void>;
  onDismiss: () => void;
}


export const NoteModal = ({ visible, isLoading, editingNote, doctors, medications, visits = [], defaultVisitId = null, onSave, onDismiss }: NoteModalProps) => {
  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { content: '', doctorId: null, medicationId: null, visitId: defaultVisitId, hidden: false, noteDate: toISODateString(new Date()) },
  });
  const doctorId = watch('doctorId');
  const medicationId = watch('medicationId');
  const visitId = watch('visitId');

  useEffect(() => {
    if (editingNote) {
      reset({ content: editingNote.content, doctorId: editingNote.doctorId, medicationId: editingNote.medicationId, visitId: editingNote.visitId, hidden: editingNote.hidden, noteDate: editingNote.noteDate ?? '' });
    } else {
      reset({ content: '', doctorId: null, medicationId: null, visitId: defaultVisitId, hidden: false, noteDate: toISODateString(new Date()) });
    }
  }, [editingNote, reset, visible]);

  const onSubmit = async (values: FormValues) => { await onSave({ ...values, noteDate: values.noteDate?.trim() || null }); reset(); };

  const doctorOptions = [
    { id: null, label: 'None' },
    ...doctors.map((d) => ({ id: d.id, label: d.name + (d.type ? ` — ${d.type}` : '') })),
  ];
  const medOptions = [
    { id: null, label: 'None' },
    ...medications.map((m) => ({ id: m.id, label: m.name + (m.dosage ? ` ${m.dosage}` : '') })),
  ];
  const visitOptions = [
    { id: null, label: 'None' },
    ...visits.map((v) => ({ id: v.id, label: `${v.title} — ${formatDate(v.visitDate)}` })),
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={onDismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable>
            <View style={{ backgroundColor: '#F7F5F0', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '92%' }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#D0CCC4', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 20 }} />
              <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 }}>{editingNote ? 'Edit note' : 'Add note'}</Text>
                <Controller control={control} name="content" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Note" isRequired placeholder="Write your note here..." autoCapitalize="sentences" multiline numberOfLines={6} style={{ minHeight: 120, textAlignVertical: 'top' }} value={value} onChangeText={onChange} onBlur={onBlur} error={errors.content?.message} />
                )} />
                <Controller control={control} name="noteDate" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Date (optional)" placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" value={value ?? ''} onChangeText={onChange} onBlur={onBlur} error={errors.noteDate?.message} />
                )} />
                {doctors.length > 0 && (
                  <InlinePicker label="Link to doctor (optional)" options={doctorOptions} value={doctorId} onChange={(id) => setValue('doctorId', id)} />
                )}
                {medications.length > 0 && (
                  <InlinePicker label="Link to medication (optional)" options={medOptions} value={medicationId} onChange={(id) => setValue('medicationId', id)} />
                )}
                {visits.length > 0 && (
                  <InlinePicker label="Link to visit (optional)" options={visitOptions} value={visitId} onChange={(id) => setValue('visitId', id)} />
                )}
                <Controller control={control} name="hidden" render={({ field: { onChange, value } }) => (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#3D3D3D' }}>Hide note</Text>
                      <Text style={{ fontSize: 12, color: '#6B6866', marginTop: 2 }}>Hidden notes are not shown by default</Text>
                    </View>
                    <Switch value={value} onValueChange={onChange} trackColor={{ false: '#D0CCC4', true: '#2A6049' }} thumbColor="#FFFFFF" />
                  </View>
                )} />
                <View style={{ gap: 12, marginTop: 8 }}>
                  <Button label={editingNote ? 'Save changes' : 'Add note'} variant="primary" size="lg" isFullWidth isLoading={isLoading} onPress={handleSubmit(onSubmit)} />
                  <Button label="Cancel" variant="ghost" size="lg" isFullWidth onPress={onDismiss} />
                </View>
              </ScrollView>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};
FHEOF
mkdir -p "$(dirname 'src/features/notes/screens/PersonNotesScreen.tsx')"
cat > 'src/features/notes/screens/PersonNotesScreen.tsx' << 'FHEOF'
// src/features/notes/screens/PersonNotesScreen.tsx
// Person notes list — sort pill (newest/oldest), single-select type filter,
// tap-to-edit cards, and an add FAB that returns here on save.

import { PressableBase } from '@/design-system/components/PressableBase';
import { useMemo, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorState, LoadingState, EmptyState } from '@/design-system/components/EmptyState';
import { FAB } from '@/design-system/components/FAB';
import { Fonts } from '@/design-system/tokens/fonts';
import { NoteModal } from '../components/NoteModal';
import { NoteCard } from '../components/NoteCard';
import { usePersonNotes } from '../hooks/usePersonNotes';
import { usePersonDoctorsQuery } from '@/features/doctors/queries/doctors.queries';
import { usePersonMedicationsQuery } from '@/features/medications/queries/medications.queries';
import { useVisits } from '@/features/visits/hooks/useVisits';
import type { Note } from '../types/notes.types';

type SortOrder = 'newest' | 'oldest';
type LinkFilter = 'doctor' | 'medication' | 'visit' | null;

interface PersonNotesScreenProps {
  personId: string;
  personName?: string;
}

const FILTER_CHIPS: { key: Exclude<LinkFilter, null>; emoji: string; label: string }[] = [
  { key: 'doctor', emoji: '👨‍⚕️', label: 'Doctor' },
  { key: 'medication', emoji: '💊', label: 'Medication' },
  { key: 'visit', emoji: '📅', label: 'Visit' },
];

// Notes with no date sort last regardless of order.
function sortByDate(notes: Note[], order: SortOrder): Note[] {
  return [...notes].sort((a, b) => {
    if (!a.noteDate && !b.noteDate) return 0;
    if (!a.noteDate) return 1;
    if (!b.noteDate) return -1;
    return order === 'newest'
      ? b.noteDate.localeCompare(a.noteDate)
      : a.noteDate.localeCompare(b.noteDate);
  });
}

export const PersonNotesScreen = ({ personId, personName }: PersonNotesScreenProps) => {
  const insets = useSafeAreaInsets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [filter, setFilter] = useState<LinkFilter>(null);

  const { notes, isLoading, error, addNote, updateNote, deleteNote, isSubmitting } = usePersonNotes(personId);
  const { data: doctors = [] } = usePersonDoctorsQuery(personId);
  const { data: medicationGroups = [] } = usePersonMedicationsQuery(personId);
  const medications = medicationGroups.flatMap((g) => g.medications);
  const { listGroups } = useVisits();
  const personVisits = (listGroups ?? []).flatMap((g) => g.visits).filter((v) => v.personId === personId);

  const visibleNotes = useMemo(() => {
    const filtered = notes.filter((n) => {
      if (filter === 'doctor') return Boolean(n.doctorId);
      if (filter === 'medication') return Boolean(n.medicationId);
      if (filter === 'visit') return Boolean(n.visitId);
      return true;
    });
    return sortByDate(filtered, sortOrder);
  }, [notes, filter, sortOrder]);

  if (isLoading) return <LoadingState message="Loading notes..." />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 16, paddingBottom: 8 }}>
        <PressableBase onPress={() => router.back()} accessibilityRole="button" style={(pressed) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 })}>
          <Text style={{ fontSize: 15, color: '#2A6049' }}>‹</Text>
          <Text style={{ fontSize: 14, color: '#2A6049', fontWeight: '500' }}>Back</Text>
        </PressableBase>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 28, fontWeight: '300', fontFamily: Fonts.serif, color: '#1C1917', lineHeight: 32 }}>Notes</Text>
            {personName ? <Text style={{ fontSize: 12, color: '#A8A09A', marginTop: 2 }}>{personName}</Text> : null}
          </View>
          <PressableBase
            onPress={() => setSortOrder((o) => (o === 'newest' ? 'oldest' : 'newest'))}
            accessibilityRole="button"
            accessibilityLabel={`Sort ${sortOrder === 'newest' ? 'newest' : 'oldest'} first`}
            style={(pressed) => ({ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: pressed ? '#F0EDE8' : 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 8, paddingHorizontal: 11, paddingVertical: 6 })}
          >
            <Text style={{ fontSize: 13, color: '#6B6866' }}>{sortOrder === 'newest' ? '↓' : '↑'}</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B6866' }}>{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</Text>
          </PressableBase>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 6 }}>
        <Text style={{ fontSize: 11, color: '#A8A09A', marginBottom: 6 }}>Filter</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {FILTER_CHIPS.map((chip) => {
            const active = filter === chip.key;
            return (
              <PressableBase
                key={chip.key}
                onPress={() => setFilter((f) => (f === chip.key ? null : chip.key))}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${chip.label}`}
                style={(pressed) => ({ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: active ? '#2A6049' : 'white', borderWidth: 1, borderColor: active ? '#2A6049' : '#E3DDD5', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, opacity: pressed ? 0.7 : 1 })}
              >
                <Text style={{ fontSize: 12 }}>{chip.emoji}</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: active ? 'white' : '#6B6866' }}>{chip.label}</Text>
              </PressableBase>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 100, flexGrow: 1 }}>
        {visibleNotes.length === 0 ? (
          <EmptyState title={filter ? 'No matches' : 'No notes yet'} message={filter ? 'No notes match this filter.' : 'Tap + to add the first note.'} />
        ) : (
          visibleNotes.map((note) => (
            <NoteCard key={note.id} note={note} onEdit={setEditing} onDelete={deleteNote} />
          ))
        )}
      </ScrollView>

      <FAB onPress={() => setShowAddModal(true)} accessibilityLabel="Add note" />

      <NoteModal
        visible={showAddModal}
        editingNote={null}
        doctors={doctors}
        medications={medications}
        visits={personVisits}
        isLoading={isSubmitting}
        onSave={async (values) => { await addNote(values); setShowAddModal(false); }}
        onDismiss={() => setShowAddModal(false)}
      />

      <NoteModal
        visible={editing !== null}
        editingNote={editing}
        doctors={doctors}
        medications={medications}
        visits={personVisits}
        isLoading={isSubmitting}
        onSave={async (values) => { if (editing) await updateNote(editing.id, values); setEditing(null); }}
        onDismiss={() => setEditing(null)}
      />
    </View>
  );
};
FHEOF
mkdir -p "$(dirname 'src/features/visits/repository/visits.repository.ts')"
cat > 'src/features/visits/repository/visits.repository.ts' << 'FHEOF'
import { db } from '@/lib/supabase';
import { handleNetworkError } from '@/core/network/errorHandler';
import type { DbVisit } from '@/shared/types/database';

export async function fetchVisits(): Promise<DbVisit[]> {
  try {
    const { data, error } = await db.from('visits').select('id, title, visit_date, visit_time, doctor_id, person_id, family_group_id, pre_notes, post_notes, total_cost, out_of_pocket').order('visit_date', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((v: Record<string, unknown>) => (v as unknown as import('@/shared/types/database').DbVisit));
  } catch (error) { handleNetworkError(error); }
}

export async function fetchVisitsByDateRange(startDate: string, endDate: string): Promise<DbVisit[]> {
  try {
    const { data, error } = await db.from('visits').select('id, title, visit_date, visit_time, doctor_id, person_id, family_group_id, pre_notes, post_notes, total_cost, out_of_pocket').gte('visit_date', startDate).lte('visit_date', endDate).order('visit_date');
    if (error) throw error;
    return (data ?? []).map((v: Record<string, unknown>) => (v as unknown as import('@/shared/types/database').DbVisit));
  } catch (error) { handleNetworkError(error); }
}

export async function fetchVisitsByPerson(personId: string): Promise<DbVisit[]> {
  try {
    const { data, error } = await db.from('visits').select('id, title, visit_date, visit_time, doctor_id, person_id, family_group_id, pre_notes, post_notes, total_cost, out_of_pocket').eq('person_id', personId).order('visit_date', { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function fetchVisitById(visitId: string): Promise<DbVisit | null> {
  try {
    const { data, error } = await db.from('visits').select('id, title, visit_date, visit_time, doctor_id, person_id, family_group_id, pre_notes, post_notes, total_cost, out_of_pocket').eq('id', visitId).maybeSingle();
    if (error) throw error;
    return data ? (data as DbVisit) : null;
  } catch (error) { handleNetworkError(error); }
}

export interface InsertVisitParams { title: string; visitDate: string; visitTime: string | null; doctorId: string | null; personId: string; familyGroupId: string; preNotes: string | null; postNotes: string | null; totalCost: number | null; outOfPocket: number | null; }

export async function insertVisit(params: InsertVisitParams): Promise<DbVisit> {
  try {
    const { data, error } = await db.from('visits').insert({ title: params.title, visit_date: params.visitDate, visit_time: params.visitTime, doctor_id: params.doctorId, person_id: params.personId, family_group_id: params.familyGroupId, pre_notes: params.preNotes, post_notes: params.postNotes, total_cost: params.totalCost, out_of_pocket: params.outOfPocket }).select('id, title, visit_date, visit_time, doctor_id, person_id, family_group_id, pre_notes, post_notes, total_cost, out_of_pocket').single();
    if (error) throw error;
    if (!data) throw new Error('Insert returned no data.');
    return data;
  } catch (error) { handleNetworkError(error); }
}

export interface UpdateVisitParams { visitId: string; title: string; visitDate: string; visitTime: string | null; doctorId: string | null; preNotes: string | null; postNotes: string | null; totalCost: number | null; outOfPocket: number | null; }

export async function updateVisit(params: UpdateVisitParams): Promise<DbVisit> {
  try {
    const { data, error } = await db.from('visits').update({ title: params.title, visit_date: params.visitDate, visit_time: params.visitTime, doctor_id: params.doctorId, pre_notes: params.preNotes, post_notes: params.postNotes, total_cost: params.totalCost, out_of_pocket: params.outOfPocket }).eq('id', params.visitId).select('id, title, visit_date, visit_time, doctor_id, person_id, family_group_id, pre_notes, post_notes, total_cost, out_of_pocket').single();
    if (error) throw error;
    if (!data) throw new Error('Update returned no data.');
    return data;
  } catch (error) { handleNetworkError(error); }
}
FHEOF
mkdir -p "$(dirname 'src/features/family/screens/PersonDetailScreen.tsx')"
cat > 'src/features/family/screens/PersonDetailScreen.tsx' << 'FHEOF'
// src/features/family/screens/PersonDetailScreen.tsx
import { PressableBase } from '@/design-system/components/PressableBase';
import { useState } from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingState, ErrorState } from '@/design-system/components/EmptyState';
import { usePersonDetail } from '../hooks/usePersonDetail';
import { usePersonMutations } from '../hooks/usePersonMutations';
import { NoteModal } from '@/features/notes/components/NoteModal';
import { AddTodoModal } from '@/features/todos/components/AddTodoModal';
import { AddVisitModal } from '@/features/visits/components/AddVisitModal';
import { usePersonNotes } from '@/features/notes/hooks/usePersonNotes';
import { useTodos } from '@/features/todos/hooks/useTodos';
import { useVisits } from '@/features/visits/hooks/useVisits';
import { usePersonDoctorsQuery } from '@/features/doctors/queries/doctors.queries';
import { useDoctorsQuery } from '@/features/doctors/queries/doctors.queries';
import { useFamilyHome } from '@/features/family/hooks/useFamilyHome';
import { usePersonMedicationsQuery } from '@/features/medications/queries/medications.queries';

export const PersonDetailScreen = () => {
  const { personId } = useLocalSearchParams<{ personId: string }>();
  const insets = useSafeAreaInsets();
  const { person, isLoading, error } = usePersonDetail(personId ?? '');
  const { updateName, deletePerson } = usePersonMutations();
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);

  const { addNote, isSubmitting: isAddingNote } = usePersonNotes(personId ?? '');
  const { addTodo, isAdding: isAddingTodo } = useTodos();
  const { addVisit, isAdding: isAddingVisit, listGroups } = useVisits();
  const { data: doctors = [] } = usePersonDoctorsQuery(personId ?? '');
  const { data: familyData } = useFamilyHome();
  const { data: doctorGroups } = useDoctorsQuery();
  const allPeople = familyData?.people ?? [];
  const allDoctors = (doctorGroups ?? []).flatMap((g) => g.doctors);
  const { data: medicationGroups = [] } = usePersonMedicationsQuery(personId ?? '');
  const medications = medicationGroups.flatMap((g) => g.medications);
  const allVisits = (listGroups ?? []).flatMap((g) => g.visits);
  const personVisits = allVisits.filter((v) => v.personId === personId);

  const promptEditName = () => {
    if (!person) return;
    Alert.prompt('Edit name', 'Enter a new name for this person',
      async (newName) => { if (newName?.trim() && newName.trim() !== person.name) await updateName(person.id, newName.trim()); },
      'plain-text', person.name,
    );
  };

  const confirmDelete = () => {
    if (!person) return;
    Alert.alert(
      `Delete ${person.name}?`,
      'This permanently deletes this person and all their doctors, medications, visits, notes, and documents. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
            await deletePerson(person.id);
            router.replace('/(app)/family');
          } },
      ],
    );
  };

  const handleManagePerson = () => {
    if (!person) return;
    Alert.alert('Manage person', undefined, [
      { text: 'Edit name', onPress: promptEditName },
      { text: 'Delete person', style: 'destructive', onPress: confirmDelete },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (isLoading) return <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}><LoadingState message="Loading..." /></View>;
  if (error || !person) return <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}><ErrorState message={error?.message ?? 'Person not found.'} onRetry={() => router.back()} /></View>;

  const { colourSet } = person;

  const menuItems = [
    { key: 'doctors',        label: 'Doctors',        emoji: '👨‍⚕️', bg: '#E8EFF8', route: `/(app)/family/${person.id}/doctors` },
    { key: 'medications',    label: 'Medications',    emoji: '💊',   bg: '#E6F0EC', route: `/(app)/family/${person.id}/medications` },
    { key: 'medical-events', label: 'Medical Events', emoji: '🏥',  bg: '#F5E8EB', route: `/(app)/family/${person.id}/medical-events` },
    { key: 'notes',          label: 'Notes',          emoji: '📝',  bg: '#FBF3DD', route: `/(app)/family/${person.id}/notes` },
    { key: 'info-card',      label: 'Info Card',      emoji: '🪪',   bg: '#F5EBE0', route: `/(app)/family/${person.id}/info-card` },
    { key: 'documents',      label: 'Documents',      emoji: '📄',  bg: '#EEE8F7', route: `/(app)/family/${person.id}/documents` },
  ];

  const quickActions = [
    { key: 'note',  label: 'Add Note',  emoji: '📝', onPress: () => setShowNoteModal(true) },
    { key: 'todo',  label: 'Add To Do', emoji: '✅', onPress: () => setShowTodoModal(true) },
    { key: 'visit', label: 'Add Visit', emoji: '📅', onPress: () => setShowVisitModal(true) },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 16, paddingBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F7F5F0' }}>
        <PressableBase onPress={() => router.back()} accessibilityRole="button" style={(pressed) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4 })}>
          <Text style={{ fontSize: 15, color: '#2A6049' }}>‹</Text>
          <Text style={{ fontSize: 14, color: '#2A6049', fontWeight: '500' }}>Back</Text>
        </PressableBase>
        <PressableBase onPress={handleManagePerson} accessibilityRole="button" accessibilityLabel="Edit person name" style={(pressed) => ({ width: 32, height: 32, borderRadius: 16, backgroundColor: '#EEEAE3', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
          <Text style={{ fontSize: 14, color: '#6B6866' }}>✎</Text>
        </PressableBase>
      </View>

      <View style={{ backgroundColor: colourSet.dot, paddingHorizontal: 16, paddingVertical: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: 'white', fontSize: 17, fontWeight: '700' }}>{person.initials}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: 'white' }}>{person.name}</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>Health Records</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14 }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {quickActions.map((action) => (
            <PressableBase key={action.key} onPress={action.onPress} accessibilityRole="button" accessibilityLabel={action.label} style={(pressed) => ({ flex: 1, backgroundColor: pressed ? '#F0EDE8' : 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 12, paddingVertical: 12, alignItems: 'center', gap: 5 })}>
              <Text style={{ fontSize: 22 }}>{action.emoji}</Text>
              <Text style={{ fontSize: 10, fontWeight: '600', color: '#1C1917' }}>{action.label}</Text>
            </PressableBase>
          ))}
        </View>
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 14, overflow: 'hidden' }}>
          {menuItems.map((item, index) => (
            <PressableBase key={item.key} onPress={() => router.push(item.route as never)} accessibilityRole="button" accessibilityLabel={item.label} style={(pressed) => ({ flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: index < menuItems.length - 1 ? 1 : 0, borderBottomColor: '#F0EDE8', backgroundColor: pressed ? '#F7F5F0' : 'white', gap: 12 })}>
              <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
              </View>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: '#1C1917' }}>{item.label}</Text>
              <Text style={{ color: '#A8A09A', fontSize: 14 }}>›</Text>
            </PressableBase>
          ))}
        </View>
      </ScrollView>

      <NoteModal visible={showNoteModal} editingNote={null} doctors={doctors} medications={medications} visits={personVisits} isLoading={isAddingNote} onSave={async (values) => { await addNote(values); setShowNoteModal(false); }} onDismiss={() => setShowNoteModal(false)} />
      <AddTodoModal visible={showTodoModal} isLoading={isAddingTodo} defaultPersonId={person.id} doctors={doctors} visits={allVisits} onAdd={async (input) => { await addTodo(input); setShowTodoModal(false); }} onDismiss={() => setShowTodoModal(false)} />
      <AddVisitModal visible={showVisitModal} isLoading={isAddingVisit} people={allPeople} doctors={allDoctors} defaultPersonId={person.id} onAdd={async (input) => { await addVisit(input); setShowVisitModal(false); }} onDismiss={() => setShowVisitModal(false)} />
    </View>
  );
};
FHEOF
mkdir -p "$(dirname 'src/core/sync/queueProcessor.ts')"
cat > 'src/core/sync/queueProcessor.ts' << 'FHEOF'
// src/core/sync/queueProcessor.ts
// Processes the offline mutation queue when connectivity is restored.
// Maps each QueuedMutationType to its repository function and executes in order.
// Imported only by useSyncManager — not by hooks or components.

import { insertPerson, updatePersonName } from '@/features/family/repository/family.repository';
import { insertDoctor, linkDoctorToPerson, unlinkDoctorFromPerson } from '@/features/doctors/repository/doctors.repository';
import { insertMedication, updateMedicationStatus } from '@/features/medications/repository/medications.repository';
import { insertVisit } from '@/features/visits/repository/visits.repository';
import { insertTodo, updateTodoCompleted, deleteTodo } from '@/features/todos/repository/todos.repository';
import { insertNote, updateNote, deleteNote } from '@/features/notes/repository/notes.repository';
import {
  getQueue,
  dequeue,
  incrementRetry,
  isNetworkError,
  MAX_RETRIES,
  type QueuedMutation,
} from './offlineQueue';

// ─── Type-safe payload interfaces ─────────────────────────────────────────────

interface AddPersonPayload { name: string; familyGroupId: string }
interface UpdatePersonPayload { personId: string; name: string }
interface AddDoctorPayload { name: string; type: string | null; address: string | null; phone: string | null; familyGroupId: string }
interface LinkDoctorPayload { doctorId: string; personId: string }
interface AddMedicationPayload { name: string; dosage: string | null; frequency: string | null; reason: string | null; status: 'active' | 'as_needed' | 'inactive'; startDate: string | null; endDate: string | null; personId: string; prescribedBy: string | null; familyGroupId: string }
interface UpdateMedicationStatusPayload { medicationId: string; status: 'active' | 'as_needed' | 'inactive' }
interface AddVisitPayload { title: string; visitDate: string; visitTime: string | null; doctorId: string | null; personId: string; familyGroupId: string; preNotes: string | null; postNotes: string | null; totalCost: number | null; outOfPocket: number | null }
interface AddTodoPayload { title: string; notes: string | null; dueDate: string | null; personId: string | null; familyGroupId: string }
interface ToggleTodoPayload { todoId: string; completed: boolean }
interface DeleteTodoPayload { todoId: string }
interface AddNotePayload { content: string; personId: string | null; doctorId: string | null; medicationId: string | null; visitId: string | null; familyGroupId: string; hidden: boolean }
interface UpdateNotePayload { noteId: string; content: string; doctorId: string | null; medicationId: string | null; visitId: string | null; hidden: boolean }
interface DeleteNotePayload { noteId: string }

// ─── Executor ─────────────────────────────────────────────────────────────────

async function executeMutation(mutation: QueuedMutation): Promise<void> {
  const { type, payload } = mutation;

  switch (type) {
    case 'ADD_PERSON': {
      const p = payload as AddPersonPayload;
      await insertPerson(p.name, p.familyGroupId);
      break;
    }
    case 'UPDATE_PERSON': {
      const p = payload as UpdatePersonPayload;
      await updatePersonName(p.personId, p.name);
      break;
    }
    case 'ADD_DOCTOR': {
      const p = payload as AddDoctorPayload;
      await insertDoctor(p);
      break;
    }
    case 'LINK_DOCTOR': {
      const p = payload as LinkDoctorPayload;
      await linkDoctorToPerson(p.doctorId, p.personId);
      break;
    }
    case 'UNLINK_DOCTOR': {
      const p = payload as LinkDoctorPayload;
      await unlinkDoctorFromPerson(p.doctorId, p.personId);
      break;
    }
    case 'ADD_MEDICATION': {
      const p = payload as AddMedicationPayload;
      await insertMedication(p);
      break;
    }
    case 'UPDATE_MEDICATION_STATUS': {
      const p = payload as UpdateMedicationStatusPayload;
      await updateMedicationStatus(p.medicationId, p.status);
      break;
    }
    case 'ADD_VISIT': {
      const p = payload as AddVisitPayload;
      await insertVisit(p);
      break;
    }
    case 'ADD_TODO': {
      const p = payload as AddTodoPayload;
      await insertTodo(p);
      break;
    }
    case 'TOGGLE_TODO': {
      const p = payload as ToggleTodoPayload;
      await updateTodoCompleted(p.todoId, p.completed);
      break;
    }
    case 'DELETE_TODO': {
      const p = payload as DeleteTodoPayload;
      await deleteTodo(p.todoId);
      break;
    }
    case 'ADD_NOTE': {
      const p = payload as AddNotePayload;
      await insertNote(p);
      break;
    }
    case 'UPDATE_NOTE': {
      const p = payload as UpdateNotePayload;
      await updateNote(p);
      break;
    }
    case 'DELETE_NOTE': {
      const p = payload as DeleteNotePayload;
      await deleteNote(p.noteId);
      break;
    }
    case 'ADD_MEDICAL_EVENT': {
      // Medical events are stored as notes
      const p = payload as AddNotePayload;
      await insertNote(p);
      break;
    }
    default:
      console.warn('[QueueProcessor] Unknown mutation type:', type);
  }
}

// ─── Drain ────────────────────────────────────────────────────────────────────

export interface DrainResult {
  processed: number;
  failed: number;
  dropped: number;
}

// Processes all queued mutations in order.
// Network errors increment retry count and keep the item in queue.
// Non-network errors (validation, auth) are dropped after MAX_RETRIES.
export async function drainQueue(): Promise<DrainResult> {
  const queue = getQueue();
  if (queue.length === 0) return { processed: 0, failed: 0, dropped: 0 };

  const result: DrainResult = { processed: 0, failed: 0, dropped: 0 };

  for (const mutation of queue) {
    try {
      await executeMutation(mutation);
      dequeue(mutation.id);
      result.processed++;
    } catch (error) {
      if (isNetworkError(error)) {
        // Keep in queue — will retry on next reconnect
        result.failed++;
        return result; // Stop processing — still offline
      }

      // Non-network error — increment retry count
      incrementRetry(mutation.id);

      if (mutation.retryCount >= MAX_RETRIES) {
        // Drop after too many failures to avoid blocking the queue
        console.error('[QueueProcessor] Dropping mutation after max retries:', mutation.type, error);
        dequeue(mutation.id);
        result.dropped++;
      } else {
        result.failed++;
      }
    }
  }

  return result;
}
FHEOF
mkdir -p "$(dirname 'app/(app)/family/_layout.tsx')"
cat > 'app/(app)/family/_layout.tsx' << 'FHEOF'
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
      <Stack.Screen name="[personId]/notes" />
      <Stack.Screen name="[personId]/info-card" />
      <Stack.Screen name="[personId]/documents" />
      <Stack.Screen name="[personId]/doctor/[doctorId]" />
    </Stack>
  );
}
FHEOF
mkdir -p "$(dirname 'app/(app)/family/[personId]/notes.tsx')"
cat > 'app/(app)/family/[personId]/notes.tsx' << 'FHEOF'
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LoadingState } from '@/design-system/components/EmptyState';
import { usePersonDetail } from '@/features/family/hooks/usePersonDetail';
import { PersonNotesScreen } from '@/features/notes/screens/PersonNotesScreen';

export default function PersonNotesRoute() {
  const { personId } = useLocalSearchParams<{ personId: string }>();
  const { person, isLoading } = usePersonDetail(personId ?? '');
  if (isLoading || !person) return <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}><LoadingState message="Loading..." /></View>;
  return <PersonNotesScreen personId={person.id} personName={person.name} />;
}
FHEOF
