import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { addComment, assignTicket, changeStatus } from '../api/tickets';
import { ApiError } from '../api/client';
import type { Status } from '../types';
import { useCurrentUser } from '../context/CurrentUserContext';
import { useToast } from '../context/ToastContext';
import { useTicket } from '../hooks/useTicket';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusChanger } from '../components/StatusChanger';
import { AssigneeControl } from '../components/AssigneeControl';
import { CommentList } from '../components/CommentList';
import { CommentForm } from '../components/CommentForm';
import { EmptyState, ErrorState, LoadingState } from '../components/states';
import { formatDateTime } from '../lib/format';

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

export function TicketDetailPage() {
  const { id = '' } = useParams();
  const { users, currentUser } = useCurrentUser();
  const { notifySuccess, notifyError } = useToast();
  const { ticket, loading, error, notFound, setTicket, refetch } = useTicket(id);
  const [statusBusy, setStatusBusy] = useState(false);
  const [assignBusy, setAssignBusy] = useState(false);
  const [commentBusy, setCommentBusy] = useState(false);

  const handleStatusChange = async (status: Status) => {
    setStatusBusy(true);
    try {
      setTicket(await changeStatus(id, status));
      notifySuccess('Status updated.');
    } catch (err) {
      notifyError(errorMessage(err, 'Failed to update status.'));
    } finally {
      setStatusBusy(false);
    }
  };

  const handleAssign = async (assignedToId: string | null) => {
    setAssignBusy(true);
    try {
      setTicket(await assignTicket(id, assignedToId));
      notifySuccess(assignedToId ? 'Ticket assigned.' : 'Ticket unassigned.');
    } catch (err) {
      notifyError(errorMessage(err, 'Failed to assign ticket.'));
    } finally {
      setAssignBusy(false);
    }
  };

  const handleComment = async (message: string) => {
    if (!currentUser) {
      notifyError('Select an acting user before commenting.');
      return;
    }
    setCommentBusy(true);
    try {
      await addComment(id, message, currentUser.id);
      notifySuccess('Comment added.');
      refetch();
    } catch (err) {
      notifyError(errorMessage(err, 'Failed to add comment.'));
    } finally {
      setCommentBusy(false);
    }
  };

  if (loading) return <LoadingState label="Loading ticket…" />;
  if (notFound) {
    return (
      <EmptyState title="Ticket not found">
        <Link to="/" className="text-sm text-blue-700 hover:underline">
          Back to tickets
        </Link>
      </EmptyState>
    );
  }
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!ticket) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="text-sm text-blue-700 hover:underline">
          ← Back to tickets
        </Link>
        <Link
          to={`/tickets/${ticket.id}/edit`}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          Edit ticket
        </Link>
      </div>

      <article className="flex flex-col gap-4 rounded-md border border-gray-200 bg-white p-5">
        <header className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
          <h1 className="text-2xl font-semibold">{ticket.title}</h1>
        </header>

        <p className="whitespace-pre-wrap text-gray-700">{ticket.description}</p>

        <dl className="grid gap-x-6 gap-y-2 text-sm text-gray-600 sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="font-medium text-gray-500">Created by</dt>
            <dd>{ticket.createdBy.name}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-gray-500">Created</dt>
            <dd>
              <time dateTime={ticket.createdAt}>{formatDateTime(ticket.createdAt)}</time>
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-gray-500">Last updated</dt>
            <dd>
              <time dateTime={ticket.updatedAt}>{formatDateTime(ticket.updatedAt)}</time>
            </dd>
          </div>
        </dl>
      </article>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-700">Status</h2>
          <StatusChanger status={ticket.status} busy={statusBusy} onChange={handleStatusChange} />
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <AssigneeControl
            assignedTo={ticket.assignedTo}
            users={users}
            busy={assignBusy}
            onAssign={handleAssign}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Comments</h2>
        <CommentList comments={ticket.comments} />
        <CommentForm submitting={commentBusy} onSubmit={handleComment} />
      </section>
    </div>
  );
}
