import { useMemo } from 'react';

import { AsyncBoundary } from '@/components/ui/AsyncBoundary';
import { Card, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { StatusPill, type Tone } from '@/components/ui/StatusPill';
import { useAsync } from '@/hooks/useAsync';
import { currentEmployeeId } from '@/mocks/employees';
import { getCurrentEmployee, getProgressFor } from '@/services';
import type { OnboardingTask, TaskStatus } from '@/types/domain';

const taskTone: Record<TaskStatus, Tone> = {
  pending: 'neutral',
  in_progress: 'info',
  completed: 'success',
  blocked: 'danger',
};

const taskLabel: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
  blocked: 'Blocked',
};

function isOverEstimate(task: OnboardingTask): boolean {
  if (task.actualHours === undefined) return false;
  return task.actualHours > task.estimatedHours;
}

function OnboardingProgress() {
  const employeeAsync = useAsync(getCurrentEmployee, []);
  const progressAsync = useAsync(() => getProgressFor(currentEmployeeId), []);

  const overall = useMemo(() => {
    if (!progressAsync.data) return { completed: 0, total: 0, percent: 0 };
    const total = progressAsync.data.tasks.length;
    const completed = progressAsync.data.tasks.filter((t) => t.status === 'completed').length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { completed, total, percent };
  }, [progressAsync.data]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">My onboarding</h1>
        <p className="text-slate-300">
          Visual progress across the four phases. Maya updates this in real time as the integrations
          finish.
        </p>
      </header>

      <AsyncBoundary
        loading={employeeAsync.loading || progressAsync.loading}
        error={employeeAsync.error ?? progressAsync.error}
        onRetry={() => {
          employeeAsync.reload();
          progressAsync.reload();
        }}
      >
        {employeeAsync.data && progressAsync.data ? (
          <>
            <Card>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Overall progress</CardTitle>
                  <CardSubtitle>
                    {overall.completed} of {overall.total} tasks completed.
                  </CardSubtitle>
                </div>
                <p className="text-3xl font-bold text-white">{overall.percent}%</p>
              </div>
              <div
                className="h-3 w-full overflow-hidden rounded-full bg-white/5"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={overall.percent}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-[width] duration-500"
                  style={{ width: `${overall.percent}%` }}
                />
              </div>
            </Card>

            <ul className="flex flex-col gap-4">
              {progressAsync.data.phases.map((phase) => {
                const tasks = progressAsync.data!.tasks.filter((t) => t.phaseId === phase.id);
                const completed = tasks.filter((t) => t.status === 'completed').length;
                const phasePercent =
                  tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);
                const isCurrent = phase.id === employeeAsync.data!.currentPhase;

                return (
                  <Card
                    key={phase.id}
                    as="article"
                    className={isCurrent ? 'ring-1 ring-cyan-400/40' : ''}
                  >
                    <header className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Phase {phase.order}
                        </p>
                        <h2 className="text-lg font-semibold text-white">{phase.name}</h2>
                        <p className="text-sm text-slate-300">{phase.description}</p>
                      </div>
                      {isCurrent && <StatusPill tone="info">Current</StatusPill>}
                    </header>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <div
                        className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={phasePercent}
                      >
                        <div
                          className="h-full rounded-full bg-cyan-400 transition-[width] duration-500"
                          style={{ width: `${phasePercent}%` }}
                        />
                      </div>
                      <span>
                        {completed}/{tasks.length}
                      </span>
                    </div>

                    {tasks.length === 0 ? (
                      <p className="text-sm text-slate-400">No tasks scheduled yet.</p>
                    ) : (
                      <ul className="flex flex-col divide-y divide-white/5">
                        {tasks.map((task) => (
                          <li
                            key={task.id}
                            className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-white">{task.title}</p>
                              <p className="text-sm text-slate-400">{task.description}</p>
                              {task.blockerReason && (
                                <p className="mt-1 text-xs text-rose-300">
                                  ⚠ {task.blockerReason}
                                </p>
                              )}
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              {isOverEstimate(task) && (
                                <StatusPill tone="warning">Over SLA</StatusPill>
                              )}
                              <StatusPill tone={taskTone[task.status]}>
                                {taskLabel[task.status]}
                              </StatusPill>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                );
              })}
            </ul>
          </>
        ) : null}
      </AsyncBoundary>
    </div>
  );
}

export default OnboardingProgress;
