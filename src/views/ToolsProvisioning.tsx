import { useEffect, useMemo, useState } from 'react';

import { AsyncBoundary } from '@/components/ui/AsyncBoundary';
import { Card, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { StatusPill, type Tone } from '@/components/ui/StatusPill';
import { useAsync } from '@/hooks/useAsync';
import {
  approveAll,
  approveTool,
  CircuitOpenError,
  listEmployees,
  listGrantsFor,
  listToolDefinitions,
} from '@/services';
import type { ProvisioningStatus, ToolDefinition, ToolGrant, ToolKey } from '@/types/domain';

const statusTone: Record<ProvisioningStatus, Tone> = {
  pending: 'neutral',
  approved: 'info',
  provisioning: 'info',
  active: 'success',
  failed: 'danger',
};

const statusLabel: Record<ProvisioningStatus, string> = {
  pending: 'Pending approval',
  approved: 'Approved',
  provisioning: 'Provisioning',
  active: 'Active',
  failed: 'Failed',
};

function ToolsProvisioning() {
  const employeesAsync = useAsync(listEmployees, []);
  const definitionsAsync = useAsync(listToolDefinitions, []);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<ToolKey>>(new Set());
  const [grants, setGrants] = useState<ToolGrant[]>([]);
  const [grantsLoading, setGrantsLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  useEffect(() => {
    if (employeeId === null && employeesAsync.data && employeesAsync.data.length > 0) {
      setEmployeeId(employeesAsync.data[0]?.id ?? null);
    }
  }, [employeeId, employeesAsync.data]);

  useEffect(() => {
    if (!employeeId) return;
    let cancelled = false;
    setGrantsLoading(true);
    listGrantsFor(employeeId)
      .then((g) => {
        if (!cancelled) {
          setGrants(g);
          setSelected(new Set());
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setActionError(error instanceof Error ? error.message : String(error));
        }
      })
      .finally(() => {
        if (!cancelled) setGrantsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  const employee = useMemo(
    () => employeesAsync.data?.find((e) => e.id === employeeId) ?? null,
    [employeesAsync.data, employeeId],
  );

  const grantByTool = useMemo(() => {
    const map = new Map<ToolKey, ToolGrant>();
    grants.forEach((g) => map.set(g.tool, g));
    return map;
  }, [grants]);

  const eligibility = useMemo(() => {
    const out = new Map<ToolKey, boolean>();
    if (!employee || !definitionsAsync.data) return out;
    definitionsAsync.data.forEach((tool) => {
      out.set(tool.key, tool.defaultRoles.includes(employee.role));
    });
    return out;
  }, [employee, definitionsAsync.data]);

  function toggle(toolKey: ToolKey, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(toolKey);
      else next.delete(toolKey);
      return next;
    });
  }

  async function handleApprove(toolKey: ToolKey) {
    if (!employee) return;
    setActionBusy(true);
    setActionError(null);
    try {
      const updated = await approveTool(employee.id, toolKey, 'mgr-001');
      setGrants((prev) => {
        const filtered = prev.filter((g) => g.tool !== toolKey);
        return [...filtered, updated];
      });
    } catch (error) {
      setActionError(formatActionError(error));
    } finally {
      setActionBusy(false);
    }
  }

  async function handleApproveAll() {
    if (!employee) return;
    const tools = Array.from(selected);
    if (tools.length === 0) return;
    setActionBusy(true);
    setActionError(null);
    try {
      const updated = await approveAll(employee.id, tools, 'mgr-001');
      setGrants((prev) => {
        const remaining = prev.filter((g) => !tools.includes(g.tool));
        return [...remaining, ...updated];
      });
      setSelected(new Set());
    } catch (error) {
      setActionError(formatActionError(error));
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Tools provisioning</h1>
        <p className="text-slate-300">
          Approve access to external tools. Eligibility comes from the role the employee was hired
          for.
        </p>
      </header>

      <AsyncBoundary
        loading={employeesAsync.loading || definitionsAsync.loading}
        error={employeesAsync.error ?? definitionsAsync.error}
        onRetry={() => {
          employeesAsync.reload();
          definitionsAsync.reload();
        }}
      >
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Employee</CardTitle>
              <CardSubtitle>Pick a new hire to manage their tool access.</CardSubtitle>
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
                  {e.fullName} · {e.role}
                </option>
              ))}
            </select>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Available tools</CardTitle>
              <CardSubtitle>
                {selected.size === 0
                  ? 'Select one or more, or approve individually.'
                  : `${selected.size} tool${selected.size === 1 ? '' : 's'} selected.`}
              </CardSubtitle>
            </div>
            <button
              type="button"
              onClick={() => {
                void handleApproveAll();
              }}
              disabled={actionBusy || selected.size === 0}
              className="rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Approve selected
            </button>
          </div>

          {actionError && (
            <p role="alert" className="text-sm text-rose-300">
              {actionError}
            </p>
          )}

          {grantsLoading ? (
            <p className="text-sm text-slate-400">Loading grants…</p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {(definitionsAsync.data ?? []).map((tool) => (
                <ToolRow
                  key={tool.key}
                  tool={tool}
                  grant={grantByTool.get(tool.key) ?? null}
                  isEligible={eligibility.get(tool.key) ?? false}
                  isSelected={selected.has(tool.key)}
                  busy={actionBusy}
                  onToggle={(checked) => {
                    toggle(tool.key, checked);
                  }}
                  onApprove={() => {
                    void handleApprove(tool.key);
                  }}
                />
              ))}
            </ul>
          )}
        </Card>
      </AsyncBoundary>
    </div>
  );
}

function formatActionError(error: unknown): string {
  if (error instanceof CircuitOpenError) {
    return 'Provisioning is throttled by the circuit breaker. Try again in a moment.';
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

function ToolRow({
  tool,
  grant,
  isEligible,
  isSelected,
  busy,
  onToggle,
  onApprove,
}: {
  tool: ToolDefinition;
  grant: ToolGrant | null;
  isEligible: boolean;
  isSelected: boolean;
  busy: boolean;
  onToggle: (checked: boolean) => void;
  onApprove: () => void;
}) {
  const status: ProvisioningStatus = grant?.status ?? 'pending';
  const isActive = status === 'active';

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-white/10 bg-slate-800/40 p-4">
      <header className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-white">{tool.name}</p>
          <p className="text-sm text-slate-300">{tool.description}</p>
        </div>
        <StatusPill tone={statusTone[status]}>{statusLabel[status]}</StatusPill>
      </header>

      {!isEligible && (
        <p className="text-xs text-amber-300">
          ⚠ This tool is not in the default set for the employee&apos;s role.
        </p>
      )}

      {grant?.failureReason && <p className="text-xs text-rose-300">⚠ {grant.failureReason}</p>}

      <footer className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={isSelected}
            disabled={isActive || busy}
            onChange={(event) => {
              onToggle(event.target.checked);
            }}
          />
          Select
        </label>
        <button
          type="button"
          onClick={onApprove}
          disabled={busy || isActive}
          className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isActive ? 'Active' : 'Approve'}
        </button>
      </footer>
    </li>
  );
}

export default ToolsProvisioning;
