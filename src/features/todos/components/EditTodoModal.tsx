// src/features/todos/components/EditTodoModal.tsx
// Thin wrapper over the shared TodoFormModal for the edit flow.
import { TodoFormModal, type TodoFormValues } from './TodoFormModal';
import type { UpdateTodoParams } from '../repository/todos.repository';
import type { Todo } from '../types/todos.types';
import type { Doctor } from '@/features/doctors/types/doctors.types';
import type { Visit } from '@/features/visits/types/visits.types';
import type { Person } from '@/features/family/types/family.types';

interface EditTodoModalProps {
  visible: boolean;
  isLoading: boolean;
  todo: Todo | null;
  people?: Person[];
  doctors?: Doctor[];
  visits?: Visit[];
  onSave: (params: UpdateTodoParams) => Promise<void>;
  onDismiss: () => void;
}

export const EditTodoModal = ({ visible, isLoading, todo, people = [], doctors = [], visits = [], onSave, onDismiss }: EditTodoModalProps) => {
  const handleSubmit = async (values: TodoFormValues) => {
    if (!todo) return;
    await onSave({
      todoId: todo.id,
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
      visible={visible} isLoading={isLoading} initialTodo={todo}
      people={people} doctors={doctors} visits={visits}
      onSubmit={handleSubmit} onDismiss={onDismiss}
    />
  );
};
