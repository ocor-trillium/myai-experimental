import { Link } from 'react-router-dom';

import { Card, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { useRole } from '@/contexts/useRole';
import type { Role } from '@/types/domain';

type Shortcut = { to: string; label: string; description: string };

const shortcutsByRole: Record<Role, Shortcut[]> = {
  employee: [
    { to: '/onboarding', label: 'My onboarding', description: 'See your progress and tasks.' },
    { to: '/maya', label: 'Talk to Maya', description: 'Finish your profile in a chat.' },
    { to: '/history', label: 'My history', description: 'What was done for you and why.' },
    { to: '/ecosystem', label: 'Ecosystem', description: 'Health of every service we depend on.' },
  ],
  manager: [
    { to: '/team', label: 'Team dashboard', description: 'Status of every new hire.' },
    {
      to: '/tools',
      label: 'Tools provisioning',
      description: 'Approve access to Jira, GitLab, Slack…',
    },
    {
      to: '/feedback',
      label: 'Feedback inbox',
      description: 'Auto-classified bugs vs feature requests.',
    },
    { to: '/ecosystem', label: 'Ecosystem', description: 'Service health for the team.' },
  ],
  admin: [
    { to: '/team', label: 'Team dashboard', description: 'All employees across all teams.' },
    { to: '/canvas', label: 'Project Canvas', description: 'Single source of truth and drift.' },
    { to: '/tools', label: 'Tools provisioning', description: 'Org-wide access reviews.' },
    { to: '/feedback', label: 'Feedback inbox', description: 'All feedback channels.' },
  ],
};

const greetingByRole: Record<Role, { title: string; subtitle: string }> = {
  employee: {
    title: 'Welcome to your onboarding.',
    subtitle: 'Maya will walk you through the rest. Open any shortcut below to keep going.',
  },
  manager: {
    title: 'Manager workspace.',
    subtitle: 'Track new hires, approve tools, and follow product feedback in one place.',
  },
  admin: {
    title: 'Admin workspace.',
    subtitle: 'Full visibility over the onboarding flow, the canvas, and the integrations.',
  },
};

function Home() {
  const { role } = useRole();
  const shortcuts = shortcutsByRole[role];
  const greeting = greetingByRole[role];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header className="flex flex-col gap-3 text-center">
        <span className="mx-auto inline-flex rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white">
          Trillium · Onboarding
        </span>
        <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight">
          {greeting.title}
        </h1>
        <p className="text-slate-300">{greeting.subtitle}</p>
      </header>

      <Card>
        <CardTitle>Shortcuts</CardTitle>
        <CardSubtitle>Curated for the current role.</CardSubtitle>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
          {shortcuts.map((shortcut) => (
            <li key={shortcut.to}>
              <Link
                to={shortcut.to}
                className="block h-full rounded-lg border border-white/10 bg-slate-800/60 p-4 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-slate-800"
              >
                <p className="font-semibold text-white">{shortcut.label}</p>
                <p className="text-sm text-slate-300">{shortcut.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export default Home;
