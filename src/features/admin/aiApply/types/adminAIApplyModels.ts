export enum AdminAIApplyRunStatus {
  Queued = 1,
  Processing,
  WaitingForUser,
  Submitted,
  Failed,
  Skipped,
  Expired,
  Cancelled,
  DeadLettered,
  NeedsReview,
}

export enum AdminAIApplySite {
  Generic = 0,
  Greenhouse,
  Lever,
  Ashby,
  SmartRecruiters,
  Workday,
  LinkedIn,
  Naukri,
  Indeed,
  Foundit,
  Wellfound,
}

export enum AdminAIApplySiteHealth {
  Healthy = 1,
  Degraded,
  Failing,
  Disabled,
  Unknown,
}

export interface AdminAIApplyPeriodQuery {
  from?: string;
  to?: string;
}
export interface AdminAIApplyOverview {
  queued: number;
  processing: number;
  waitingForUser: number;
  submitted: number;
  failed: number;
  deadLettered: number;
  submissionUnconfirmed: number;
  activeWorkers: number;
  browserExecutionSeconds: number;
  estimatedCost: number;
}
export interface AdminAIApplyApplication {
  id: string;
  status: AdminAIApplyRunStatus;
  retryCount: number;
  failureCode: string | null;
  failureClassification: string | null;
  firstFailureAtUtc: string | null;
  lastFailureAtUtc: string | null;
  deadLetteredAtUtc: string | null;
  createdAtUtc: string;
}
export interface AdminAIApplyApplicationsPage {
  items: AdminAIApplyApplication[];
  page: number;
  pageSize: number;
  total: number;
}
export interface AdminAIApplyApplicationsQuery extends AdminAIApplyPeriodQuery {
  status?: AdminAIApplyRunStatus;
  failureCode?: string;
  page?: number;
  pageSize?: number;
}
export interface AdminAIApplyFailure {
  failureCode: string;
  failureClassification: string | null;
  count: number;
  lastFailureAtUtc: string | null;
}
export interface AdminAIApplySiteStatus {
  site: AdminAIApplySite;
  health: AdminAIApplySiteHealth;
}
export interface AdminAIApplyWorker {
  workerId: string;
  startedAtUtc: string;
  lastHeartbeatAtUtc: string;
  activeExecutions: number;
  status: string;
}
export interface AdminAIApplyCostTotals {
  aiRequests: number;
  inputTokens: number;
  outputTokens: number;
  browserSeconds: number;
  proxyCost: number;
  estimatedCost: number;
}
export interface AdminAIApplyCosts {
  totals: AdminAIApplyCostTotals | null;
  confirmedSubmissions: number;
  costPerConfirmedApplication: number | null;
}
export interface AdminAIApplyRequeueResponse {
  id: string;
  status: AdminAIApplyRunStatus;
}
export interface AdminAIApplyCircuitResponse {
  site: AdminAIApplySite;
  circuitState: 'Open' | 'Closed';
}
