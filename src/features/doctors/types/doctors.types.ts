// src/features/doctors/types/doctors.types.ts
// Domain types for the doctors feature.
// Repositories map DbDoctor → Doctor before returning data.

export interface Doctor {
  id: string;
  name: string;
  type: string | null;
  address: string | null;
  phone: string | null;
  familyGroupId: string;
}

export interface DoctorWithPeople extends Doctor {
  personIds: string[];
}

// Grouped by type for the doctors list screen
export interface DoctorGroup {
  type: string;
  doctors: Doctor[];
}
