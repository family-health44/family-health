// app/(app)/appointments/index.tsx
// Route file only — imports screen from features layer.
// Accessed via router.push('/(app)/appointments', { params: { visitId, personId, ... } })
import { StartAppointmentScreen } from '@/features/appointments/screens/StartAppointmentScreen';
export default StartAppointmentScreen;
