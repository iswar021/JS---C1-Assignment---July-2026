import { useCallback, useEffect, useState } from 'react';
import { getTicket } from '../api/tickets';
import { ApiError } from '../api/client';
import type { Ticket } from '../types';

interface UseTicketResult {
  ticket: Ticket | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
  setTicket: (ticket: Ticket) => void;
  refetch: () => void;
}

/** Fetches a single ticket by id, exposing a 404 flag and a manual setter. */
export function useTicket(id: string): UseTicketResult {
  const [ticket, setTicketState] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    getTicket(id)
      .then((result) => {
        if (!active) return;
        setTicketState(result);
        setError(null);
      })
      .catch((err: ApiError) => {
        if (!active) return;
        if (err.status === 404) {
          setNotFound(true);
        } else {
          setError(err.message);
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, reloadToken]);

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  return { ticket, loading, error, notFound, setTicket: setTicketState, refetch };
}
