// src/features/todos/components/AddTodoModal.tsx
// Thin wrapper over the shared TodoFormModal for the create flow.
import { TodoFormModal, type TodoFormValues } from './TodoFormModal';
import type { InsertTodoParams } from '../repository/todos.repository';
import type { Doctor } from '@/features/doctors/types/doctors.types';
import type { Visit } from '@/features/visits/types/visits.types';
import type { Person } from '@/features/family/types/family.types';

type AddTodoInput = Omit<InsertTodoParams, 'familyGroupId'>;

interface AddTodoModalProps {
  visible: boolean;
  isLoading: boolean;
  people?: Person[];
  defaultPersonId?: string | null;
  doctors?: Doctor[];
  visits?: Visit[];
  onAdd: (input: AddTodoInput) => Promise<void>;
  onDismiss: () => void;
}

export const AddTodoModal = ({ visible, isLoading, people = [], defaultPersonId, doctors = [], visits = [], onAdd, onDismiss }: AddTodoModalProps) => {
  const handleSubmit = async (values: TodoFormValues) => {
    await onAdd({
      title: values.title,
      notes: values.notes ?? null,
      dueDate: values.dueDate ?? null,
      personId: values.personId,
      doctorId: values.doctorId ?? null,
      visitId: values.visitId ?? null,
      reminderAt: values.reminderAt ?? null,
    });
  };

  return (
    <TodoFormModal
      visible={visible} isLoading={isLoading} initialTodo={null}
      people={people} defaultPersonId={defaultPersonId} doctors={doctors} visits={visits}
      onSubmit={handleSubmit} onDismiss={onDismiss}
    />
  );
};
