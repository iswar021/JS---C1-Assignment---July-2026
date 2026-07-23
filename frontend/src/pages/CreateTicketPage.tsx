import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createTicket } from '../api/tickets';
import { ApiError } from '../api/client';
import { useCurrentUser } from '../context/CurrentUserContext';
import { useToast } from '../context/ToastContext';
import { TicketForm, type TicketFormValues } from '../components/TicketForm';

export function CreateTicketPage() {
  const navigate = useNavigate();
  const { users, currentUser } = useCurrentUser();
  const { notifySuccess, notifyError } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string[] | undefined>>();

  const handleSubmit = async (values: TicketFormValues) => {
    if (!currentUser) {
      notifyError('Select an acting user before creating a ticket.');
      return;
    }
    setSubmitting(true);
    setServerErrors(undefined);
    try {
      const ticket = await createTicket({
        title: values.title,
        description: values.description,
        priority: values.priority,
        createdById: currentUser.id,
        assignedToId: values.assignedToId || null,
      });
      notifySuccess('Ticket created.');
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details) setServerErrors(err.details);
        notifyError(err.message);
      } else {
        notifyError('Unexpected error while creating the ticket.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Link to="/" className="text-sm text-blue-700 hover:underline">
        ← Back to tickets
      </Link>
      <h1 className="text-2xl font-semibold">Create ticket</h1>
      <TicketForm
        users={users}
        submitLabel="Create ticket"
        submitting={submitting}
        serverErrors={serverErrors}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/')}
      />
    </div>
  );
}
