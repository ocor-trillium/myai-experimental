import { useEffect, useState } from 'react';

import { AsyncBoundary } from '@/components/ui/AsyncBoundary';
import { Card, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/StatusPill';
import { useAsync } from '@/hooks/useAsync';
import {
  CircuitOpenError,
  getCanvasFor,
  listEmployees,
  pullFromCanvas,
  pushToCanvas,
} from '@/services';
import type { CanvasEntry } from '@/types/domain';

const fieldLabel: Record<NonNullable<CanvasEntry['drift']>[number]['field'], string> = {
  zohoProjectId: 'Zoho Project ID',
  contractId: 'Contract ID',
  sharePointFolderId: 'SharePoint Folder ID',
};

function ProjectCanvas() {
  const employeesAsync = useAsync(listEmployees, []);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [entry, setEntry] = useState<CanvasEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (employeeId === null && employeesAsync.data && employeesAsync.data.length > 0) {
      setEmployeeId(employeesAsync.data[0]?.id ?? null);
    }
  }, [employeeId, employeesAsync.data]);

  useEffect(() => {
    if (!employeeId) return;
    let cancelled = false;
    setLoading(true);
    setActionError(null);
    getCanvasFor(employeeId)
      .then((next) => {
        if (!cancelled) setEntry(next);
      })
      .catch((error: unknown) => {
        if (!cancelled) setActionError(formatError(error));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  async function handlePull() {
    if (!employeeId) return;
    setActionBusy(true);
    setActionError(null);
    try {
      const next = await pullFromCanvas(employeeId);
      setEntry(next);
    } catch (error) {
      setActionError(formatError(error));
    } finally {
      setActionBusy(false);
    }
  }

  async function handlePushField(field: NonNullable<CanvasEntry['drift']>[number]['field']) {
    if (!employeeId || !entry || !entry.drift) return;
    const drift = entry.drift.find((d) => d.field === field);
    if (!drift) return;
    setActionBusy(true);
    setActionError(null);
    try {
      const next = await pushToCanvas(employeeId, { [field]: drift.appValue });
      setEntry(next);
    } catch (error) {
      setActionError(formatError(error));
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Project Canvas</h1>
        <p className="text-slate-300">
          Glue object linking Zoho, contracts, and SharePoint. The canvas is the source of truth;
          the app reconciles drift on every employee.
        </p>
      </header>

      <AsyncBoundary
        loading={employeesAsync.loading}
        error={employeesAsync.error}
        onRetry={employeesAsync.reload}
      >
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Employee</CardTitle>
              <CardSubtitle>Pick a new hire to inspect their canvas linkage.</CardSubtitle>
            </div>
            <select
              value={employeeId ?? ''}
              onChange={(event) => {
                setEmployeeId(event.target.value);
              }}
              className="rounded-md border border-white/10 bg-slate-800/80 px-2 py-1 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              aria-label="Select employee"
            >
              {(employeesAsync.data ?? []).map((e) => (
                <option key={e.id} value={e.id}>
                  {e.fullName} · {e.team}
                </option>
              ))}
            </select>
          </div>
        </Card>

        <AsyncBoundary
          loading={loading}
          error={null}
          empty={!loading && !entry}
          emptyMessage="No canvas record for this employee yet."
        >
          {entry ? (
            <Card>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Canvas linkage</CardTitle>
                  <CardSubtitle>
                    Last synced {new Date(entry.lastSyncedAt).toLocaleString()}.
                  </CardSubtitle>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void handlePull();
                  }}
                  disabled={actionBusy}
                  className="rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Pull from Canvas
                </button>
              </div>

              {actionError && (
                <p role="alert" className="text-sm text-rose-300">
                  {actionError}
                </p>
              )}

              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-800/40 p-3">
                  <dt className="text-xs uppercase tracking-wider text-slate-400">Zoho project</dt>
                  <dd className="font-mono text-sm text-white">{entry.zohoProjectId}</dd>
                </div>
                <div className="rounded-lg bg-slate-800/40 p-3">
                  <dt className="text-xs uppercase tracking-wider text-slate-400">Contract</dt>
                  <dd className="font-mono text-sm text-white">{entry.contractId}</dd>
                </div>
                <div className="rounded-lg bg-slate-800/40 p-3">
                  <dt className="text-xs uppercase tracking-wider text-slate-400">
                    SharePoint folder
                  </dt>
                  <dd className="break-all font-mono text-sm text-white">
                    {entry.sharePointFolderId}
                  </dd>
                </div>
              </dl>

              {entry.drift && entry.drift.length > 0 ? (
                <Card className="!bg-amber-500/5">
                  <div className="flex items-center gap-2">
                    <StatusPill tone="warning">Drift detected</StatusPill>
                    <CardSubtitle>
                      The Canvas and the app disagree on {entry.drift.length} field
                      {entry.drift.length === 1 ? '' : 's'}.
                    </CardSubtitle>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {entry.drift.map((d) => (
                      <li
                        key={d.field}
                        className="grid grid-cols-1 items-center gap-2 rounded-lg bg-slate-800/40 p-3 sm:grid-cols-[160px_1fr_1fr_auto]"
                      >
                        <span className="text-xs uppercase tracking-wider text-slate-400">
                          {fieldLabel[d.field]}
                        </span>
                        <span className="font-mono text-xs text-rose-300">
                          Canvas: {d.canvasValue}
                        </span>
                        <span className="font-mono text-xs text-emerald-300">
                          App: {d.appValue}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            void handlePushField(d.field);
                          }}
                          disabled={actionBusy}
                          className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Push app value
                        </button>
                      </li>
                    ))}
                  </ul>
                </Card>
              ) : (
                <p className="text-sm text-emerald-300">✓ No drift. App and Canvas are aligned.</p>
              )}
            </Card>
          ) : null}
        </AsyncBoundary>
      </AsyncBoundary>
    </div>
  );
}

function formatError(error: unknown): string {
  if (error instanceof CircuitOpenError) {
    return 'Canvas service is temporarily throttled. Try again in a moment.';
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

export default ProjectCanvas;
