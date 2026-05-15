import { useEffect, useState, type FormEvent } from 'react';

import { AsyncBoundary } from '@/components/ui/AsyncBoundary';
import { Card, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { StatusPill, type Tone } from '@/components/ui/StatusPill';
import { useAsync } from '@/hooks/useAsync';
import { CircuitOpenError, listFeedback, reclassify, submitFeedback } from '@/services';
import type { FeedbackCategory, FeedbackItem } from '@/types/domain';

const categoryTone: Record<FeedbackCategory, Tone> = {
  bug: 'danger',
  feature_request: 'info',
  question: 'warning',
  unclassified: 'neutral',
};

const categoryLabel: Record<FeedbackCategory, string> = {
  bug: 'Bug',
  feature_request: 'Feature request',
  question: 'Question',
  unclassified: 'Unclassified',
};

function FeedbackInbox() {
  const inboxAsync = useAsync(listFeedback, []);
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (inboxAsync.data) setItems(inboxAsync.data);
  }, [inboxAsync.data]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    setBusy(true);
    setActionError(null);
    try {
      const created = await submitFeedback('emp-001', trimmed);
      setItems((prev) => [created, ...prev]);
      setText('');
    } catch (error) {
      setActionError(formatError(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleReclassify(id: string, next: FeedbackCategory) {
    setBusy(true);
    setActionError(null);
    try {
      const updated = await reclassify(id, next);
      if (updated) {
        setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      }
    } catch (error) {
      setActionError(formatError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Feedback inbox</h1>
        <p className="text-slate-300">
          Every entry is auto-classified by MYAI and routed to the matching Microsoft Teams channel.
        </p>
      </header>

      <Card>
        <CardTitle>Submit feedback</CardTitle>
        <CardSubtitle>
          For demo purposes; in production this is wired to in-app prompts.
        </CardSubtitle>
        <form
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
          className="flex flex-col gap-2"
        >
          <textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value);
            }}
            rows={3}
            maxLength={2000}
            placeholder="Tell us what worked, what broke, or what you'd like next…"
            className="w-full resize-none rounded-md border border-white/10 bg-slate-900/80 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || text.trim().length === 0}
            className="self-start rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 px-4 py-1.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Sending…' : 'Submit'}
          </button>
        </form>
        {actionError && (
          <p role="alert" className="text-sm text-rose-300">
            {actionError}
          </p>
        )}
      </Card>

      <AsyncBoundary
        loading={inboxAsync.loading}
        error={inboxAsync.error}
        empty={items.length === 0}
        emptyMessage="No feedback yet."
        onRetry={inboxAsync.reload}
      >
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-900/60 p-4 shadow-lg"
            >
              <header className="flex flex-wrap items-center gap-2">
                <StatusPill tone={categoryTone[item.category]}>
                  {categoryLabel[item.category]}
                </StatusPill>
                <span className="text-xs text-slate-400">
                  Confidence {Math.round(item.confidence * 100)}%
                </span>
                <span className="text-xs text-slate-400">·</span>
                <time className="text-xs text-slate-400">
                  {new Date(item.submittedAt).toLocaleString()}
                </time>
                {item.notifiedTeamsChannel && (
                  <StatusPill tone="success">Notified {item.notifiedTeamsChannel}</StatusPill>
                )}
              </header>
              <p className="text-sm text-slate-200">{item.text}</p>
              <footer className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span>Submitted by {item.submittedBy}</span>
                <label className="flex items-center gap-2">
                  Reclassify:
                  <select
                    value={item.category}
                    onChange={(event) => {
                      void handleReclassify(item.id, event.target.value as FeedbackCategory);
                    }}
                    className="rounded-md border border-white/10 bg-slate-800/80 px-2 py-1 text-xs text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                    disabled={busy}
                  >
                    {(['bug', 'feature_request', 'question', 'unclassified'] as const).map((c) => (
                      <option key={c} value={c}>
                        {categoryLabel[c]}
                      </option>
                    ))}
                  </select>
                </label>
              </footer>
            </li>
          ))}
        </ul>
      </AsyncBoundary>
    </div>
  );
}

function formatError(error: unknown): string {
  if (error instanceof CircuitOpenError) {
    return 'Feedback service is temporarily throttled. Try again in a moment.';
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

export default FeedbackInbox;
