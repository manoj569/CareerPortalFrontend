import { describe, expect, it } from 'vitest';

import { ROUTES } from '@/constants/routes';
import { adminNavigationItems } from './adminNavigation';

describe('adminNavigationItems', () => {
  it('uses the expected admin navigation order', () => {
    const labels = adminNavigationItems.map((item) => item.label);

    expect(labels).toEqual([
      'Dashboard',
      'Jobs',
      'Job Sources',
      'Users',
      'Career Guidance',
      'Applications',
      'Interview insights',
      'AI Apply Operations',
      'Payments',
      'Audit logs',
      'View public site',
    ]);
  });

  it('routes Career Guidance to consultant verification', () => {
    const careerGuidance = adminNavigationItems.find(
      (item) => item.label === 'Career Guidance',
    );

    expect(careerGuidance?.path).toBe(
      ROUTES.ADMIN_CAREER_GUIDANCE,
    );
  });
});