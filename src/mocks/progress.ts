import type {
  EmployeeProgress,
  OnboardingPhase,
  OnboardingPhaseId,
  OnboardingTask,
  TaskStatus,
} from '@/types/domain';

export const phasesFixture: OnboardingPhase[] = [
  {
    id: 'discovery',
    name: 'Discovery',
    description: 'Get to know the company, the team, and the role expectations.',
    order: 1,
  },
  {
    id: 'setup',
    name: 'Setup',
    description: 'Workstation, accounts, and identity provisioning.',
    order: 2,
  },
  {
    id: 'access',
    name: 'Access',
    description: 'Tooling and repositories needed to start contributing.',
    order: 3,
  },
  {
    id: 'integration',
    name: 'Integration',
    description: 'First commits, first reviews, and team rituals.',
    order: 4,
  },
];

type TaskSeed = {
  phaseId: OnboardingPhaseId;
  title: string;
  description: string;
  estimatedHours: number;
  status: TaskStatus;
  actualHours?: number;
  blockerReason?: string;
  daysAgo?: number;
};

const seedsByEmployee: Record<string, TaskSeed[]> = {
  'emp-001': [
    {
      phaseId: 'discovery',
      title: 'Welcome session with Maya',
      description: 'Conversational intro to gather profile data without forms.',
      estimatedHours: 1,
      actualHours: 1,
      status: 'completed',
      daysAgo: 3,
    },
    {
      phaseId: 'discovery',
      title: 'Read the company handbook',
      description: 'Mission, values, and operating principles.',
      estimatedHours: 2,
      actualHours: 2,
      status: 'completed',
      daysAgo: 3,
    },
    {
      phaseId: 'setup',
      title: 'Workstation provisioning',
      description: 'Laptop encryption, MDM enrollment, and password manager.',
      estimatedHours: 3,
      actualHours: 3,
      status: 'completed',
      daysAgo: 2,
    },
    {
      phaseId: 'setup',
      title: 'SSO + MFA enrollment',
      description: 'Identity provider and required factors.',
      estimatedHours: 1,
      status: 'in_progress',
    },
    {
      phaseId: 'access',
      title: 'Repository access (GitLab)',
      description: 'Clone the platform monorepo and run a build.',
      estimatedHours: 2,
      status: 'pending',
    },
    {
      phaseId: 'access',
      title: 'Slack channels',
      description: 'Auto-join the team channels assigned to the role.',
      estimatedHours: 0.5,
      status: 'pending',
    },
    {
      phaseId: 'integration',
      title: 'First pull request',
      description: 'A small docs fix to validate the full workflow.',
      estimatedHours: 4,
      status: 'pending',
    },
  ],
  'emp-002': [
    {
      phaseId: 'discovery',
      title: 'Welcome session with Maya',
      description: 'Conversational intro.',
      estimatedHours: 1,
      actualHours: 1,
      status: 'completed',
      daysAgo: 8,
    },
    {
      phaseId: 'setup',
      title: 'Workstation provisioning',
      description: 'Linux laptop, dotfiles bootstrap.',
      estimatedHours: 3,
      actualHours: 4,
      status: 'completed',
      daysAgo: 6,
    },
    {
      phaseId: 'access',
      title: 'BigQuery service account',
      description: 'Read access to the analytics dataset.',
      estimatedHours: 1,
      actualHours: 6,
      status: 'blocked',
      blockerReason: 'Awaiting IAM approval beyond SLA (>4h).',
    },
    {
      phaseId: 'access',
      title: 'Airflow access',
      description: 'Webserver + Composer environment.',
      estimatedHours: 1,
      status: 'pending',
    },
    {
      phaseId: 'integration',
      title: 'First DAG review',
      description: 'Pair with a senior on a small dataset DAG.',
      estimatedHours: 3,
      status: 'pending',
    },
  ],
  'emp-003': [
    {
      phaseId: 'discovery',
      title: 'Welcome session with Maya',
      description: 'Conversational intro.',
      estimatedHours: 1,
      status: 'pending',
    },
    {
      phaseId: 'setup',
      title: 'Workstation provisioning',
      description: 'Designer macOS image with Figma + Linear.',
      estimatedHours: 2,
      status: 'pending',
    },
  ],
  'emp-004': [
    {
      phaseId: 'discovery',
      title: 'Welcome session with Maya',
      description: 'Conversational intro.',
      estimatedHours: 1,
      actualHours: 1,
      status: 'completed',
      daysAgo: 14,
    },
    {
      phaseId: 'setup',
      title: 'Workstation provisioning',
      description: 'Hardened SRE workstation image.',
      estimatedHours: 3,
      actualHours: 3,
      status: 'completed',
      daysAgo: 12,
    },
    {
      phaseId: 'access',
      title: 'Production access (break-glass)',
      description: 'Time-bounded production credentials.',
      estimatedHours: 1,
      actualHours: 1,
      status: 'completed',
      daysAgo: 8,
    },
    {
      phaseId: 'integration',
      title: 'First on-call shadow',
      description: 'Shadow a senior SRE for one rotation.',
      estimatedHours: 8,
      actualHours: 8,
      status: 'completed',
      daysAgo: 1,
    },
  ],
};

function buildTasks(employeeId: string): OnboardingTask[] {
  const seeds = seedsByEmployee[employeeId] ?? [];
  return seeds.map((seed, index) => {
    const completedAt =
      seed.status === 'completed' && seed.daysAgo !== undefined
        ? new Date(Date.now() - seed.daysAgo * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

    const task: OnboardingTask = {
      id: `${employeeId}-task-${String(index + 1).padStart(2, '0')}`,
      phaseId: seed.phaseId,
      title: seed.title,
      description: seed.description,
      status: seed.status,
      estimatedHours: seed.estimatedHours,
    };

    if (seed.actualHours !== undefined) {
      task.actualHours = seed.actualHours;
    }
    if (completedAt !== undefined) {
      task.completedAt = completedAt;
    }
    if (seed.blockerReason !== undefined) {
      task.blockerReason = seed.blockerReason;
    }
    return task;
  });
}

export function buildProgressFor(employeeId: string): EmployeeProgress {
  return {
    employeeId,
    phases: phasesFixture,
    tasks: buildTasks(employeeId),
    startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedCompletionAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  };
}
