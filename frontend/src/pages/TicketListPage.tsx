import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';
import { useTickets } from '../hooks/useTickets';
import { useDebounce } from '../hooks/useDebounce';
import type { ListTicketsParams } from '../api/tickets';
import { SearchFilterBar, type TicketFilters } from '../components/SearchFilterBar';

const DEFAULT_FILTERS: TicketFilters = {
  search: '',
  status: '',
  priority: '',
  assignedTo: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};
import { TicketCard } from '../components/TicketCard';
import { Pagination } from '../components/Pagination';
import { EmptyState, ErrorState, LoadingState } from '../components/states';

const PAGE_SIZE = 10;

export function TicketListPage() {
  const { users } = useCurrentUser();
  const [filters, setFilters] = useState<TicketFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(filters.search);

  const params = useMemo<ListTicketsParams>(
    () => ({
      q: debouncedSearch || undefined,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      assignedTo: filters.assignedTo || undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      page,
      pageSize: PAGE_SIZE,
    }),
    [
      debouncedSearch,
      filters.status,
      filters.priority,
      filters.assignedTo,
      filters.sortBy,
      filters.sortOrder,
      page,
    ],
  );

  const { data, loading, error, refetch } = useTickets(params);

  const handleFilterChange = (patch: Partial<TicketFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <Link
          to="/tickets/new"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          New ticket
        </Link>
      </div>

      <SearchFilterBar
        filters={filters}
        users={users}
        onChange={handleFilterChange}
        onReset={handleReset}
      />

      {loading && <LoadingState label="Loading tickets…" />}

      {!loading && error && <ErrorState message={error} onRetry={refetch} />}

      {!loading && !error && data && data.data.length === 0 && (
        <EmptyState title="No tickets found">
          <p className="text-sm">Try adjusting your filters, or create a new ticket.</p>
        </EmptyState>
      )}

      {!loading && !error && data && data.data.length > 0 && (
        <>
          <ul className="flex flex-col gap-3">
            {data.data.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </ul>
          <Pagination meta={data.pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
