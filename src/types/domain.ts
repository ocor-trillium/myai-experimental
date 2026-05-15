/**
 * Domain types for the Trillium onboarding app.
 *
 * These mirror the entities described in the OnboardingContext document.
 * Keep them small and serializable; they will eventually map 1:1 to the
 * REST/GraphQL contracts of MYAI and the Project Canvas.
 */

export type Role = 'employee' | 'manager' | 'admin';

export type OnboardingPhaseId = 'discovery' | 'setup' | 'access' | 'integration';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export type EmployeeStatus = 'pending' | 'in_progress' | 'completed' | 'at_risk';

export type ToolKey = 'jira' | 'gitlab' | 'slack' | 'teams' | 'gusto' | 'deel' | 'zoho';

export type ProvisioningStatus = 'pending' | 'approved' | 'provisioning' | 'active' | 'failed';

export type EcosystemStatus = 'operational' | 'degraded' | 'down' | 'maintenance';

export type FeedbackCategory = 'bug' | 'feature_request' | 'question' | 'unclassified';

export type ChatRole = 'maya' | 'user' | 'system';

export type AdaptiveCardFieldKind = 'text' | 'email' | 'phone' | 'employee_id' | 'select';

export type SignedUrlScope = 'document' | 'avatar' | 'export';

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

export type Employee = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  team: string;
  startDate: string; // ISO 8601
  managerId?: string;
  zohoProjectId?: string;
  contractId?: string;
  sharePointFolderId?: string;
  status: EmployeeStatus;
  currentPhase: OnboardingPhaseId;
  avatarColor: string;
};

// ---------------------------------------------------------------------------
// Onboarding progress
// ---------------------------------------------------------------------------

export type OnboardingTask = {
  id: string;
  phaseId: OnboardingPhaseId;
  title: string;
  description: string;
  status: TaskStatus;
  estimatedHours: number;
  actualHours?: number;
  completedAt?: string;
  blockerReason?: string;
};

export type OnboardingPhase = {
  id: OnboardingPhaseId;
  name: string;
  description: string;
  order: 1 | 2 | 3 | 4;
};

export type EmployeeProgress = {
  employeeId: string;
  phases: OnboardingPhase[];
  tasks: OnboardingTask[];
  startedAt: string;
  estimatedCompletionAt: string;
};

// ---------------------------------------------------------------------------
// History (transparency log)
// ---------------------------------------------------------------------------

export type HistoryEvent = {
  id: string;
  employeeId: string;
  timestamp: string;
  /** Plain-language summary, never raw technical jargon. Required by OB-03. */
  summary: string;
  /** Why this happened, in plain language. */
  reason: string;
  source: 'maya' | 'manager' | 'system' | 'integration';
  relatedTool?: ToolKey;
};

// ---------------------------------------------------------------------------
// Maya chat (OB-02)
// ---------------------------------------------------------------------------

export type AdaptiveCardField = {
  id: string;
  label: string;
  kind: AdaptiveCardFieldKind;
  placeholder?: string;
  required: boolean;
  options?: { value: string; label: string }[];
};

export type AdaptiveCard = {
  id: string;
  title: string;
  description?: string;
  submitLabel: string;
  fields: AdaptiveCardField[];
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  timestamp: string;
  card?: AdaptiveCard;
  cardSubmittedValues?: Record<string, string>;
};

// ---------------------------------------------------------------------------
// Tools provisioning (OB-05)
// ---------------------------------------------------------------------------

export type ToolDefinition = {
  key: ToolKey;
  name: string;
  description: string;
  /** Roles eligible to receive this tool by default. */
  defaultRoles: string[];
};

export type ToolGrant = {
  id: string;
  employeeId: string;
  tool: ToolKey;
  status: ProvisioningStatus;
  requestedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  failureReason?: string;
};

// ---------------------------------------------------------------------------
// Ecosystem health (OB-06)
// ---------------------------------------------------------------------------

export type EcosystemServiceSnapshot = {
  key: string;
  name: string;
  description: string;
  status: EcosystemStatus;
  lastCheckedAt: string;
  uptime30d: number; // 0..1
  message?: string;
};

export type MaintenanceWindow = {
  id: string;
  serviceKey: string;
  title: string;
  startsAt: string;
  endsAt: string;
  description: string;
};

// ---------------------------------------------------------------------------
// Feedback (OB-07)
// ---------------------------------------------------------------------------

export type FeedbackItem = {
  id: string;
  submittedBy: string;
  submittedAt: string;
  text: string;
  category: FeedbackCategory;
  /** Confidence of the auto-classifier, 0..1. */
  confidence: number;
  notifiedTeamsChannel?: string;
  notifiedAt?: string;
};

// ---------------------------------------------------------------------------
// Project Canvas (OB-08)
// ---------------------------------------------------------------------------

export type CanvasEntry = {
  employeeId: string;
  zohoProjectId: string;
  contractId: string;
  sharePointFolderId: string;
  lastSyncedAt: string;
  /** Diff against the in-app value, populated by the sync routine. */
  drift?: {
    field: 'zohoProjectId' | 'contractId' | 'sharePointFolderId';
    canvasValue: string;
    appValue: string;
  }[];
};

// ---------------------------------------------------------------------------
// Signed URLs (security: 1h TTL per OnboardingContext)
// ---------------------------------------------------------------------------

export type SignedUrl = {
  url: string;
  scope: SignedUrlScope;
  expiresAt: string;
};
