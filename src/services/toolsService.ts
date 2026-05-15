import { toolDefinitionsFixture, toolGrantsFixtureByEmployee } from '@/mocks/tools';
import type { ProvisioningStatus, ToolDefinition, ToolGrant, ToolKey } from '@/types/domain';

import { simulateLatency, withCircuitBreaker } from './transport';

/**
 * Tools provisioning service (OB-05).
 *
 * Orchestrates account creation across Jira, GitLab, Slack, and the rest of
 * the corporate stack. Real implementation runs server-side; the browser
 * never holds API tokens for any of these tools.
 *
 * TODO(BACKEND):
 *   GET    /tools                                  -> ToolDefinition[]
 *   GET    /employees/{id}/tools                   -> ToolGrant[]
 *   POST   /employees/{id}/tools/{tool}/approve    -> ToolGrant
 *   POST   /employees/{id}/tools/approve-all       -> ToolGrant[]
 *
 * The backend MUST enforce role-based eligibility (defaultRoles) before
 * provisioning. Front-end only renders eligibility hints.
 */

const grantsByEmployee = new Map<string, ToolGrant[]>(
  Object.entries(toolGrantsFixtureByEmployee).map(([id, grants]) => [
    id,
    grants.map((g) => ({ ...g })),
  ]),
);

export async function listToolDefinitions(): Promise<ToolDefinition[]> {
  return withCircuitBreaker('tools:definitions', async () => {
    await simulateLatency();
    return toolDefinitionsFixture.map((t) => ({ ...t }));
  });
}

export async function listGrantsFor(employeeId: string): Promise<ToolGrant[]> {
  return withCircuitBreaker(`tools:grants:${employeeId}`, async () => {
    await simulateLatency();
    return (grantsByEmployee.get(employeeId) ?? []).map((g) => ({ ...g }));
  });
}

async function transitionGrant(
  employeeId: string,
  tool: ToolKey,
  decidedBy: string,
  finalStatus: Extract<ProvisioningStatus, 'active' | 'failed'>,
): Promise<ToolGrant> {
  return withCircuitBreaker(`tools:approve:${employeeId}:${tool}`, async () => {
    await simulateLatency(400, 900);
    const list = grantsByEmployee.get(employeeId) ?? [];
    const existing = list.find((g) => g.tool === tool);
    const now = new Date().toISOString();

    const next: ToolGrant = existing
      ? { ...existing, status: finalStatus, decidedAt: now, decidedBy }
      : {
          id: `grant-${employeeId}-${tool}-${Date.now()}`,
          employeeId,
          tool,
          status: finalStatus,
          requestedAt: now,
          decidedAt: now,
          decidedBy,
        };

    if (finalStatus === 'failed') {
      next.failureReason = 'Mock failure injected by toolsService.';
    }

    const updated = list.filter((g) => g.tool !== tool).concat(next);
    grantsByEmployee.set(employeeId, updated);
    return { ...next };
  });
}

export async function approveTool(
  employeeId: string,
  tool: ToolKey,
  decidedBy: string,
): Promise<ToolGrant> {
  return transitionGrant(employeeId, tool, decidedBy, 'active');
}

export async function approveAll(
  employeeId: string,
  tools: ToolKey[],
  decidedBy: string,
): Promise<ToolGrant[]> {
  const results: ToolGrant[] = [];
  for (const tool of tools) {
    results.push(await approveTool(employeeId, tool, decidedBy));
  }
  return results;
}
