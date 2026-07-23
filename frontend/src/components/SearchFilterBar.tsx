import type { Priority, Status, User } from '../types';
import { PRIORITY_LABELS, PRIORITY_OPTIONS, STATUS_LABELS, STATUS_OPTIONS } from '../lib/format';
import { Button } from './ui/Button';

export interface TicketFilters {
  search: string;
  status: Status | '';
  priority: Priority | '';
  assignedTo: string;
  sortBy: 'createdAt' | 'updatedAt' | 'priority';
  sortOrder: 'asc' | 'desc';
}

interface SearchFilterBarProps {
  filters: TicketFilters;
  users: User[];
  onChange: (patch: Partial<TicketFilters>) => void;
  onReset: () => void;
}

const selectClass =
  'rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-blue-500 focus:outline-none';

export function SearchFilterBar({ filters, users, onChange, onReset }: SearchFilterBarProps) {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== '' ||
    filters.priority !== '' ||
    filters.assignedTo !== '';

  return (
    <div className="flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-4">
      <div>
        <label htmlFor="ticket-search" className="sr-only">
          Search tickets
        </label>
        <input
          id="ticket-search"
          type="search"
          placeholder="Search by title or description…"
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-status" className="text-xs font-medium text-gray-600">
            Status
          </label>
          <select
            id="filter-status"
            className={selectClass}
            value={filters.status}
            onChange={(event) => onChange({ status: event.target.value as Status | '' })}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="filter-priority" className="text-xs font-medium text-gray-600">
            Priority
          </label>
          <select
            id="filter-priority"
            className={selectClass}
            value={filters.priority}
            onChange={(event) => onChange({ priority: event.target.value as Priority | '' })}
          >
            <option value="">All priorities</option>
            {PRIORITY_OPTIONS.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="filter-assignee" className="text-xs font-medium text-gray-600">
            Assignee
          </label>
          <select
            id="filter-assignee"
            className={selectClass}
            value={filters.assignedTo}
            onChange={(event) => onChange({ assignedTo: event.target.value })}
          >
            <option value="">Anyone</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="filter-sort" className="text-xs font-medium text-gray-600">
            Sort by
          </label>
          <select
            id="filter-sort"
            className={selectClass}
            value={`${filters.sortBy}:${filters.sortOrder}`}
            onChange={(event) => {
              const [sortBy, sortOrder] = event.target.value.split(':') as [
                TicketFilters['sortBy'],
                TicketFilters['sortOrder'],
              ];
              onChange({ sortBy, sortOrder });
            }}
          >
            <option value="createdAt:desc">Newest first</option>
            <option value="createdAt:asc">Oldest first</option>
            <option value="updatedAt:desc">Recently updated</option>
            <option value="priority:desc">Priority: high → low</option>
            <option value="priority:asc">Priority: low → high</option>
          </select>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={onReset} className="ml-auto">
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
