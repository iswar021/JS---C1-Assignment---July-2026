import type { Status } from '../types';
import { STATUS_ACTION_LABELS, nextStatuses } from '../lib/statusMachine';
import { Button } from './ui/Button';

interface StatusChangerProps {
  status: Status;
  busy: boolean;
  onChange: (status: Status) => void;
}

export function StatusChanger({ status, busy, onChange }: StatusChangerProps) {
  const options = nextStatuses(status);

  if (options.length === 0) {
    return (
      <p className="text-sm text-gray-500">This ticket is closed for further status changes.</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((next) => (
        <Button
          key={next}
          variant={next === 'CANCELLED' ? 'danger' : 'primary'}
          loading={busy}
          onClick={() => onChange(next)}
        >
          {STATUS_ACTION_LABELS[next]}
        </Button>
      ))}
    </div>
  );
}
