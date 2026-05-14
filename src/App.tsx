import { useState } from 'react';

import { config } from '@/config/env';

function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="app">
      <header className="app__header">
        <span className="app__badge">Trillium · MyAI</span>
        <h1 className="app__title">In-house AI experiment</h1>
        <p className="app__subtitle">
          Base template with React + TypeScript + Vite, ready to iterate on.
        </p>
      </header>

      <section className="app__card" aria-labelledby="status-title">
        <h2 id="status-title" className="app__card-title">
          Environment status
        </h2>
        <dl className="app__meta">
          <div>
            <dt>Environment</dt>
            <dd>{config.appEnv}</dd>
          </div>
          <div>
            <dt>Version</dt>
            <dd>{config.appVersion}</dd>
          </div>
          <div>
            <dt>API base</dt>
            <dd>
              <code>{config.apiBaseUrl}</code>
            </dd>
          </div>
        </dl>

        <button
          type="button"
          className="app__button"
          onClick={() => {
            setCount((value) => value + 1);
          }}
        >
          Interactions: {count}
        </button>
      </section>

      <footer className="app__footer">
        <small>
          Edit <code>src/App.tsx</code> and save to see changes hot-reload.
        </small>
      </footer>
    </main>
  );
}

export default App;
