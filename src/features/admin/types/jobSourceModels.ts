// Contracts: AdminJobSourcesController / JobSourceManagementDtos / JobSourceRunResult.
export enum AtsType {
  Custom = 0,
  Greenhouse = 1,
  Lever = 2,
  Ashby = 3,
  SuccessFactors = 4,
}

export interface SaveJobSourceRequest {
  companyId: string;
  careerPageUrl: string;
  atsType: AtsType;
  atsIdentifier: string | null;
  isActive: boolean;
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
}
