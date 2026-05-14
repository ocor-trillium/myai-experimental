import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Telemetry hook: forward to Sentry/Datadog/etc. in production.
    // We avoid exposing error details in the UI by default.
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info);
    }
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div role="alert" style={{ padding: '2rem', fontFamily: 'system-ui' }}>
            <h1>Something went wrong.</h1>
            <p>The team has been notified. Please reload the page.</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
