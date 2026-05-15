import { ecosystemFixture, maintenanceWindowsFixture } from '@/mocks/ecosystem';
import type { EcosystemServiceSnapshot, MaintenanceWindow } from '@/types/domain';

import { simulateLatency, withCircuitBreaker } from './transport';

/**
 * Aggregated ecosystem health (OB-06).
 *
 * The backend already aggregates per-service status pages into a single
 * snapshot. The browser reads only the aggregate; it must NOT poll
 * third-party status pages directly.
 *
 * TODO(BACKEND):
 *   GET /ecosystem/snapshot     -> EcosystemServiceSnapshot[]
 *   GET /ecosystem/maintenance  -> MaintenanceWindow[]
 *   WS  /ecosystem/stream       (real-time updates)
 */

export async function getEcosystemSnapshot(): Promise<EcosystemServiceSnapshot[]> {
  return withCircuitBreaker('ecosystem:snapshot', async () => {
    await simulateLatency();
    return ecosystemFixture.map((s) => ({ ...s, lastCheckedAt: new Date().toISOString() }));
  });
}

export async function getMaintenanceWindows(): Promise<MaintenanceWindow[]> {
  return withCircuitBreaker('ecosystem:maintenance', async () => {
    await simulateLatency();
    return maintenanceWindowsFixture.map((m) => ({ ...m }));
  });
}
