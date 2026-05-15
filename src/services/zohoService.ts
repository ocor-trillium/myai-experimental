import { simulateLatency, withCircuitBreaker } from './transport';

/**
 * Zoho Projects (System of Record).
 *
 * Read-only from the browser. Writes go through the Project Canvas
 * (`canvasService`) so the source of truth stays consistent.
 *
 * TODO(BACKEND):
 *   GET /zoho/projects/{zohoProjectId} -> {id, name, status, owner}
 */

export type ZohoProject = {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'on_hold' | 'closed';
  owner: string;
};

export async function getZohoProject(zohoProjectId: string): Promise<ZohoProject> {
  return withCircuitBreaker(`zoho:get:${zohoProjectId}`, async () => {
    await simulateLatency();
    return {
      id: zohoProjectId,
      name: `Project ${zohoProjectId}`,
      status: 'active',
      owner: 'REDACTED · request via BFF',
    };
  });
}
