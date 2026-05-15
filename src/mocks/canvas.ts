import type { CanvasEntry } from '@/types/domain';

const minutesAgo = (m: number) => new Date(Date.now() - m * 60 * 1000).toISOString();

export const canvasFixtureByEmployee: Record<string, CanvasEntry> = {
  'emp-001': {
    employeeId: 'emp-001',
    zohoProjectId: 'ZP-4821',
    contractId: 'CT-9801',
    sharePointFolderId: 'SP-folder-ana-reyes',
    lastSyncedAt: minutesAgo(12),
  },
  'emp-002': {
    employeeId: 'emp-002',
    zohoProjectId: 'ZP-4822',
    contractId: 'CT-9802-OLD',
    sharePointFolderId: 'SP-folder-luis-hernandez',
    lastSyncedAt: minutesAgo(8),
    drift: [
      {
        field: 'contractId',
        canvasValue: 'CT-9802-OLD',
        appValue: 'CT-9802',
      },
    ],
  },
  'emp-003': {
    employeeId: 'emp-003',
    zohoProjectId: 'ZP-4823',
    contractId: 'CT-9803',
    sharePointFolderId: 'SP-folder-sofia-martin',
    lastSyncedAt: minutesAgo(45),
  },
  'emp-004': {
    employeeId: 'emp-004',
    zohoProjectId: 'ZP-4824',
    contractId: 'CT-9804',
    sharePointFolderId: 'SP-folder-marco-bianchi-LEGACY',
    lastSyncedAt: minutesAgo(60),
    drift: [
      {
        field: 'sharePointFolderId',
        canvasValue: 'SP-folder-marco-bianchi-LEGACY',
        appValue: 'SP-folder-marco-bianchi',
      },
    ],
  },
};
