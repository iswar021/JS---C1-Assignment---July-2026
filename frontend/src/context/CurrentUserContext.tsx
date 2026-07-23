import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { listUsers } from '../api/users';
import type { User } from '../types';

interface CurrentUserContextValue {
  users: User[];
  currentUser: User | null;
  setCurrentUserId: (id: string) => void;
  loading: boolean;
  error: string | null;
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

/**
 * Loads the seeded users once and tracks the "acting as" user. Because Core has
 * no authentication, this user stands in for the logged-in actor and supplies
 * `createdBy` for new tickets and comments.
 */
export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listUsers()
      .then((loaded) => {
        if (!active) return;
        setUsers(loaded);
        setCurrentUserId((prev) => prev ?? loaded[0]?.id ?? null);
        setError(null);
      })
      .catch((err: Error) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<CurrentUserContextValue>(
    () => ({
      users,
      currentUser: users.find((u) => u.id === currentUserId) ?? null,
      setCurrentUserId,
      loading,
      error,
    }),
    [users, currentUserId, loading, error],
  );

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser(): CurrentUserContextValue {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error('useCurrentUser must be used within a CurrentUserProvider');
  }
  return ctx;
}
