import { AsyncBoundary } from '@/components/ui/AsyncBoundary';
import { Card, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { StatusPill, type Tone } from '@/components/ui/StatusPill';
import { useAsync } from '@/hooks/useAsync';
import { currentEmployeeId } from '@/mocks/employees';
import { getHistoryFor } from '@/services';
import type { HistoryEvent } from '@/types/domain';

const sourceTone: Record<HistoryEvent['source'], Tone> = {
  maya: 'info',
  manager: 'warning',
  system: 'neutral',
  integration: 'success',
};

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function History() {
  const { data, loading, error, reload } = useAsync(() => getHistoryFor(currentEmployeeId), []);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">My history</h1>
        <p className="text-slate-300">
          A plain-language record of what happened on your behalf, and why. No technical jargon.
        </p>
      </header>

      <AsyncBoundary
        loading={loading}
        error={error}
        empty={data !== null && data.length === 0}
        emptyMessage="No events recorded yet — Maya will start populating this timeline once your onboarding kicks off."
        onRetry={reload}
      >
        <Card>
          <CardTitle>Timeline</CardTitle>
          <CardSubtitle>Most recent first.</CardSubtitle>
          <ol className="relative ml-3 flex flex-col gap-5 border-l border-white/10 pl-5">
            {(data ?? []).map((event) => (
              <li key={event.id} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-[1.6rem] top-2 inline-flex size-3 rounded-full bg-cyan-400 ring-4 ring-cyan-400/10"
                />
                <article className="flex flex-col gap-1.5">
                  <header className="flex flex-wrap items-center gap-2">
                    <time className="text-xs uppercase tracking-wider text-slate-400">
                      {formatTimestamp(event.timestamp)}
                    </time>
                    <StatusPill tone={sourceTone[event.source]}>{event.source}</StatusPill>
                    {event.relatedTool && (
                      <StatusPill tone="info">tool · {event.relatedTool}</StatusPill>
                    )}
                  </header>
                  <p className="font-semibold text-white">{event.summary}</p>
                  <p className="text-sm text-slate-300">Why: {event.reason}</p>
                </article>
              </li>
            ))}
          </ol>
        </Card>
      </AsyncBoundary>
    </div>
  );
}

export default History;
