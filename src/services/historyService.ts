import { historyFixtureByEmployee } from '@/mocks/history';
import type { HistoryEvent } from '@/types/domain';

import { simulateLatency, withCircuitBreaker } from './transport';

/**
 * Plain-language transparency log per employee (OB-03).
 *
 * The backend MUST translate technical events into a sentence the user can
 * read without context. Never expose raw error codes or stack traces here.
 *
 * TODO(BACKEND): `GET /employees/{id}/history`. The backend reads from the
 * MYAI activity store and applies the natural-language transformation.
 */

export async function getHistoryFor(employeeId: string): Promise<HistoryEvent[]> {
  return withCircuitBreaker(`history:get:${employeeId}`, async () => {
    await simulateLatency();
    const events = historyFixtureByEmployee[employeeId] ?? [];
    return [...events].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  });
}
