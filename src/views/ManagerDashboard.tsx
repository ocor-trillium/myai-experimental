import { useMemo, useState } from 'react';

import { AsyncBoundary } from '@/components/ui/AsyncBoundary';
import { Card, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { StatusPill, type Tone } from '@/components/ui/StatusPill';
import { useAsync } from '@/hooks/useAsync';
import { listEmployees } from '@/services';
import type { Employee, EmployeeStatus, OnboardingPhaseId } from '@/types/domain';

const statusTone: Record<EmployeeStatus, Tone> = {
  pending: 'neutral',
  in_progress: 'info',
  completed: 'success',
  at_risk: 'danger',
};

const statusLabel: Record<EmployeeStatus, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
  at_risk: 'At risk',
};

const phaseLabel: Record<OnboardingPhaseId, string> = {
  discovery: 'Discovery',
  setup: 'Setup',
  access: 'Access',
  integration: 'Integration',
};

type PhaseFilter = OnboardingPhaseId | 'all';

function daysSinceStart(employee: Employee): number {
  return Math.floor((Date.now() - new Date(employee.startDate).getTime()) / (24 * 60 * 60 * 1000));
}

function ManagerDashboard() {
  const { data, loading, error, reload } = useAsync(listEmployees, []);
  const [team, setTeam] = useState<string>('all');
  const [phase, setPhase] = useState<PhaseFilter>('all');

  const teams = useMemo(() => {
    const set = new Set<string>();
    (data ?? []).forEach((e) => set.add(e.team));
    return ['all', ...Array.from(set).sort()];
  }, [data]);

  const filtered = useMemo(() => {
    return (data ?? []).filter((e) => {
      const teamOk = team === 'all' || e.team === team;
      const phaseOk = phase === 'all' || e.currentPhase === phase;
      return teamOk && phaseOk;
    });
  }, [data, team, phase]);

  const summary = useMemo(() => {
    const all = data ?? [];
    return {
      total: all.length,
      atRisk: all.filter((e) => e.status === 'at_risk').length,
      inProgress: all.filter((e) => e.status === 'in_progress').length,
      completed: all.filter((e) => e.status === 'completed').length,
    };
  }, [data]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Team dashboard</h1>
        <p className="text-slate-300">
          Status of every new hire. Filter by team or phase, and watch for SLA breaches.
        </p>
      </header>

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'New hires', value: summary.total, tone: 'info' as const },
            { label: 'At risk', value: summary.atRisk, tone: 'danger' as const },
            { label: 'In progress', value: summary.inProgress, tone: 'info' as const },
            { label: 'Completed', value: summary.completed, tone: 'success' as const },
          ].map((stat) => (
            <Card key={stat.label} className="!p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <StatusPill tone={stat.tone}>tracked</StatusPill>
            </Card>
          ))}
        </div>

        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>New hires</CardTitle>
              <CardSubtitle>{filtered.length} match the current filters.</CardSubtitle>
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="flex flex-col text-xs">
                <span className="font-semibold uppercase tracking-wider text-slate-400">Team</span>
                <select
                  value={team}
                  onChange={(event) => {
                    setTeam(event.target.value);
                  }}
                  className="rounded-md border border-white/10 bg-slate-800/80 px-2 py-1 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  {teams.map((t) => (
                    <option key={t} value={t}>
                      {t === 'all' ? 'All teams' : t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col text-xs">
                <span className="font-semibold uppercase tracking-wider text-slate-400">Phase</span>
                <select
                  value={phase}
                  onChange={(event) => {
                    setPhase(event.target.value as PhaseFilter);
                  }}
                  className="rounded-md border border-white/10 bg-slate-800/80 px-2 py-1 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <option value="all">All phases</option>
                  {(['discovery', 'setup', 'access', 'integration'] as const).map((p) => (
                    <option key={p} value={p}>
                      {phaseLabel[p]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-slate-400">No employees match the filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/5 text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-2 pr-4">Employee</th>
                    <th className="py-2 pr-4">Team</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Phase</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Days since start</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((employee) => {
                    const days = daysSinceStart(employee);
                    const overdue = employee.status !== 'completed' && days > 7;
                    return (
                      <tr key={employee.id} className="text-slate-200">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span
                              aria-hidden
                              className="inline-flex size-7 items-center justify-center rounded-full text-xs font-bold text-white"
                              style={{ background: employee.avatarColor }}
                            >
                              {employee.fullName
                                .split(' ')
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join('')}
                            </span>
                            <div>
                              <p className="font-semibold text-white">{employee.fullName}</p>
                              <p className="text-xs text-slate-400">{employee.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-slate-300">{employee.team}</td>
                        <td className="py-3 pr-4 text-slate-300">{employee.role}</td>
                        <td className="py-3 pr-4">
                          <StatusPill tone="info">{phaseLabel[employee.currentPhase]}</StatusPill>
                        </td>
                        <td className="py-3 pr-4">
                          <StatusPill tone={statusTone[employee.status]}>
                            {statusLabel[employee.status]}
                          </StatusPill>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-200">{days}d</span>
                            {overdue && <StatusPill tone="warning">SLA</StatusPill>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </AsyncBoundary>
    </div>
  );
}

export default ManagerDashboard;
