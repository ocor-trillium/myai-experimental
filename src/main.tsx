import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/App';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RoleProvider } from '@/contexts/RoleContext';
import '@/styles/index.css';

const rootEl = document.getElementById('root');

if (!rootEl) {
  throw new Error('Root element #root not found in index.html');
}

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <RoleProvider>
        <App />
      </RoleProvider>
    </ErrorBoundary>
  </StrictMode>,
);
