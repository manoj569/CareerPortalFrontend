import type { ChipProps } from '@mui/material';
import {
  AdminAIApplyRunStatus,
  AdminAIApplySite,
  AdminAIApplySiteHealth,
} from '../types/adminAIApplyModels';

export const runStatusLabel = (status: AdminAIApplyRunStatus): string =>
  ({
    [AdminAIApplyRunStatus.Queued]: 'Queued',
    [AdminAIApplyRunStatus.Processing]: 'Processing',
    [AdminAIApplyRunStatus.WaitingForUser]: 'Waiting for user',
    [AdminAIApplyRunStatus.Submitted]: 'Submitted',
    [AdminAIApplyRunStatus.Failed]: 'Failed',
    [AdminAIApplyRunStatus.Skipped]: 'Skipped',
    [AdminAIApplyRunStatus.Expired]: 'Expired',
    [AdminAIApplyRunStatus.Cancelled]: 'Cancelled',
    [AdminAIApplyRunStatus.DeadLettered]: 'Dead Lettered',
    [AdminAIApplyRunStatus.NeedsReview]: 'Needs Review',
  })[status] ?? 'Unknown';

export const runStatusColor = (status: AdminAIApplyRunStatus): ChipProps['color'] =>
  status === AdminAIApplyRunStatus.Submitted
    ? 'success'
    : status === AdminAIApplyRunStatus.DeadLettered || status === AdminAIApplyRunStatus.Failed
      ? 'error'
      : status === AdminAIApplyRunStatus.NeedsReview ||
          status === AdminAIApplyRunStatus.WaitingForUser
        ? 'warning'
        : status === AdminAIApplyRunStatus.Processing
          ? 'info'
          : 'default';

export const siteLabel = (site: AdminAIApplySite): string => AdminAIApplySite[site] ?? 'Unknown';
export const siteHealthLabel = (health: AdminAIApplySiteHealth): string =>
  AdminAIApplySiteHealth[health] ?? 'Unknown';
export const canOfferRequeue = (status: AdminAIApplyRunStatus): boolean =>
  status === AdminAIApplyRunStatus.DeadLettered;

export const failureDescription = (classification: string | null): string =>
  ({
    Transient: 'A temporary operational failure.',
    Permanent: 'A non-retryable application failure.',
    UserActionRequired: 'Candidate action is required.',
    SiteUnavailable: 'The external site is unavailable.',
    UnsupportedFlow: 'The external application flow is unsupported.',
    HumanVerificationRequired: 'Candidate human verification is required.',
    AuthenticationRequired: 'Candidate authentication is required.',
    SubscriptionUnavailable: 'The candidate subscription is unavailable.',
    Cancelled: 'Processing was cancelled.',
    SubmissionUnconfirmed: 'Submission was attempted but confirmation was not established.',
    InternalFailure: 'An internal operational failure occurred.',
    OperationalLimitExceeded: 'Configured AI Apply operational guardrails were exceeded.',
  })[classification ?? ''] ?? 'Backend-classified operational failure.';
