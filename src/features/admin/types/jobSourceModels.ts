// Contracts: AdminJobSourcesController / JobSourceManagementDtos / JobSourceRunResult.
export enum AtsType {
  Custom = 0,
  Greenhouse = 1,
  Lever = 2,
  Ashby = 3,
  SuccessFactors = 4,
  Workday = 5,
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

export const isActiveJobSourceRun = (run: DurableJobSourceRun) =>
  run.status === 'Queued' ||
  run.status === 'Running' ||
  run.status === 'Paused' ||
  (run.status === 'Interrupted' && run.retryPending);
