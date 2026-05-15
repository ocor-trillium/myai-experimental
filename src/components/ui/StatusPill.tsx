import type { ReactNode } from 'react';

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-slate-500/15 text-slate-300 ring-1 ring-slate-400/30',
  info: 'bg-indigo-500/15 text-indigo-200 ring-1 ring-indigo-400/30',
  success: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30',
  warning: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30',
  danger: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30',
};

export function StatusPill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
