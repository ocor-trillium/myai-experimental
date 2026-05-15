import { simulateLatency, withCircuitBreaker } from './transport';

/**
 * HRIS read-through (Deel + Gusto).
 *
 * The browser never talks to Deel or Gusto directly — both hold financial
 * and personal data subject to PCI / privacy regulation. Calls are
 * proxied via the BFF, which applies field-level redaction.
 *
 * TODO(BACKEND):
 *   GET /hris/{provider}/employees/{id}      -> redacted profile
 *   POST /hris/{provider}/sync/{id}          -> trigger reconciliation
 */

type HrisProvider = 'deel' | 'gusto';

export type HrisProfile = {
  provider: HrisProvider;
  employeeId: string;
  fullName: string;
  startDate: string;
  /** Country, never the full address. */
  country: string;
  contractKind: string;
  status: 'active' | 'pending' | 'terminated';
};

export async function getHrisProfile(
  provider: HrisProvider,
  employeeId: string,
): Promise<HrisProfile> {
  return withCircuitBreaker(`hris:${provider}:${employeeId}`, async () => {
    await simulateLatency();
    return {
      provider,
      employeeId,
      fullName: 'REDACTED · request via BFF',
      startDate: new Date().toISOString(),
      country: 'US',
      contractKind: provider === 'deel' ? 'contractor' : 'full_time',
      status: 'pending',
    };
  });
}
