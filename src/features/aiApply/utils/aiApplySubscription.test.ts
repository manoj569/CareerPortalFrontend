import { describe, expect, it } from 'vitest';
import { AIApplyPlanTier, type AIApplyAccess, type MembershipPlan } from '../types/aiApplyModels';
import { getPlanActionLabel, isAIApplyPlan, isExpiringSoon } from './aiApplySubscription';

const access = (overrides: Partial<AIApplyAccess> = {}): AIApplyAccess => ({
  subscriptionActive: true,
  subscriptionExpired: false,
  tier: AIApplyPlanTier.Standard,
  canUseAIApply: true,
  canUseAIApplyPro: false,
  planCode: 'AIApply',
  subscriptionStatus: 2,
  startsAt: '2026-09-01T00:00:00Z',
  expiresAt: '2026-10-01T00:00:00Z',
  canUseStandardMembership: true,
  canUseAIGeneratedAnswers: false,
  canUseAdvancedMatching: false,
  canUseTailoredApplicationContent: false,
  processingPriority: 1,
  ...overrides,
});
const plan = (overrides: Partial<MembershipPlan> = {}): MembershipPlan => ({
  planCode: 'AIApply',
  displayName: 'AI Apply',
  price: 1234,
  currency: 'INR',
  durationDays: 30,
  canUseStandardMembership: true,
  canUseAIApply: true,
  canUseAIApplyPro: false,
  ...overrides,
});

describe('AI Apply subscription presentation policy', () => {
  it('filters plans by backend AI Apply capability rather than price or name', () => {
    expect(isAIApplyPlan(plan())).toBe(true);
    expect(isAIApplyPlan(plan({ planCode: 'Other', canUseAIApply: false }))).toBe(false);
  });
  it('uses backend plan identity for renew and upgrade actions', () => {
    expect(getPlanActionLabel(plan(), access())).toBe('Renew AI Apply');
    expect(
      getPlanActionLabel(
        plan({ planCode: 'AIApplyPro', displayName: 'AI Apply Pro', canUseAIApplyPro: true }),
        access(),
      ),
    ).toBe('Upgrade to AI Apply Pro');
  });
  it('uses the named five-day threshold without treating expired access as expiring', () => {
    const now = Date.parse('2026-09-03T00:00:00Z');
    expect(isExpiringSoon(access({ expiresAt: '2026-09-07T00:00:00Z' }), now)).toBe(true);
    expect(
      isExpiringSoon(
        access({
          subscriptionActive: false,
          subscriptionExpired: true,
          expiresAt: '2026-09-02T00:00:00Z',
        }),
        now,
      ),
    ).toBe(false);
  });
});
