import { useEffect } from 'react';

import { AsyncBoundary } from '@/components/ui/AsyncBoundary';
import { Card, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { StatusPill, type Tone } from '@/components/ui/StatusPill';
import { useAsync } from '@/hooks/useAsync';
import { getEcosystemSnapshot, getMaintenanceWindows } from '@/services';
import type { EcosystemStatus } from '@/types/domain';

const statusTone: Record<EcosystemStatus, Tone> = {
  operational: 'success',
  degraded: 'warning',
  down: 'danger',
  maintenance: 'info',
};

const statusLabel: Record<EcosystemStatus, string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  down: 'Down',
  maintenance: 'Maintenance',
};

function formatDateRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  return `${start.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })} → ${end.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function Ecosystem() {
  const snapshotAsync = useAsync(getEcosystemSnapshot, []);
  const maintenanceAsync = useAsync(getMaintenanceWindows, []);

  useEffect(() => {
    // TODO(BACKEND): replace with WS subscription to /ecosystem/stream.
    const interval = setInterval(() => {
      snapshotAsync.reload();
    }, 30_000);
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Ecosystem</h1>
        <p className="text-slate-300">
          Real-time health of every external service we depend on. Auto-refreshes every 30 seconds.
        </p>
      </header>

      <AsyncBoundary
        loading={snapshotAsync.loading}
        error={snapshotAsync.error}
        onRetry={snapshotAsync.reload}
      >
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {(snapshotAsync.data ?? []).map((service) => (
            <li
              key={service.key}
              className="flex flex-col gap-2 rounded-xl border border-white/10 bg-slate-900/60 p-4 shadow-lg"
            >
              <header className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-white">{service.name}</p>
                  <p className="text-sm text-slate-300">{service.description}</p>
                </div>
                <StatusPill tone={statusTone[service.status]}>
                  {statusLabel[service.status]}
                </StatusPill>
              </header>
              {service.message && <p className="text-sm text-amber-300/90">⚠ {service.message}</p>}
              <footer className="flex items-center justify-between text-xs text-slate-400">
                <span>Uptime 30d: {(service.uptime30d * 100).toFixed(1)}%</span>
                <time>{new Date(service.lastCheckedAt).toLocaleTimeString()}</time>
              </footer>
            </li>
          ))}
        </ul>
      </AsyncBoundary>

      <AsyncBoundary
        loading={maintenanceAsync.loading}
        error={maintenanceAsync.error}
        empty={maintenanceAsync.data !== null && maintenanceAsync.data.length === 0}
        emptyMessage="No scheduled maintenance windows."
        onRetry={maintenanceAsync.reload}
      >
        <Card>
          <CardTitle>Scheduled maintenance</CardTitle>
          <CardSubtitle>
            Windows shared by upstream providers and our own platform team.
          </CardSubtitle>
          <ul className="flex flex-col gap-3">
            {(maintenanceAsync.data ?? []).map((window) => (
              <li
                key={window.id}
                className="flex flex-col gap-1 rounded-lg border border-white/10 bg-slate-800/40 p-3"
              >
                <header className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-white">{window.title}</p>
                  <StatusPill tone="neutral">{window.serviceKey}</StatusPill>
                </header>
                <p className="text-xs uppercase tracking-wider text-slate-400">
                  {formatDateRange(window.startsAt, window.endsAt)}
                </p>
                <p className="text-sm text-slate-300">{window.description}</p>
              </li>
            ))}
          </ul>
        </Card>
      </AsyncBoundary>
    </div>
  );
}

export default Ecosystem;
