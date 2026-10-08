import { describe, expect, it } from 'vitest';

import { candidateNavigationItems } from './candidateNavigation';

describe('candidate navigation', () => {
  it('integrates referral navigation with the candidate workspace', () => {
    expect(candidateNavigationItems.map((item) => item.label)).toEqual([
      'Dashboard',
      'Browse jobs',
      'Saved jobs',
      'Applied jobs',
      'Refer a job',
      'My referrals',
      'Referral requests',
      'My referral requests',
      'Interview insights',
      'Portfolio',
      'Membership',
      'Resume maker',
      'Settings',
    ]);
    expect(candidateNavigationItems.map((item) => item.label)).not.toContain('Notifications');
    expect(candidateNavigationItems.map((item) => item.label)).not.toEqual(
      expect.arrayContaining(['Profile', 'Career preferences']),
    );
  });
});
