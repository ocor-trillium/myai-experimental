const stack = [
  { name: 'React', detail: 'UI library, v18 with Strict Mode' },
  { name: 'TypeScript', detail: 'Strict typing across the codebase' },
  { name: 'Vite', detail: 'Dev server with HMR + production bundler' },
  { name: 'Tailwind CSS', detail: 'Utility-first styling, v4 with native Vite plugin' },
  { name: 'React Router', detail: 'Client-side routing' },
  { name: 'nginx', detail: 'Hardened static runtime, served as non-root in production' },
];

const principles = [
  'Treat anything shipped to the browser as public — secrets stay in the backend.',
  'Pin dependencies and ship reproducible builds from the lockfile.',
  'Default to secure headers, strict CSP, no source maps in public assets.',
  'Iterate fast: small, well-typed components and utilities.',
];

function About() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">About</h1>
        <p className="text-slate-300">
          A minimal sandbox for Trillium&apos;s in-house AI work. The goal is to keep the surface
          tiny while staying production-ready.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-400">
          Tech stack
        </h2>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
          {stack.map((item) => (
            <li
              key={item.name}
              className="rounded-lg border border-white/10 bg-slate-900/60 px-4 py-3"
            >
              <p className="font-semibold text-white">{item.name}</p>
              <p className="text-sm text-slate-300">{item.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-400">
          Principles
        </h2>
        <ul className="flex flex-col gap-2">
          {principles.map((p) => (
            <li
              key={p}
              className="rounded-lg border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-slate-200"
            >
              {p}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default About;
