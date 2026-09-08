import { describe, expect, it } from 'vitest';
import { AIApplyFailureKind, AIApplyRunStatus } from '../types/aiApplyModels';
import {
  canCancelAIApplyApplication,
  getAIApplyFailureMessage,
  getAIApplyStatus,
  isActiveAIApplyStatus,
} from './aiApplyStatus';

describe('candidate-facing AI Apply statuses', () => {
  it('keeps confirmed submission distinct from review', () => {
    expect(getAIApplyStatus(AIApplyRunStatus.Submitted).label).toBe('Submitted');
    expect(getAIApplyStatus(AIApplyRunStatus.NeedsReview).label).toBe('Needs review');
    expect(getAIApplyStatus(AIApplyRunStatus.NeedsReview).description).not.toMatch(
      /submitted successfully/i,
    );
  });

  it.each([
    [AIApplyFailureKind.JobExpired, 'no longer accepting'],
    [AIApplyFailureKind.Duplicate, 'already applied'],
    [AIApplyFailureKind.LoginRequired, 'sign in'],
    [AIApplyFailureKind.HumanVerificationRequired, 'manual verification'],
    [AIApplyFailureKind.SubmissionUnconfirmed, 'could not confirm'],
  ])('maps failure %s to safe copy', (failure, text) =>
    expect(getAIApplyFailureMessage(failure)).toContain(text),
  );

  it('allows cancellation and polling only for supported states', () => {
    expect(canCancelAIApplyApplication(AIApplyRunStatus.Queued)).toBe(true);
    expect(canCancelAIApplyApplication(AIApplyRunStatus.WaitingForUser)).toBe(true);
    expect(canCancelAIApplyApplication(AIApplyRunStatus.Submitted)).toBe(false);
    expect(isActiveAIApplyStatus(AIApplyRunStatus.Processing)).toBe(true);
    expect(isActiveAIApplyStatus(AIApplyRunStatus.Failed)).toBe(false);
  });
});
