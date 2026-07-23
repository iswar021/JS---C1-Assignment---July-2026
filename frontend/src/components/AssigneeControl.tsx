import type { User, UserRef } from '../types';

interface AssigneeControlProps {
  assignedTo: UserRef | null;
  users: User[];
  busy: boolean;
  onAssign: (assignedToId: string | null) => void;
}

export function AssigneeControl({ assignedTo, users, busy, onAssign }: AssigneeControlProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="assignee-control" className="text-sm font-medium text-gray-700">
        Assignee
      </label>
      <select
        id="assignee-control"
        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-60"
        value={assignedTo?.id ?? ''}
        disabled={busy}
        onChange={(event) => onAssign(event.target.value === '' ? null : event.target.value)}
      >
        <option value="">Unassigned</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
}
