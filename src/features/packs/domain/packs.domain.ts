// src/features/packs/domain/packs.domain.ts
// Pure builders: domain data -> PDF sections. Zero React, zero Supabase.
//
// GUARDRAIL: pass-through of user-entered records only. Do not add derived
// insight, scoring, trends, or clinical language here.

import { isoToDisplayDate, formatTimestampLocalDate, formatDate, formatTime } from '@/shared/utils/dates';
import { MEDICAL_EVENT_CONFIG } from '@/features/medical-events/types/medical-events.types';

import type { PdfSection, PdfListItem, PdfRow, PdfDocument } from '@/shared/utils/pdfShare';
import type { Person } from '@/features/family/types/family.types';
import type { MedicationGroup } from '@/features/medications/types/medications.types';
import type { MedicalEventGroup } from '@/features/medical-events/types/medical-events.types';
import type { Doctor } from '@/features/doctors/types/doctors.types';
import type { Visit } from '@/features/visits/types/visits.types';
import type { Todo } from '@/features/todos/types/todos.types';
import type { Document } from '@/features/documents/types/documents.types';
import type { PackSectionKey, PackSelection } from '../types/packs.types';

const RECENT_VISIT_LIMIT = 5;

// ── Individual section builders ──────────────────────────────────────────────

export function buildInfoSection(person: Person): PdfSection {
  const i = person.infoCard;
  const rows: PdfRow[] = [
    { label: 'Date of Birth', value: i.dob ? isoToDisplayDate(i.dob) : '' },
    { label: 'Medicare Number', value: i.medicareNumber ?? '' },
    { label: 'Blood Type', value: i.bloodType ?? '' },
    { label: 'Allergies', value: i.allergies ?? '' },
    { label: 'Diagnoses', value: i.diagnoses ?? '' },
    { label: 'Health Fund', value: i.healthFund ?? '' },
    { label: 'Health Fund Number', value: i.healthFundNumber ?? '' },
    { label: 'Emergency Contact', value: i.emergencyContact ?? '' },
    { label: 'Emergency Phone', value: i.emergencyPhone ?? '' },
  ].filter((r) => r.value.trim().length > 0);

  return { kind: 'rows', heading: 'Person details', rows };
}

// Active + as-needed only. Inactive meds are history, not what you hand a doctor.
export function buildMedicationsSection(groups: MedicationGroup[]): PdfSection {
  const meds = groups
    .filter((g) => g.status === 'active' || g.status === 'as_needed')
    .flatMap((g) => g.medications);

  const items: PdfListItem[] = meds.map((m) => {
    const dose = [m.dosage, m.frequency].filter(Boolean).join(' · ');
    const extra = [
      m.status === 'as_needed' ? 'As needed' : null,
      m.reason ? `For ${m.reason}` : null,
      m.prescribedByName ? `Prescribed by ${m.prescribedByName}` : null,
    ]
      .filter(Boolean)
      .join(' · ');
    return {
      primary: m.name,
      secondary: [dose, extra].filter(Boolean).join(' — ') || null,
    };
  });

  return { kind: 'list', heading: 'Current medications', items };
}

export function buildEventsSection(groups: MedicalEventGroup[]): PdfSection {
  const items: PdfListItem[] = groups.flatMap((g) =>
    g.events.map((e) => ({
      primary: e.description,
      secondary: [
        MEDICAL_EVENT_CONFIG[e.eventType].label,
        isoToDisplayDate(e.eventDate),
        e.doctorName,
      ]
        .filter(Boolean)
        .join(' · '),
    })),
  );

  return { kind: 'list', heading: 'Conditions & events', items };
}

export function buildDoctorsSection(doctors: Doctor[]): PdfSection {
  const items: PdfListItem[] = doctors.map((d) => ({
    primary: d.name,
    secondary: [d.type, d.phone, d.address].filter(Boolean).join(' · ') || null,
  }));

  return { kind: 'list', heading: 'Doctors & providers', items };
}

// Past visits for this person, newest first, capped.
export function buildVisitsSection(
  visits: Visit[],
  personId: string,
  todayIso: string,
  excludeVisitId: string,
): PdfSection {
  const items: PdfListItem[] = visits
    .filter((v) => v.personId === personId && v.id !== excludeVisitId && v.visitDate < todayIso)
    .sort((a, b) => b.visitDate.localeCompare(a.visitDate))
    .slice(0, RECENT_VISIT_LIMIT)
    .map((v) => ({
      primary: v.title,
      secondary: [
        formatDate(v.visitDate) + (v.visitTime ? ` at ${formatTime(v.visitTime)}` : ''),
        v.doctorName,
        v.postNotes,
      ]
        .filter(Boolean)
        .join(' · '),
    }));

  return { kind: 'list', heading: 'Recent visits', items };
}

