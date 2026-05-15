import type { ReactNode } from 'react';

type Props = {
  loading: boolean;
  error: Error | null;
  empty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  children: ReactNode;
};

export function AsyncBoundary({
  loading,
  error,
  empty = false,
  emptyMessage = 'Nothing to show yet.',
  onRetry,
  children,
}: Props) {
  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-3 text-sm text-slate-400"
      >
        <span className="size-3 animate-pulse rounded-full bg-slate-400/60" aria-hidden />
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100"
      >
        <p className="font-semibold">Something went wrong.</p>
        <p className="text-rose-200/80">{error.message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="self-start rounded-full border border-rose-300/30 px-3 py-1 text-xs font-semibold text-rose-100 hover:bg-rose-500/20"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return <p className="text-sm text-slate-400">{emptyMessage}</p>;
  }

  return <>{children}</>;
}
