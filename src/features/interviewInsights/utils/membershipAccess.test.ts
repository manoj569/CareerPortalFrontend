import { describe, expect, it } from 'vitest';

import { ROUTES } from '@/constants/routes';
import { getSafeCandidateDashboardReturnPath, getSafeMembershipReturnTo } from './membershipAccess';

describe('membership access return paths', () => {
  it.each(['/dashboard/jobs', '/dashboard/jobs?mode=referral', '/dashboard/membership', '/dashboard/interview-insights', '/dashboard/jobs/referral/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/contact'])('preserves exact supported destination %s', (path) => {
    expect(getSafeMembershipReturnTo(path)).toBe(path);
  });
  it.each(['/dashboard/jobs?mode=referral&token=secret', '/dashboard/jobs?next=https://evil.example', '/dashboard/jobs/referral', '/dashboard/jobs/referral/job-123/contact', '/dashboard/jobs/referral/00000000-0000-0000-0000-000000000000/contact', '/dashboard/membership#token', '/dashboard/interview-insights?returnTo=/admin', '/dashboard/jobs/referral/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/contact?token=secret'])('rejects unsupported destination %s', (path) => {
    expect(getSafeMembershipReturnTo(path)).toBeUndefined();
  });
  it('allows candidate dashboard destinations and rejects external or privileged paths', () => {
    expect(getSafeCandidateDashboardReturnPath('/dashboard/jobs?sort=newest')).toBe(
      '/dashboard/jobs?sort=newest',
    );
    expect(getSafeCandidateDashboardReturnPath('//malicious.example/steal')).toBe(ROUTES.DASHBOARD);
    expect(getSafeCandidateDashboardReturnPath('https://malicious.example/steal')).toBe(
      ROUTES.DASHBOARD,
    );
    expect(getSafeCandidateDashboardReturnPath('/admin')).toBe(ROUTES.DASHBOARD);
  });

  it('only accepts supported candidate feature destinations as membership returnTo', () => {
    expect(getSafeMembershipReturnTo(ROUTES.INTERVIEW_INSIGHTS)).toBe(ROUTES.INTERVIEW_INSIGHTS);
    expect(getSafeMembershipReturnTo(ROUTES.AI_APPLY)).toBeUndefined();
    expect(getSafeMembershipReturnTo('https://malicious.example')).toBeUndefined();
    expect(getSafeMembershipReturnTo('//malicious.example')).toBeUndefined();
  });
});
