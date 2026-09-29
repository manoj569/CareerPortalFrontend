import { describe, expect, it } from 'vitest';
import { MembershipStatus, type Membership } from '@/features/dashboard/types/dashboardModels';
import { getSafeMembershipReturnTo } from '@/features/interviewInsights/utils/membershipAccess';
import { findActivePlanMembership, membershipPlanCode } from './entitlement';

describe('independent membership entitlements', () => {
  const membership: Membership = {
    id: 'job',
    planCode: 'CareerHarborMembership',
    planName: 'Job Application Access',
    status: MembershipStatus.Active,
    startsAtUtc: '2026-01-01T00:00:00Z',
    endsAtUtc: '2099-01-01T00:00:00Z',
    autoRenew: false,
  };
  it('matches codes and conservative legacy names without promoting unrelated plans', () => {
    expect(findActivePlanMembership([membership], 'ReferralContactAccess')).toBeUndefined();
    expect(findActivePlanMembership([membership], 'CareerHarborMembership')).toBe(membership);
    expect(
      findActivePlanMembership(
        [{ ...membership, endsAtUtc: '2000-01-01T00:00:00Z' }],
        'CareerHarborMembership',
      ),
    ).toBeUndefined();
    expect(membershipPlanCode({ planName: 'Referral Contact Access' })).toBe(
      'ReferralContactAccess',
    );
    expect(membershipPlanCode({ planName: 'Unknown legacy access' })).toBeUndefined();
    expect(findActivePlanMembership([membership], undefined)).toBeUndefined();
  });
  it('allows exact referral routes and rejects external, encoded and redirected destinations', () => {
    expect(getSafeMembershipReturnTo('/dashboard/jobs/referral/job-123/contact')).toBe(
      '/dashboard/jobs/referral/job-123/contact',
    );
    for (const value of [
      'https://evil.test',
      '//evil.test',
      '/\\evil.test',
      '/dashboard/jobs/referral/../contact',
      '/dashboard/jobs/referral/a/contact?next=https://evil.test',
      '/dashboard/jobs/referral/%2F/contact',
    ]) {
      expect(getSafeMembershipReturnTo(value)).toBeUndefined();
    }
  });
});
