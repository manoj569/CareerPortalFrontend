import { AIApplyFailureKind, AIApplyRunStatus } from '../types/aiApplyModels';

export type AIApplyStatusTone = 'default' | 'info' | 'warning' | 'success' | 'error';
const statuses: Record<
  AIApplyRunStatus,
  { label: string; description: string; tone: AIApplyStatusTone }
> = {
  [AIApplyRunStatus.Queued]: {
    label: 'Queued',
    description: 'This application is waiting to be processed.',
    tone: 'info',
  },
  [AIApplyRunStatus.Processing]: {
    label: 'Applying',
    description: 'Career Harbor is currently working on this application.',
    tone: 'info',
  },
  [AIApplyRunStatus.WaitingForUser]: {
    label: 'Needs your input',
    description: 'Career Harbor needs information from you before it can continue.',
    tone: 'warning',
  },
  [AIApplyRunStatus.Submitted]: {
    label: 'Submitted',
    description: 'Career Harbor confirmed that this application was submitted successfully.',
    tone: 'success',
  },
  [AIApplyRunStatus.Failed]: {
    label: 'Could not complete',
    description: 'Career Harbor could not safely complete this application.',
    tone: 'error',
  },
  [AIApplyRunStatus.Skipped]: {
    label: 'Skipped',
    description: 'This application was not continued.',
    tone: 'default',
  },
  [AIApplyRunStatus.Expired]: {
    label: 'Job closed',
    description: 'This job is no longer accepting applications.',
    tone: 'default',
  },
  [AIApplyRunStatus.Cancelled]: {
    label: 'Cancelled',
    description: 'Processing for this application was cancelled.',
    tone: 'default',
  },
  [AIApplyRunStatus.DeadLettered]: {
    label: 'Could not complete',
    description: 'Career Harbor could not safely complete this application.',
    tone: 'error',
  },
  [AIApplyRunStatus.NeedsReview]: {
    label: 'Needs review',
    description: 'Career Harbor could not safely confirm the final submission and needs review.',
    tone: 'warning',
  },
};
const failures: Record<AIApplyFailureKind, string | null> = {
  [AIApplyFailureKind.None]: null,
  [AIApplyFailureKind.JobExpired]: 'This job is no longer accepting applications.',
  [AIApplyFailureKind.ApplicationUnavailable]: 'The application form is no longer available.',
  [AIApplyFailureKind.LoginRequired]:
    'You need to sign in to the external job site before Career Harbor can continue.',
  [AIApplyFailureKind.HumanVerificationRequired]:
    'The job site requires a manual verification step.',
  [AIApplyFailureKind.WebsiteError]:
    'The job site was unavailable while Career Harbor was applying.',
  [AIApplyFailureKind.FieldMappingError]:
    'Career Harbor could not safely complete this application form.',
  [AIApplyFailureKind.MissingUserInformation]:
    'Additional profile information is required before this application can continue.',
  [AIApplyFailureKind.Timeout]: 'The job site did not respond in time.',
  [AIApplyFailureKind.Duplicate]: 'Career Harbor detected that you have already applied.',
  [AIApplyFailureKind.Unknown]: 'Career Harbor could not safely complete this application.',
  [AIApplyFailureKind.RequiredUserDeclaration]:
    'A declaration requires your review before this application can continue.',
  [AIApplyFailureKind.SubmissionUnconfirmed]:
    'Career Harbor could not confirm whether this application was submitted.',
  [AIApplyFailureKind.UnsupportedApplicationFlow]:
    'Career Harbor could not safely complete this application automatically.',
  [AIApplyFailureKind.OperationalLimitExceeded]:
    'This application could not be processed at this time.',
};
export const getAIApplyStatus = (status: AIApplyRunStatus) =>
  statuses[status] ?? statuses[AIApplyRunStatus.Failed];
export const getAIApplyFailureMessage = (kind: AIApplyFailureKind) =>
  failures[kind] ?? failures[AIApplyFailureKind.Unknown];
export const canCancelAIApplyApplication = (status: AIApplyRunStatus) =>
  status === AIApplyRunStatus.Queued || status === AIApplyRunStatus.WaitingForUser;
export const isActiveAIApplyStatus = (status: AIApplyRunStatus) =>
  status === AIApplyRunStatus.Queued || status === AIApplyRunStatus.Processing;
