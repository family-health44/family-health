// src/features/doctors/domain/specialties.ts
// Hardcoded specialty list for the doctor type picker. Labels are chosen so their
// lowercased form matches keys in SPECIALTY_COLOUR_MAP (PersonDoctorsTab), keeping
// specialty colours deterministic. Free-text entry stays available via "Other".

export const OTHER_SPECIALTY = '__other__';

export const SPECIALTY_LIST = [
  'GP', 'Paediatrician', 'Dentist', 'Physiotherapist', 'Optometrist',
  'Ophthalmologist', 'Orthodontist', 'Occupational Therapist', 'Speech Pathologist',
  'Psychologist', 'Counsellor', 'Psychiatrist', 'Neurologist', 'Cardiologist',
  'Endocrinologist', 'Dermatologist', 'Allergist/Immunologist', 'Surgeon',
  'Obstetrician', 'Gynaecologist', 'Gastroenterologist', 'Urologist',
  'Rheumatologist', 'Oncologist', 'Radiologist', 'Pathologist', 'Dietitian',
  'Podiatrist', 'Chiropractor', 'Naturopath', 'Audiologist', 'Osteopath',
  'Sports Medicine',
] as const;

export const SPECIALTY_OPTIONS = [
  ...SPECIALTY_LIST.map((s) => ({ id: s as string, label: s as string })),
  { id: OTHER_SPECIALTY, label: 'Other\u2026' },
];
