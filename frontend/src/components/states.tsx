import type { ReactNode } from 'react';
import { Spinner } from './ui/Spinner';
import { Button } from './ui/Button';

/** Centered loading indicator for full-section loads. */
export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
      <Spinner />
      <p>{label}</p>
    </div>
  );
}

/** Error panel with an optional retry action. */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-md border border-red-200 bg-red-50 py-12 px-4 text-center"
    >
      <p className="font-medium text-red-800">Something went wrong</p>
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Neutral empty-state placeholder. */
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 py-16 px-4 text-center text-gray-500">
      <p className="font-medium text-gray-700">{title}</p>
      {children}
    </div>
  );
}