export function buildTodosSection(todos: Todo[], personId: string): PdfSection {
  const items: PdfListItem[] = todos
    .filter((t) => !t.completed && t.personId === personId)
    .sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'))
    .map((t) => ({
      primary: t.title,
      secondary: [t.dueDate ? `Due ${isoToDisplayDate(t.dueDate)}` : null, t.notes]
        .filter(Boolean)
        .join(' · ') || null,
    }));

  return { kind: 'list', heading: 'Open to dos', items };
}

// The visit's saved pre-appointment notes. Verbatim — no editing, no synthesis.
export function buildPreNotesSection(preNotes: string | null): PdfSection {
  return { kind: 'text', heading: 'Pre-appointment notes', body: preNotes ?? '' };
}

// Free text typed at pack time. Not persisted.
export function buildQuestionsSection(text: string): PdfSection {
  const items: PdfListItem[] = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => ({ primary: l }));

  return { kind: 'list', heading: 'Notes & questions', items };
}

// An index of the documents attached to this visit. The files themselves are
// merged onto the end of the PDF (see packMerge.ts). Anything that could not be
// merged is marked here, so nothing disappears silently.
export function buildDocumentsSection(
  documents: Document[],
  skippedNames: ReadonlyMap<string, string> = new Map(),
): PdfSection {
  const items: PdfListItem[] = documents.map((d) => {
    const skipNote = skippedNames.get(d.name);
    const added = d.uploadedAt ? `Added ${formatTimestampLocalDate(d.uploadedAt)}` : null;
    return {
      primary: d.name,
      secondary: [added, skipNote ?? 'Attached'].filter(Boolean).join(' · '),
    };
  });

  return { kind: 'list', heading: 'Documents attached', items };
}

// ── Assembly ─────────────────────────────────────────────────────────────────

export interface PackInput {
  person: Person;
  visit: Visit;
  medicationGroups: MedicationGroup[];
  eventGroups: MedicalEventGroup[];
  doctors: Doctor[];
  allVisits: Visit[];
  todos: Todo[];
  documents: Document[];
  questions: string;
  todayIso: string;
  // name -> reason, for documents that could not be merged. Empty on the first pass.
  skippedDocuments?: ReadonlyMap<string, string>;
}

// A section is only included if selected AND it has content — a Pack full of
// empty headings is worse than a shorter Pack.
function hasContent(s: PdfSection): boolean {
  if (s.kind === 'rows') return s.rows.length > 0;
  if (s.kind === 'list') return s.items.length > 0;
  return s.body.trim().length > 0;
}

export function buildPackSections(
  input: PackInput,
  selection: PackSelection,
): PdfSection[] {
  const builders: Record<PackSectionKey, () => PdfSection> = {
    info: () => buildInfoSection(input.person),
    prenotes: () => buildPreNotesSection(input.visit.preNotes),
    medications: () => buildMedicationsSection(input.medicationGroups),
    events: () => buildEventsSection(input.eventGroups),
    doctors: () => buildDoctorsSection(input.doctors),
    visits: () =>
      buildVisitsSection(input.allVisits, input.person.id, input.todayIso, input.visit.id),
    todos: () => buildTodosSection(input.todos, input.person.id),
    questions: () => buildQuestionsSection(input.questions),
    documents: () => buildDocumentsSection(input.documents, input.skippedDocuments ?? new Map()),
  };

  return (Object.keys(builders) as PackSectionKey[])
    .filter((k) => selection[k])
    .map((k) => builders[k]())
    .filter(hasContent);
}

export function buildPackDocument(
  input: PackInput,
  selection: PackSelection,
): PdfDocument {
  const v = input.visit;
  const subtitle = [
    'Appointment Pack',
    v.doctorName,
    formatDate(v.visitDate) + (v.visitTime ? ` at ${formatTime(v.visitTime)}` : ''),
  ]
    .filter(Boolean)
    .join(' · ');

  return {
    title: input.person.name,
    subtitle,
    sections: buildPackSections(input, selection),
  };
}

// Plain-text fallback when native file sharing is unavailable.
export function buildPackPlainText(doc: PdfDocument): string {
  const body = doc.sections
    .map((s) => {
      const lines: string[] =
        s.kind === 'rows'
          ? s.rows.map((r) => `${r.label}: ${r.value}`)
          : s.kind === 'list'
            ? s.items.map((i) => (i.secondary ? `${i.primary} — ${i.secondary}` : i.primary))
            : s.body.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      return `${s.heading.toUpperCase()}\n${lines.join('\n')}`;
    })
    .join('\n\n');

  return `${doc.title}\n${doc.subtitle}\n\n${body}`;
}

export const PACK_FOOTER =
  'Prepared in FamFiles from records entered by the user. Not a medical record or clinical document.';
