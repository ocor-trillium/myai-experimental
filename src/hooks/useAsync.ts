import { useCallback, useEffect, useRef, useState } from 'react';

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

/**
 * Lightweight async hook for our mock services. Cancels stale results on
 * unmount and on `deps` changes; no caching, no retries — keep it simple
 * (per the "plain async + useState/useEffect" decision).
 */
export function useAsync<T>(
  factory: () => Promise<T>,
  deps: ReadonlyArray<unknown>,
): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  const counterRef = useRef(0);

  const run = useCallback(() => {
    const myToken = ++counterRef.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    factory()
      .then((data) => {
        if (counterRef.current === myToken) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((error: unknown) => {
        if (counterRef.current === myToken) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
    return () => {
      counterRef.current += 1;
    };
  }, [run]);

  return { ...state, reload: run };
}
