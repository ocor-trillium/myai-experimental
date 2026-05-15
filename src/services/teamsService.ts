import { simulateLatency, withCircuitBreaker } from './transport';

/**
 * Microsoft Teams notifications.
 *
 * Server-side responsibility — the browser never holds Teams webhooks or
 * tokens. The service here is a thin wrapper that calls our BFF.
 *
 * TODO(BACKEND): POST {VITE_API_BASE_URL}/integrations/teams/notify
 *   body: { channel: string, message: string, severity?: 'info'|'warn'|'error' }
 *
 * Privacy contract (per OnboardingContext, "Zero-Chat Monitoring"):
 *   - Never forward private chat messages.
 *   - Only post to channels listed in the Teams allowlist managed by IT.
 */

const TEAMS_CHANNEL_ALLOWLIST = new Set<string>([
  '#onboarding-bugs',
  '#onboarding-features',
  '#onboarding-help',
  '#onboarding-alerts',
  '#onboarding-ops',
]);

export async function notifyTeams(channel: string, message: string): Promise<{ ok: true }> {
  return withCircuitBreaker(`teams:notify:${channel}`, async () => {
    if (!TEAMS_CHANNEL_ALLOWLIST.has(channel)) {
      throw new Error(`Teams channel "${channel}" is not on the allowlist.`);
    }
    if (message.trim().length === 0) {
      throw new Error('Teams message cannot be empty.');
    }
    await simulateLatency(80, 200);
    return { ok: true };
  });
}
