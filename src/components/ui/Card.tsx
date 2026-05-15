import type { ReactNode } from 'react';

export function Card({
  children,
  className = '',
  as: Tag = 'section',
}: {
  children: ReactNode;
  className?: string;
  as?: 'section' | 'article' | 'div';
}) {
  return (
    <Tag
      className={`flex flex-col gap-4 rounded-xl border border-white/10 bg-slate-900/60 p-[clamp(1rem,2vw,1.5rem)] shadow-lg ${className}`}
    >
      {children}
    </Tag>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-400">{children}</h2>
  );
}

export function CardSubtitle({ children }: { children: ReactNode }) {
  return <p className="text-sm text-slate-400">{children}</p>;
}
