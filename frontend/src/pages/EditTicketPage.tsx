import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { updateTicket } from '../api/tickets';
import { ApiError } from '../api/client';
import { useCurrentUser } from '../context/CurrentUserContext';
import { useToast } from '../context/ToastContext';
import { useTicket } from '../hooks/useTicket';
import { TicketForm, type TicketFormValues } from '../components/TicketForm';
import { EmptyState, ErrorState, LoadingState } from '../components/states';

export function EditTicketPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { users } = useCurrentUser();
  const { notifySuccess, notifyError } = useToast();
  const { ticket, loading, error, notFound, refetch } = useTicket(id);
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string[] | undefined>>();

  const handleSubmit = async (values: TicketFormValues) => {
    setSubmitting(true);
    setServerErrors(undefined);
    try {
      await updateTicket(id, {
        title: values.title,
        description: values.description,
        priority: values.priority,
        assignedToId: values.assignedToId || null,
      });
      notifySuccess('Ticket updated.');
      navigate(`/tickets/${id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details) setServerErrors(err.details);
        notifyError(err.message);
      } else {
        notifyError('Unexpected error while updating the ticket.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Loading ticket…" />;
  if (notFound) return <EmptyState title="Ticket not found" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!ticket) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Link to={`/tickets/${id}`} className="text-sm text-blue-700 hover:underline">
        ← Back to ticket
      </Link>
      <h1 className="text-2xl font-semibold">Edit ticket</h1>
      <TicketForm
        users={users}
        submitLabel="Save changes"
        submitting={submitting}
        serverErrors={serverErrors}
        initialValues={{
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority,
          assignedToId: ticket.assignedTo?.id ?? '',
        }}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/tickets/${id}`)}
      />
    </div>
  );
}
