import { describe, expect, it } from 'vitest';
import {
  AdminAIApplyRunStatus,
  AdminAIApplySite,
  AdminAIApplySiteHealth,
} from '../types/adminAIApplyModels';
import {
  canOfferRequeue,
  failureDescription,
  runStatusLabel,
  siteHealthLabel,
  siteLabel,
} from './adminAIApplyStatus';

describe('admin AI Apply operational mappings', () => {
  it('preserves exact operational status wording', () => {
    expect(runStatusLabel(AdminAIApplyRunStatus.DeadLettered)).toBe('Dead Lettered');
    expect(runStatusLabel(AdminAIApplyRunStatus.NeedsReview)).toBe('Needs Review');
    expect(runStatusLabel(AdminAIApplyRunStatus.WaitingForUser)).toBe('Waiting for user');
  });

  it('only offers frontend requeue for dead-lettered work', () => {
    expect(canOfferRequeue(AdminAIApplyRunStatus.DeadLettered)).toBe(true);
    expect(canOfferRequeue(AdminAIApplyRunStatus.NeedsReview)).toBe(false);
    expect(canOfferRequeue(AdminAIApplyRunStatus.Submitted)).toBe(false);
    expect(canOfferRequeue(AdminAIApplyRunStatus.Processing)).toBe(false);
  });

  it('maps exact site and health enum values', () => {
    expect(siteLabel(AdminAIApplySite.Greenhouse)).toBe('Greenhouse');
    expect(siteHealthLabel(AdminAIApplySiteHealth.Failing)).toBe('Failing');
    expect(siteHealthLabel(AdminAIApplySiteHealth.Unknown)).toBe('Unknown');
  });

  it('explains sensitive failure classes without raw exception content', () => {
    expect(failureDescription('SubmissionUnconfirmed')).toContain(
      'confirmation was not established',
    );
    expect(failureDescription('OperationalLimitExceeded')).toContain('guardrails');
    expect(failureDescription('System.Exception: secret')).toBe(
      'Backend-classified operational failure.',
    );
  });
});
