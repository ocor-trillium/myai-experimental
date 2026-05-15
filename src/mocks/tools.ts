import type { ToolDefinition, ToolGrant } from '@/types/domain';

export const toolDefinitionsFixture: ToolDefinition[] = [
  {
    key: 'jira',
    name: 'Jira',
    description: 'Issue tracker and sprint planning.',
    defaultRoles: ['Frontend Engineer', 'Data Engineer', 'Product Designer', 'SRE'],
  },
  {
    key: 'gitlab',
    name: 'GitLab',
    description: 'Source code, CI pipelines, container registry.',
    defaultRoles: ['Frontend Engineer', 'Data Engineer', 'SRE'],
  },
  {
    key: 'slack',
    name: 'Slack',
    description: 'Team chat and async communication.',
    defaultRoles: ['Frontend Engineer', 'Data Engineer', 'Product Designer', 'SRE'],
  },
  {
    key: 'teams',
    name: 'Microsoft Teams',
    description: 'Video calls and corporate notifications.',
    defaultRoles: ['Frontend Engineer', 'Data Engineer', 'Product Designer', 'SRE'],
  },
  {
    key: 'gusto',
    name: 'Gusto',
    description: 'US payroll and benefits.',
    defaultRoles: ['Frontend Engineer', 'Data Engineer', 'Product Designer', 'SRE'],
  },
  {
    key: 'deel',
    name: 'Deel',
    description: 'International contracts and payments.',
    defaultRoles: [],
  },
  {
    key: 'zoho',
    name: 'Zoho',
    description: 'Customer projects and timesheets.',
    defaultRoles: ['Frontend Engineer', 'Data Engineer', 'Product Designer', 'SRE'],
  },
];

const minutesAgo = (m: number) => new Date(Date.now() - m * 60 * 1000).toISOString();

export const toolGrantsFixtureByEmployee: Record<string, ToolGrant[]> = {
  'emp-001': [
    {
      id: 'grant-001-jira',
      employeeId: 'emp-001',
      tool: 'jira',
      status: 'active',
      requestedAt: minutesAgo(60 * 24 * 2),
      decidedAt: minutesAgo(60 * 24 * 2 - 30),
      decidedBy: 'mgr-001',
    },
    {
      id: 'grant-001-gitlab',
      employeeId: 'emp-001',
      tool: 'gitlab',
      status: 'pending',
      requestedAt: minutesAgo(60),
    },
    {
      id: 'grant-001-slack',
      employeeId: 'emp-001',
      tool: 'slack',
      status: 'provisioning',
      requestedAt: minutesAgo(20),
      decidedAt: minutesAgo(15),
      decidedBy: 'mgr-001',
    },
  ],
  'emp-002': [
    {
      id: 'grant-002-jira',
      employeeId: 'emp-002',
      tool: 'jira',
      status: 'active',
      requestedAt: minutesAgo(60 * 24 * 6),
      decidedAt: minutesAgo(60 * 24 * 6 - 60),
      decidedBy: 'mgr-002',
    },
    {
      id: 'grant-002-gitlab',
      employeeId: 'emp-002',
      tool: 'gitlab',
      status: 'failed',
      requestedAt: minutesAgo(60 * 8),
      decidedAt: minutesAgo(60 * 8 - 30),
      decidedBy: 'mgr-002',
      failureReason: 'GitLab API returned 503 — retry scheduled.',
    },
  ],
  'emp-003': [],
  'emp-004': [
    {
      id: 'grant-004-jira',
      employeeId: 'emp-004',
      tool: 'jira',
      status: 'active',
      requestedAt: minutesAgo(60 * 24 * 14),
      decidedAt: minutesAgo(60 * 24 * 14 - 30),
      decidedBy: 'mgr-002',
    },
    {
      id: 'grant-004-gitlab',
      employeeId: 'emp-004',
      tool: 'gitlab',
      status: 'active',
      requestedAt: minutesAgo(60 * 24 * 14),
      decidedAt: minutesAgo(60 * 24 * 14 - 30),
      decidedBy: 'mgr-002',
    },
    {
      id: 'grant-004-slack',
      employeeId: 'emp-004',
      tool: 'slack',
      status: 'active',
      requestedAt: minutesAgo(60 * 24 * 14),
      decidedAt: minutesAgo(60 * 24 * 14 - 30),
      decidedBy: 'mgr-002',
    },
  ],
};
