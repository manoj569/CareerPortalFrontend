// Contracts: AdminJobSourcesController / JobSourceManagementDtos / JobSourceRunResult.
export enum AtsType {
  Custom = 0,
  Greenhouse = 1,
  Lever = 2,
  Ashby = 3,
  SuccessFactors = 4,
  Workday = 5,
  SmartRecruiters = 7,
  RippleHire = 8,
}

export interface JobSourceConnectionResult {
  provider: AtsType;
  configurationValid: boolean;
  providerReachable: boolean;
  listingReachable: boolean;
  reasonCode: string;
  message: string;
  statusCode?: number | null;
}

export interface SaveJobSourceRequest {
  companyId: string;
  careerPageUrl: string;
  atsType: AtsType;
  atsIdentifier: string | null;
  isActive: boolean;
  autoPublishEnabled: boolean;
  scanIntervalMinutes: number;
}

export interface JobSource extends SaveJobSourceRequest {
  id: string;
  companyName: string;
  lastRunAtUtc: string | null;
  lastSuccessfulRunAtUtc: string | null;
  lastError: string | null;
  consecutiveFailures: number;
  categoryId: string | null;
  categoryName: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
}

export interface JobSourceRunResult {
  jobSourceId: string;
  totalReceived: number;
  created: number;
  matched: number;
  updated?: number;
  skipped: number;
  failed: number;
  succeeded: boolean;
  error: string | null;
  parsed?: number;
  published?: number;
  existing?: number;
  rejected?: number;
  reconciliationSafe?: boolean;
  failureReasonCode?: string | null;
  failureStage?: string | null;
  stopReason?: string | null;
}

export const jobSourceRunStatuses = [
  'Queued',
  'Running',
  'Interrupted',
  'Paused',
  'Succeeded',
  'Failed',
  'Unsafe',
  'Cancelled',
] as const;
export type JobSourceRunStatus = (typeof jobSourceRunStatuses)[number];

export interface DurableJobSourceRun extends JobSourceRunResult {
  runId: string;
  status: JobSourceRunStatus;
  statusUrl: string;
  retryPending: boolean;
  completedAtUtc: string | null;
  attemptCount: number;
  diagnostics?: Partial<JobSourceRunResult> | null;
}

// retryPending describes backend recovery eligibility, not a live execution.
// Interrupted monitoring ends; an explicit Run Now can safely reattach via POST.
// Paused remains active for the existing Workday continuation workflow.
export const isActiveJobSourceRun = (run: DurableJobSourceRun) =>
  run.status === 'Queued' ||
  run.status === 'Running' ||
  run.status === 'Paused';
