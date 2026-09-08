import { describe, expect, it } from 'vitest';
import {
  AIApplyFailureKind,
  AIApplyRunStatus,
  type AIApplyApplication,
} from '../types/aiApplyModels';
import { getAIApplyAttentionKind, isHandoffAttention } from './aiApplyActions';

const application = (
  status: AIApplyRunStatus,
  failureKind = AIApplyFailureKind.None,
): AIApplyApplication => ({
  id: 'application-id',
  jobId: 'job-id',
  status,
  priority: 0,
  scheduledAtUtc: '',
  startedAtUtc: null,
  completedAtUtc: null,
  retryCount: 0,
  failureKind,
  requiresUserInput: false,
  matchScore: null,
  createdAtUtc: '',
});

describe('AI Apply candidate action policy', () => {
  it.each([
    [AIApplyFailureKind.LoginRequired, 'login'],
    [AIApplyFailureKind.HumanVerificationRequired, 'verification'],
    [AIApplyFailureKind.SubmissionUnconfirmed, 'review'],
    [AIApplyFailureKind.Duplicate, 'duplicate'],
    [AIApplyFailureKind.JobExpired, 'expired'],
  ] as const)('maps failure %s to %s without offering a frontend retry', (failure, expected) => {
    const value = application(AIApplyRunStatus.Failed, failure);
    expect(getAIApplyAttentionKind(value)).toBe(expected);
    expect(isHandoffAttention(value)).toBe(['login', 'verification', 'review'].includes(expected));
  });

  it('treats NeedsReview as submission review rather than success', () => {
    expect(getAIApplyAttentionKind(application(AIApplyRunStatus.NeedsReview))).toBe('review');
  });
});
