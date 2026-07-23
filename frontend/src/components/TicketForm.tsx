import { useState, type FormEvent } from 'react';
import type { Priority, User } from '../types';
import { PRIORITY_LABELS, PRIORITY_OPTIONS } from '../lib/format';
import { SelectField, TextAreaField, TextField } from './ui/fields';
import { Button } from './ui/Button';

export interface TicketFormValues {
  title: string;
  description: string;
  priority: Priority;
  assignedToId: string;
}

interface TicketFormProps {
  initialValues?: Partial<TicketFormValues>;
  users: User[];
  submitLabel: string;
  submitting: boolean;
  /** Field-level errors returned by the backend (keyed by field name). */
  serverErrors?: Record<string, string[] | undefined>;
  onSubmit: (values: TicketFormValues) => void;
  onCancel: () => void;
}

const MAX_TITLE = 200;
const MAX_DESCRIPTION = 5000;

type Errors = Partial<Record<keyof TicketFormValues, string>>;

function validate(values: TicketFormValues): Errors {
  const errors: Errors = {};
  if (!values.title.trim()) {
    errors.title = 'Title is required.';
  } else if (values.title.trim().length > MAX_TITLE) {
    errors.title = `Title must be at most ${MAX_TITLE} characters.`;
  }
  if (!values.description.trim()) {
    errors.description = 'Description is required.';
  } else if (values.description.trim().length > MAX_DESCRIPTION) {
    errors.description = `Description must be at most ${MAX_DESCRIPTION} characters.`;
  }
  return errors;
}

export function TicketForm({
  initialValues,
  users,
  submitLabel,
  submitting,
  serverErrors,
  onSubmit,
  onCancel,
}: TicketFormProps) {
  const [values, setValues] = useState<TicketFormValues>({
    title: initialValues?.title ?? '',
    description: initialValues?.description ?? '',
    priority: initialValues?.priority ?? 'MEDIUM',
    assignedToId: initialValues?.assignedToId ?? '',
  });
  const [errors, setErrors] = useState<Errors>({});

  const setField = <K extends keyof TicketFormValues>(key: K, value: TicketFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSubmit({ ...values, title: values.title.trim(), description: values.description.trim() });
  };

  const fieldError = (field: keyof TicketFormValues): string | undefined =>
    errors[field] ?? serverErrors?.[field]?.[0];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <TextField
        id="ticket-title"
        label="Title"
        required
        maxLength={MAX_TITLE}
        value={values.title}
        error={fieldError('title')}
        onChange={(event) => setField('title', event.target.value)}
      />

      <TextAreaField
        id="ticket-description"
        label="Description"
        required
        rows={6}
        maxLength={MAX_DESCRIPTION}
        value={values.description}
        error={fieldError('description')}
        onChange={(event) => setField('description', event.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          id="ticket-priority"
          label="Priority"
          required
          value={values.priority}
          error={fieldError('priority')}
          onChange={(event) => setField('priority', event.target.value as Priority)}
        >
          {PRIORITY_OPTIONS.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_LABELS[priority]}
            </option>
          ))}
        </SelectField>

        <SelectField
          id="ticket-assignee"
          label="Assignee"
          value={values.assignedToId}
          error={fieldError('assignedToId')}
          onChange={(event) => setField('assignedToId', event.target.value)}
        >
          <option value="">Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
