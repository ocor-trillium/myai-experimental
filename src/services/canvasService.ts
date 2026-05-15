import { canvasFixtureByEmployee } from '@/mocks/canvas';
import { employeesFixture } from '@/mocks/employees';
import type { CanvasEntry } from '@/types/domain';

import { simulateLatency, withCircuitBreaker } from './transport';

/**
 * Project Canvas integration (OB-08).
 *
 * Project Canvas is the single source of truth that links Zoho projects,
 * contracts and SharePoint folders. The backend keeps the in-app data and
 * the Canvas in sync; this service surfaces drift and lets a manager
 * reconcile from the UI.
 *
 * TODO(BACKEND):
 *   GET    /canvas/{employeeId}            -> CanvasEntry (with drift[])
 *   POST   /canvas/{employeeId}/sync       -> CanvasEntry (after pull)
 *   POST   /canvas/{employeeId}/push       -> CanvasEntry (after push)
 *
 * Anti-duplication contract: writes MUST be idempotent (e.g. include the
 * employeeId as the natural key) to prevent the duplicate entries listed
 * in the original spec.
 */

const canvasState = new Map<string, CanvasEntry>(
  Object.entries(canvasFixtureByEmployee).map(([id, entry]) => [id, structuredClone(entry)]),
);

function recomputeDrift(employeeId: string, entry: CanvasEntry): CanvasEntry {
  const employee = employeesFixture.find((e) => e.id === employeeId);
  const { drift: _omit, ...base } = entry;
  void _omit;
  if (!employee) return base;
  const drift: NonNullable<CanvasEntry['drift']> = [];
  if (employee.zohoProjectId && employee.zohoProjectId !== entry.zohoProjectId) {
    drift.push({
      field: 'zohoProjectId',
      canvasValue: entry.zohoProjectId,
      appValue: employee.zohoProjectId,
    });
  }
  if (employee.contractId && employee.contractId !== entry.contractId) {
    drift.push({
      field: 'contractId',
      canvasValue: entry.contractId,
      appValue: employee.contractId,
    });
  }
  if (employee.sharePointFolderId && employee.sharePointFolderId !== entry.sharePointFolderId) {
    drift.push({
      field: 'sharePointFolderId',
      canvasValue: entry.sharePointFolderId,
      appValue: employee.sharePointFolderId,
    });
  }
  return drift.length > 0 ? { ...base, drift } : base;
}

export async function getCanvasFor(employeeId: string): Promise<CanvasEntry | null> {
  return withCircuitBreaker(`canvas:get:${employeeId}`, async () => {
    await simulateLatency();
    const entry = canvasState.get(employeeId);
    if (!entry) return null;
    return recomputeDrift(employeeId, entry);
  });
}

export async function pullFromCanvas(employeeId: string): Promise<CanvasEntry | null> {
  return withCircuitBreaker(`canvas:pull:${employeeId}`, async () => {
    await simulateLatency(300, 700);
    const entry = canvasState.get(employeeId);
    if (!entry) return null;
    const synced: CanvasEntry = { ...entry, lastSyncedAt: new Date().toISOString() };
    canvasState.set(employeeId, synced);
    return recomputeDrift(employeeId, synced);
  });
}

export async function pushToCanvas(
  employeeId: string,
  patch: Partial<Pick<CanvasEntry, 'zohoProjectId' | 'contractId' | 'sharePointFolderId'>>,
): Promise<CanvasEntry | null> {
  return withCircuitBreaker(`canvas:push:${employeeId}`, async () => {
    await simulateLatency(300, 700);
    const current = canvasState.get(employeeId);
    if (!current) return null;
    const next: CanvasEntry = {
      ...current,
      ...patch,
      lastSyncedAt: new Date().toISOString(),
    };
    canvasState.set(employeeId, next);
    return recomputeDrift(employeeId, next);
  });
}
