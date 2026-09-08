import { describe, expect, it } from 'vitest';

import { ROUTES } from '@/constants/routes';
import { getSafeCandidateDashboardReturnPath, getSafeMembershipReturnTo } from './membershipAccess';

describe('membership access return paths', () => {
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
    expect(getSafeMembershipReturnTo(ROUTES.AI_APPLY)).toBe(ROUTES.AI_APPLY);
    expect(getSafeMembershipReturnTo('https://malicious.example')).toBeUndefined();
    expect(getSafeMembershipReturnTo('//malicious.example')).toBeUndefined();
  });
});
