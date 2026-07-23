import { Link } from 'react-router-dom';
import type { TicketSummary } from '../types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { formatDateTime } from '../lib/format';

export function TicketCard({ ticket }: { ticket: TicketSummary }) {
  return (
    <li className="rounded-md border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm">
      <Link to={`/tickets/${ticket.id}`} className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-medium text-blue-700">{ticket.title}</h2>
          <div className="flex shrink-0 items-center gap-2">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>
        <p className="line-clamp-2 text-sm text-gray-600">{ticket.description}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>Assignee: {ticket.assignedTo ? ticket.assignedTo.name : 'Unassigned'}</span>
          <span>Created by {ticket.createdBy.name}</span>
          <time dateTime={ticket.createdAt}>{formatDateTime(ticket.createdAt)}</time>
        </div>
      </Link>
    </li>
  );
}
