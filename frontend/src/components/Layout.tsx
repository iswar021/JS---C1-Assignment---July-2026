import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';

/** App shell: header with branding and an "acting as" user switcher. */
export function Layout({ children }: { children: ReactNode }) {
  const { users, currentUser, setCurrentUserId } = useCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="text-lg font-semibold text-blue-700">
            Support Tickets
          </Link>
          {users.length > 0 && (
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <span className="hidden sm:inline">Acting as</span>
              <select
                className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                value={currentUser?.id ?? ''}
                onChange={(event) => setCurrentUserId(event.target.value)}
                aria-label="Acting as user"
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
