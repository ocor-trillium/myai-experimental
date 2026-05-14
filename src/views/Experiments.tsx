type Experiment = {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'planned' | 'archived';
  owner: string;
};

const experiments: Experiment[] = [
  {
    id: 'exp-001',
    name: 'Prompt routing',
    description: 'Route user prompts to the cheapest model that meets quality thresholds.',
    status: 'running',
    owner: 'Platform · AI',
  },
  {
    id: 'exp-002',
    name: 'Embedding cache',
    description: 'Memoize embeddings for repeat documents to cut latency and cost.',
    status: 'planned',
    owner: 'Search',
  },
  {
    id: 'exp-003',
    name: 'PII redactor',
    description: 'Strip PII from prompts before they reach any external provider.',
    status: 'running',
    owner: 'Security',
  },
  {
    id: 'exp-004',
    name: 'Eval harness',
    description: 'Track regressions across prompts with automated evals on every release.',
    status: 'planned',
    owner: 'Platform · AI',
  },
  {
    id: 'exp-005',
    name: 'Legacy summarizer',
    description: 'Original summarization pipeline kept around for benchmarking.',
    status: 'archived',
    owner: 'Knowledge',
  },
];

const statusStyles: Record<Experiment['status'], string> = {
  running: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30',
  planned: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30',
  archived: 'bg-slate-500/15 text-slate-300 ring-1 ring-slate-400/30',
};

function Experiments() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Experiments</h1>
        <p className="text-slate-300">
          Mock list of experiments to validate the layout. Replace with the real registry once the
          backend is ready.
        </p>
      </header>

      <ul className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
        {experiments.map((exp) => (
          <li
            key={exp.id}
            className="flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-900/60 p-5 shadow-lg transition hover:-translate-y-0.5 hover:border-white/20"
          >
            <div className="flex items-center justify-between gap-2">
              <code className="text-xs text-slate-400">{exp.id}</code>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${statusStyles[exp.status]}`}
              >
                {exp.status}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-white">{exp.name}</h2>
            <p className="text-sm leading-relaxed text-slate-300">{exp.description}</p>
            <p className="mt-auto text-xs text-slate-400">Owner: {exp.owner}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Experiments;
