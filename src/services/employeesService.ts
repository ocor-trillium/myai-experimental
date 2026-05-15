import { currentEmployeeId, employeesFixture } from '@/mocks/employees';
import type { Employee } from '@/types/domain';

import { simulateLatency, withCircuitBreaker } from './transport';

/**
 * Read access to employee profiles.
 *
 * TODO(BACKEND): replace with `GET /employees` and `GET /employees/{id}`.
 * Auth: bearer token from the BFF; never reach external HRIS systems
 * directly from the browser.
 */

export async function listEmployees(): Promise<Employee[]> {
  return withCircuitBreaker('employees:list', async () => {
    await simulateLatency();
    return employeesFixture.map((e) => ({ ...e }));
  });
}

export async function getEmployee(employeeId: string): Promise<Employee | null> {
  return withCircuitBreaker(`employees:get:${employeeId}`, async () => {
    await simulateLatency();
    const found = employeesFixture.find((e) => e.id === employeeId);
    return found ? { ...found } : null;
  });
}

export async function getCurrentEmployee(): Promise<Employee> {
  const employee = await getEmployee(currentEmployeeId);
  if (!employee) {
    throw new Error(`Current employee fixture is missing (id=${currentEmployeeId}).`);
  }
  return employee;
}
