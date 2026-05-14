import { useState } from 'react';

import { config } from '@/config/env';

const meta = [
  { label: 'Environment', value: config.appEnv },
  { label: 'Version', value: config.appVersion },
  { label: 'API base', value: config.apiBaseUrl, mono: true },
];

function Home() {
  const [count, setCount] = useState(0);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <span className="inline-flex rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white">
          Trillium · MyAI
        </span>
        <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight">
          In-house AI experiment
        </h1>
        <p className="text-slate-300">
          Base template with React + TypeScript + Vite, ready to iterate on.
        </p>
      </header>

      <section
        aria-labelledby="status-title"
        className="flex flex-col gap-5 rounded-xl border border-white/10 bg-slate-900/60 p-[clamp(1.25rem,2.5vw,2rem)] shadow-2xl"
      >
        <h2
          id="status-title"
          className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-400"
        >
          Environment status
        </h2>

        <dl className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
          {meta.map((item) => (
            <div key={item.label} className="min-w-0 rounded-lg bg-slate-800/60 px-4 py-3">
              <dt className="mb-1 text-[0.7rem] font-medium uppercase tracking-[0.08em] text-slate-400">
                {item.label}
              </dt>
              <dd className="break-words font-semibold">
                {item.mono ? (
                  <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-sm">
                    {item.value}
                  </code>
                ) : (
                  item.value
                )}
              </dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={() => {
            setCount((value) => value + 1);
          }}
          className="self-start rounded-full border border-white/10 bg-gradient-to-br from-indigo-500 to-cyan-500 px-5 py-2 font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Interactions: {count}
        </button>
      </section>
    </div>
  );
}

export default Home;
