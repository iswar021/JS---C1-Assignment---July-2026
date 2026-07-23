export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <span
      role="status"
      aria-label={label}
      className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
    />
  );
}
