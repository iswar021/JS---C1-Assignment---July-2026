import { useCallback, useEffect, useState } from 'react';
import { listTickets, type ListTicketsParams } from '../api/tickets';
import { ApiError } from '../api/client';
import type { Paginated, TicketSummary } from '../types';

interface UseTicketsResult {
  data: Paginated<TicketSummary> | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/** Fetches the ticket list for the given params; refetches whenever they change. */
export function useTickets(params: ListTicketsParams): UseTicketsResult {
  const [data, setData] = useState<Paginated<TicketSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const key = JSON.stringify(params);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listTickets(params)
      .then((result) => {
        if (!active) return;
        setData(result);
        setError(null);
      })
      .catch((err: ApiError) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // params is serialized into `key` to avoid re-running on referential changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, reloadToken]);

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  return { data, loading, error, refetch };
}
