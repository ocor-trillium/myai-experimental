import type { HistoryEvent } from '@/types/domain';

const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

export const historyFixtureByEmployee: Record<string, HistoryEvent[]> = {
  'emp-001': [
    {
      id: 'hist-001-1',
      employeeId: 'emp-001',
      timestamp: hoursAgo(72),
      summary: 'Maya created your profile in the company directory.',
      reason: 'Required so the rest of the systems can recognize you.',
      source: 'maya',
    },
    {
      id: 'hist-001-2',
      employeeId: 'emp-001',
      timestamp: hoursAgo(48),
      summary: 'Your laptop was paired with the company device manager.',
      reason: 'Lets the IT team push security updates without blocking you.',
      source: 'system',
    },
    {
      id: 'hist-001-3',
      employeeId: 'emp-001',
      timestamp: hoursAgo(24),
      summary: 'A Slack workspace invite was sent to your email.',
      reason: 'Frontend Engineers join Slack from day one to follow the team channels.',
      source: 'integration',
      relatedTool: 'slack',
    },
    {
      id: 'hist-001-4',
      employeeId: 'emp-001',
      timestamp: hoursAgo(2),
      summary: 'Multi-factor authentication is being enrolled.',
      reason: 'Required to access any internal tool. You will receive a push notification.',
      source: 'system',
    },
  ],
  'emp-002': [
    {
      id: 'hist-002-1',
      employeeId: 'emp-002',
      timestamp: hoursAgo(192),
      summary: 'Maya created your profile in the company directory.',
      reason: 'Required so HR and payroll systems can recognize you.',
      source: 'maya',
    },
    {
      id: 'hist-002-2',
      employeeId: 'emp-002',
      timestamp: hoursAgo(96),
      summary: 'Your laptop was provisioned with the data engineering image.',
      reason: 'Includes pre-installed BigQuery CLI and Airflow profiles.',
      source: 'system',
    },
    {
      id: 'hist-002-3',
      employeeId: 'emp-002',
      timestamp: hoursAgo(8),
      summary: 'A request for BigQuery access was sent to the IAM team.',
      reason: 'Read-only access to the analytics dataset is needed for your first task.',
      source: 'integration',
    },
  ],
  'emp-003': [],
  'emp-004': [
    {
      id: 'hist-004-1',
      employeeId: 'emp-004',
      timestamp: hoursAgo(360),
      summary: 'Maya created your profile in the company directory.',
      reason: 'Required so the rest of the systems can recognize you.',
      source: 'maya',
    },
    {
      id: 'hist-004-2',
      employeeId: 'emp-004',
      timestamp: hoursAgo(192),
      summary: 'Time-bounded production credentials were issued.',
      reason: 'SREs need break-glass access from week one. Credentials expire automatically.',
      source: 'system',
    },
  ],
};
