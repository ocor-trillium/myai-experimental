import { buildProgressFor } from '@/mocks/progress';
import type { EmployeeProgress } from '@/types/domain';

import { simulateLatency, withCircuitBreaker } from './transport';

/**
 * Onboarding progress per employee (OB-01).
 *
 * TODO(BACKEND): replace with `GET /employees/{id}/onboarding/progress`.
 * The backend computes phases and tasks from the Project Canvas.
 */

export async function getProgressFor(employeeId: string): Promise<EmployeeProgress> {
  return withCircuitBreaker(`progress:get:${employeeId}`, async () => {
    await simulateLatency();
    return buildProgressFor(employeeId);
  });
}
