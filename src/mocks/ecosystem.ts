import type { EcosystemServiceSnapshot, MaintenanceWindow } from '@/types/domain';

const minutesAgo = (m: number) => new Date(Date.now() - m * 60 * 1000).toISOString();
const hoursFromNow = (h: number) => new Date(Date.now() + h * 60 * 60 * 1000).toISOString();

export const ecosystemFixture: EcosystemServiceSnapshot[] = [
  {
    key: 'myai',
    name: 'MYAI',
    description: 'Internal LLM gateway powering Maya and feedback classification.',
    status: 'operational',
    lastCheckedAt: minutesAgo(2),
    uptime30d: 0.999,
  },
  {
    key: 'zoho',
    name: 'Zoho Projects',
    description: 'Project of record for customer engagements.',
    status: 'operational',
    lastCheckedAt: minutesAgo(3),
    uptime30d: 0.998,
  },
  {
    key: 'gusto',
    name: 'Gusto',
    description: 'US payroll and benefits provider.',
    status: 'degraded',
    lastCheckedAt: minutesAgo(4),
    uptime30d: 0.985,
    message: 'Higher latency reported on tax filing endpoints.',
  },
  {
    key: 'deel',
    name: 'Deel',
    description: 'International contractor management.',
    status: 'operational',
    lastCheckedAt: minutesAgo(2),
    uptime30d: 0.997,
  },
  {
    key: 'sharepoint',
    name: 'SharePoint',
    description: 'Document storage with signed URLs.',
    status: 'maintenance',
    lastCheckedAt: minutesAgo(10),
    uptime30d: 0.994,
    message: 'Scheduled maintenance until 18:00 UTC.',
  },
  {
    key: 'teams',
    name: 'Microsoft Teams',
    description: 'Corporate notifications channel.',
    status: 'operational',
    lastCheckedAt: minutesAgo(1),
    uptime30d: 0.999,
  },
  {
    key: 'canvas',
    name: 'Project Canvas',
    description: 'Glue object linking Zoho, contracts, and SharePoint.',
    status: 'down',
    lastCheckedAt: minutesAgo(6),
    uptime30d: 0.972,
    message: 'Sync worker is restarting after a deploy.',
  },
];

export const maintenanceWindowsFixture: MaintenanceWindow[] = [
  {
    id: 'maint-001',
    serviceKey: 'sharepoint',
    title: 'SharePoint signing keys rotation',
    startsAt: hoursFromNow(-2),
    endsAt: hoursFromNow(2),
    description: 'Rotation of the signing keys used for short-lived document URLs.',
  },
  {
    id: 'maint-002',
    serviceKey: 'myai',
    title: 'MYAI gateway upgrade',
    startsAt: hoursFromNow(48),
    endsAt: hoursFromNow(50),
    description: 'Rolling upgrade of the MYAI gateway. No downtime expected.',
  },
];
