// src/features/medications/components/medicationFieldOptions.ts
// Shared dropdown options for Add/Edit medication modals. Stored value is the label text itself.

const toOpts = (vals: string[]) => [
  { id: null as string | null, label: 'Not set' },
  ...vals.map((v) => ({ id: v, label: v })),
];

export const FORM_OPTIONS = toOpts(['Tablet', 'Capsule', 'Liquid', 'Injection', 'Inhaler', 'Patch', 'Drops', 'Cream', 'Other']);
export const TIME_OF_DAY_OPTIONS = toOpts(['Morning', 'Midday', 'Evening', 'Night', 'As needed']);
export const WITH_FOOD_OPTIONS = toOpts(['With food', 'Without food', 'Preferred', 'No preference']);
