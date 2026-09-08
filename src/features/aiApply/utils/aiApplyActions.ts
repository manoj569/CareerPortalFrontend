import {
  AIApplyFailureKind,
  AIApplyRunStatus,
  type AIApplyApplication,
} from '../types/aiApplyModels';

export type AIApplyAttentionKind =
  'login' | 'verification' | 'review' | 'expired' | 'duplicate' | 'question' | 'none';

export const getAIApplyAttentionKind = (application: AIApplyApplication): AIApplyAttentionKind => {
  if (application.failureKind === AIApplyFailureKind.LoginRequired) return 'login';
  if (application.failureKind === AIApplyFailureKind.HumanVerificationRequired)
    return 'verification';
  if (
    application.status === AIApplyRunStatus.NeedsReview ||
    application.failureKind === AIApplyFailureKind.SubmissionUnconfirmed
  )
    return 'review';
  if (
    application.status === AIApplyRunStatus.Expired ||
    application.failureKind === AIApplyFailureKind.JobExpired
  )
    return 'expired';
  if (application.failureKind === AIApplyFailureKind.Duplicate) return 'duplicate';
  if (application.requiresUserInput || application.status === AIApplyRunStatus.WaitingForUser)
    return 'question';
  return 'none';
};

export const isHandoffAttention = (application: AIApplyApplication) =>
  ['login', 'verification', 'review'].includes(getAIApplyAttentionKind(application));
export const getAIApplyAttentionPriority = (application: AIApplyApplication) =>
  ({ login: 1, verification: 1, question: 2, review: 3, expired: 4, duplicate: 4, none: 5 })[
    getAIApplyAttentionKind(application)
  ];
