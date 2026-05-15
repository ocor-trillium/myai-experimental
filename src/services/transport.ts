/**
 * Transport-layer helpers shared by every service.
 *
 * - `simulateLatency` mimics network latency in mock mode.
 * - `withCircuitBreaker` enforces the "Circuit Breaker" requirement from the
 *   OnboardingContext: any call to an external system must short-circuit
 *   after a small number of consecutive failures so we never spin up an
 *   infinite retry loop. The implementation is intentionally simple
 *   (in-memory, per-key) — when wiring a real backend, swap for the
 *   platform-wide breaker (e.g. resilience4j / opossum equivalent).
 */

const FAILURE_THRESHOLD = 5;
const COOLDOWN_MS = 30_000;

type BreakerState = {
  failures: number;
  openedAt: number | null;
};

const breakers = new Map<string, BreakerState>();

export class CircuitOpenError extends Error {
  constructor(public readonly key: string) {
    super(`Circuit breaker open for "${key}". Skipping call.`);
    this.name = 'CircuitOpenError';
  }
}

export async function simulateLatency(minMs = 120, maxMs = 320): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function withCircuitBreaker<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const state = breakers.get(key) ?? { failures: 0, openedAt: null };

  if (state.openedAt !== null) {
    const elapsed = Date.now() - state.openedAt;
    if (elapsed < COOLDOWN_MS) {
      throw new CircuitOpenError(key);
    }
    state.openedAt = null;
    state.failures = 0;
  }

  try {
    const result = await fn();
    state.failures = 0;
    breakers.set(key, state);
    return result;
  } catch (error) {
    state.failures += 1;
    if (state.failures >= FAILURE_THRESHOLD) {
      state.openedAt = Date.now();
    }
    breakers.set(key, state);
    throw error;
  }
}

/** Test-only helper to reset breaker state between scenarios. */
export function _resetBreakers(): void {
  breakers.clear();
}
